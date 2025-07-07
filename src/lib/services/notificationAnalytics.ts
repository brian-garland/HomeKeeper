import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotificationAnalytics,
  NotificationType,
  UserEngagementProfile
} from '../../types/notifications';

interface AnalyticsReport {
  totalNotificationsSent: number;
  totalNotificationsOpened: number;
  openRate: number;
  notificationsByType: Record<NotificationType, number>;
  weeklyTrends: Array<{
    week: string;
    sent: number;
    opened: number;
    openRate: number;
  }>;
  userEngagement: {
    averageResponseTime: number;
    preferredTimes: string[];
    mostEngagingTypes: NotificationType[];
  };
}

class NotificationAnalyticsService {
  private static instance: NotificationAnalyticsService;
  
  private readonly STORAGE_KEYS = {
    ANALYTICS: 'homekeeper_notification_analytics',
    ENGAGEMENT_PROFILE: 'homekeeper_user_engagement_profile',
    WEEKLY_STATS: 'homekeeper_weekly_notification_stats'
  };

  private constructor() {}

  static getInstance(): NotificationAnalyticsService {
    if (!NotificationAnalyticsService.instance) {
      NotificationAnalyticsService.instance = new NotificationAnalyticsService();
    }
    return NotificationAnalyticsService.instance;
  }

  async trackNotificationSent(
    notificationId: string,
    type: NotificationType,
    scheduledFor: Date
  ): Promise<void> {
    try {
      const analytics: NotificationAnalytics = {
        notificationId,
        type,
        sentAt: new Date(),
        engagementScore: 0
      };

      await this.saveAnalytics(analytics);
      await this.updateWeeklyStats('sent', type);
      console.log(`📊 Tracked notification sent: ${type}`);
    } catch (error) {
      console.error('Error tracking notification sent:', error);
    }
  }

  async trackNotificationOpened(
    notificationId: string,
    responseTime: number = 0
  ): Promise<void> {
    try {
      const analytics = await this.getAnalyticsByNotificationId(notificationId);
      if (!analytics) {
        console.warn('Analytics not found for notification:', notificationId);
        return;
      }

      analytics.openedAt = new Date();
      analytics.engagementScore = this.calculateEngagementScore(analytics, responseTime);

      await this.updateAnalytics(analytics);
      await this.updateWeeklyStats('opened', analytics.type);
      await this.updateUserEngagementProfile(analytics, responseTime);
      
      console.log(`📊 Tracked notification opened: ${analytics.type}, score: ${analytics.engagementScore}`);
    } catch (error) {
      console.error('Error tracking notification opened:', error);
    }
  }

  async trackNotificationDismissed(notificationId: string): Promise<void> {
    try {
      const analytics = await this.getAnalyticsByNotificationId(notificationId);
      if (!analytics) {
        console.warn('Analytics not found for notification:', notificationId);
        return;
      }

      analytics.dismissedAt = new Date();
      analytics.engagementScore = Math.max(0, analytics.engagementScore - 20);

      await this.updateAnalytics(analytics);
      console.log(`📊 Tracked notification dismissed: ${analytics.type}`);
    } catch (error) {
      console.error('Error tracking notification dismissed:', error);
    }
  }

  async trackNotificationAction(
    notificationId: string,
    action: string
  ): Promise<void> {
    try {
      const analytics = await this.getAnalyticsByNotificationId(notificationId);
      if (!analytics) {
        console.warn('Analytics not found for notification:', notificationId);
        return;
      }

      analytics.actionTaken = action;
      analytics.engagementScore += 30; // Bonus for taking action

      await this.updateAnalytics(analytics);
      console.log(`📊 Tracked notification action: ${action} for ${analytics.type}`);
    } catch (error) {
      console.error('Error tracking notification action:', error);
    }
  }

