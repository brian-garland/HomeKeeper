import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createRecurringTask } from '../lib/services/recurringTaskService';
import { updateTasksWithMoneySaved } from '../lib/utils/updateTasksWithMoneySaved';
import NotificationService from '../lib/services/notificationService';
import NotificationScheduler from '../lib/services/notificationScheduler';
import type { Home, Task, Equipment } from '../types';

interface DataContextType {
  // Homes
  homes: Home[];
  setHomes: (homes: Home[]) => void;
  addHome: (home: Home) => void;
  updateHome: (id: string, updates: Partial<Home>) => void;
  deleteHome: (id: string) => void;
  
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => void;
  
  // Equipment
  equipment: Equipment[];
  setEquipment: (equipment: Equipment[]) => void;
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  
  // Money tracking
  totalMoneySaved: number;
  getTotalMoneySaved: () => number;
  
  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  HOMES: 'homekeeper_homes',
  TASKS: 'homekeeper_tasks',
  EQUIPMENT: 'homekeeper_equipment'
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [homes, setHomesState] = useState<Home[]>([]);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [equipment, setEquipmentState] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalMoneySaved, setTotalMoneySaved] = useState(0);

  // 🔧 FIX: Add storage operation queue to prevent race conditions
  const storageQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Notification services
  const notificationService = NotificationService.getInstance();
  const notificationScheduler = NotificationScheduler.getInstance();

  // 🔧 FIX: Queue storage operations to prevent race conditions
  const queueStorageOperation = async (operation: () => Promise<void>): Promise<void> => {
    const currentQueue = storageQueueRef.current;
    storageQueueRef.current = currentQueue.then(operation).catch(error => {
      console.error('Storage operation failed:', error);
    });
    return storageQueueRef.current;
  };

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load homes
      const savedHomes = await AsyncStorage.getItem(STORAGE_KEYS.HOMES);
      if (savedHomes) {
        const parsedHomes = JSON.parse(savedHomes);
        setHomesState(parsedHomes);
        console.log('📍 DataContext loaded local home with coordinates:', parsedHomes[0]?.latitude, parsedHomes[0]?.longitude);
      }

      // Load tasks
      const savedTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        setTasksState(parsedTasks);
        console.log('📋 DataContext: Loading saved tasks:', parsedTasks.length);
        
        // Run migration to add money_saved_estimate to existing tasks
        await updateTasksWithMoneySaved();
        
        // Reload tasks after migration
        const updatedTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
        if (updatedTasks) {
          const reparsedTasks = JSON.parse(updatedTasks);
          setTasksState(reparsedTasks);
          console.log('📋 DataContext: Reloaded tasks after migration:', reparsedTasks.length);
        }
      }

      // Load equipment
      const savedEquipment = await AsyncStorage.getItem(STORAGE_KEYS.EQUIPMENT);
      if (savedEquipment) {
        const parsedEquipment = JSON.parse(savedEquipment);
        setEquipmentState(parsedEquipment);
        console.log('📦 DataContext: Loading saved equipment:', parsedEquipment.length);
      }
    } catch (error) {
      console.error('Error loading data from AsyncStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FIX: Modified save functions to use queuing
  const saveHomes = async (newHomes: Home[]) => {
    return queueStorageOperation(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.HOMES, JSON.stringify(newHomes));
      } catch (error) {
        console.error('Error saving homes:', error);
        throw error;
      }
    });
  };

  const saveTasks = async (newTasks: Task[]) => {
    return queueStorageOperation(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
        throw error;
      }
    });
  };

  const saveEquipment = async (newEquipment: Equipment[]) => {
    return queueStorageOperation(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(newEquipment));
      } catch (error) {
        console.error('Error saving equipment:', error);
        throw error;
      }
    });
  };

  // Home methods
  const setHomes = (newHomes: Home[]) => {
    setHomesState(newHomes);
    saveHomes(newHomes);
  };

  const addHome = (home: Home) => {
    setHomesState(prevHomes => {
      const newHomes = [...prevHomes, home];
      saveHomes(newHomes);
      return newHomes;
    });
  };

  const updateHome = (id: string, updates: Partial<Home>) => {
    setHomesState(prevHomes => {
      const newHomes = prevHomes.map(home => 
        home.id === id ? { ...home, ...updates } : home
      );
      saveHomes(newHomes);
      return newHomes;
    });
  };

  const deleteHome = (id: string) => {
    setHomesState(prevHomes => {
      const newHomes = prevHomes.filter(home => home.id !== id);
      saveHomes(newHomes);
      return newHomes;
    });
  };

  // Task methods
  const setTasks = (newTasks: Task[]) => {
    setTasksState(newTasks);
    saveTasks(newTasks);
  };

  const addTask = (task: Task) => {
    setTasksState(prevTasks => {
      const newTasks = [...prevTasks, task];
      saveTasks(newTasks);
      
      // Schedule notifications for the new task
      setTimeout(async () => {
        try {
          await scheduleTaskNotifications(task);
        } catch (error) {
          console.log('Failed to schedule notifications for new task:', error);
        }
      }, 100); // Small delay to ensure state is updated
      
      return newTasks;
    });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    console.log('DataContext updateTask called with id:', id, 'updates:', updates);
    
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    );
    
    // Check if task was completed and handle recurring task creation
    const updatedTask = updatedTasks.find(task => task.id === id);
    console.log('🔍 Updated task found:', updatedTask?.title);
    console.log('🔍 Task has recurrence:', updatedTask?.recurrence);
    console.log('🔍 Status update:', updates.status);
    console.log('🔍 Completed at:', updates.completed_at);
    
    if (updatedTask && updates.status === 'completed' && updates.completed_at) {
      console.log('🔄 Task completed, checking for recurrence...');
      
      // Cancel any pending notifications for this task
      try {
        await cancelTaskNotifications(id);
      } catch (error) {
        console.log('Failed to cancel task notifications:', error);
      }
      
      // Schedule achievement notification for task completion
      try {
        await scheduleAchievementNotification('completion', {
          taskName: updatedTask.title,
          moneySaved: updatedTask.money_saved_estimate || 0
        });
      } catch (error) {
        console.log('Failed to schedule achievement notification:', error);
      }
      
      // Log money saved if applicable
      if (updatedTask.money_saved_estimate && updatedTask.money_saved_estimate > 0) {
        console.log('💰 Money saved by completing task:', `$${updatedTask.money_saved_estimate}`);
      }

      // 🚀 NEW: Update equipment service dates when equipment-linked task is completed
      console.log('🔍 Task equipment_id:', updatedTask.equipment_id);
      console.log('🔍 Available equipment:', equipment.map(eq => ({ id: eq.id, name: eq.name })));
      
      if (updatedTask.equipment_id) {
        console.log('⚙️ Task is equipment-linked, updating equipment service dates...');
        const linkedEquipment = equipment.find(eq => eq.id === updatedTask.equipment_id);
        
        if (linkedEquipment) {
          const completedDate = new Date(updates.completed_at);
          const completedDateString = completedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          
          // Calculate next service due date based on maintenance frequency
          let nextServiceDue: string | null = null;
          if (linkedEquipment.maintenance_frequency_months) {
            const nextServiceDate = new Date(completedDate);
            nextServiceDate.setMonth(nextServiceDate.getMonth() + linkedEquipment.maintenance_frequency_months);
            nextServiceDue = nextServiceDate.toISOString().split('T')[0];
          }
          
          // Update equipment service dates
          const equipmentUpdates = {
            last_service_date: completedDateString,
            ...(nextServiceDue && { next_service_due: nextServiceDue }),
            updated_at: new Date().toISOString()
          };
          
          console.log(`⚙️ Updating equipment "${linkedEquipment.name}":`, equipmentUpdates);
          updateEquipment(linkedEquipment.id, equipmentUpdates);
          
          console.log(`✅ Equipment service dates updated! Last service: ${completedDateString}, Next service: ${nextServiceDue || 'Not scheduled'}`);
        } else {
          console.log('⚠️ Equipment not found for equipment_id:', updatedTask.equipment_id);
        }
      }
      
      if (updatedTask.recurrence?.enabled) {
        console.log('🔄 Recurrence enabled, creating recurring task...');
        try {
          // Convert the task to the expected type for createRecurringTask
          const taskForRecurring = {
            ...updatedTask,
            recurrence: updatedTask.recurrence
          };
          const recurringTask = createRecurringTask(taskForRecurring, new Date(updates.completed_at));
          
          if (recurringTask) {
            console.log('✅ Created recurring task:', recurringTask.title);
            console.log('📅 Next due date:', recurringTask.due_date);
            updatedTasks.push(recurringTask);
          } else {
            console.log('❌ No recurring task created');
          }
        } catch (error) {
          console.error('❌ Error creating recurring task:', error);
        }
      } else {
        console.log('🚫 Recurrence not enabled for this task');
      }
    }
    
    console.log('Updated tasks array length:', updatedTasks.length);
    setTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    setTasksState(prevTasks => {
      const newTasks = prevTasks.filter(task => task.id !== id);
      saveTasks(newTasks);
      return newTasks;
    });
  };

  // Equipment methods
  const setEquipment = (newEquipment: Equipment[]) => {
    setEquipmentState(newEquipment);
    saveEquipment(newEquipment);
  };

  const addEquipment = (equipmentItem: Equipment) => {
    setEquipmentState(prevEquipment => {
      const newEquipment = [...prevEquipment, equipmentItem];
      saveEquipment(newEquipment);
      
      // Schedule notifications for the new equipment
      setTimeout(async () => {
        try {
          await scheduleEquipmentNotifications(equipmentItem);
        } catch (error) {
          console.log('Failed to schedule notifications for new equipment:', error);
        }
      }, 100); // Small delay to ensure state is updated
      
      return newEquipment;
    });
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    setEquipmentState(prevEquipment => {
      const newEquipment = prevEquipment.map(eq => 
        eq.id === id ? { ...eq, ...updates } : eq
      );
      saveEquipment(newEquipment);
      return newEquipment;
    });
  };

  const deleteEquipment = (id: string) => {
    setEquipmentState(prevEquipment => {
      const newEquipment = prevEquipment.filter(eq => eq.id !== id);
      saveEquipment(newEquipment);
      return newEquipment;
    });
  };

  // Money tracking methods
  const getTotalMoneySaved = () => {
    return tasks
      .filter(task => task.status === 'completed' && task.money_saved_estimate)
      .reduce((total, task) => total + (task.money_saved_estimate || 0), 0);
  };

  // Update total money saved when tasks change
  React.useEffect(() => {
    const newTotal = getTotalMoneySaved();
    setTotalMoneySaved(newTotal);
  }, [tasks]);

  // Notification helper functions
  const scheduleTaskNotifications = async (task: Task) => {
    try {
      const preferences = await notificationService.getPreferences();
      if (!preferences.enabled || !preferences.frequency.taskReminders) {
        return;
      }

      // Schedule reminder notifications based on due date
      const dueDate = new Date(task.due_date);
      const now = new Date();
      
      // Skip if task is already overdue
      if (dueDate <= now) {
        return;
      }

      // Schedule different types of reminders
      const threeDaysOut = new Date(dueDate.getTime() - (3 * 24 * 60 * 60 * 1000));
      const oneDayOut = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000));

      if (threeDaysOut > now) {
        await notificationService.scheduleTaskReminder(task, 'advance');
      }
      if (oneDayOut > now) {
        await notificationService.scheduleTaskReminder(task, 'due');
      }
    } catch (error) {
      console.error('Error scheduling task notifications:', error);
    }
  };

  const cancelTaskNotifications = async (taskId: string) => {
    try {
      await notificationScheduler.cancelScheduledNotificationsForTask(taskId);
    } catch (error) {
      console.error('Error cancelling task notifications:', error);
    }
  };

  const scheduleAchievementNotification = async (type: 'money_saved' | 'streak' | 'completion', data: any) => {
    try {
      await notificationService.scheduleAchievementNotification(type, data);
    } catch (error) {
      console.error('Error scheduling achievement notification:', error);
    }
  };

  const scheduleEquipmentNotifications = async (equipmentItem: Equipment) => {
    try {
      const preferences = await notificationService.getPreferences();
      if (!preferences.enabled || !preferences.frequency.equipmentAlerts) {
        return;
      }

      // Schedule service due notification if applicable
      if (equipmentItem.next_service_due) {
        await notificationService.scheduleEquipmentAlert(equipmentItem, 'service_due');
      }

      // Schedule attention needed notification if applicable
      if (equipmentItem.needs_attention) {
        await notificationService.scheduleEquipmentAlert(equipmentItem, 'attention_needed');
      }
    } catch (error) {
      console.error('Error scheduling equipment notifications:', error);
    }
  };

  const value: DataContextType = {
    // Homes
    homes,
    setHomes,
    addHome,
    updateHome,
    deleteHome,
    
    // Tasks
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    
    // Equipment
    equipment,
    setEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    
    // Money tracking
    totalMoneySaved,
    getTotalMoneySaved,
    
    // Loading
    loading,
    setLoading
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}; 