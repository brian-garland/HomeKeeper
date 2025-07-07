# HomeKeeper Notification System Documentation

## Overview

The HomeKeeper notification system is a comprehensive, intelligent push notification solution designed specifically for home maintenance apps. It provides personalized, context-aware notifications that drive user engagement while avoiding notification fatigue.

## Architecture

### Core Components

```
NotificationService (Main Orchestrator)
├── NotificationScheduler (Smart Scheduling Logic)
├── NotificationContentGenerator (Dynamic Content Creation)
├── NotificationAnalytics (Engagement Tracking)
└── NotificationContext (React Integration)
```

### Data Flow

```
User Action (Add Task/Equipment) 
    ↓
DataContext Integration
    ↓ 
NotificationScheduler.scheduleTaskNotifications()
    ↓
NotificationContentGenerator.generateContent()
    ↓
NotificationService.scheduleNotification()
    ↓
Expo Notifications API
```

## Key Design Principles

### 1. **Offline-First**
- All data stored locally using AsyncStorage
- No backend dependency required
- Works with existing local-first architecture

### 2. **Progressive Engagement**
- Starts conservative (3 notifications/week)
- Increases frequency based on user engagement
- Learns optimal delivery times from user behavior

### 3. **Context-Aware Scheduling**
- Respects quiet hours (9 PM - 8 AM default)
- Batches non-urgent notifications
- Weather-aware for outdoor tasks
- Seasonal suggestions based on time of year

### 4. **User-Controlled**
- Granular preference controls
- Easy enable/disable
- Custom frequency limits
- Notification type toggles

## Core Services

### NotificationService (`src/lib/services/notificationService.ts`)

**Purpose**: Main orchestrator for all notification functionality

**Key Methods**:
- `initialize()` - Sets up permissions and handlers
- `scheduleNotification()` - Core scheduling method
- `scheduleTaskReminder()` - Task-specific reminders
- `scheduleEquipmentAlert()` - Equipment maintenance alerts
- `scheduleAchievementNotification()` - Celebration notifications

**Responsibilities**:
- Permission management
- Expo Notifications API integration
- Notification channel setup (Android)
- Basic content rendering
- Storage of notification preferences

### NotificationScheduler (`src/lib/services/notificationScheduler.ts`)

**Purpose**: Intelligent scheduling logic and timing optimization

**Key Features**:
- **Smart Timing Rules**: Different strategies per notification type
- **User Engagement Learning**: Adapts to user response patterns
- **Frequency Management**: Weekly limits and batching
- **Context Analysis**: Time of day, day of week, season awareness

**Scheduling Strategies**:
```typescript
Task Reminders: Optimal timing (evenings/weekend mornings)
Equipment Alerts: Batched delivery on consistent days
Achievements: Immediate delivery for engagement
Weather Opportunities: Morning delivery when conditions are good
Seasonal Suggestions: Weekend batch delivery
```

**Weekly Frequency Management**:
- Tracks notifications per week
- Prevents over-messaging
- Automatically adjusts based on engagement

### NotificationContentGenerator (`src/lib/services/notificationContentGenerator.ts`)

**Purpose**: Dynamic, personalized content creation

**Template System**:
- 20+ pre-built templates per notification type
- Variable substitution (task name, savings, time, weather)
- Context-aware emoji selection
- User preference style adaptation

**Content Types**:
```typescript
Task Reminders: "🏠 Weekend task: Check HVAC filter (15 min, Save $50)"
Equipment Alerts: "🔧 Water heater service due (Last: 6 months ago)"
Achievements: "💰 You've saved $150 this month with DIY maintenance!"
Weather Opportunities: "🌤️ Perfect weather for exterior painting this weekend"
```

**Personalization Features**:
- Dynamic emoji selection based on task category
- Time estimates and money savings included
- Seasonal context integration
- Motivational messaging with user engagement history

### NotificationAnalytics (`src/lib/services/notificationAnalytics.ts`)

**Purpose**: Engagement tracking and system optimization

**Metrics Tracked**:
- Notification open rates
- Response times
- User engagement scores
- Weekly delivery patterns
- Notification type preferences

**Auto-Optimization**:
- Adjusts frequency based on engagement
- Learns optimal delivery times
- Identifies most engaging content types
- Provides performance reports

## React Integration

### NotificationContext (`src/contexts/NotificationContext.tsx`)

**Purpose**: React integration layer providing hooks and state management

**Key Hooks**:
```typescript
const {
  preferences,
  isInitialized,
  permissionGranted,
  scheduleTaskReminder,
  updatePreferences,
  testNotification
} = useNotifications();
```

### useNotificationSetup (`src/hooks/useNotificationSetup.ts`)

**Purpose**: Automatic initialization and bulk scheduling

**Features**:
- Auto-schedules notifications for existing tasks/equipment
- Sets up periodic optimization
- Handles seasonal suggestion scheduling
- Provides initialization status

## Data Models

### Core Types (`src/types/notifications.ts`)

```typescript
enum NotificationType {
  TASK_REMINDER = 'task_reminder',
  EQUIPMENT_SERVICE = 'equipment_service', 
  ACHIEVEMENT = 'achievement',
  SEASONAL_SUGGESTION = 'seasonal_suggestion',
  WEATHER_OPPORTUNITY = 'weather_opportunity'
}

interface NotificationPreferences {
  enabled: boolean;
  quietHours: { start: string; end: string };
  frequency: {
    taskReminders: boolean;
    equipmentAlerts: boolean;
    achievements: boolean;
    suggestions: boolean;
    weeklyLimit: number;
  };
  style: 'gentle' | 'standard' | 'persistent';
  deliveryTiming: 'immediate' | 'batched' | 'smart';
}
```

