import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOCAL_TASK_TEMPLATES } from '../data/localTaskTemplates';
import type { Task } from '../../types';

/**
 * Update existing tasks with money_saved_estimate from their templates
 * This migration function updates tasks that don't have money_saved_estimate
 */
export async function updateTasksWithMoneySaved(): Promise<void> {
  try {
    console.log('🔄 Starting task money saved update...');
    
    // Load existing tasks
    const savedTasks = await AsyncStorage.getItem('homekeeper_tasks');
    if (!savedTasks) {
      console.log('📋 No tasks found to update');
      return;
    }

    const tasks: Task[] = JSON.parse(savedTasks);
    console.log(`📋 Found ${tasks.length} tasks to check`);

    let updatedCount = 0;
    const updatedTasks = tasks.map(task => {
      // Skip if task already has money_saved_estimate
      if (task.money_saved_estimate !== null && task.money_saved_estimate !== undefined) {
        return task;
      }

      // Find matching template by title
      const template = LOCAL_TASK_TEMPLATES.find((t: any) => 
        t.title.toLowerCase() === task.title.toLowerCase() ||
        task.title.toLowerCase().includes(t.title.toLowerCase()) ||
        t.title.toLowerCase().includes(task.title.toLowerCase())
      );

      if (template && template.money_saved_estimate) {
        console.log(`💰 Updating "${task.title}" with $${template.money_saved_estimate} saved`);
        updatedCount++;
        return {
          ...task,
          money_saved_estimate: template.money_saved_estimate
        };
      }

      return task;
    });

    if (updatedCount > 0) {
      // Save updated tasks
      await AsyncStorage.setItem('homekeeper_tasks', JSON.stringify(updatedTasks));
      console.log(`✅ Updated ${updatedCount} tasks with money saved estimates`);
    } else {
      console.log('📋 No tasks needed money saved updates');
    }

  } catch (error) {
    console.error('❌ Error updating tasks with money saved:', error);
  }
} 