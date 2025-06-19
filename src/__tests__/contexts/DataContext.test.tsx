import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataProvider, useDataContext } from '../../contexts/DataContext';
import { TEST_HOME } from '../setup';
import type { Home } from '../../types';

// Test wrapper component
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

// Type assertion for our AsyncStorage mock
const mockAsyncStorage = AsyncStorage as any;

// Storage keys (matching DataContext)
const STORAGE_KEYS = {
  HOMES: 'homekeeper_homes',
  TASKS: 'homekeeper_tasks', 
  EQUIPMENT: 'homekeeper_equipment'
};

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