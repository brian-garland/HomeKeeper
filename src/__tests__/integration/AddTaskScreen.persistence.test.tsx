import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddTaskScreen } from '../../screens/AddTaskScreen';
import { DataProvider, useDataContext } from '../../contexts/DataContext';
import type { Task, Home } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
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
  MaterialIcons: 'MaterialIcons',
  MaterialCommunityIcons: 'MaterialCommunityIcons', 
  Ionicons: 'Ionicons',
  FontAwesome: 'FontAwesome',
  AntDesign: 'AntDesign',
  Feather: 'Feather',
}));

// Mock the Icon component
jest.mock('../../components/icons/Icon', () => ({
  Icon: ({ name, size, color, ...props }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View {...props} testID={`icon-${name}`}>
        <Text>{name}</Text>
      </View>
    );
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock navigation
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
    params: {},
  }),
}));

// Test component to access DataContext
const TestContextReader: React.FC<{ onDataChange: (data: { tasks: Task[], homes: Home[] }) => void }> = ({ onDataChange }) => {
  const { tasks, homes } = useDataContext();
  
  React.useEffect(() => {
    onDataChange({ tasks, homes });
  }, [tasks, homes, onDataChange]);
  
  return null;
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; onDataChange?: (data: { tasks: Task[], homes: Home[] }) => void }> = ({ 
  children, 
  onDataChange 
}) => (
  <DataProvider>
    {onDataChange && <TestContextReader onDataChange={onDataChange} />}
    {children}
  </DataProvider>
);

