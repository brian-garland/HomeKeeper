import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDataContext } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationScheduler from '../lib/services/notificationScheduler';
import NotificationAnalyticsService from '../lib/services/notificationAnalytics';

/**
 * Hook to set up and initialize the notification system
 * Call this in your main App component or root provider
 */
export const useNotificationSetup = () => {
  const { tasks, equipment } = useDataContext();
  const { 
    isInitialized, 
    preferences, 
    scheduleTaskNotifications, 
    scheduleEquipmentNotifications 
  } = useNotifications();

  // Initialize bulk notifications when the system is ready
  useEffect(() => {
    if (!isInitialized || !preferences.enabled) {
      return;
    }

    const setupInitialNotifications = async () => {
      try {
        console.log('🔔 Setting up initial notifications...');
        
        // Schedule notifications for existing tasks
        if (preferences.frequency.taskReminders && tasks.length > 0) {
          const pendingTasks = tasks.filter(task => 
            task.status !== 'completed' && 
            new Date(task.due_date) > new Date()
          );
          
          if (pendingTasks.length > 0) {
            await scheduleTaskNotifications(pendingTasks);
            console.log(`📋 Scheduled notifications for ${pendingTasks.length} tasks`);
          }
        }

        // Schedule notifications for equipment
        if (preferences.frequency.equipmentAlerts && equipment.length > 0) {
          await scheduleEquipmentNotifications(equipment);
          console.log(`🔧 Scheduled notifications for ${equipment.length} equipment items`);
        }

        // Schedule periodic optimization
        schedulePeriodicOptimization();
        
        console.log('✅ Initial notification setup complete');
      } catch (error) {
        console.error('❌ Failed to setup initial notifications:', error);
      }
    };

    // Small delay to ensure all contexts are ready
    const timer = setTimeout(setupInitialNotifications, 1000);
    return () => clearTimeout(timer);
  }, [isInitialized, preferences.enabled, tasks.length, equipment.length]);

  // Schedule weekly money saved notifications
  useEffect(() => {
    if (!isInitialized || !preferences.enabled || !preferences.frequency.achievements) {
      return;
    }

    const scheduleWeeklyMoneySaved = () => {
      const completedTasks = tasks.filter(task => 
        task.status === 'completed' && 
        task.money_saved_estimate && 
        task.money_saved_estimate > 0
      );

      if (completedTasks.length === 0) return;

      // Calculate money saved this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const thisWeeksTasks = completedTasks.filter(task =>
        task.completed_at && new Date(task.completed_at) >= oneWeekAgo
      );

      if (thisWeeksTasks.length >= 2) { // Only if user completed 2+ tasks this week
        const totalSaved = thisWeeksTasks.reduce(
          (sum, task) => sum + (task.money_saved_estimate || 0), 
          0
        );

        if (totalSaved >= 20) { // Only if saved $20+ this week
          // This would schedule a weekly summary notification
          console.log(`💰 Would schedule weekly money saved notification: $${totalSaved}`);
        }
      }
    };

    // Check weekly on Sundays
    const now = new Date();
    if (now.getDay() === 0) { // Sunday
      scheduleWeeklyMoneySaved();
    }
  }, [tasks, isInitialized, preferences]);

  // Schedule seasonal suggestions
  useEffect(() => {
    if (!isInitialized || !preferences.enabled || !preferences.frequency.suggestions) {
      return;
    }

    const scheduleSeasonalSuggestions = async () => {
      try {
        const now = new Date();
        const month = now.getMonth();
        let season: string;

        if (month >= 2 && month <= 4) season = 'spring';
        else if (month >= 5 && month <= 7) season = 'summer';
        else if (month >= 8 && month <= 10) season = 'fall';
        else season = 'winter';

        const scheduler = NotificationScheduler.getInstance();
        
        // This would schedule seasonal suggestions based on current season
        console.log(`🍂 Would schedule ${season} seasonal suggestions`);
        
        // Example: Schedule once per season
        try {
          const lastSeasonalCheck = await AsyncStorage.getItem(`lastSeasonalCheck_${season}`);
          if (!lastSeasonalCheck || new Date(lastSeasonalCheck) < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
            // Schedule seasonal notification
            await AsyncStorage.setItem(`lastSeasonalCheck_${season}`, now.toISOString());
          }
        } catch (error) {
          console.log('Error checking seasonal notification timing:', error);
        }
      } catch (error) {
        console.error('Error scheduling seasonal suggestions:', error);
      }
    };

    // Check on the 1st of each month
    if (new Date().getDate() === 1) {
      scheduleSeasonalSuggestions();
    }
  }, [isInitialized, preferences]);

  const schedulePeriodicOptimization = () => {
    // Schedule weekly optimization of notification frequency and timing
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextSunday.setHours(9, 0, 0, 0); // 9 AM on Sunday

    const timeUntilSunday = nextSunday.getTime() - now.getTime();
    
    setTimeout(async () => {
      try {
        const scheduler = NotificationScheduler.getInstance();
        await scheduler.optimizeNotificationFrequency();
        
        const analytics = NotificationAnalyticsService.getInstance();
        const report = await analytics.generateReport(7); // Last 7 days
        
        console.log('📊 Weekly notification optimization complete:', {
          openRate: report.openRate,
          totalSent: report.totalNotificationsSent
        });
        
        // Schedule next week's optimization
        schedulePeriodicOptimization();
      } catch (error) {
        console.error('Error in periodic optimization:', error);
      }
    }, timeUntilSunday);
  };

  return {
    isInitialized,
    notificationsEnabled: preferences.enabled,
    weeklyLimit: preferences.frequency.weeklyLimit
  };
};