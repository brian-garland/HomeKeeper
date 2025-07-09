import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  NotificationType,
  NotificationSchedule,
  NotificationPreferences,
  NotificationAnalytics,
  UserEngagementProfile,
  NotificationContent,
  NotificationPriority,
  NotificationTiming,
  DEFAULT_NOTIFICATION_PREFERENCES
} from '../../types/notifications';
import type { Task, Equipment } from '../../types';

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private expoPushToken: string | null = null;

  // Storage keys
  private readonly STORAGE_KEYS = {
    PREFERENCES: 'homekeeper_notification_preferences',
    SCHEDULE: 'homekeeper_notification_schedule',
    ANALYTICS: 'homekeeper_notification_analytics',
    ENGAGEMENT: 'homekeeper_user_engagement_profile'
  };

  private constructor() {
    this.setupNotificationHandlers();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure notification behavior
      await Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          const preferences = await this.getPreferences();
          
          return {
            shouldShowAlert: preferences.enabled,
            shouldPlaySound: preferences.style !== 'gentle',
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true
          };
        },
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return;
      }

      // Get push token for analytics (optional)
      if (Platform.OS !== 'web') {
        try {
          this.expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
        } catch (error) {
          console.log('Could not get push token:', error);
        }
      }

      // Setup notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      this.isInitialized = true;
      console.log('🔔 NotificationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
    }
  }

  private async setupAndroidChannels(): Promise<void> {
    const channels = [
      {
        identifier: 'task-reminders',
        name: 'Task Reminders',
        description: 'Notifications for upcoming and due tasks',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [250, 250, 250, 250],
      },
      {
        identifier: 'equipment-alerts',
        name: 'Equipment Alerts',
        description: 'Notifications for equipment service and maintenance',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      },
      {
        identifier: 'achievements',
        name: 'Achievements',
        description: 'Celebration notifications for completed tasks',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'success.wav',
      },
      {
        identifier: 'suggestions',
        name: 'Suggestions',
        description: 'Smart suggestions and seasonal reminders',
        importance: Notifications.AndroidImportance.LOW,
      }
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.identifier, channel);
    }
  }

  private setupNotificationHandlers(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
      this.trackNotificationAnalytics(notification.request.identifier, 'received');
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      this.trackNotificationAnalytics(response.notification.request.identifier, 'opened');
      this.handleNotificationAction(response);
    });
  }

  private async handleNotificationAction(response: Notifications.NotificationResponse): Promise<void> {
    const data = response.notification.request.content.data;
    
    if (data?.actionUrl) {
      // Navigate to specific screen
      console.log('Navigate to:', data.actionUrl);
    }

    if (data?.taskId) {
      // Mark task as viewed or update engagement
      await this.updateUserEngagement('task_viewed');
    }
  }

  async scheduleNotification(
    type: NotificationType,
    content: NotificationContent,
    scheduledFor: Date,
    options: {
      priority?: NotificationPriority;
      timing?: NotificationTiming;
      relatedTaskId?: string;
      relatedEquipmentId?: string;
    } = {}
  ): Promise<string> {
    const preferences = await this.getPreferences();
    
    if (!preferences.enabled) {
      throw new Error('Notifications are disabled');
    }

    // Check if notification type is enabled
    if (!this.isNotificationTypeEnabled(type, preferences)) {
      throw new Error(`Notification type ${type} is disabled`);
    }

    // Apply quiet hours if needed
    const adjustedTime = await this.adjustForQuietHours(scheduledFor, preferences);

    const notificationSchedule: NotificationSchedule = {
      id: this.generateId(),
      type,
      priority: options.priority || NotificationPriority.NORMAL,
      timing: options.timing || NotificationTiming.SCHEDULED,
      scheduledFor: adjustedTime,
      content,
      relatedTaskId: options.relatedTaskId,
      relatedEquipmentId: options.relatedEquipmentId,
      userId: 'current-user', // TODO: Get from auth context
      delivered: false,
      opened: false,
      dismissed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Schedule with Expo Notifications
    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: notificationSchedule.id,
      content: {
        title: content.title,
        body: content.body,
        data: {
          type,
          priority: options.priority,
          taskId: options.relatedTaskId,
          equipmentId: options.relatedEquipmentId,
          actionUrl: content.actionUrl,
          ...content.metadata
        },
        sound: this.getSoundForType(type, preferences.style),
      },
      trigger: {
        type: 'date' as const,
        date: adjustedTime,
      },
    });

    // Store in local schedule
    await this.saveScheduledNotification(notificationSchedule);

    console.log(`🔔 Scheduled ${type} notification for ${adjustedTime.toISOString()}`);
    return identifier;
  }

  async scheduleTaskReminder(task: Task, reminderType: 'advance' | 'due' | 'overdue'): Promise<string> {
    const dueDate = new Date(task.due_date);
    let scheduledFor: Date;
    let titlePrefix: string;

    switch (reminderType) {
      case 'advance':
        scheduledFor = new Date(dueDate.getTime() - (3 * 24 * 60 * 60 * 1000)); // 3 days before
        titlePrefix = '🏠 Upcoming Task';
        break;
      case 'due':
        scheduledFor = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000)); // 1 day before
        titlePrefix = '⏰ Task Due Tomorrow';
        break;
      case 'overdue':
        scheduledFor = dueDate;
        titlePrefix = '📋 Task Due Today';
        break;
    }

    const content: NotificationContent = {
      title: `${titlePrefix}: ${task.title}`,
      body: this.generateTaskReminderBody(task, reminderType),
      emoji: this.getEmojiForTask(task),
      actionUrl: `/tasks/${task.id}`,
      metadata: {
        taskId: task.id,
        dueDate: task.due_date,
        priority: task.priority
      }
    };

    return this.scheduleNotification(
      NotificationType.TASK_REMINDER,
      content,
      scheduledFor,
      {
        priority: this.getTaskPriority(task),
        relatedTaskId: task.id
      }
    );
  }

  async scheduleEquipmentAlert(equipment: Equipment, alertType: 'service_due' | 'attention_needed'): Promise<string> {
    let scheduledFor: Date;
    
    if (alertType === 'service_due' && equipment.next_service_due) {
      scheduledFor = new Date(new Date(equipment.next_service_due).getTime() - (7 * 24 * 60 * 60 * 1000)); // 1 week before
    } else {
      // Schedule for 2 seconds in the future for immediate alerts
      scheduledFor = new Date();
      scheduledFor.setSeconds(scheduledFor.getSeconds() + 2);
    }

    const content: NotificationContent = {
      title: alertType === 'service_due' 
        ? `🔧 ${equipment.name} Service Due` 
        : `⚠️ ${equipment.name} Needs Attention`,
      body: this.generateEquipmentAlertBody(equipment, alertType),
      emoji: '🔧',
      actionUrl: `/equipment/${equipment.id}`,
      metadata: {
        equipmentId: equipment.id,
        category: equipment.category,
        alertType
      }
    };

    return this.scheduleNotification(
      alertType === 'service_due' ? NotificationType.EQUIPMENT_SERVICE : NotificationType.EQUIPMENT_ATTENTION,
      content,
      scheduledFor,
      {
        priority: alertType === 'attention_needed' ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
        relatedEquipmentId: equipment.id
      }
    );
  }

  async scheduleAchievementNotification(achievementType: 'money_saved' | 'streak' | 'completion', data: any): Promise<string> {
    const content = this.generateAchievementContent(achievementType, data);
    
    // Schedule for 2 seconds in the future to avoid iOS scheduling issues
    const scheduleDate = new Date();
    scheduleDate.setSeconds(scheduleDate.getSeconds() + 2);
    
    return this.scheduleNotification(
      NotificationType.ACHIEVEMENT,
      content,
      scheduleDate,
      { priority: NotificationPriority.NORMAL, timing: NotificationTiming.OPTIMAL }
    );
  }

  private generateTaskReminderBody(task: Task, reminderType: string): string {
    const parts: string[] = [];
    
    if (task.estimated_duration_minutes) {
      parts.push(`Est. ${task.estimated_duration_minutes} min`);
    }
    
    if (task.money_saved_estimate && task.money_saved_estimate > 0) {
      parts.push(`Save $${task.money_saved_estimate}`);
    }

    if (task.difficulty_level) {
      const difficulty = task.difficulty_level <= 2 ? 'Easy' : task.difficulty_level <= 4 ? 'Moderate' : 'Advanced';
      parts.push(difficulty);
    }

    const suffix = parts.length > 0 ? ` (${parts.join(', ')})` : '';
    
    switch (reminderType) {
      case 'advance':
        return `Coming up this weekend${suffix}`;
      case 'due':
        return `Don't forget${suffix}`;
      default:
        return `Ready to tackle this?${suffix}`;
    }
  }

  private generateEquipmentAlertBody(equipment: Equipment, alertType: string): string {
    if (alertType === 'service_due') {
      const lastService = equipment.last_service_date 
        ? ` (Last: ${new Date(equipment.last_service_date).toLocaleDateString()})`
        : '';
      return `Regular maintenance due${lastService}`;
    } else {
      return equipment.notes || 'Check equipment status and condition';
    }
  }

  private generateAchievementContent(type: string, data: any): NotificationContent {
    switch (type) {
      case 'money_saved':
        return {
          title: '💰 Money Saved!',
          body: `You've saved $${data.amount} this ${data.period} with DIY maintenance!`,
          emoji: '💰'
        };
      case 'streak':
        return {
          title: '🔥 Task Streak!',
          body: `${data.count} tasks completed this week - you're on fire!`,
          emoji: '🔥'
        };
      case 'completion':
        return {
          title: '✅ Great Job!',
          body: `Task completed: ${data.taskName}. Your home thanks you!`,
          emoji: '✅'
        };
      default:
        return {
          title: '🎉 Achievement!',
          body: 'Keep up the great work!',
          emoji: '🎉'
        };
    }
  }

  private getEmojiForTask(task: Task): string {
    const category = task.category.toLowerCase();
    if (category.includes('hvac')) return '🌡️';
    if (category.includes('plumbing')) return '🚿';
    if (category.includes('electrical')) return '⚡';
    if (category.includes('exterior')) return '🏠';
    if (category.includes('safety')) return '🛡️';
    return '🔧';
  }

  private getTaskPriority(task: Task): NotificationPriority {
    if (!task.priority) return NotificationPriority.LOW;
    if (task.priority >= 4) return NotificationPriority.HIGH;
    if (task.priority >= 3) return NotificationPriority.NORMAL;
    return NotificationPriority.LOW;
  }

  private getSoundForType(type: NotificationType, style: string): string | boolean {
    if (style === 'gentle') return false;
    
    switch (type) {
      case NotificationType.ACHIEVEMENT:
        return 'success.wav';
      case NotificationType.EQUIPMENT_ATTENTION:
        return 'alert.wav';
      default:
        return 'default';
    }
  }

  private async adjustForQuietHours(scheduledFor: Date, preferences: NotificationPreferences): Promise<Date> {
    const hour = scheduledFor.getHours();
    const quietStart = parseInt(preferences.quietHours.start.split(':')[0]);
    const quietEnd = parseInt(preferences.quietHours.end.split(':')[0]);

    // If scheduled time is in quiet hours, move to next allowed time
    if ((quietStart > quietEnd && (hour >= quietStart || hour < quietEnd)) ||
        (quietStart < quietEnd && hour >= quietStart && hour < quietEnd)) {
      
      const nextAllowedTime = new Date(scheduledFor);
      nextAllowedTime.setHours(quietEnd, 0, 0, 0);
      
      // If quiet end is tomorrow, add a day
      if (quietStart > quietEnd && hour >= quietStart) {
        nextAllowedTime.setDate(nextAllowedTime.getDate() + 1);
      }
      
      return nextAllowedTime;
    }

    return scheduledFor;
  }

  private isNotificationTypeEnabled(type: NotificationType, preferences: NotificationPreferences): boolean {
    switch (type) {
      case NotificationType.TASK_REMINDER:
        return preferences.frequency.taskReminders;
      case NotificationType.EQUIPMENT_SERVICE:
      case NotificationType.EQUIPMENT_ATTENTION:
        return preferences.frequency.equipmentAlerts;
      case NotificationType.ACHIEVEMENT:
      case NotificationType.MONEY_SAVED:
      case NotificationType.STREAK:
        return preferences.frequency.achievements;
      case NotificationType.SEASONAL_SUGGESTION:
      case NotificationType.WEATHER_OPPORTUNITY:
        return preferences.frequency.suggestions;
      default:
        return true;
    }
  }

  private mapPriorityToExpo(priority: NotificationPriority): Notifications.AndroidImportance {
    switch (priority) {
      case NotificationPriority.URGENT:
        return Notifications.AndroidImportance.MAX;
      case NotificationPriority.HIGH:
        return Notifications.AndroidImportance.HIGH;
      case NotificationPriority.NORMAL:
        return Notifications.AndroidImportance.DEFAULT;
      case NotificationPriority.LOW:
        return Notifications.AndroidImportance.LOW;
      default:
        return Notifications.AndroidImportance.DEFAULT;
    }
  }

  // Storage methods
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.PREFERENCES);
      return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATION_PREFERENCES;
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...preferences };
      await AsyncStorage.setItem(this.STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  private async saveScheduledNotification(schedule: NotificationSchedule): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.SCHEDULE);
      const schedules: NotificationSchedule[] = stored ? JSON.parse(stored) : [];
      schedules.push(schedule);
      await AsyncStorage.setItem(this.STORAGE_KEYS.SCHEDULE, JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving notification schedule:', error);
    }
  }

  private async trackNotificationAnalytics(notificationId: string, action: 'received' | 'opened' | 'dismissed'): Promise<void> {
    try {
      const analytics: NotificationAnalytics = {
        notificationId,
        type: NotificationType.TASK_REMINDER, // TODO: Get from stored data
        sentAt: new Date(),
        engagementScore: action === 'opened' ? 100 : action === 'received' ? 50 : 0
      };

      if (action === 'opened') analytics.openedAt = new Date();
      if (action === 'dismissed') analytics.dismissedAt = new Date();

      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.ANALYTICS);
      const allAnalytics: NotificationAnalytics[] = stored ? JSON.parse(stored) : [];
      allAnalytics.push(analytics);
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.ANALYTICS, JSON.stringify(allAnalytics));
    } catch (error) {
      console.error('Error tracking notification analytics:', error);
    }
  }

  private async updateUserEngagement(action: string): Promise<void> {
    // Update user engagement profile based on actions
    console.log('Updating user engagement for action:', action);
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup methods
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

export default NotificationService;