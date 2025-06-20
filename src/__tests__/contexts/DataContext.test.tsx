import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataProvider, useDataContext } from '../../contexts/DataContext';
import { TEST_HOME, TEST_TASK, STORAGE_KEYS } from '../setup';
import type { Home, Task } from '../../types';

// Test wrapper component
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

// Type assertion for our AsyncStorage mock
const mockAsyncStorage = AsyncStorage as any;

describe('DataContext - Home Management', () => {
  beforeEach(async () => {
    // Reset mock and clear storage before each test
    mockAsyncStorage.__resetMocks();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State and Loading', () => {
    test('should start with empty homes array', () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      expect(result.current.homes).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    test('should load homes from AsyncStorage on initialization', async () => {
      // Pre-populate storage with test home data
      const testHomes = [TEST_HOME];
      await AsyncStorage.setItem(STORAGE_KEYS.HOMES, JSON.stringify(testHomes));
      
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Wait for async loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(result.current.homes).toHaveLength(1);
      expect(result.current.homes[0].id).toBe(TEST_HOME.id);
      expect(result.current.homes[0].name).toBe(TEST_HOME.name);
    });
  });

  describe('addHome', () => {
    test('should add a new home to the array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const newHome: Home = {
        ...TEST_HOME,
        id: 'new-home-id',
        name: 'New Test Home'
      };
      
      await act(async () => {
        result.current.addHome(newHome);
      });
      
      expect(result.current.homes).toHaveLength(1);
      expect(result.current.homes[0]).toEqual(newHome);
    });

    test('should save homes to AsyncStorage when adding', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const newHome: Home = {
        ...TEST_HOME,
        id: 'new-home-id',
        name: 'New Test Home'
      };
      
      await act(async () => {
        result.current.addHome(newHome);
      });
      
      // Verify AsyncStorage.setItem was called with correct data
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.HOMES,
        JSON.stringify([newHome])
      );
    });

    test('should add multiple homes correctly', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const home1: Home = { ...TEST_HOME, id: 'home-1', name: 'Home 1' };
      const home2: Home = { ...TEST_HOME, id: 'home-2', name: 'Home 2' };
      
      await act(async () => {
        result.current.addHome(home1);
        result.current.addHome(home2);
      });
      
      expect(result.current.homes).toHaveLength(2);
      expect(result.current.homes[0]).toEqual(home1);
      expect(result.current.homes[1]).toEqual(home2);
    });

    test('should handle rapid successive addHome calls without race condition', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const home1: Home = { ...TEST_HOME, id: 'home-1', name: 'Home 1' };
      const home2: Home = { ...TEST_HOME, id: 'home-2', name: 'Home 2' };
      const home3: Home = { ...TEST_HOME, id: 'home-3', name: 'Home 3' };
      
      // Add homes in rapid succession to test race condition fix
      await act(async () => {
        result.current.addHome(home1);
        result.current.addHome(home2);
        result.current.addHome(home3);
      });
      
      // Wait for all async storage operations to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(result.current.homes).toHaveLength(3);
      expect(result.current.homes[0]).toEqual(home1);
      expect(result.current.homes[1]).toEqual(home2);
      expect(result.current.homes[2]).toEqual(home3);
      
      // Verify AsyncStorage was called the correct number of times
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('updateHome', () => {
    test('should update an existing home', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // First add a home
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      // Then update it
      const updates = { name: 'Updated Home Name', address: 'New Address' };
      
      await act(async () => {
        result.current.updateHome(TEST_HOME.id, updates);
      });
      
      expect(result.current.homes).toHaveLength(1);
      expect(result.current.homes[0].name).toBe('Updated Home Name');
      expect(result.current.homes[0].address).toBe('New Address');
      expect(result.current.homes[0].id).toBe(TEST_HOME.id); // ID should remain unchanged
    });

    test('should not affect other homes when updating', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const home1: Home = { ...TEST_HOME, id: 'home-1', name: 'Home 1' };
      const home2: Home = { ...TEST_HOME, id: 'home-2', name: 'Home 2' };
      
      // Add two homes
      await act(async () => {
        result.current.addHome(home1);
        result.current.addHome(home2);
      });
      
      // Update only the first home
      await act(async () => {
        result.current.updateHome('home-1', { name: 'Updated Home 1' });
      });
      
      expect(result.current.homes).toHaveLength(2);
      expect(result.current.homes[0].name).toBe('Updated Home 1');
      expect(result.current.homes[1].name).toBe('Home 2'); // Should remain unchanged
    });

    test('should save updated homes to AsyncStorage', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      const updates = { name: 'Updated Home' };
      
      await act(async () => {
        result.current.updateHome(TEST_HOME.id, updates);
      });
      
      const expectedHome = { ...TEST_HOME, ...updates };
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        STORAGE_KEYS.HOMES,
        JSON.stringify([expectedHome])
      );
    });

    test('should handle updating non-existent home gracefully', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      // Try to update a home that doesn't exist
      await act(async () => {
        result.current.updateHome('non-existent-id', { name: 'Should not exist' });
      });
      
      // Should not crash and should not affect existing homes
      expect(result.current.homes).toHaveLength(1);
      expect(result.current.homes[0]).toEqual(TEST_HOME);
    });
  });

  describe('deleteHome', () => {
    test('should remove a home from the array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      expect(result.current.homes).toHaveLength(1);
      
      await act(async () => {
        result.current.deleteHome(TEST_HOME.id);
      });
      
      expect(result.current.homes).toHaveLength(0);
    });

    test('should only delete the specified home', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const home1: Home = { ...TEST_HOME, id: 'home-1', name: 'Home 1' };
      const home2: Home = { ...TEST_HOME, id: 'home-2', name: 'Home 2' };
      
      await act(async () => {
        result.current.addHome(home1);
        result.current.addHome(home2);
      });
      
      expect(result.current.homes).toHaveLength(2);
      
      await act(async () => {
        result.current.deleteHome('home-1');
      });
      
      expect(result.current.homes).toHaveLength(1);
      expect(result.current.homes[0]).toEqual(home2);
    });

    test('should save updated homes to AsyncStorage after deletion', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const home1: Home = { ...TEST_HOME, id: 'home-1', name: 'Home 1' };
      const home2: Home = { ...TEST_HOME, id: 'home-2', name: 'Home 2' };
      
      await act(async () => {
        result.current.addHome(home1);
        result.current.addHome(home2);
      });
      
      await act(async () => {
        result.current.deleteHome('home-1');
      });
      
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        STORAGE_KEYS.HOMES,
        JSON.stringify([home2])
      );
    });

    test('should handle deleting non-existent home gracefully', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      const originalLength = result.current.homes.length;
      
      await act(async () => {
        result.current.deleteHome('non-existent-id');
      });
      
      // Should not crash and array should remain unchanged
      expect(result.current.homes).toHaveLength(originalLength);
      expect(result.current.homes[0]).toEqual(TEST_HOME);
    });
  });

  describe('setHomes', () => {
    test('should replace the entire homes array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // First add a home
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      expect(result.current.homes).toHaveLength(1);
      
      // Then replace with new array
      const newHomes: Home[] = [
        { ...TEST_HOME, id: 'new-1', name: 'New Home 1' },
        { ...TEST_HOME, id: 'new-2', name: 'New Home 2' }
      ];
      
      await act(async () => {
        result.current.setHomes(newHomes);
      });
      
      expect(result.current.homes).toHaveLength(2);
      expect(result.current.homes).toEqual(newHomes);
    });

    test('should save new homes array to AsyncStorage', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const newHomes: Home[] = [
        { ...TEST_HOME, id: 'new-1', name: 'New Home 1' }
      ];
      
      await act(async () => {
        result.current.setHomes(newHomes);
      });
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.HOMES,
        JSON.stringify(newHomes)
      );
    });

    test('should handle empty array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      expect(result.current.homes).toHaveLength(1);
      
      await act(async () => {
        result.current.setHomes([]);
      });
      
      expect(result.current.homes).toHaveLength(0);
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        STORAGE_KEYS.HOMES,
        JSON.stringify([])
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle AsyncStorage setItem errors gracefully', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Mock AsyncStorage to fail
      mockAsyncStorage.__simulateFailure('Storage quota exceeded');
      
      // Spy on console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      // Should not crash, but should log error
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving homes:',
        expect.any(Error)
      );
      
      // State should still be updated despite storage failure
      expect(result.current.homes).toHaveLength(1);
      expect(result.current.homes[0]).toEqual(TEST_HOME);
      
      consoleSpy.mockRestore();
    });
  });
});

