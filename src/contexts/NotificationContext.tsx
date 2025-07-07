import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  NotificationPreferences,
  NotificationSchedule,
  NotificationAnalytics,
  NotificationType,
  DEFAULT_NOTIFICATION_PREFERENCES
} from '../types/notifications';
import type { Task, Equipment } from '../types';
import NotificationService from '../lib/services/notificationService';
import NotificationScheduler from '../lib/services/notificationScheduler';
import NotificationContentGenerator from '../lib/services/notificationContentGenerator';

interface NotificationContextType {
  // Preferences
  preferences: NotificationPreferences;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  
  // Service status
  isInitialized: boolean;
  permissionGranted: boolean;
  
  // Scheduling
  scheduleTaskReminder: (task: Task, reminderType: 'advance' | 'due' | 'overdue') => Promise<string>;
  scheduleEquipmentAlert: (equipment: Equipment, alertType: 'service_due' | 'attention_needed') => Promise<string>;
  scheduleAchievementNotification: (type: string, data: any) => Promise<string>;
  
  // Bulk operations
  scheduleTaskNotifications: (tasks: Task[]) => Promise<void>;
  scheduleEquipmentNotifications: (equipment: Equipment[]) => Promise<void>;
  
  // Management
  cancelNotification: (identifier: string) => Promise<void>;
  cancelTaskNotifications: (taskId: string) => Promise<void>;
  cancelEquipmentNotifications: (equipmentId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  
  // Analytics
  getNotificationAnalytics: () => Promise<NotificationAnalytics[]>;
  getScheduledNotifications: () => Promise<Notifications.NotificationRequest[]>;
  
  // Quick actions
  enableNotifications: () => Promise<void>;
  disableNotifications: () => Promise<void>;
  testNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Service instances
  const notificationService = NotificationService.getInstance();
  const notificationScheduler = NotificationScheduler.getInstance();
  const contentGenerator = NotificationContentGenerator.getInstance();

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      console.log('🔔 Initializing notification system...');
      
      // Initialize the notification service
      await notificationService.initialize();
      
      // Load preferences
      const savedPreferences = await notificationService.getPreferences();
      setPreferences(savedPreferences);
      
      // Check permissions
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionGranted(status === 'granted');
      
      setIsInitialized(true);
      console.log('✅ Notification system initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
      setIsInitialized(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      await notificationService.updatePreferences(newPreferences);
      setPreferences(updated);
      console.log('✅ Notification preferences updated');
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      throw error;
    }
  };

  const scheduleTaskReminder = async (
    task: Task, 
    reminderType: 'advance' | 'due' | 'overdue'
  ): Promise<string> => {
    if (!preferences.enabled || !preferences.frequency.taskReminders) {
      throw new Error('Task reminders are disabled');
    }

    try {
      const identifier = await notificationService.scheduleTaskReminder(task, reminderType);
      console.log(`📋 Scheduled ${reminderType} reminder for task: ${task.title}`);
      return identifier;
    } catch (error) {
      console.error('❌ Failed to schedule task reminder:', error);
      throw error;
    }
  };

  const scheduleEquipmentAlert = async (
    equipment: Equipment, 
    alertType: 'service_due' | 'attention_needed'
  ): Promise<string> => {
    if (!preferences.enabled || !preferences.frequency.equipmentAlerts) {
      throw new Error('Equipment alerts are disabled');
    }

    try {
      const identifier = await notificationService.scheduleEquipmentAlert(equipment, alertType);
      console.log(`🔧 Scheduled ${alertType} alert for equipment: ${equipment.name}`);
      return identifier;
    } catch (error) {
      console.error('❌ Failed to schedule equipment alert:', error);
      throw error;
    }
  };

  const scheduleAchievementNotification = async (type: string, data: any): Promise<string> => {
    if (!preferences.enabled || !preferences.frequency.achievements) {
      throw new Error('Achievement notifications are disabled');
    }

    try {
      const identifier = await notificationService.scheduleAchievementNotification(type, data);
      console.log(`🎉 Scheduled achievement notification: ${type}`);
      return identifier;
    } catch (error) {
      console.error('❌ Failed to schedule achievement notification:', error);
      throw error;
    }
  };

  const scheduleTaskNotifications = async (tasks: Task[]): Promise<void> => {
    if (!preferences.enabled || !preferences.frequency.taskReminders) {
      console.log('Task notifications disabled, skipping batch scheduling');
      return;
    }

    try {
      await notificationScheduler.scheduleTaskNotifications(tasks);
      console.log(`📋 Scheduled notifications for ${tasks.length} tasks`);
    } catch (error) {
      console.error('❌ Failed to schedule task notifications:', error);
      throw error;
    }
  };

  const scheduleEquipmentNotifications = async (equipment: Equipment[]): Promise<void> => {
    if (!preferences.enabled || !preferences.frequency.equipmentAlerts) {
      console.log('Equipment notifications disabled, skipping batch scheduling');
      return;
    }

    try {
      await notificationScheduler.scheduleEquipmentNotifications(equipment);
      console.log(`🔧 Scheduled notifications for ${equipment.length} equipment items`);
    } catch (error) {
      console.error('❌ Failed to schedule equipment notifications:', error);
      throw error;
    }
  };

  const cancelNotification = async (identifier: string): Promise<void> => {
    try {
      await notificationService.cancelNotification(identifier);
      console.log(`🗑️ Cancelled notification: ${identifier}`);
    } catch (error) {
      console.error('❌ Failed to cancel notification:', error);
      throw error;
    }
  };

  const cancelTaskNotifications = async (taskId: string): Promise<void> => {
    try {
      await notificationScheduler.cancelScheduledNotificationsForTask(taskId);
      console.log(`🗑️ Cancelled all notifications for task: ${taskId}`);
    } catch (error) {
      console.error('❌ Failed to cancel task notifications:', error);
      throw error;
    }
  };

  const cancelEquipmentNotifications = async (equipmentId: string): Promise<void> => {
    try {
      await notificationScheduler.cancelScheduledNotificationsForEquipment(equipmentId);
      console.log(`🗑️ Cancelled all notifications for equipment: ${equipmentId}`);
    } catch (error) {
      console.error('❌ Failed to cancel equipment notifications:', error);
      throw error;
    }
  };

  const cancelAllNotifications = async (): Promise<void> => {
    try {
      await notificationService.cancelAllNotifications();
      console.log('🗑️ Cancelled all scheduled notifications');
    } catch (error) {
      console.error('❌ Failed to cancel all notifications:', error);
      throw error;
    }
  };

  const getNotificationAnalytics = async (): Promise<NotificationAnalytics[]> => {
    try {
      // This would be implemented to retrieve analytics from storage
      console.log('📊 Fetching notification analytics...');
      return []; // TODO: Implement analytics retrieval
    } catch (error) {
      console.error('❌ Failed to get notification analytics:', error);
      return [];
    }
  };

  const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
    try {
      return await notificationService.getScheduledNotifications();
    } catch (error) {
      console.error('❌ Failed to get scheduled notifications:', error);
      return [];
    }
  };

