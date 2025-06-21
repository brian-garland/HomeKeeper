import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddTaskScreen } from '../../screens/AddTaskScreen';
import { TasksScreen } from '../../screens/TasksScreen';
import { DataProvider, useDataContext } from '../../contexts/DataContext';
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
  useFocusEffect: jest.fn((callback) => callback()),
}));

// Mock KeyboardAwareScrollView
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

// Mock RefreshControl
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    RefreshControl: ({ refreshing, onRefresh, ...props }: any) => {
      const { View } = require('react-native');
      return <View testID="refresh-control" {...props} />;
    },
  };
});

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
  Icon: ({ name, size, color, testID, ...props }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View {...props} testID={testID || `icon-${name}`}>
        <Text>{name}</Text>
      </View>
    );
  },
}));

// Test component to capture DataContext state
const TestContextCapture: React.FC<{ onStateChange: (state: any) => void }> = ({ onStateChange }) => {
  const contextState = useDataContext();
  
  React.useEffect(() => {
    onStateChange(contextState);
  }, [contextState, onStateChange]);
  
  return null;
};

// Test wrapper component
const TestWrapper: React.FC<{ 
  children: React.ReactNode; 
  onStateChange?: (state: any) => void;
}> = ({ children, onStateChange }) => {
  return (
    <DataProvider>
      {onStateChange && <TestContextCapture onStateChange={onStateChange} />}
      {children}
    </DataProvider>
  );
};