### User Engagement Profiling

```typescript
interface UserEngagementProfile {
  userId: string;
  optimalDeliveryTime?: string; // Learned from behavior
  responseRate: number; // 0-1
  averageResponseTime: number; // minutes
  notificationFrequencyTolerance: number; // per week
}
```

## Integration Points

### DataContext Integration

The notification system automatically integrates with your existing DataContext:

**Task Management**:
```typescript
// When task is added
addTask() → scheduleTaskNotifications() → 3-day, 1-day reminders

// When task completed  
updateTask(status: 'completed') → 
  - Cancel pending reminders
  - Send achievement notification
  - Update money saved tracking
```

**Equipment Management**:
```typescript
// When equipment added
addEquipment() → scheduleEquipmentNotifications() → Service due alerts

// Equipment attention needed
equipment.needs_attention = true → Immediate alert notification
```

## Configuration & Customization

### Default Settings (`src/types/preferences.ts`)

```typescript
const DEFAULT_NOTIFICATION_PREFERENCES = {
  enabled: true,
  reminderDays: 3,
  style: 'standard',
  quietHours: { start: "21:00", end: "08:00" },
  frequency: {
    taskReminders: true,
    equipmentAlerts: true, 
    achievements: true,
    suggestions: false, // Conservative start
    weeklyLimit: 3
  },
  deliveryTiming: 'smart'
};
```

### Notification Channels (Android)

```typescript
const channels = [
  {
    identifier: 'task-reminders',
    name: 'Task Reminders',
    importance: HIGH,
    sound: 'default'
  },
  {
    identifier: 'achievements', 
    name: 'Achievements',
    importance: DEFAULT,
    sound: 'success.wav'
  }
];
```

## Testing & Debugging

### Test Panel (`src/components/NotificationTestPanel.tsx`)

A comprehensive testing interface that provides:
- System status monitoring
- Permission management
- Test notification sending
- Scheduled notification inspection
- Preference adjustment
- Analytics viewing

**Usage**: Automatically appears in DashboardScreen during development mode.

### Testing Checklist

1. **Basic Functionality**:
   - [ ] Permissions requested and granted
   - [ ] Test notifications appear in notification tray
   - [ ] Notifications respect quiet hours

2. **Task Integration**:
   - [ ] Adding task schedules reminders 
   - [ ] Completing task cancels reminders and sends achievement
   - [ ] Overdue tasks don't create new reminders

3. **Equipment Integration**:
   - [ ] Equipment with service dates schedules alerts
   - [ ] Equipment needing attention sends immediate alerts

4. **User Preferences**:
   - [ ] Enabling/disabling works correctly
   - [ ] Frequency limits are respected
   - [ ] Quiet hours are enforced

## Performance Considerations

### Storage Management
- Notification analytics limited to last 1000 records
- Automatic weekly cleanup of old data
- Queued storage operations prevent race conditions

### Battery Optimization
- Smart batching reduces notification frequency
- Context-aware scheduling minimizes unnecessary processing
- Local-only processing (no network requests)

### Memory Management
- Lazy loading of analytics data
- Minimal background processing
- Efficient date/time calculations

## Security & Privacy

### Data Privacy
- All data stored locally on device
- No personal information sent to external services
- User has full control over data deletion

### Permissions
- Only requests necessary notification permissions
- Graceful degradation if permissions denied
- Clear permission status reporting

## Troubleshooting

### Common Issues

**Notifications not appearing**:
1. Check device notification settings
2. Verify app has notification permissions
3. Test on physical device (simulators may not show notifications)
4. Check console for initialization errors

**Weekday value errors**:
- Fixed in current implementation
- Uses array-based day names instead of locale formatting

**AsyncStorage errors**:
- Ensure @react-native-async-storage/async-storage is installed
- Check for storage quota limits on device

### Debug Tools

**Console Logging**:
```typescript
// Enable detailed logging
console.log('🔔 Notification system ready!');
console.log('📋 Scheduled notifications for X tasks');
console.log('💰 Money saved achievement sent');
```

**Test Panel Status**:
- System initialization status
- Permission status  
- Scheduled notification count
- Weekly notification count

## Future Enhancements

### Planned Features
1. **Machine Learning**: More sophisticated user behavior prediction
2. **Rich Notifications**: Images, action buttons, progress indicators
3. **Geofencing**: Location-based outdoor task suggestions
4. **Smart Bundling**: Related task grouping in notifications
5. **Voice Integration**: Siri/Google Assistant shortcuts

### Extensibility Points
- Custom notification templates
- Additional analytics metrics
- Integration with external calendar apps
- Weather service integration
- Home automation system hooks

## API Reference

### Quick Reference

```typescript
// Initialize system
const { isInitialized } = useNotificationSetup();

// Schedule notifications
await scheduleTaskReminder(task, 'advance');
await scheduleEquipmentAlert(equipment, 'service_due');
await scheduleAchievementNotification('money_saved', { amount: 150 });

// Manage preferences
await updatePreferences({ 
  frequency: { weeklyLimit: 5 } 
});

// Test functionality
await testNotification();
```

This documentation provides a complete understanding of the notification system architecture, implementation details, and usage patterns. Keep this file updated as the system evolves!