/**
 * User Feedback Collection Service
 * Collects user feedback for beta testing and product improvement
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import { feedbackSubmissionService } from './feedbackSubmission';

export interface FeedbackEntry {
  id: string;
  type: 'bug' | 'feature' | 'rating' | 'general';
  title: string;
  description: string;
  rating?: number; // 1-5 stars for rating type
  userContext?: {
    screen?: string;
    action?: string;
    timestamp: string;
  };
  timestamp: string;
}

export interface UsageAnalytics {
  sessionId: string;
  screenViews: Record<string, number>;
  taskActions: {
    created: number;
    completed: number;
    postponed: number;
    deleted: number;
  };
  equipmentActions: {
    added: number;
    edited: number;
    deleted: number;
  };
  onboardingCompleted: boolean;
  sessionDuration: number;
  crashCount: number;
  timestamp: string;
}

class FeedbackService {
  private readonly FEEDBACK_KEY = 'homekeeper_feedback';
  private readonly ANALYTICS_KEY = 'homekeeper_analytics';
  private readonly MAX_STORED_FEEDBACK = 50;
  private currentSession!: UsageAnalytics;

  constructor() {
    this.initializeSession();
  }

  private initializeSession() {
    this.currentSession = {
      sessionId: this.generateSessionId(),
      screenViews: {},
      taskActions: {
        created: 0,
        completed: 0,
        postponed: 0,
        deleted: 0,
      },
      equipmentActions: {
        added: 0,
        edited: 0,
        deleted: 0,
      },
      onboardingCompleted: false,
      sessionDuration: 0,
      crashCount: 0,
      timestamp: new Date().toISOString(),
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFeedbackId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Feedback Collection Methods
  async submitFeedback(feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>): Promise<string> {
    const entry: FeedbackEntry = {
      ...feedback,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Always store locally first
      const existingFeedback = await this.getAllFeedback();
      const updatedFeedback = [...existingFeedback, entry];
      await AsyncStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(updatedFeedback));

      // Try to submit to cloud if configured
      const cloudSubmitted = await feedbackSubmissionService.submitFeedback(entry);
      
      if (cloudSubmitted) {
        logger.info('Feedback submitted to cloud and stored locally', { feedbackId: entry.id });
      } else {
        logger.info('Feedback stored locally only', { feedbackId: entry.id });
      }

      return entry.id;
    } catch (error) {
      logger.error('Failed to submit feedback', error);
      throw error;
    }
  }

  private async getAllFeedback(): Promise<FeedbackEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(this.FEEDBACK_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to retrieve stored feedback', error);
      return [];
    }
  }

  // Usage Analytics Methods
  trackScreenView(screenName: string): void {
    this.currentSession.screenViews[screenName] = 
      (this.currentSession.screenViews[screenName] || 0) + 1;
    
    logger.debug('Screen view tracked', { screenName });
  }

  trackTaskAction(action: keyof UsageAnalytics['taskActions']): void {
    this.currentSession.taskActions[action]++;
    logger.debug('Task action tracked', { action });
  }

  trackEquipmentAction(action: keyof UsageAnalytics['equipmentActions']): void {
    this.currentSession.equipmentActions[action]++;
    logger.debug('Equipment action tracked', { action });
  }

  trackOnboardingCompleted(): void {
    this.currentSession.onboardingCompleted = true;
    logger.info('Onboarding completion tracked');
  }

  trackCrash(): void {
    this.currentSession.crashCount++;
    logger.error('Crash tracked', { sessionId: this.currentSession.sessionId });
  }

  // Session Management
  async endSession(): Promise<void> {
    try {
      this.currentSession.sessionDuration = Date.now() - new Date(this.currentSession.timestamp).getTime();
      
      // Store session analytics
      await this.storeSessionAnalytics();
      
      // Try to submit analytics
      await this.attemptAnalyticsSubmission();
      
      logger.info('Session ended', { 
        duration: this.currentSession.sessionDuration,
        screenViews: Object.keys(this.currentSession.screenViews).length
      });
      
      // Initialize new session
      this.initializeSession();
    } catch (error) {
      logger.error('Failed to end session', error);
    }
  }

  private async storeSessionAnalytics(): Promise<void> {
    try {
      const existingAnalytics = await this.getAnalytics();
      const updatedAnalytics = [this.currentSession, ...existingAnalytics].slice(0, 20); // Keep last 20 sessions
      
      await AsyncStorage.setItem(
        this.ANALYTICS_KEY,
        JSON.stringify(updatedAnalytics)
      );
    } catch (error) {
      logger.error('Failed to store session analytics', error);
    }
  }

  private async getAnalytics(): Promise<UsageAnalytics[]> {
    try {
      const stored = await AsyncStorage.getItem(this.ANALYTICS_KEY);
      return stored ? JSON.parse(stored) : [this.currentSession];
    } catch (error) {
      logger.error('Failed to retrieve stored analytics', error);
      return [this.currentSession];
    }
  }

  private async attemptAnalyticsSubmission(): Promise<void> {
    // In a real implementation, this would submit to your analytics service
    try {
      // Example: await submitToAnalyticsService(this.currentSession);
      logger.debug('Analytics submission attempted', { 
        sessionId: this.currentSession.sessionId 
      });
    } catch (error) {
      logger.warn('Failed to submit analytics, stored locally', error);
    }
  }

  // Utility Methods
  async getFeedbackSummary(): Promise<{
    totalFeedback: number;
    byType: Record<string, number>;
    pendingSubmission: number;
    averageRating?: number;
  }> {
    try {
      const feedback = await this.getAllFeedback();
      const byType = feedback.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ratings = feedback
        .filter(f => f.rating !== undefined)
        .map(f => f.rating!);
      
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : undefined;

      return {
        totalFeedback: feedback.length,
        byType,
        pendingSubmission: feedback.filter(f => !f.submitted).length,
        averageRating,
      };
    } catch (error) {
      logger.error('Failed to get feedback summary', error);
      return {
        totalFeedback: 0,
        byType: {},
        pendingSubmission: 0,
      };
    }
  }

  async getAnalyticsSummary(): Promise<{
    totalSessions: number;
    averageSessionDuration: number;
    mostViewedScreens: Array<{ screen: string; views: number }>;
    totalTaskActions: number;
    onboardingCompletionRate: number;
  }> {
    try {
      const analytics = await this.getAnalytics();
      
      const totalSessions = 1;
      const averageSessionDuration = 0;

      // Aggregate screen views
      const screenViews = analytics.reduce((acc, session) => ({
        ...acc,
        ...session.screenViews
      }), {} as Record<string, number>);

      const mostViewedScreens = Object.entries(screenViews)
        .map(([screen, views]) => ({ screen, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      const totalTaskActions = analytics.reduce((acc, session) => ({
        ...acc,
        ...session.taskActions
      }), {} as Record<string, number>).reduce((sum, count) => sum + count, 0);

      const onboardingCompletionRate = 0;

      return {
        totalSessions,
        averageSessionDuration,
        mostViewedScreens,
        totalTaskActions,
        onboardingCompletionRate,
      };
    } catch (error) {
      logger.error('Failed to get analytics summary', error);
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        mostViewedScreens: [],
        totalTaskActions: 0,
        onboardingCompletionRate: 0,
      };
    }
  }

  // Cleanup old data
  async cleanup(): Promise<void> {
    try {
      // Clean up old feedback (keep only last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const feedback = await this.getAllFeedback();
      const recentFeedback = feedback.filter(f => 
        new Date(f.timestamp) > thirtyDaysAgo
      );

      if (recentFeedback.length !== feedback.length) {
        await AsyncStorage.setItem(
          this.FEEDBACK_KEY,
          JSON.stringify(recentFeedback)
        );
      }

      // Clean up old analytics (keep only last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const analytics = await this.getAnalytics();
      const recentAnalytics = analytics.map(session => ({
        ...session,
        timestamp: new Date().toISOString(),
      }));

      const filteredAnalytics = recentAnalytics.filter(session => 
        new Date(session.timestamp) > sevenDaysAgo
      );

      if (filteredAnalytics.length !== recentAnalytics.length) {
        await AsyncStorage.setItem(
          this.ANALYTICS_KEY,
          JSON.stringify(filteredAnalytics)
        );
      }

      logger.info('Feedback and analytics cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup feedback and analytics', error);
    }
  }

  async syncPendingFeedback(): Promise<void> {
    try {
      const allFeedback = await this.getAllFeedback();
      const analytics = await this.getAnalytics();

      // Submit any feedback that hasn't been sent to cloud yet
      for (const feedback of allFeedback) {
        await feedbackSubmissionService.submitFeedback(feedback);
      }

      // Submit analytics if configured
      for (const analyticsSession of analytics) {
        await feedbackSubmissionService.submitAnalytics(analyticsSession);
      }

      logger.info('Pending feedback sync completed');
    } catch (error) {
      logger.error('Failed to sync pending feedback', error);
    }
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();

// Convenience functions for common feedback types
export const collectFeedback = {
  bug: (title: string, description: string, context?: any) =>
    feedbackService.submitFeedback({
      type: 'bug',
      title,
      description,
      userContext: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    }),

  feature: (title: string, description: string) =>
    feedbackService.submitFeedback({
      type: 'feature',
      title,
      description,
    }),

  rating: (rating: number, description?: string) =>
    feedbackService.submitFeedback({
      type: 'rating',
      title: `App Rating: ${rating}/5`,
      description: description || '',
      rating,
    }),

  general: (title: string, description: string) =>
    feedbackService.submitFeedback({
      type: 'general',
      title,
      description,
    }),
}; 