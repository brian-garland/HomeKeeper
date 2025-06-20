import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataProvider, useDataContext } from '../../contexts/DataContext';
import { TEST_HOME, TEST_TASK, TEST_EQUIPMENT, STORAGE_KEYS } from '../setup';
import type { Home, Task, Equipment } from '../../types';

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
    test('should start with empty homes array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      expect(result.current.homes).toEqual([]);
      expect(result.current.loading).toBe(true);
      
      // Wait for initialization to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // After initialization, loading should be false
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
    test('should handle AsyncStorage setItem errors gracefully during save operations', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Wait for initial loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Reset console spy after initialization
      consoleSpy.mockClear();
      
      // Mock setItem to fail for save operations (not initial loading)
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage quota exceeded'));
      
      // Try to add a home, which should trigger a save error
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      // Should not crash, and should log the save error
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving homes:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    test('should handle AsyncStorage getItem errors gracefully during load operations', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock getItem to fail during initial load
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage access denied'));
      
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Wait for loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Should not crash, should log the load error, and loading should be false
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading data from AsyncStorage:',
        expect.any(Error)
      );
      expect(result.current.loading).toBe(false);
      expect(result.current.homes).toEqual([]);
      
      consoleSpy.mockRestore();
    });

    test('should maintain stable state after storage errors', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Wait for initial loading
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Add a home successfully first
      await act(async () => {
        result.current.addHome(TEST_HOME);
      });
      
      expect(result.current.homes).toHaveLength(1);
      
      // Mock storage to fail for next operation
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Network error'));
      
      // Try to add another home
      const home2 = { ...TEST_HOME, id: 'home-2', name: 'Home 2' };
      await act(async () => {
        result.current.addHome(home2);
      });
      
      // State should still be updated even if storage fails
      expect(result.current.homes).toHaveLength(2);
      expect(result.current.homes[1]).toEqual(home2);
    });

    test('should handle multiple concurrent storage failures gracefully', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Wait for initial loading
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      consoleSpy.mockClear();
      
      // Mock all storage operations to fail
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));
      
      // Try multiple operations that should fail storage but succeed in memory
      await act(async () => {
        result.current.addHome({ ...TEST_HOME, id: 'home-1', name: 'Home 1' });
        result.current.addTask({ ...TEST_TASK, id: 'task-1', title: 'Task 1' });
        result.current.addEquipment({ ...TEST_EQUIPMENT, id: 'equipment-1', name: 'Equipment 1' });
      });
      
      // All operations should succeed in memory despite storage failures
      expect(result.current.homes).toHaveLength(1);
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.equipment).toHaveLength(1);
      
      // Should have logged multiple storage errors
      expect(consoleSpy).toHaveBeenCalledWith('Error saving homes:', expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith('Error saving tasks:', expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith('Error saving equipment:', expect.any(Error));
      
      consoleSpy.mockRestore();
      mockAsyncStorage.setItem.mockResolvedValue(); // Reset mock
    });
  });

  describe('Loading State Management', () => {
    test('should properly manage loading state during initialization', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Should start loading
      expect(result.current.loading).toBe(true);
      
      // Wait for initialization to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Should finish loading
      expect(result.current.loading).toBe(false);
    });

    test('should maintain loading false during normal operations', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.loading).toBe(false);
      
      // Perform various operations
      await act(async () => {
        result.current.addHome(TEST_HOME);
        result.current.addTask(TEST_TASK);
        result.current.addEquipment(TEST_EQUIPMENT);
      });
      
      // Loading should remain false during normal operations
      expect(result.current.loading).toBe(false);
    });

    test('should handle manual loading state changes', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.loading).toBe(false);
      
      // Manually set loading to true
      await act(async () => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
      
      // Manually set loading to false
      await act(async () => {
        result.current.setLoading(false);
      });
      
      expect(result.current.loading).toBe(false);
    });

    test('should handle loading state during error scenarios', async () => {
      // Mock getItem to fail during initialization
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Should start loading
      expect(result.current.loading).toBe(true);
      
      // Wait for error handling to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Should finish loading even after error
      expect(result.current.loading).toBe(false);
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
      // Pre-populate AsyncStorage with task data
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([TEST_TASK]));
      
      // Ensure the mock returns the data we just set
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TASKS) {
          return Promise.resolve(JSON.stringify([TEST_TASK]));
        }
        return Promise.resolve(null);
      });
      
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Wait for the useEffect to run and load data
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe(TEST_TASK.id);
      expect(result.current.tasks[0].title).toBe(TEST_TASK.title);
      
      // Reset mock
      mockAsyncStorage.getItem.mockResolvedValue(null);
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
        result.current.updateTask(TEST_TASK.id, updates);
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

