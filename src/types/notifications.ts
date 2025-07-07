export enum NotificationType {
  TASK_REMINDER = 'task_reminder',
  EQUIPMENT_SERVICE = 'equipment_service',
  ACHIEVEMENT = 'achievement',
  SEASONAL_SUGGESTION = 'seasonal_suggestion',
  WEATHER_OPPORTUNITY = 'weather_opportunity',
  MONEY_SAVED = 'money_saved',
  STREAK = 'streak',
  EQUIPMENT_ATTENTION = 'equipment_attention'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal', 
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationTiming {
  IMMEDIATE = 'immediate',
  OPTIMAL = 'optimal',
  BATCH = 'batch',
  SCHEDULED = 'scheduled'
}

export interface NotificationContent {
  title: string;
  body: string;
  emoji?: string;
  imageUrl?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSchedule {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  timing: NotificationTiming;
  scheduledFor: Date;
  content: NotificationContent;
  relatedTaskId?: string;
  relatedEquipmentId?: string;
  userId: string;
  delivered: boolean;
  opened: boolean;
  dismissed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  enabled: boolean;
  quietHours: {
    start: string; // "21:00"
    end: string;   // "08:00"
  };
  frequency: {
    taskReminders: boolean;
    equipmentAlerts: boolean;
    achievements: boolean;
    suggestions: boolean;
    weeklyLimit: number; // max notifications per week
  };
  style: 'gentle' | 'standard' | 'persistent';
  deliveryTiming: 'immediate' | 'batched' | 'smart';
}

export interface NotificationAnalytics {
  notificationId: string;
  type: NotificationType;
  sentAt: Date;
  openedAt?: Date;
  dismissedAt?: Date;
  actionTaken?: string;
  engagementScore: number; // 0-100
}

export interface NotificationTemplate {
  type: NotificationType;
  priority: NotificationPriority;
  titleTemplate: string;
  bodyTemplate: string;
  emoji: string;
  variables: string[]; // Template variables like {taskName}, {savings}, etc.
}

export interface UserEngagementProfile {
  userId: string;
  optimalDeliveryTime?: string; // Learned from user behavior
  preferredDays: string[]; // ['monday', 'wednesday', 'saturday']
  responseRate: number; // 0-1
  averageResponseTime: number; // minutes
  lastActiveHour: number; // 0-23
  notificationFrequencyTolerance: number; // notifications per week
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationContext {
  weather?: {
    condition: string;
    temperature: number;
    isGoodForOutdoorWork: boolean;
  };
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  userActivity: 'active' | 'inactive' | 'away';
}

// Default preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  quietHours: {
    start: "21:00",
    end: "08:00"
  },
  frequency: {
    taskReminders: true,
    equipmentAlerts: true,
    achievements: true,
    suggestions: false, // Start conservative
    weeklyLimit: 3
  },
  style: 'standard',
  deliveryTiming: 'smart'
};