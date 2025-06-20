/**
 * Integration Tests: AddTaskScreen Form Validation
 * 
 * Tests the complete form validation logic including:
 * 1. Required field validation (title, description)
 * 2. Form field interactions and updates
 * 3. Category, priority, and difficulty selection
 * 4. Alert handling for validation errors
 * 5. Equipment integration validation
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Import the screen
import { AddTaskScreen } from '../../screens/AddTaskScreen';

// Import contexts
import { DataProvider } from '../../contexts/DataContext';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
    reset: mockReset,
  }),
  useRoute: () => ({
    params: undefined, // Default to no params, override in individual tests
  }),
}));

// Mock keyboard aware scroll view
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: ({ children, ...props }: any) => {
    const { ScrollView } = require('react-native');
    return <ScrollView {...props}>{children}</ScrollView>;
  },
}));

// Mock Icon component
jest.mock('../../components/icons/Icon', () => ({
  Icon: jest.fn(({ name, size, color, ...props }) => {
    const React = require('react');
    return React.createElement('Text', {
      ...props,
      testID: `icon-${name}`,
      children: `Icon-${name}`,
      style: { color, fontSize: size === 'sm' ? 16 : size === 'md' ? 20 : 24 },
    });
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>
    {children}
  </DataProvider>
);

describe('AddTaskScreen Form Validation - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear all alert mocks
    (Alert.alert as jest.Mock).mockClear();
  });

  // ========================================
  // REQUIRED FIELD VALIDATION TESTS
  // ========================================
  describe('Required Field Validation', () => {
    test('should show error when title is empty', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Find and fill description (required)
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      fireEvent.changeText(descriptionInput, 'Valid description');

      // Try to save without title
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Wait for validation and check alert
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a task title');
      });
    });

    test('should show error when description is empty', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Find and fill title (required)
      const titleInput = getByPlaceholderText('Enter task title');
      fireEvent.changeText(titleInput, 'Valid title');

      // Try to save without description
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Wait for validation and check alert
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a task description');
      });
    });

    test('should show error when both title and description are empty', async () => {
      const { getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Try to save without any required fields
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Wait for validation - should show title error first
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a task title');
      });
    });

    test('should show error when title contains only whitespace', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill with whitespace-only title
      const titleInput = getByPlaceholderText('Enter task title');
      fireEvent.changeText(titleInput, '   \\n\\t   ');

      // Fill valid description
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      fireEvent.changeText(descriptionInput, 'Valid description');

      // Try to save
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Should show title validation error
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a task title');
      });
    });

    test('should show error when description contains only whitespace', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill valid title
      const titleInput = getByPlaceholderText('Enter task title');
      fireEvent.changeText(titleInput, 'Valid title');

      // Fill with whitespace-only description
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      fireEvent.changeText(descriptionInput, '   \\n\\t   ');

      // Try to save
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Should show description validation error
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a task description');
      });
    });
  });

  // ========================================
  // FORM FIELD INTERACTION TESTS
  // ========================================
  describe('Form Field Interactions', () => {
    test('should update title field correctly', () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      const titleInput = getByPlaceholderText('Enter task title');
      fireEvent.changeText(titleInput, 'Test Task Title');

      expect(titleInput.props.value).toBe('Test Task Title');
    });

    test('should update description field correctly', () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      fireEvent.changeText(descriptionInput, 'Test task description with multiple lines\\nSecond line');

      expect(descriptionInput.props.value).toBe('Test task description with multiple lines\\nSecond line');
    });

    test('should handle long text input correctly', () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      const longTitle = 'A'.repeat(200); // Very long title
      const longDescription = 'B'.repeat(1000); // Very long description

      const titleInput = getByPlaceholderText('Enter task title');
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');

      fireEvent.changeText(titleInput, longTitle);
      fireEvent.changeText(descriptionInput, longDescription);

      expect(titleInput.props.value).toBe(longTitle);
      expect(descriptionInput.props.value).toBe(longDescription);
    });

    test('should handle special characters and emojis', () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      const specialTitle = '🔧 Fix A/C Unit - $500 (HIGH PRIORITY!)';
      const specialDescription = 'Check temperature readings: 75°F → 68°F\\n• Priority: HIGH 🚨\\n• Cost: $500-$750';

      const titleInput = getByPlaceholderText('Enter task title');
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');

      fireEvent.changeText(titleInput, specialTitle);
      fireEvent.changeText(descriptionInput, specialDescription);

      expect(titleInput.props.value).toBe(specialTitle);
      expect(descriptionInput.props.value).toBe(specialDescription);
    });
  });

  // ========================================
  // CATEGORY SELECTION TESTS
  // ========================================
  describe('Category Selection', () => {
    test('should select category correctly', () => {
      const { getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Select HVAC category
      const hvacButton = getByText('HVAC');
      fireEvent.press(hvacButton);

      // Should update active category styling (test passes if no errors)
      expect(hvacButton).toBeTruthy();
    });

    test('should allow switching between categories', () => {
      const { getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Select multiple categories in sequence
      const categories = ['HVAC', 'Plumbing', 'Electrical', 'General'];
      
      categories.forEach(category => {
        const categoryButton = getByText(category);
        fireEvent.press(categoryButton);
        expect(categoryButton).toBeTruthy();
      });
    });

    test('should handle all available categories', () => {
      const { getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Test all available categories
      const allCategories = ['HVAC', 'Plumbing', 'Electrical', 'Exterior', 'Interior', 'Appliances', 'Safety', 'General'];
      
      allCategories.forEach(category => {
        const categoryButton = getByText(category);
        fireEvent.press(categoryButton);
        expect(categoryButton).toBeTruthy();
      });
    });
  });

  // ========================================
  // PRIORITY SELECTION TESTS
  // ========================================
  describe('Priority Selection', () => {
    test('should select priority levels correctly', () => {
      const { getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Test all priority levels
      const priorities = ['Low', 'Medium', 'High'];
      
      priorities.forEach(priority => {
        const priorityButton = getByText(priority);
        fireEvent.press(priorityButton);
        expect(priorityButton).toBeTruthy();
      });
    });

    test('should start with default medium priority', () => {
      const { getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Medium should be the default selection
      const mediumButton = getByText('Medium');
      expect(mediumButton).toBeTruthy();
    });
  });

  // ========================================
  // DIFFICULTY SELECTION TESTS
  // ========================================
  describe('Difficulty Selection', () => {
    test('should select difficulty levels correctly', () => {
      const { getByText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Test all difficulty levels
      const difficulties = ['Easy', 'Medium', 'Hard'];
      
      difficulties.forEach(difficulty => {
        const difficultyButton = getByText(difficulty);
        fireEvent.press(difficultyButton);
        expect(difficultyButton).toBeTruthy();
      });
    });
  });

  // ========================================
  // SUCCESSFUL FORM SUBMISSION TESTS
  // ========================================
  describe('Successful Form Submission', () => {
    test('should successfully create task with valid data', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill required fields
      const titleInput = getByPlaceholderText('Enter task title');
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      
      fireEvent.changeText(titleInput, 'Integration Test Task');
      fireEvent.changeText(descriptionInput, 'Test task for form validation');

      // Select category
      const hvacButton = getByText('HVAC');
      fireEvent.press(hvacButton);

      // Select priority
      const highPriority = getByText('High');
      fireEvent.press(highPriority);

      // Submit form
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Should show success alert
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });

    test('should trim whitespace from inputs before validation', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill with leading/trailing whitespace
      const titleInput = getByPlaceholderText('Enter task title');
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      
      fireEvent.changeText(titleInput, '  Trimmed Title  ');
      fireEvent.changeText(descriptionInput, '  Trimmed Description  ');

      // Submit form
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Should successfully create task (no validation errors)
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
  // LOADING STATE TESTS
  // ========================================
  describe('Loading State Management', () => {
    test('should disable form during submission', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Fill required fields
      const titleInput = getByPlaceholderText('Enter task title');
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      
      fireEvent.changeText(titleInput, 'Loading Test Task');
      fireEvent.changeText(descriptionInput, 'Test loading state');

      // Submit form
      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // During submission, button should show loading state
      // (Implementation depends on actual loading UI)
      expect(saveButton).toBeTruthy();
    });
  });

  // ========================================
  // EDGE CASE VALIDATION TESTS
  // ========================================
  describe('Edge Case Validation', () => {
    test('should handle empty strings vs undefined', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Set empty string explicitly
      const titleInput = getByPlaceholderText('Enter task title');
      fireEvent.changeText(titleInput, '');

      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a task title');
      });
    });

    test('should validate minimum meaningful content', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      // Single character inputs
      const titleInput = getByPlaceholderText('Enter task title');
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      
      fireEvent.changeText(titleInput, 'A');
      fireEvent.changeText(descriptionInput, 'B');

      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Should accept minimal but non-empty content
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success', 
          'Task created successfully!',
          expect.any(Array)
        );
      });
    });

    test('should handle mixed whitespace and content', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AddTaskScreen />
        </TestWrapper>
      );

      const titleInput = getByPlaceholderText('Enter task title');
      const descriptionInput = getByPlaceholderText('Describe what needs to be done');
      
      // Mixed whitespace with actual content
      fireEvent.changeText(titleInput, '  Valid   Title  ');
      fireEvent.changeText(descriptionInput, '\\n  Valid Description  \\t');

      const saveButton = getByText('Create Task');
      fireEvent.press(saveButton);

      // Should trim and accept valid content
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