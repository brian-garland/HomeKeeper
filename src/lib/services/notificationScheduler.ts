import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotificationType,
  NotificationSchedule,
  NotificationPreferences,
  UserEngagementProfile,
  NotificationContext,
  NotificationTiming,
  NotificationPriority
} from '../../types/notifications';
import type { Task, Equipment, Home } from '../../types';
import NotificationService from './notificationService';

interface SchedulerRule {
  type: NotificationType;
  priority: NotificationPriority;
  timing: NotificationTiming;
  condition: (context: NotificationContext) => boolean;
  generateScheduleTime: (baseTime: Date, context: NotificationContext) => Date;
}

class NotificationScheduler {
  private static instance: NotificationScheduler;
  private notificationService: NotificationService;
  private schedulerRules: SchedulerRule[] = [];

  private readonly STORAGE_KEYS = {
    ENGAGEMENT_PROFILE: 'homekeeper_user_engagement_profile',
    WEEKLY_COUNT: 'homekeeper_weekly_notification_count'
  };

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.initializeSchedulerRules();
  }

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  private initializeSchedulerRules(): void {
    this.schedulerRules = [
      // Task reminders - high priority, smart timing
      {
        type: NotificationType.TASK_REMINDER,
        priority: NotificationPriority.HIGH,
        timing: NotificationTiming.OPTIMAL,
        condition: (context) => context.timeOfDay !== 'night',
        generateScheduleTime: (baseTime, context) => this.getOptimalReminderTime(baseTime, context)
      },
      
      // Equipment alerts - immediate for urgent, batched for routine
      {
        type: NotificationType.EQUIPMENT_SERVICE,
        priority: NotificationPriority.NORMAL,
        timing: NotificationTiming.BATCH,
        condition: (context) => context.dayOfWeek !== 'sunday',
        generateScheduleTime: (baseTime, context) => this.getBatchTime(baseTime, context)
      },
      
      // Achievements - immediate for engagement
      {
        type: NotificationType.ACHIEVEMENT,
        priority: NotificationPriority.NORMAL,
        timing: NotificationTiming.IMMEDIATE,
        condition: () => true,
        generateScheduleTime: (baseTime) => baseTime
      },
      
      // Weather opportunities - only when conditions are favorable
      {
        type: NotificationType.WEATHER_OPPORTUNITY,
        priority: NotificationPriority.LOW,
        timing: NotificationTiming.OPTIMAL,
        condition: (context) => context.weather?.isGoodForOutdoorWork === true,
        generateScheduleTime: (baseTime, context) => this.getWeatherOptimalTime(baseTime, context)
      },
      
      // Seasonal suggestions - batched, weekend preferred
      {
        type: NotificationType.SEASONAL_SUGGESTION,
        priority: NotificationPriority.LOW,
        timing: NotificationTiming.BATCH,
        condition: (context) => {
          const weekendDays = ['friday', 'saturday', 'sunday'];
          return weekendDays.includes(context.dayOfWeek);
        },
        generateScheduleTime: (baseTime, context) => this.getWeekendBatchTime(baseTime, context)
      }
    ];
  }

  async scheduleTaskNotifications(tasks: Task[]): Promise<void> {
    const preferences = await this.notificationService.getPreferences();
    const context = await this.getCurrentContext();
    
    if (!preferences.enabled || !preferences.frequency.taskReminders) {
      return;
    }

    const weeklyCount = await this.getWeeklyNotificationCount();
    if (weeklyCount >= preferences.frequency.weeklyLimit) {
      console.log('Weekly notification limit reached, skipping task notifications');
      return;
    }

    for (const task of tasks) {
      await this.scheduleTaskReminderSequence(task, context, preferences);
    }
  }

  private async scheduleTaskReminderSequence(
    task: Task, 
    context: NotificationContext, 
    preferences: NotificationPreferences
  ): Promise<void> {
    const dueDate = new Date(task.due_date);
    const now = new Date();
    
    // Skip if task is overdue or due very soon
    if (dueDate <= now || dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return;
    }

    const reminderTimes = this.calculateReminderTimes(dueDate, preferences.style);
    
    for (const { time, type } of reminderTimes) {
      if (time > now) {
        const optimalTime = await this.getOptimalDeliveryTime(time, context);
        await this.notificationService.scheduleTaskReminder(task, type);
        await this.incrementWeeklyCount();
      }
    }
  }

  private calculateReminderTimes(dueDate: Date, style: string): Array<{ time: Date; type: 'advance' | 'due' | 'overdue' }> {
    const times: Array<{ time: Date; type: 'advance' | 'due' | 'overdue' }> = [];
    
    // Base reminder schedule
    const threeDaysBefore = new Date(dueDate.getTime() - (3 * 24 * 60 * 60 * 1000));
    const oneDayBefore = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000));
    
    switch (style) {
      case 'gentle':
        times.push({ time: oneDayBefore, type: 'due' });
        break;
      case 'standard':
        times.push({ time: threeDaysBefore, type: 'advance' });
        times.push({ time: oneDayBefore, type: 'due' });
        break;
      case 'persistent':
        times.push({ time: threeDaysBefore, type: 'advance' });
        times.push({ time: oneDayBefore, type: 'due' });
        times.push({ time: dueDate, type: 'overdue' });
        break;
    }
    
    return times;
  }

  async scheduleEquipmentNotifications(equipment: Equipment[]): Promise<void> {
    const preferences = await this.notificationService.getPreferences();
    const context = await this.getCurrentContext();
    
    if (!preferences.enabled || !preferences.frequency.equipmentAlerts) {
      return;
    }

    for (const item of equipment) {
      await this.scheduleEquipmentAlerts(item, context, preferences);
    }
  }

  private async scheduleEquipmentAlerts(
    equipment: Equipment, 
    context: NotificationContext, 
    preferences: NotificationPreferences
  ): Promise<void> {
    const now = new Date();

    // Service due notifications
    if (equipment.next_service_due) {
      const serviceDue = new Date(equipment.next_service_due);
      const reminderTime = new Date(serviceDue.getTime() - (7 * 24 * 60 * 60 * 1000)); // 1 week before
      
      if (reminderTime > now) {
        const optimalTime = await this.getOptimalDeliveryTime(reminderTime, context);
        await this.notificationService.scheduleEquipmentAlert(equipment, 'service_due');
      }
    }

    // Attention needed notifications (immediate)
    if (equipment.needs_attention) {
      await this.notificationService.scheduleEquipmentAlert(equipment, 'attention_needed');
    }
  }

  async scheduleSeasonalSuggestions(home: Home, season: string): Promise<void> {
    const preferences = await this.notificationService.getPreferences();
    const context = await this.getCurrentContext();
    
    if (!preferences.enabled || !preferences.frequency.suggestions) {
      return;
    }

    const suggestions = this.getSeasonalSuggestions(season, home);
    const batchTime = this.getWeekendBatchTime(new Date(), context);
    
    for (const suggestion of suggestions.slice(0, 2)) { // Limit to 2 suggestions
      // Schedule seasonal suggestions would go here
      console.log('Would schedule seasonal suggestion:', suggestion);
    }
  }

  private getSeasonalSuggestions(season: string, home: Home): string[] {
    const suggestions: Record<string, string[]> = {
      spring: [
        'Spring HVAC maintenance - clean filters and ducts',
        'Inspect roof for winter damage',
        'Clean gutters and downspouts',
        'Service lawn mower and outdoor equipment'
      ],
      summer: [
        'Check air conditioning efficiency',
        'Inspect and clean deck/patio',
        'Trim trees and bushes near house',
        'Check irrigation system'
      ],
      fall: [
        'Winterize sprinkler system',
        'Clean and store outdoor furniture',
        'Check heating system before cold weather',
        'Clean fireplace and chimney'
      ],
      winter: [
        'Check for ice dams and icicles',
        'Test smoke and carbon monoxide detectors',
        'Indoor maintenance projects',
        'Plan for spring maintenance'
      ]
    };

    return suggestions[season] || [];
  }

  async scheduleWeatherOpportunityNotifications(tasks: Task[], weatherCondition: string): Promise<void> {
    const preferences = await this.notificationService.getPreferences();
    
    if (!preferences.enabled || !preferences.frequency.suggestions) {
      return;
    }

    const outdoorTasks = tasks.filter(task => 
      task.weather_dependent || 
      task.category.toLowerCase().includes('exterior') ||
      task.title.toLowerCase().includes('outdoor')
    );

    if (outdoorTasks.length > 0 && this.isGoodWeatherForOutdoorWork(weatherCondition)) {
      // Schedule weather opportunity notification
      console.log('Good weather for outdoor tasks:', outdoorTasks.length, 'tasks');
    }
  }

  private isGoodWeatherForOutdoorWork(condition: string): boolean {
    const goodConditions = ['clear', 'sunny', 'partly cloudy', 'overcast'];
    return goodConditions.some(good => condition.toLowerCase().includes(good));
  }

  // Smart timing methods
  private async getOptimalDeliveryTime(baseTime: Date, context: NotificationContext): Promise<Date> {
    const profile = await this.getUserEngagementProfile();
    
    if (profile?.optimalDeliveryTime) {
      const [hours, minutes] = profile.optimalDeliveryTime.split(':').map(Number);
      const optimalTime = new Date(baseTime);
      optimalTime.setHours(hours, minutes, 0, 0);
      
      // If optimal time has passed for today, schedule for tomorrow
      if (optimalTime <= new Date()) {
        optimalTime.setDate(optimalTime.getDate() + 1);
      }
      
      return optimalTime;
    }

    return this.getDefaultOptimalTime(baseTime, context);
  }

  private getDefaultOptimalTime(baseTime: Date, context: NotificationContext): Date {
    const optimalTime = new Date(baseTime);
    
    // Default optimal times based on context
    switch (context.timeOfDay) {
      case 'morning':
        optimalTime.setHours(9, 0, 0, 0); // 9 AM
        break;
      case 'afternoon':
        optimalTime.setHours(14, 0, 0, 0); // 2 PM
        break;
      case 'evening':
        optimalTime.setHours(18, 0, 0, 0); // 6 PM
        break;
      default:
        optimalTime.setHours(10, 0, 0, 0); // 10 AM default
    }
    
    return optimalTime;
  }

  private getOptimalReminderTime(baseTime: Date, context: NotificationContext): Date {
    // For task reminders, prefer weekday evenings or weekend mornings
    const optimalTime = new Date(baseTime);
    const weekendDays = ['saturday', 'sunday'];
    
    if (weekendDays.includes(context.dayOfWeek)) {
      optimalTime.setHours(10, 0, 0, 0); // Weekend mornings
    } else {
      optimalTime.setHours(18, 0, 0, 0); // Weekday evenings
    }
    
    return optimalTime;
  }

  private getBatchTime(baseTime: Date, context: NotificationContext): Date {
    // Batch notifications for non-urgent items at consistent times
    const batchTime = new Date(baseTime);
    const morningDays = ['monday', 'wednesday', 'friday'];
    
    if (morningDays.includes(context.dayOfWeek)) {
      batchTime.setHours(10, 0, 0, 0); // Morning batch
    } else {
      batchTime.setHours(15, 0, 0, 0); // Afternoon batch
    }
    
    return batchTime;
  }

  private getWeatherOptimalTime(baseTime: Date, context: NotificationContext): Date {
    // For weather-dependent notifications, schedule for early morning
    const weatherTime = new Date(baseTime);
    weatherTime.setHours(8, 0, 0, 0);
    return weatherTime;
  }

  private getWeekendBatchTime(baseTime: Date, context: NotificationContext): Date {
    // Schedule for Saturday morning for weekend planning
    const weekendTime = new Date(baseTime);
    const daysUntilSaturday = (6 - weekendTime.getDay()) % 7;
    weekendTime.setDate(weekendTime.getDate() + daysUntilSaturday);
    weekendTime.setHours(9, 0, 0, 0);
    return weekendTime;
  }

  // Context and user profiling
  private async getCurrentContext(): Promise<NotificationContext> {
    const now = new Date();
    const hour = now.getHours();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[now.getDay()];
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    const month = now.getMonth();
    let season: 'spring' | 'summer' | 'fall' | 'winter';
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else season = 'winter';

    return {
      timeOfDay,
      dayOfWeek,
      season,
      userActivity: 'active' // TODO: Integrate with app usage tracking
    };
  }

  private async getUserEngagementProfile(): Promise<UserEngagementProfile | null> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.ENGAGEMENT_PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading user engagement profile:', error);
      return null;
    }
  }

  private async getWeeklyNotificationCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.WEEKLY_COUNT);
      if (!stored) return 0;
      
      const { week, count } = JSON.parse(stored);
      const currentWeek = this.getCurrentWeek();
      
      // Reset count if it's a new week
      if (week !== currentWeek) {
        await this.resetWeeklyCount();
        return 0;
      }
      
      return count;
    } catch (error) {
      console.error('Error loading weekly notification count:', error);
      return 0;
    }
  }

  private async incrementWeeklyCount(): Promise<void> {
    try {
      const currentWeek = this.getCurrentWeek();
      const currentCount = await this.getWeeklyNotificationCount();
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.WEEKLY_COUNT, JSON.stringify({
        week: currentWeek,
        count: currentCount + 1
      }));
    } catch (error) {
      console.error('Error incrementing weekly notification count:', error);
    }
  }

  private async resetWeeklyCount(): Promise<void> {
    try {
      const currentWeek = this.getCurrentWeek();
      await AsyncStorage.setItem(this.STORAGE_KEYS.WEEKLY_COUNT, JSON.stringify({
        week: currentWeek,
        count: 0
      }));
    } catch (error) {
      console.error('Error resetting weekly notification count:', error);
    }
  }

  private getCurrentWeek(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
  }

  // Cleanup and management
  async cancelScheduledNotificationsForTask(taskId: string): Promise<void> {
    const scheduled = await this.notificationService.getScheduledNotifications();
    
    for (const notification of scheduled) {
      if (notification.content.data?.taskId === taskId) {
        await this.notificationService.cancelNotification(notification.identifier);
      }
    }
  }

  async cancelScheduledNotificationsForEquipment(equipmentId: string): Promise<void> {
    const scheduled = await this.notificationService.getScheduledNotifications();
    
    for (const notification of scheduled) {
      if (notification.content.data?.equipmentId === equipmentId) {
        await this.notificationService.cancelNotification(notification.identifier);
      }
    }
  }

  async optimizeNotificationFrequency(): Promise<void> {
    // Analyze user engagement and adjust notification frequency
    const profile = await this.getUserEngagementProfile();
    const preferences = await this.notificationService.getPreferences();
    
    if (profile && profile.responseRate < 0.3) {
      // Low engagement - reduce frequency
      const newLimit = Math.max(1, preferences.frequency.weeklyLimit - 1);
      await this.notificationService.updatePreferences({
        frequency: { ...preferences.frequency, weeklyLimit: newLimit }
      });
      console.log('Reduced notification frequency due to low engagement');
    } else if (profile && profile.responseRate > 0.7) {
      // High engagement - could increase frequency
      const newLimit = Math.min(5, preferences.frequency.weeklyLimit + 1);
      await this.notificationService.updatePreferences({
        frequency: { ...preferences.frequency, weeklyLimit: newLimit }
      });
      console.log('Increased notification frequency due to high engagement');
    }
  }
}

export default NotificationScheduler;