describe('Task List Display UI Update - Integration Tests', () => {
  let mockAsyncStorage: jest.Mocked<typeof AsyncStorage>;
  let capturedState: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    capturedState = {};
    
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
  // CORE INTEGRATION TESTS
  // ========================================
  describe('Task Creation and List Integration', () => {
    test('should create task and verify it can be persisted for list display', async () => {
      const stateChangeHandler = jest.fn((state) => {
        capturedState = state;
      });

      // Test 1: Create a task via AddTaskScreen
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper onStateChange={stateChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill out the form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Integration Test Task');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing integration flow');

      // Submit the form
      fireEvent.press(getByText('Create Task'));

      // Wait for task creation and verify it was added to context
      await waitFor(() => {
        expect(capturedState.tasks).toBeDefined();
        expect(capturedState.tasks.length).toBeGreaterThan(0);
      });

      // Verify the task has correct data
      const createdTask = capturedState.tasks[0];
      expect(createdTask.title).toBe('Integration Test Task');
      expect(createdTask.description).toBe('Testing integration flow');
      expect(createdTask.id).toBeDefined();
      expect(createdTask.created_at).toBeDefined();

      // Verify task was persisted to AsyncStorage
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'homekeeper_tasks',
        expect.stringContaining('Integration Test Task')
      );
    });

    test('should display empty state correctly in TasksScreen', async () => {
      // Test that TasksScreen shows empty state when no tasks exist
      const { getByText } = render(
        <TestWrapper>
          <TasksScreen />
        </TestWrapper>
      );

      // Verify empty state elements are present
      expect(getByText('No Tasks Yet')).toBeTruthy();
      expect(getByText('Add your first task to get started')).toBeTruthy();
      // Multiple "0" counts exist, so we just verify the empty state message is shown
    });

    test('should show task creation form elements correctly', async () => {
      // Verify that AddTaskScreen has all necessary form elements for task creation
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Verify form elements exist
      expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      expect(getByPlaceholderText('Describe what needs to be done')).toBeTruthy();
      expect(getByText('Create Task')).toBeTruthy();
      
      // Verify category options
      expect(getByText('General')).toBeTruthy();
      expect(getByText('HVAC')).toBeTruthy();
      expect(getByText('Plumbing')).toBeTruthy();
      
      // Verify priority options (handling multiple "Medium" elements)
      expect(getByText('Low')).toBeTruthy();
      expect(getByText('High')).toBeTruthy();
      // Medium appears in both priority and difficulty, so we check both exist
      const { getAllByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );
      const mediumElements = getAllByText('Medium');
      expect(mediumElements.length).toBeGreaterThan(0);
      
      // Verify difficulty options
      expect(getByText('Easy')).toBeTruthy();
      expect(getByText('Hard')).toBeTruthy();
    });

    test('should create task with specific priority and difficulty settings', async () => {
      const stateChangeHandler = jest.fn((state) => {
        capturedState = state;
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper onStateChange={stateChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill out form with specific settings
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'High Priority Task');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'This is urgent');
      
      // Select High priority
      fireEvent.press(getByText('High'));
      
      // Select Hard difficulty
      fireEvent.press(getByText('Hard'));
      
      // Select HVAC category
      fireEvent.press(getByText('HVAC'));

      // Submit the form
      fireEvent.press(getByText('Create Task'));

      // Wait for task creation
      await waitFor(() => {
        expect(capturedState.tasks).toBeDefined();
        expect(capturedState.tasks.length).toBeGreaterThan(0);
      });

      // Verify the task has correct priority and difficulty
      const createdTask = capturedState.tasks[0];
      expect(createdTask.title).toBe('High Priority Task');
      expect(createdTask.priority).toBe(3); // High priority
      expect(createdTask.difficulty_level).toBe(3); // Hard difficulty
      expect(createdTask.category).toBe('hvac');
    });

    test('should create multiple tasks and verify they accumulate in context', async () => {
      const stateChangeHandler = jest.fn((state) => {
        capturedState = state;
      });

      // Create first task
      let { getByText, getByPlaceholderText, rerender } = render(
        <TestWrapper onStateChange={stateChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'First Task');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'First task description');
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(capturedState.tasks).toBeDefined();
        expect(capturedState.tasks.length).toBe(1);
      });

      // Create second task
      rerender(
        <TestWrapper onStateChange={stateChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Second Task');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Second task description');
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(capturedState.tasks).toBeDefined();
        expect(capturedState.tasks.length).toBe(2);
      });

      // Verify both tasks exist with correct data
      const tasks = capturedState.tasks;
      expect(tasks.find((t: Task) => t.title === 'First Task')).toBeTruthy();
      expect(tasks.find((t: Task) => t.title === 'Second Task')).toBeTruthy();
    });
  });

  // ========================================
  // TASK LIST UI COMPONENT TESTS
  // ========================================
  describe('TasksScreen UI Components', () => {
    test('should display task overview statistics correctly', async () => {
      const { getByText } = render(
        <TestWrapper>
          <TasksScreen />
        </TestWrapper>
      );

      // Verify overview section exists
      expect(getByText('Overview')).toBeTruthy();
      expect(getByText('Open')).toBeTruthy();
      expect(getByText('Completed')).toBeTruthy();
      expect(getByText('Overdue')).toBeTruthy();
    });

    test('should display task list header and navigation elements', async () => {
      const { getByText } = render(
        <TestWrapper>
          <TasksScreen />
        </TestWrapper>
      );

      // Verify header elements
      expect(getByText('Tasks')).toBeTruthy();
      expect(getByText('Stay on top of your home maintenance')).toBeTruthy();
      expect(getByText('Add Task')).toBeTruthy();
    });

    test('should display filter indicators correctly', async () => {
      const { getByText } = render(
        <TestWrapper>
          <TasksScreen />
        </TestWrapper>
      );

      // Verify filter indicators
      expect(getByText(/Showing:/)).toBeTruthy();
      expect(getByText(/All Tasks/)).toBeTruthy();
    });
  });

  // ========================================
  // DATA PERSISTENCE VERIFICATION TESTS
  // ========================================
  describe('Data Persistence Integration', () => {
    test('should verify AsyncStorage operations during task creation', async () => {
      const stateChangeHandler = jest.fn((state) => {
        capturedState = state;
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper onStateChange={stateChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Create a task
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Persistence Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing data persistence');
      fireEvent.press(getByText('Create Task'));

      // Wait for task creation
      await waitFor(() => {
        expect(capturedState.tasks).toBeDefined();
        expect(capturedState.tasks.length).toBeGreaterThan(0);
      });

      // Verify AsyncStorage.setItem was called with task data
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'homekeeper_tasks',
        expect.stringContaining('Persistence Test')
      );

      // Verify the stored data contains the task
      const setItemCalls = mockAsyncStorage.setItem.mock.calls;
      const taskDataCall = setItemCalls.find(call => call[0] === 'homekeeper_tasks');
      expect(taskDataCall).toBeTruthy();
      
      if (taskDataCall) {
        const storedData = JSON.parse(taskDataCall[1]);
        expect(Array.isArray(storedData)).toBe(true);
        expect(storedData.length).toBeGreaterThan(0);
        expect(storedData[0].title).toBe('Persistence Test');
      }
    });

    test('should handle task creation with proper data structure', async () => {
      const stateChangeHandler = jest.fn((state) => {
        capturedState = state;
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper onStateChange={stateChangeHandler}>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Create a task
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Data Structure Test');
      fireEvent.changeText(getByPlaceholderText('Describe what needs to be done'), 'Testing data structure');
      fireEvent.press(getByText('Create Task'));

      // Wait for task creation
      await waitFor(() => {
        expect(capturedState.tasks).toBeDefined();
        expect(capturedState.tasks.length).toBeGreaterThan(0);
      });

      // Verify task has proper structure for display
      const task = capturedState.tasks[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('category');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('difficulty_level');
      expect(task).toHaveProperty('due_date');
      expect(task).toHaveProperty('created_at');
      expect(task).toHaveProperty('status');
      
      // Verify values are correct for list display
      expect(task.title).toBe('Data Structure Test');
      expect(task.description).toBe('Testing data structure');
      expect(task.status).toBe('pending');
      expect(typeof task.priority).toBe('number');
      expect(typeof task.difficulty_level).toBe('number');
    });
  });
}); 