  const enableNotifications = async (): Promise<void> => {
    try {
      // Request permissions if not granted
      if (!permissionGranted) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Notification permissions not granted');
        }
        setPermissionGranted(true);
      }

      await updatePreferences({ enabled: true });
      console.log('✅ Notifications enabled');
    } catch (error) {
      console.error('❌ Failed to enable notifications:', error);
      throw error;
    }
  };

  const disableNotifications = async (): Promise<void> => {
    try {
      await updatePreferences({ enabled: false });
      await cancelAllNotifications();
      console.log('🔕 Notifications disabled');
    } catch (error) {
      console.error('❌ Failed to disable notifications:', error);
      throw error;
    }
  };

  const testNotification = async (): Promise<void> => {
    try {
      if (!permissionGranted) {
        throw new Error('Notifications not permitted');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏠 HomeKeeper Test',
          body: 'Your notification system is working perfectly!',
          data: { test: true },
        },
        trigger: null, // Send immediately
      });

      console.log('🧪 Test notification sent');
    } catch (error) {
      console.error('❌ Failed to send test notification:', error);
      throw error;
    }
  };

  const value: NotificationContextType = {
    // Preferences
    preferences,
    updatePreferences,
    
    // Service status
    isInitialized,
    permissionGranted,
    
    // Scheduling
    scheduleTaskReminder,
    scheduleEquipmentAlert,
    scheduleAchievementNotification,
    
    // Bulk operations
    scheduleTaskNotifications,
    scheduleEquipmentNotifications,
    
    // Management
    cancelNotification,
    cancelTaskNotifications,
    cancelEquipmentNotifications,
    cancelAllNotifications,
    
    // Analytics
    getNotificationAnalytics,
    getScheduledNotifications,
    
    // Quick actions
    enableNotifications,
    disableNotifications,
    testNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;