// TASK OPERATIONS TESTS - NEW SECTION FOR SUBTASK 21.3
describe('DataContext - Task Management', () => {
  beforeEach(async () => {
    // Reset mock and clear storage before each test
    mockAsyncStorage.__resetMocks();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State and Loading', () => {
    test('should start with empty tasks array', () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      expect(result.current.tasks).toEqual([]);
    });

    test('should load tasks from AsyncStorage on initialization', async () => {
      // Pre-populate storage with test task data
      const testTasks = [TEST_TASK];
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(testTasks));
      
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Wait for async loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe(TEST_TASK.id);
      expect(result.current.tasks[0].title).toBe(TEST_TASK.title);
    });
  });

  describe('addTask', () => {
    test('should add a new task to the array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const newTask: Task = {
        ...TEST_TASK,
        id: 'new-task-id',
        title: 'New Test Task'
      };
      
      await act(async () => {
        result.current.addTask(newTask);
      });
      
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toEqual(newTask);
    });

    test('should save tasks to AsyncStorage when adding', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const newTask: Task = {
        ...TEST_TASK,
        id: 'new-task-id',
        title: 'New Test Task'
      };
      
      await act(async () => {
        result.current.addTask(newTask);
      });
      
      // Verify AsyncStorage.setItem was called with correct data
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TASKS,
        JSON.stringify([newTask])
      );
    });

    test('should add multiple tasks correctly', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const task1: Task = { ...TEST_TASK, id: 'task-1', title: 'Task 1' };
      const task2: Task = { ...TEST_TASK, id: 'task-2', title: 'Task 2' };
      
      await act(async () => {
        result.current.addTask(task1);
        result.current.addTask(task2);
      });
      
      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0]).toEqual(task1);
      expect(result.current.tasks[1]).toEqual(task2);
    });

    test('should handle rapid successive addTask calls without race condition', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const task1: Task = { ...TEST_TASK, id: 'task-1', title: 'Task 1' };
      const task2: Task = { ...TEST_TASK, id: 'task-2', title: 'Task 2' };
      const task3: Task = { ...TEST_TASK, id: 'task-3', title: 'Task 3' };
      
      // Add tasks in rapid succession to test race condition fix
      await act(async () => {
        result.current.addTask(task1);
        result.current.addTask(task2);
        result.current.addTask(task3);
      });
      
      // Wait for all async storage operations to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(result.current.tasks).toHaveLength(3);
      expect(result.current.tasks[0]).toEqual(task1);
      expect(result.current.tasks[1]).toEqual(task2);
      expect(result.current.tasks[2]).toEqual(task3);
      
      // Verify AsyncStorage was called the correct number of times
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('updateTask', () => {
    test('should update an existing task', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // First add a task
      await act(async () => {
        result.current.addTask(TEST_TASK);
      });
      
      // Then update it
      const updates = { 
        title: 'Updated Task Title', 
        status: 'in_progress' as const,
        priority: 5 
      };
      
      await act(async () => {
        await result.current.updateTask(TEST_TASK.id, updates);
      });
      
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('Updated Task Title');
      expect(result.current.tasks[0].status).toBe('in_progress');
      expect(result.current.tasks[0].priority).toBe(5);
      expect(result.current.tasks[0].id).toBe(TEST_TASK.id); // ID should remain unchanged
    });

    test('should not affect other tasks when updating', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const task1: Task = { ...TEST_TASK, id: 'task-1', title: 'Task 1' };
      const task2: Task = { ...TEST_TASK, id: 'task-2', title: 'Task 2' };
      
      // Add two tasks
      await act(async () => {
        result.current.addTask(task1);
        result.current.addTask(task2);
      });
      
      // Update only the first task
      await act(async () => {
        await result.current.updateTask('task-1', { title: 'Updated Task 1' });
      });
      
      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0].title).toBe('Updated Task 1');
      expect(result.current.tasks[1].title).toBe('Task 2'); // Should remain unchanged
    });

    test('should save updated tasks to AsyncStorage', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addTask(TEST_TASK);
      });
      
      const updates = { title: 'Updated Task' };
      
      await act(async () => {
        await result.current.updateTask(TEST_TASK.id, updates);
      });
      
      const expectedTask = { ...TEST_TASK, ...updates };
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        STORAGE_KEYS.TASKS,
        JSON.stringify([expectedTask])
      );
    });

    test('should handle updating non-existent task gracefully', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addTask(TEST_TASK);
      });
      
      // Try to update a task that doesn't exist
      await act(async () => {
        await result.current.updateTask('non-existent-id', { title: 'Should not exist' });
      });
      
      // Should not crash and should not affect existing tasks
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toEqual(TEST_TASK);
    });

    test('should handle task completion and money saved tracking', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const taskWithMoney: Task = {
        ...TEST_TASK,
        money_saved_estimate: 75,
        status: 'pending'
      };
      
      await act(async () => {
        result.current.addTask(taskWithMoney);
      });
      
      // Complete the task
      await act(async () => {
        await result.current.updateTask(TEST_TASK.id, { 
          status: 'completed',
          completed_at: '2024-01-15T10:00:00Z'
        });
      });
      
      expect(result.current.tasks[0].status).toBe('completed');
      expect(result.current.tasks[0].completed_at).toBe('2024-01-15T10:00:00Z');
      expect(result.current.getTotalMoneySaved()).toBe(75);
    });
  });

  describe('deleteTask', () => {
    test('should remove a task from the array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addTask(TEST_TASK);
      });
      
      expect(result.current.tasks).toHaveLength(1);
      
      await act(async () => {
        result.current.deleteTask(TEST_TASK.id);
      });
      
      expect(result.current.tasks).toHaveLength(0);
    });

    test('should only delete the specified task', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const task1: Task = { ...TEST_TASK, id: 'task-1', title: 'Task 1' };
      const task2: Task = { ...TEST_TASK, id: 'task-2', title: 'Task 2' };
      
      await act(async () => {
        result.current.addTask(task1);
        result.current.addTask(task2);
      });
      
      expect(result.current.tasks).toHaveLength(2);
      
      await act(async () => {
        result.current.deleteTask('task-1');
      });
      
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toEqual(task2);
    });

    test('should save updated tasks to AsyncStorage after deletion', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const task1: Task = { ...TEST_TASK, id: 'task-1', title: 'Task 1' };
      const task2: Task = { ...TEST_TASK, id: 'task-2', title: 'Task 2' };
      
      await act(async () => {
        result.current.addTask(task1);
        result.current.addTask(task2);
      });
      
      await act(async () => {
        result.current.deleteTask('task-1');
      });
      
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        STORAGE_KEYS.TASKS,
        JSON.stringify([task2])
      );
    });

    test('should handle deleting non-existent task gracefully', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addTask(TEST_TASK);
      });
      
      const originalLength = result.current.tasks.length;
      
      await act(async () => {
        result.current.deleteTask('non-existent-id');
      });
      
      // Should not crash and array should remain unchanged
      expect(result.current.tasks).toHaveLength(originalLength);
      expect(result.current.tasks[0]).toEqual(TEST_TASK);
    });
  });

  describe('setTasks', () => {
    test('should replace the entire tasks array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // First add a task
      await act(async () => {
        result.current.addTask(TEST_TASK);
      });
      
      expect(result.current.tasks).toHaveLength(1);
      
      // Then replace with new array
      const newTasks: Task[] = [
        { ...TEST_TASK, id: 'new-1', title: 'New Task 1' },
        { ...TEST_TASK, id: 'new-2', title: 'New Task 2' }
      ];
      
      await act(async () => {
        result.current.setTasks(newTasks);
      });
      
      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks).toEqual(newTasks);
    });

    test('should save new tasks array to AsyncStorage', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const newTasks: Task[] = [
        { ...TEST_TASK, id: 'new-1', title: 'New Task 1' }
      ];
      
      await act(async () => {
        result.current.setTasks(newTasks);
      });
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TASKS,
        JSON.stringify(newTasks)
      );
    });

    test('should handle empty array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addTask(TEST_TASK);
      });
      
      expect(result.current.tasks).toHaveLength(1);
      
      await act(async () => {
        result.current.setTasks([]);
      });
      
      expect(result.current.tasks).toHaveLength(0);
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        STORAGE_KEYS.TASKS,
        JSON.stringify([])
      );
    });
  });

  describe('Money Tracking', () => {
    test('should calculate total money saved correctly', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const task1: Task = { 
        ...TEST_TASK, 
        id: 'task-1', 
        status: 'completed',
        money_saved_estimate: 50
      };
      const task2: Task = { 
        ...TEST_TASK, 
        id: 'task-2', 
        status: 'completed',
        money_saved_estimate: 75
      };
      const task3: Task = { 
        ...TEST_TASK, 
        id: 'task-3', 
        status: 'pending',
        money_saved_estimate: 100 // Should not count towards total
      };
      
      await act(async () => {
        result.current.addTask(task1);
        result.current.addTask(task2);
        result.current.addTask(task3);
      });
      
      expect(result.current.getTotalMoneySaved()).toBe(125); // 50 + 75
      expect(result.current.totalMoneySaved).toBe(125);
    });

    test('should update total money saved when tasks change status', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const task: Task = { 
        ...TEST_TASK, 
        status: 'pending',
        money_saved_estimate: 50
      };
      
      await act(async () => {
        result.current.addTask(task);
      });
      
      expect(result.current.totalMoneySaved).toBe(0);
      
      // Complete the task
      await act(async () => {
        await result.current.updateTask(TEST_TASK.id, { status: 'completed' });
      });
      
      expect(result.current.totalMoneySaved).toBe(50);
    });
  });
}); 