  async generateReport(periodDays: number = 30): Promise<AnalyticsReport> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));
      
      const allAnalytics = await this.getAllAnalytics();
      const periodAnalytics = allAnalytics.filter(a => 
        a.sentAt >= startDate && a.sentAt <= endDate
      );

      const totalSent = periodAnalytics.length;
      const totalOpened = periodAnalytics.filter(a => a.openedAt).length;
      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

      const notificationsByType = this.groupByType(periodAnalytics);
      const weeklyTrends = await this.calculateWeeklyTrends(startDate, endDate);
      const userEngagement = await this.calculateUserEngagement(periodAnalytics);

      return {
        totalNotificationsSent: totalSent,
        totalNotificationsOpened: totalOpened,
        openRate: Math.round(openRate * 100) / 100,
        notificationsByType,
        weeklyTrends,
        userEngagement
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      return this.getEmptyReport();
    }
  }

  async optimizeNotificationTiming(): Promise<{
    recommendedTimes: string[];
    recommendedDays: string[];
    recommendedFrequency: number;
  }> {
    try {
      const profile = await this.getUserEngagementProfile();
      const analytics = await this.getAllAnalytics();
      
      // Analyze best performing times
      const timeAnalysis = this.analyzeOptimalTimes(analytics);
      const dayAnalysis = this.analyzeOptimalDays(analytics);
      const frequencyAnalysis = await this.analyzeOptimalFrequency(analytics);

      return {
        recommendedTimes: timeAnalysis.slice(0, 3),
        recommendedDays: dayAnalysis.slice(0, 3),
        recommendedFrequency: frequencyAnalysis
      };
    } catch (error) {
      console.error('Error optimizing notification timing:', error);
      return {
        recommendedTimes: ['09:00', '18:00'],
        recommendedDays: ['monday', 'wednesday', 'saturday'],
        recommendedFrequency: 3
      };
    }
  }

  private calculateEngagementScore(
    analytics: NotificationAnalytics,
    responseTime: number
  ): number {
    let score = 50; // Base score for opening

    // Response time bonus (faster response = higher score)
    if (responseTime < 60) score += 30; // Under 1 minute
    else if (responseTime < 300) score += 20; // Under 5 minutes
    else if (responseTime < 900) score += 10; // Under 15 minutes

    // Type-based scoring
    switch (analytics.type) {
      case NotificationType.TASK_REMINDER:
        score += 20;
        break;
      case NotificationType.ACHIEVEMENT:
        score += 15;
        break;
      case NotificationType.EQUIPMENT_ATTENTION:
        score += 25;
        break;
      default:
        score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private async updateUserEngagementProfile(
    analytics: NotificationAnalytics,
    responseTime: number
  ): Promise<void> {
    try {
      let profile = await this.getUserEngagementProfile();
      
      if (!profile) {
        profile = {
          userId: 'current-user',
          preferredDays: [],
          responseRate: 0,
          averageResponseTime: 0,
          lastActiveHour: new Date().getHours(),
          notificationFrequencyTolerance: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Update response rate
      const totalAnalytics = await this.getAllAnalytics();
      const totalOpened = totalAnalytics.filter(a => a.openedAt).length;
      profile.responseRate = totalAnalytics.length > 0 ? totalOpened / totalAnalytics.length : 0;

      // Update average response time
      const responseTimes = totalAnalytics
        .filter(a => a.openedAt && a.sentAt)
        .map(a => (a.openedAt!.getTime() - a.sentAt.getTime()) / 60000); // Convert to minutes

      if (responseTimes.length > 0) {
        profile.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }

      // Update optimal delivery time based on open patterns
      if (analytics.openedAt) {
        const openHour = analytics.openedAt.getHours();
        const openTime = `${openHour.toString().padStart(2, '0')}:00`;
        
        if (!profile.optimalDeliveryTime || Math.random() < 0.3) { // 30% chance to update
          profile.optimalDeliveryTime = openTime;
        }
      }

      profile.updatedAt = new Date();
      await this.saveUserEngagementProfile(profile);
    } catch (error) {
      console.error('Error updating user engagement profile:', error);
    }
  }

  // Storage methods
  private async saveAnalytics(analytics: NotificationAnalytics): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.ANALYTICS);
      const allAnalytics: NotificationAnalytics[] = stored ? JSON.parse(stored) : [];
      allAnalytics.push(analytics);
      
      // Keep only last 1000 records to prevent storage bloat
      if (allAnalytics.length > 1000) {
        allAnalytics.splice(0, allAnalytics.length - 1000);
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.ANALYTICS, JSON.stringify(allAnalytics));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }

  private async getAllAnalytics(): Promise<NotificationAnalytics[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.ANALYTICS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading analytics:', error);
      return [];
    }
  }

  private async getAnalyticsByNotificationId(notificationId: string): Promise<NotificationAnalytics | null> {
    try {
      const allAnalytics = await this.getAllAnalytics();
      return allAnalytics.find(a => a.notificationId === notificationId) || null;
    } catch (error) {
      console.error('Error finding analytics by notification ID:', error);
      return null;
    }
  }

  private async updateAnalytics(analytics: NotificationAnalytics): Promise<void> {
    try {
      const allAnalytics = await this.getAllAnalytics();
      const index = allAnalytics.findIndex(a => a.notificationId === analytics.notificationId);
      
      if (index >= 0) {
        allAnalytics[index] = analytics;
        await AsyncStorage.setItem(this.STORAGE_KEYS.ANALYTICS, JSON.stringify(allAnalytics));
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
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

  private async saveUserEngagementProfile(profile: UserEngagementProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.ENGAGEMENT_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user engagement profile:', error);
    }
  }

  private async updateWeeklyStats(action: 'sent' | 'opened', type: NotificationType): Promise<void> {
    try {
      const week = this.getCurrentWeek();
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.WEEKLY_STATS);
      const stats = stored ? JSON.parse(stored) : {};
      
      if (!stats[week]) {
        stats[week] = { sent: 0, opened: 0, byType: {} };
      }
      
      stats[week][action]++;
      
      if (!stats[week].byType[type]) {
        stats[week].byType[type] = { sent: 0, opened: 0 };
      }
      stats[week].byType[type][action]++;
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.WEEKLY_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating weekly stats:', error);
    }
  }

  private groupByType(analytics: NotificationAnalytics[]): Record<NotificationType, number> {
    const grouped = {} as Record<NotificationType, number>;
    
    analytics.forEach(a => {
      grouped[a.type] = (grouped[a.type] || 0) + 1;
    });
    
    return grouped;
  }

  private async calculateWeeklyTrends(startDate: Date, endDate: Date): Promise<any[]> {
    // Simplified implementation - would calculate actual weekly trends
    return [];
  }

  private async calculateUserEngagement(analytics: NotificationAnalytics[]): Promise<any> {
    const responseTime = analytics
      .filter(a => a.openedAt && a.sentAt)
      .reduce((acc, a) => acc + (a.openedAt!.getTime() - a.sentAt.getTime()) / 60000, 0) / 
      analytics.filter(a => a.openedAt).length || 0;

    return {
      averageResponseTime: Math.round(responseTime),
      preferredTimes: ['09:00', '18:00'], // Would be calculated from actual data
      mostEngagingTypes: [NotificationType.TASK_REMINDER, NotificationType.ACHIEVEMENT]
    };
  }

  private analyzeOptimalTimes(analytics: NotificationAnalytics[]): string[] {
    // Simplified - would analyze actual open times
    return ['09:00', '18:00', '14:00'];
  }

  private analyzeOptimalDays(analytics: NotificationAnalytics[]): string[] {
    // Simplified - would analyze actual open days
    return ['monday', 'wednesday', 'saturday'];
  }

  private async analyzeOptimalFrequency(analytics: NotificationAnalytics[]): Promise<number> {
    // Simplified - would analyze engagement vs frequency
    return 3;
  }

  private getCurrentWeek(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
  }

  private getEmptyReport(): AnalyticsReport {
    return {
      totalNotificationsSent: 0,
      totalNotificationsOpened: 0,
      openRate: 0,
      notificationsByType: {} as Record<NotificationType, number>,
      weeklyTrends: [],
      userEngagement: {
        averageResponseTime: 0,
        preferredTimes: [],
        mostEngagingTypes: []
      }
    };
  }

  // Public method to clear analytics data
  async clearAnalytics(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.ANALYTICS,
        this.STORAGE_KEYS.ENGAGEMENT_PROFILE,
        this.STORAGE_KEYS.WEEKLY_STATS
      ]);
      console.log('📊 Analytics data cleared');
    } catch (error) {
      console.error('Error clearing analytics:', error);
    }
  }
}

export default NotificationAnalyticsService;