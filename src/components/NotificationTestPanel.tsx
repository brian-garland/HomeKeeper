import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { useDataContext } from '../contexts/DataContext';
import { Colors } from '../theme/colors';

interface NotificationTestPanelProps {
  visible?: boolean;
}

export const NotificationTestPanel: React.FC<NotificationTestPanelProps> = ({ 
  visible = true 
}) => {
  const { 
    isInitialized, 
    permissionGranted, 
    preferences, 
    testNotification, 
    enableNotifications, 
    disableNotifications,
    updatePreferences,
    getScheduledNotifications
  } = useNotifications();
  
  const { tasks, equipment } = useDataContext();
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const handleTestBasicNotification = async () => {
    try {
      setLoading(true);
      await testNotification();
      Alert.alert('✅ Success', 'Test notification sent! Check your notification tray.');
    } catch (error) {
      Alert.alert('❌ Error', `Failed to send test notification: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      setLoading(true);
      await enableNotifications();
      Alert.alert('✅ Enabled', 'Notifications are now enabled!');
    } catch (error) {
      Alert.alert('❌ Error', `Failed to enable notifications: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      setLoading(true);
      await disableNotifications();
      Alert.alert('🔕 Disabled', 'Notifications are now disabled');
    } catch (error) {
      Alert.alert('❌ Error', `Failed to disable notifications: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestTaskReminder = async () => {
    if (tasks.length === 0) {
      Alert.alert('ℹ️ No Tasks', 'Add a task first to test task reminders');
      return;
    }

    const upcomingTask = tasks.find(task => 
      task.status !== 'completed' && 
      new Date(task.due_date) > new Date()
    );

    if (!upcomingTask) {
      Alert.alert('ℹ️ No Upcoming Tasks', 'All tasks are completed or overdue');
      return;
    }

    try {
      setLoading(true);
      await testNotification(); // This would normally be a task-specific test
      Alert.alert('📋 Task Reminder', `Test reminder sent for: ${upcomingTask.title}`);
    } catch (error) {
      Alert.alert('❌ Error', `Failed to send task reminder: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAchievement = async () => {
    try {
      setLoading(true);
      await testNotification(); // This would be an achievement notification
      Alert.alert('🎉 Achievement', 'Test achievement notification sent!');
    } catch (error) {
      Alert.alert('❌ Error', `Failed to send achievement: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckScheduled = async () => {
    try {
      setLoading(true);
      const scheduled = await getScheduledNotifications();
      Alert.alert(
        '📅 Scheduled Notifications', 
        `You have ${scheduled.length} notifications scheduled.\n\n${
          scheduled.slice(0, 3).map(n => 
            `• ${n.content.title}\n  Due: ${new Date(n.trigger.date).toLocaleString()}`
          ).join('\n\n')
        }${scheduled.length > 3 ? '\n\n...and more' : ''}`
      );
    } catch (error) {
      Alert.alert('❌ Error', `Failed to check scheduled notifications: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFrequency = async () => {
    const newLimit = preferences.frequency.weeklyLimit >= 5 ? 1 : preferences.frequency.weeklyLimit + 1;
    try {
      await updatePreferences({
        frequency: {
          ...preferences.frequency,
          weeklyLimit: newLimit
        }
      });
      Alert.alert('⚙️ Updated', `Weekly limit set to ${newLimit} notifications`);
    } catch (error) {
      Alert.alert('❌ Error', `Failed to update preferences: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔔 Notification Test Panel</Text>
      
      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.statusText}>
          System: {isInitialized ? '✅ Ready' : '⏳ Initializing...'}
        </Text>
        <Text style={styles.statusText}>
          Permissions: {permissionGranted ? '✅ Granted' : '❌ Not Granted'}
        </Text>
        <Text style={styles.statusText}>
          Enabled: {preferences.enabled ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.statusText}>
          Weekly Limit: {preferences.frequency.weeklyLimit} notifications
        </Text>
      </View>

      {/* Permission Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controls</Text>
        
        {!permissionGranted && (
          <TouchableOpacity 
            style={[styles.button, styles.enableButton]} 
            onPress={handleEnableNotifications}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔔 Enable Notifications</Text>
          </TouchableOpacity>
        )}

        {preferences.enabled ? (
          <TouchableOpacity 
            style={[styles.button, styles.disableButton]} 
            onPress={handleDisableNotifications}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔕 Disable Notifications</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.enableButton]} 
            onPress={handleEnableNotifications}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔔 Enable Notifications</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Notifications</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={handleTestBasicNotification}
          disabled={loading || !permissionGranted}
        >
          <Text style={styles.buttonText}>🧪 Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={handleTestTaskReminder}
          disabled={loading || !permissionGranted}
        >
          <Text style={styles.buttonText}>📋 Test Task Reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={handleTestAchievement}
          disabled={loading || !permissionGranted}
        >
          <Text style={styles.buttonText}>🎉 Test Achievement</Text>
        </TouchableOpacity>
      </View>

      {/* Info Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.infoButton]} 
          onPress={handleCheckScheduled}
          disabled={loading}
        >
          <Text style={styles.buttonText}>📅 Check Scheduled</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.infoButton]} 
          onPress={handleToggleFrequency}
          disabled={loading}
        >
          <Text style={styles.buttonText}>⚙️ Cycle Weekly Limit</Text>
        </TouchableOpacity>
      </View>

      {/* Data Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Summary</Text>
        <Text style={styles.statusText}>Tasks: {tasks.length} total</Text>
        <Text style={styles.statusText}>
          Upcoming: {tasks.filter(t => t.status !== 'completed' && new Date(t.due_date) > new Date()).length}
        </Text>
        <Text style={styles.statusText}>Equipment: {equipment.length} items</Text>
        <Text style={styles.statusText}>
          Needs Attention: {equipment.filter(e => e.needs_attention).length}
        </Text>
      </View>

      <Text style={styles.footer}>
        💡 Tip: Check your phone's notification tray after testing
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.background || '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.primary || '#2E7D32',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.primary || '#2E7D32',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  enableButton: {
    backgroundColor: Colors.primary || '#2E7D32',
  },
  disableButton: {
    backgroundColor: '#757575',
  },
  testButton: {
    backgroundColor: '#1976D2',
  },
  infoButton: {
    backgroundColor: '#7B1FA2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default NotificationTestPanel;