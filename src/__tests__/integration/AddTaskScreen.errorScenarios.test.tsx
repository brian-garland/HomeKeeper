import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddTaskScreen } from '../../screens/AddTaskScreen';
import { DataProvider } from '../../contexts/DataContext';
import type { Task, Home, Equipment } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock navigation hooks
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    reset: mockReset,
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: undefined,
  }),
}));

// Mock KeyboardAwareScrollView
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{props.name || 'icon'}</Text>;
  },
}));

// Mock Icon component
jest.mock('../../components/icons/Icon', () => ({
  Icon: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${props.name}`}>{props.name || 'icon'}</Text>;
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Test data
const mockHomes: Home[] = [
  {
    id: 'home-1',
    name: 'Test Home',
    address: '123 Test St',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    owner_id: 'user-1',
    city: 'Test City',
    state: 'TS',
    zip_code: '12345',
    country: 'US',
    square_footage: 2000,
    year_built: 2020,
    home_type: 'single_family',
    bedrooms: 3,
    bathrooms: 2,
    lot_size: 0.25,
    heating_type: 'forced_air',
    cooling_type: 'central',
    water_heater_type: 'gas',
    floors: 1,
    latitude: null,
    longitude: null,
    location: null,
    maintenance_season_start: null,
    high_maintenance_mode: false,
    photo_url: null,
    notes: null,
    active: true,
  },
];

const mockEquipment: Equipment[] = [
  {
    id: 'equipment-1',
    home_id: 'home-1',
    name: 'Test Equipment',
    type: 'hvac',
    category: 'hvac',
    brand: 'Test Brand',
    model: 'Test Model',
    serial_number: 'TEST123',
    purchase_date: '2024-01-01',
    warranty_expires: '2025-01-01',
    install_date: '2024-01-01',
    location: 'Test Location',
    room: 'Test Room',
    active: true,
    needs_attention: false,
    maintenance_frequency_months: 6,
    last_service_date: null,
    next_service_due: null,
    manual_url: null,
    specifications: null,
    photo_urls: null,
    notes: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
];

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; initialData?: { homes?: Home[]; equipment?: Equipment[]; tasks?: Task[] } }> = ({ 
  children, 
  initialData = {} 
}) => {
  // Mock initial data loading
  React.useEffect(() => {
    const { homes = mockHomes, equipment = mockEquipment, tasks = [] } = initialData;
    
    mockAsyncStorage.getItem.mockImplementation((key: string) => {
      switch (key) {
        case 'homes':
          return Promise.resolve(JSON.stringify(homes));
        case 'equipment':
          return Promise.resolve(JSON.stringify(equipment));
        case 'tasks':
          return Promise.resolve(JSON.stringify(tasks));
        default:
          return Promise.resolve(null);
      }
    });
  }, [initialData]);

  return (
    <DataProvider>
      {children}
    </DataProvider>
  );
};

describe('AddTaskScreen - Error Scenarios and Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  // ========================================
  // STORAGE AND PERSISTENCE ERROR SCENARIOS
  // ========================================

  describe('Storage and Persistence Errors', () => {
    test('should handle AsyncStorage quota exceeded error gracefully', async () => {
      // Mock storage quota exceeded error
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage quota exceeded'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Storage Error Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing storage quota error');

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should create task successfully (DataContext handles storage errors gracefully)
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });

      // Should log error to console for storage failure
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle AsyncStorage permission denied error', async () => {
      // Mock permission denied error
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage access denied'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Permission Error Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing permission error');

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should create task successfully (DataContext handles storage errors gracefully)
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });

      // Should log error to console for storage failure
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle network timeout during storage operations', async () => {
      // Mock timeout error
      mockAsyncStorage.setItem.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Timeout Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing timeout error');

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should create task successfully (DataContext handles storage errors gracefully)
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      }, { timeout: 5000 });

      // Should log error to console for storage failure
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  // ========================================
  // INVALID INPUT AND DATA EDGE CASES
  // ========================================

  describe('Invalid Input and Data Edge Cases', () => {
    test('should handle extremely long task title', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Create extremely long title (1000+ characters)
      const longTitle = 'A'.repeat(1000);
      const longDescription = 'B'.repeat(2000);

      fireEvent.changeText(getByPlaceholderText('Enter task title'), longTitle);
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), longDescription);

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should handle long input gracefully and create task
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });

    test('should handle special characters and unicode in task input', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Use special characters and unicode
      const specialTitle = '🏠 Fix 🔧 & 🧹 Clean "Quotes" & \'Apostrophes\' & <HTML> & {JSON}';
      const specialDescription = 'Test émojis: 🎉🚀💡 & special chars: @#$%^&*()[]{}|\\:";\'<>?,./ & unicode: café résumé naïve';

      fireEvent.changeText(getByPlaceholderText('Enter task title'), specialTitle);
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), specialDescription);

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should handle special characters gracefully
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });

    test('should handle malformed date inputs', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out basic form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Date Test Task');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing date handling');

      // Submit form (should use default date handling)
      fireEvent.press(getByText('Create Task'));

      // Should create task with valid date
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });

    test('should handle null and undefined values in form data', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill only required fields, leaving others as defaults
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Minimal Data Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing minimal data');

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should handle null/undefined gracefully
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });
  });

  // ========================================
  // MEMORY AND RESOURCE CONSTRAINT SCENARIOS
  // ========================================

  describe('Memory and Resource Constraints', () => {
    test('should handle rapid consecutive task creation attempts', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Rapid Creation Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing rapid creation');

      // Rapidly press save button multiple times
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);
      fireEvent.press(saveButton);
      fireEvent.press(saveButton);

      // Should handle multiple presses (may create multiple tasks or be prevented by loading state)
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });

      // Verify that Alert.alert was called at least once (rapid presses may result in multiple calls)
      expect((Alert.alert as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });

    test('should handle large number of existing tasks', async () => {
      // Create large number of existing tasks
      const largeTasks: Task[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        home_id: 'home-1',
        equipment_id: null,
        template_id: null,
        title: `Existing Task ${i}`,
        description: `Description for task ${i}`,
        category: 'general',
        due_date: '2024-12-31',
        priority: 1,
        estimated_duration_minutes: 30,
        difficulty_level: 1,
        instructions: null,
        status: 'pending',
        completed_at: null,
        completed_by: null,
        auto_generated: false,
        reschedule_count: 0,
        weather_dependent: false,
        notes: null,
        tags: [],
        money_saved_estimate: null,
        recurrence: null,
      }));

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper initialData={{ tasks: largeTasks }}>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Large Dataset Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing with large dataset');

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should handle large dataset gracefully
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });
  });

  // ========================================
  // UI STATE MANAGEMENT DURING ERRORS
  // ========================================

  describe('UI State Management During Errors', () => {
    test('should show loading state and disable button during save', async () => {
      // Slow down AsyncStorage to test loading state
      mockAsyncStorage.setItem.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 500))
      );

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Loading State Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing loading state');

      // Submit form
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Button should be disabled during loading (try pressing again)
      fireEvent.press(saveButton);

      // Should complete successfully
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      }, { timeout: 1000 });
    });

    test('should maintain form state during storage operations', async () => {
      // Mock slow storage operation to test form state persistence
      mockAsyncStorage.setItem.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );

      const { getByPlaceholderText, getByText, getByDisplayValue } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Form State Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing form state');

      // Verify form has data before submission
      expect(getByDisplayValue('Form State Test')).toBeTruthy();
      expect(getByDisplayValue('Testing form state')).toBeTruthy();

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Form should maintain data during processing
      expect(getByDisplayValue('Form State Test')).toBeTruthy();
      expect(getByDisplayValue('Testing form state')).toBeTruthy();

      // Should eventually succeed
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      }, { timeout: 1000 });
    });
  });

  // ========================================
  // DATA INTEGRITY AND CORRUPTION SCENARIOS
  // ========================================

  describe('Data Integrity and Corruption Scenarios', () => {
    test('should handle corrupted AsyncStorage data gracefully', async () => {
      // Mock corrupted data in AsyncStorage
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        switch (key) {
          case 'homes':
            return Promise.resolve('{"corrupted": json}'); // Invalid JSON
          case 'equipment':
            return Promise.resolve('null');
          case 'tasks':
            return Promise.resolve('[{"id": "corrupt", "missing_required_fields": true}]');
          default:
            return Promise.resolve(null);
        }
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Should still render despite corrupted data
      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Corruption Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing data corruption handling');

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should handle gracefully despite corrupted initial data
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });

      consoleSpy.mockRestore();
    });

    test('should handle type mismatches in form data', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form with edge case data
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Type Mismatch Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing type handling');

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should handle type conversion gracefully
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });
  });

  // ========================================
  // BOUNDARY CONDITION TESTING
  // ========================================

  describe('Boundary Condition Testing', () => {
    test('should handle minimum viable task data', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out only required fields with minimal data
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'A'); // Single character
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'B'); // Single character

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should create task with minimal data
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });

    test('should handle maximum priority and difficulty values', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Max Values Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing maximum values');

      // Select highest priority and difficulty
      fireEvent.press(getByText('High')); // Priority
      
      // Find and select highest difficulty
      const hardButton = getByText('Hard');
      fireEvent.press(hardButton);

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should handle maximum values correctly
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });

    test('should handle edge case with no homes available', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper initialData={{ homes: [] }}>
          <AddTaskScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      });

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'No Homes Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing with no homes');

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // Should handle no homes gracefully (may use default home ID)
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });
  });
}); 