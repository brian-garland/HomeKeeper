import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDataContext } from '../contexts/DataContext';
import { updateTasksWithMoneySaved } from '../lib/utils/updateTasksWithMoneySaved';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export default function DebugScreen() {
  const { tasks, totalMoneySaved, getTotalMoneySaved } = useDataContext();

  const handleRunMigration = async () => {
    try {
      await updateTasksWithMoneySaved();
      Alert.alert('Success', 'Migration completed! Check the console for details.');
    } catch (error) {
      Alert.alert('Error', 'Migration failed: ' + (error as Error).message);
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const tasksWithMoney = tasks.filter(task => task.money_saved_estimate && task.money_saved_estimate > 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background, padding: 16 }}>
      <Text style={[Typography.displayMedium, { marginBottom: 20 }]}>Debug Screen</Text>
      
      <View style={{ marginBottom: 20 }}>
        <Text style={[Typography.titleLarge, { marginBottom: 10 }]}>Money Saved Summary</Text>
        <Text style={Typography.bodyLarge}>Total Money Saved: ${totalMoneySaved}</Text>
        <Text style={Typography.bodyLarge}>Calculated Total: ${getTotalMoneySaved()}</Text>
        <Text style={Typography.bodyLarge}>Completed Tasks: {completedTasks.length}</Text>
        <Text style={Typography.bodyLarge}>Tasks with Money Estimate: {tasksWithMoney.length}</Text>
      </View>

      <TouchableOpacity
        onPress={handleRunMigration}
        style={{
          backgroundColor: Colors.primary,
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <Text style={[Typography.labelLarge, { color: Colors.white, textAlign: 'center' }]}>
          Run Money Saved Migration
        </Text>
      </TouchableOpacity>

      <Text style={[Typography.titleLarge, { marginBottom: 10 }]}>All Tasks</Text>
      {tasks.map((task, index) => (
        <View
          key={task.id || index}
          style={{
            backgroundColor: Colors.surface,
            padding: 12,
            marginBottom: 8,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: task.status === 'completed' ? Colors.success : Colors.primary,
          }}
        >
          <Text style={[Typography.titleMedium, { marginBottom: 4 }]}>{task.title}</Text>
          <Text style={Typography.bodyMedium}>Status: {task.status}</Text>
          <Text style={Typography.bodyMedium}>
            Money Saved: {task.money_saved_estimate ? `$${task.money_saved_estimate}` : 'Not set'}
          </Text>
          <Text style={Typography.bodyMedium}>Template ID: {task.template_id || 'None'}</Text>
          {task.completed_at && (
            <Text style={Typography.bodyMedium}>Completed: {new Date(task.completed_at).toLocaleDateString()}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
} 