describe('AddTaskScreen Task Submission and Persistence - Integration Tests', () => {
  let mockAsyncStorage: jest.Mocked<typeof AsyncStorage>;
  let capturedData: { tasks: Task[], homes: Home[] } = { tasks: [], homes: [] };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    capturedData = { tasks: [], homes: [] };
    
    // Mock AsyncStorage to return empty data initially
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    
    // Reset navigation mocks
    mockGoBack.mockClear();
    mockReset.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // TASK CREATION AND PERSISTENCE TESTS
  // ========================================
  describe('Task Creation and Persistence', () => {
    test('should create task and persist to AsyncStorage', async () => {
      const dataChangeHandler = jest.fn((data) => {
        capturedData = data;
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper onDataChange={dataChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill out the form
      const titleInput = getByPlaceholderText('Enter task title');
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      
      fireEvent.changeText(titleInput, 'Test Persistence Task');
      fireEvent.changeText(descriptionInput, 'Testing task persistence functionality');

      // Submit the form
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Wait for success alert
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });

      // Verify task was added to context state
      await waitFor(() => {
        expect(capturedData.tasks).toHaveLength(1);
        expect(capturedData.tasks[0].title).toBe('Test Persistence Task');
        expect(capturedData.tasks[0].description).toBe('Testing task persistence functionality');
      });

      // Verify AsyncStorage.setItem was called to persist the task
      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'homekeeper_tasks',
          expect.stringContaining('Test Persistence Task')
        );
      });
    });

    test('should persist task with all form field data', async () => {
      const dataChangeHandler = jest.fn((data) => {
        capturedData = data;
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper onDataChange={dataChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill out the form with all fields
      const titleInput = getByPlaceholderText('Enter task title');
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      
      fireEvent.changeText(titleInput, 'Complete Task Data');
      fireEvent.changeText(descriptionInput, 'Testing complete task data persistence');

      // Select category
      const hvacButton = getByText('HVAC');
      fireEvent.press(hvacButton);

      // Select priority (High)
      const highPriority = getByText('High');
      fireEvent.press(highPriority);

      // Select difficulty (Hard)
      const hardDifficulty = getByText('Hard');
      fireEvent.press(hardDifficulty);

      // Submit the form
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Wait for task creation
      await waitFor(() => {
        expect(capturedData.tasks).toHaveLength(1);
      });

      const createdTask = capturedData.tasks[0];

      // Verify all form data was persisted correctly
      expect(createdTask.title).toBe('Complete Task Data');
      expect(createdTask.description).toBe('Testing complete task data persistence');
      expect(createdTask.category).toBe('hvac');
      expect(createdTask.priority).toBe(3); // High priority
      expect(createdTask.difficulty_level).toBe(3); // Hard difficulty
      expect(createdTask.status).toBe('pending');
      expect(createdTask.auto_generated).toBe(false);

      // Verify required fields are set
      expect(createdTask.id).toBeDefined();
      expect(createdTask.created_at).toBeDefined();
      expect(createdTask.updated_at).toBeDefined();
      expect(createdTask.home_id).toBeDefined();

      // Verify AsyncStorage persistence with complete data
      const lastSetItemCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      const persistedData = JSON.parse(lastSetItemCall[1]);
      
      expect(persistedData).toHaveLength(1);
      expect(persistedData[0].title).toBe('Complete Task Data');
      expect(persistedData[0].category).toBe('hvac');
      expect(persistedData[0].priority).toBe(3);
      expect(persistedData[0].difficulty_level).toBe(3);
    });

    test('should handle multiple task creations and persist all', async () => {
      const dataChangeHandler = jest.fn((data) => {
        capturedData = data;
      });

      const { getByText, getByPlaceholderText, rerender } = render(
        <TestWrapper onDataChange={dataChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Create first task
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'First Task');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'First task description');
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(capturedData.tasks).toHaveLength(1);
      });

      // Re-render the component to simulate navigating back to AddTaskScreen
      rerender(
        <TestWrapper onDataChange={dataChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Create second task
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Second Task');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Second task description');
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(capturedData.tasks).toHaveLength(2);
      });

      // Verify both tasks are persisted
      expect(capturedData.tasks[0].title).toBe('First Task');
      expect(capturedData.tasks[1].title).toBe('Second Task');

      // Verify AsyncStorage was called for both tasks
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  // ========================================
  // PERSISTENCE ERROR HANDLING TESTS
  // ========================================
  describe('Persistence Error Handling', () => {
    test('should handle AsyncStorage save errors gracefully', async () => {
      // Mock AsyncStorage to throw an error
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage quota exceeded'));

      const dataChangeHandler = jest.fn((data) => {
        capturedData = data;
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper onDataChange={dataChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill out the form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Error Test Task');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing error handling');

      // Submit the form
      fireEvent.press(getByText('Create Task'));

      // Task should still be added to memory state even if persistence fails
      await waitFor(() => {
        expect(capturedData.tasks).toHaveLength(1);
        expect(capturedData.tasks[0].title).toBe('Error Test Task');
      });

      // Success alert should still show (app continues to work)
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
  // DATA INTEGRITY TESTS
  // ========================================
  describe('Data Integrity', () => {
    test('should maintain task data integrity during persistence', async () => {
      const dataChangeHandler = jest.fn((data) => {
        capturedData = data;
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper onDataChange={dataChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Create task with special characters and long content
      const specialTitle = '🔧 Fix A/C Unit - $500 (HIGH PRIORITY!)';
      const longDescription = 'A'.repeat(500) + ' - This is a very long description to test data integrity';

      fireEvent.changeText(getByPlaceholderText('Enter task title'), specialTitle);
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), longDescription);

      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(capturedData.tasks).toHaveLength(1);
      });

      const createdTask = capturedData.tasks[0];

      // Verify special characters are preserved
      expect(createdTask.title).toBe(specialTitle);
      expect(createdTask.description).toBe(longDescription);

      // Verify data types are correct
      expect(typeof createdTask.id).toBe('string');
      expect(typeof createdTask.title).toBe('string');
      expect(typeof createdTask.description).toBe('string');
      expect(typeof createdTask.priority).toBe('number');
      expect(typeof createdTask.difficulty_level).toBe('number');
      expect(typeof createdTask.created_at).toBe('string');
      expect(typeof createdTask.auto_generated).toBe('boolean');

      // Verify dates are valid ISO strings
      expect(createdTask.created_at).toBeDefined();
      expect(createdTask.updated_at).toBeDefined();
      expect(new Date(createdTask.created_at!).toISOString()).toBe(createdTask.created_at);
      expect(new Date(createdTask.updated_at!).toISOString()).toBe(createdTask.updated_at);

      // Verify persisted data matches memory data
      const lastSetItemCall = mockAsyncStorage.setItem.mock.calls[mockAsyncStorage.setItem.mock.calls.length - 1];
      const persistedData = JSON.parse(lastSetItemCall[1]);
      
      expect(persistedData[0]).toEqual(createdTask);
    });

    test('should generate unique task IDs for multiple tasks', async () => {
      const dataChangeHandler = jest.fn((data) => {
        capturedData = data;
      });

      const { getByText, getByPlaceholderText, rerender } = render(
        <TestWrapper onDataChange={dataChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Create multiple tasks quickly
      for (let i = 1; i <= 3; i++) {
        fireEvent.changeText(getByPlaceholderText('Enter task title'), `Task ${i}`);
        fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), `Description ${i}`);
        fireEvent.press(getByText('Create Task'));

        await waitFor(() => {
          expect(capturedData.tasks).toHaveLength(i);
        });

        // Re-render for next task
        if (i < 3) {
          rerender(
            <TestWrapper onDataChange={dataChangeHandler}>
              <AddTaskScreen />
            </TestWrapper>
          );
        }
      }

      // Verify all tasks have unique IDs
      const taskIds = capturedData.tasks.map(task => task.id);
      const uniqueIds = new Set(taskIds);
      
      expect(uniqueIds.size).toBe(3);
      expect(taskIds).toHaveLength(3);

      // Verify all IDs follow expected format
      taskIds.forEach(id => {
        expect(id).toMatch(/^demo-task-\d+$/);
      });
    });
  });

  // ========================================
  // NAVIGATION INTEGRATION TESTS
  // ========================================
  describe('Navigation Integration', () => {
    test('should navigate back after successful task creation', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill out and submit form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Navigation Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing navigation');
      fireEvent.press(getByText('Create Task'));

      // Wait for success alert
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });

      // Simulate pressing OK on the alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls.find(call => 
        call[0] === 'Success' && call[1] === 'Task created successfully!'
      );
      
      if (alertCall && alertCall[2] && alertCall[2][0] && alertCall[2][0].onPress) {
        alertCall[2][0].onPress();
      }

      // Verify navigation.goBack was called
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================
  // LOADING STATE PERSISTENCE TESTS
  // ========================================
  describe('Loading State During Persistence', () => {
    test('should handle loading state during task creation', async () => {
      // Slow down AsyncStorage to test loading state
      mockAsyncStorage.setItem.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill out form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Loading Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing loading state');

      // Submit form
      fireEvent.press(getByText('Create Task'));

      // During loading, the component should handle the async operation
      // (Note: In a real app, you might disable the button or show a spinner)
      
      // Wait for completion
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });

      // Verify AsyncStorage was called
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });
}); 