// EQUIPMENT OPERATIONS TESTS - NEW SECTION FOR SUBTASK 21.4
describe('DataContext - Equipment Management', () => {
  beforeEach(async () => {
    // Reset mock and clear storage before each test
    mockAsyncStorage.__resetMocks();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State and Loading', () => {
    test('should start with empty equipment array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      expect(result.current.equipment).toEqual([]);
    });

    test('should load equipment from AsyncStorage on mount', async () => {
      // Pre-populate AsyncStorage with equipment data
      await AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify([TEST_EQUIPMENT]));
      
      // Ensure the mock returns the data we just set
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.EQUIPMENT) {
          return Promise.resolve(JSON.stringify([TEST_EQUIPMENT]));
        }
        return Promise.resolve(null);
      });
      
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Wait for the useEffect to run and load data
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.equipment).toHaveLength(1);
      expect(result.current.equipment[0]).toEqual(TEST_EQUIPMENT);
      
      // Reset mock
      mockAsyncStorage.getItem.mockResolvedValue(null);
    });
  });

  describe('addEquipment', () => {
    test('should add a single equipment item correctly', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addEquipment(TEST_EQUIPMENT);
      });
      
      expect(result.current.equipment).toHaveLength(1);
      expect(result.current.equipment[0]).toEqual(TEST_EQUIPMENT);
      
      // Verify persistence
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EQUIPMENT,
        JSON.stringify([TEST_EQUIPMENT])
      );
    });

    test('should add multiple equipment items correctly', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const equipment1: Equipment = { ...TEST_EQUIPMENT, id: 'equipment-1', name: 'Equipment 1' };
      const equipment2: Equipment = { ...TEST_EQUIPMENT, id: 'equipment-2', name: 'Equipment 2' };
      
      await act(async () => {
        result.current.addEquipment(equipment1);
        result.current.addEquipment(equipment2);
      });
      
      expect(result.current.equipment).toHaveLength(2);
      expect(result.current.equipment[0]).toEqual(equipment1);
      expect(result.current.equipment[1]).toEqual(equipment2);
    });

    test('should handle rapid successive addEquipment calls without race condition', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const equipment1: Equipment = { ...TEST_EQUIPMENT, id: 'equipment-1', name: 'Equipment 1' };
      const equipment2: Equipment = { ...TEST_EQUIPMENT, id: 'equipment-2', name: 'Equipment 2' };
      const equipment3: Equipment = { ...TEST_EQUIPMENT, id: 'equipment-3', name: 'Equipment 3' };
      
      await act(async () => {
        // Add multiple equipment items rapidly in succession
        result.current.addEquipment(equipment1);
        result.current.addEquipment(equipment2);
        result.current.addEquipment(equipment3);
      });
      
      // All three should be present (tests our race condition fix)
      expect(result.current.equipment).toHaveLength(3);
      expect(result.current.equipment.map(eq => eq.id)).toEqual(['equipment-1', 'equipment-2', 'equipment-3']);
    });
  });

  describe('updateEquipment', () => {
    test('should update equipment correctly', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Add initial equipment
      await act(async () => {
        result.current.addEquipment(TEST_EQUIPMENT);
      });
      
      // Update equipment
      const updates = { name: 'Updated HVAC System', maintenance_frequency_months: 12 };
      await act(async () => {
        result.current.updateEquipment(TEST_EQUIPMENT.id, updates);
      });
      
      expect(result.current.equipment).toHaveLength(1);
      expect(result.current.equipment[0].name).toBe('Updated HVAC System');
      expect(result.current.equipment[0].maintenance_frequency_months).toBe(12);
      expect(result.current.equipment[0].id).toBe(TEST_EQUIPMENT.id); // Should preserve ID
    });

    test('should update only the targeted equipment item', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const equipment1: Equipment = { ...TEST_EQUIPMENT, id: 'equipment-1', name: 'Equipment 1' };
      const equipment2: Equipment = { ...TEST_EQUIPMENT, id: 'equipment-2', name: 'Equipment 2' };
      
      // Add multiple equipment items
      await act(async () => {
        result.current.addEquipment(equipment1);
        result.current.addEquipment(equipment2);
      });
      
      // Update only the second equipment item
      await act(async () => {
        result.current.updateEquipment('equipment-2', { name: 'Updated Equipment 2' });
      });
      
      expect(result.current.equipment).toHaveLength(2);
      expect(result.current.equipment[0].name).toBe('Equipment 1'); // Should remain unchanged
      expect(result.current.equipment[1].name).toBe('Updated Equipment 2'); // Should be updated
    });

    test('should handle updating non-existent equipment gracefully', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addEquipment(TEST_EQUIPMENT);
      });
      
      // Try to update non-existent equipment
      await act(async () => {
        result.current.updateEquipment('non-existent-id', { name: 'Should not create' });
      });
      
      // Should not crash and should not add a new equipment item
      expect(result.current.equipment).toHaveLength(1);
      expect(result.current.equipment[0]).toEqual(TEST_EQUIPMENT);
    });

    test('should update service dates correctly', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addEquipment(TEST_EQUIPMENT);
      });
      
      const serviceUpdates = {
        last_service_date: '2024-06-15',
        next_service_due: '2024-12-15',
        updated_at: '2024-06-15T10:00:00Z'
      };
      
      await act(async () => {
        result.current.updateEquipment(TEST_EQUIPMENT.id, serviceUpdates);
      });
      
      expect(result.current.equipment[0].last_service_date).toBe('2024-06-15');
      expect(result.current.equipment[0].next_service_due).toBe('2024-12-15');
      expect(result.current.equipment[0].updated_at).toBe('2024-06-15T10:00:00Z');
    });
  });

  describe('deleteEquipment', () => {
    test('should delete equipment correctly', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addEquipment(TEST_EQUIPMENT);
      });
      
      expect(result.current.equipment).toHaveLength(1);
      
      await act(async () => {
        result.current.deleteEquipment(TEST_EQUIPMENT.id);
      });
      
      expect(result.current.equipment).toHaveLength(0);
      
      // Verify persistence
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EQUIPMENT,
        JSON.stringify([])
      );
    });

    test('should delete only the specified equipment item', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      const equipment1: Equipment = { ...TEST_EQUIPMENT, id: 'equipment-1', name: 'Equipment 1' };
      const equipment2: Equipment = { ...TEST_EQUIPMENT, id: 'equipment-2', name: 'Equipment 2' };
      
      await act(async () => {
        result.current.addEquipment(equipment1);
        result.current.addEquipment(equipment2);
      });
      
      await act(async () => {
        result.current.deleteEquipment('equipment-1');
      });
      
      expect(result.current.equipment).toHaveLength(1);
      expect(result.current.equipment[0].id).toBe('equipment-2');
    });

    test('should handle deleting non-existent equipment gracefully', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      await act(async () => {
        result.current.addEquipment(TEST_EQUIPMENT);
      });
      
      // Try to delete non-existent equipment
      await act(async () => {
        result.current.deleteEquipment('non-existent-id');
      });
      
      // Should not crash and original equipment should remain
      expect(result.current.equipment).toHaveLength(1);
      expect(result.current.equipment[0]).toEqual(TEST_EQUIPMENT);
    });
  });

  describe('setEquipment', () => {
    test('should replace equipment array completely', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Add initial equipment
      await act(async () => {
        result.current.addEquipment(TEST_EQUIPMENT);
      });
      
      expect(result.current.equipment).toHaveLength(1);
      
      // Replace with new array
      const newEquipment: Equipment[] = [
        { ...TEST_EQUIPMENT, id: 'new-1', name: 'New Equipment 1' },
        { ...TEST_EQUIPMENT, id: 'new-2', name: 'New Equipment 2' }
      ];
      
      await act(async () => {
        result.current.setEquipment(newEquipment);
      });
      
      expect(result.current.equipment).toHaveLength(2);
      expect(result.current.equipment).toEqual(newEquipment);
      
      // Verify persistence
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EQUIPMENT,
        JSON.stringify(newEquipment)
      );
    });

    test('should handle empty equipment array', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Add initial equipment
      await act(async () => {
        result.current.addEquipment(TEST_EQUIPMENT);
      });
      
      // Set to empty array
      await act(async () => {
        result.current.setEquipment([]);
      });
      
      expect(result.current.equipment).toEqual([]);
      
      // Verify persistence
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EQUIPMENT,
        JSON.stringify([])
      );
    });
  });

  describe('Equipment and Task Integration', () => {
    test('should maintain equipment-task relationships when equipment is updated', async () => {
      const { result } = renderHook(() => useDataContext(), { wrapper });
      
      // Add equipment and task
      await act(async () => {
        result.current.addEquipment(TEST_EQUIPMENT);
        result.current.addTask(TEST_TASK);
      });
      
      // Update equipment
      await act(async () => {
        result.current.updateEquipment(TEST_EQUIPMENT.id, { name: 'Updated HVAC' });
      });
      
      // Task should still reference the equipment
      expect(result.current.tasks[0].equipment_id).toBe(TEST_EQUIPMENT.id);
      expect(result.current.equipment[0].name).toBe('Updated HVAC');
    });
  });
}); 