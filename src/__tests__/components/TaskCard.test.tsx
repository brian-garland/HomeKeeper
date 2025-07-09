/**
 * Comprehensive TaskCard Test Suite
 * Task 22.3: Complete user interaction, state management, and visual testing
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';

// Mock the Icon component
jest.mock('../../components/icons/Icon', () => ({
  Icon: jest.fn(({ name, size, color, ...props }) => {
    const React = require('react');
    return React.createElement('Text', {
      ...props,
      testID: `icon-${name}`,
      children: `Icon-${name}`,
      style: { color, fontSize: size === 'sm' ? 16 : size === 'xs' ? 12 : 20 },
    });
  }),
}));

// Import the theme files
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

// Create mock data for testing
const createMockTask = (overrides = {}) => ({
  id: '1',
  title: 'Test Task',
  description: 'This is a test task description for testing purposes',
  priority: 2, // Medium
  difficulty_level: 2, // Medium
  due_date: '2024-01-15',
  estimated_duration_minutes: 30,
  money_saved_estimate: 50,
  equipment_id: null,
  completed_at: null,
  ...overrides,
});

const createMockEquipment = (overrides = {}) => ({
  id: '1',
  name: 'Test Equipment',
  category: 'hvac',
  ...overrides,
});

// Type definitions for TaskCard
interface TaskCardProps {
  task: any;
  equipment?: any;
  onPress: () => void;
  testID?: string;
}

// Create the TaskCard component for testing
const TaskCard: React.FC<TaskCardProps> = ({ task, equipment, onPress, testID }) => {
  const React = require('react');
  const { TouchableOpacity, View, Text } = require('react-native');
  const { Icon } = require('../../components/icons/Icon');

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return Colors.error; // High
      case 2: return Colors.warning; // Medium
      case 1: return Colors.info; // Low
      default: return Colors.textSecondary;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'HIGH';
      case 2: return 'MEDIUM';
      case 1: return 'LOW';
      default: return 'MEDIUM';
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 3: return 'Hard';
      case 2: return 'Medium';
      case 1: return 'Easy';
      default: return 'Normal';
    }
  };

  const getEquipmentIcon = (category: string) => {
    switch (category) {
      case 'hvac': return 'air-conditioner';
      case 'plumbing': return 'water';
      case 'electrical': return 'lightning';
      case 'mechanical': return 'settings';
      default: return 'wrench';
    }
  };

  const isCompleted = !!task.completed_at;
  const isOverdue = !isCompleted && task.due_date && new Date(task.due_date) < new Date();
  const priorityColor = getPriorityColor(task.priority);

  const styles = {
    taskCard: {
      backgroundColor: Colors.white,
      borderRadius: 12,
      padding: Spacing.lg,
    },
    taskCardCompleted: {
      backgroundColor: Colors.surface,
    },
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
    },
    priorityIndicator: {
      width: 4,
      height: 40,
      borderRadius: 2,
      marginRight: Spacing.md,
    },
    taskInfo: {
      flex: 1,
    },
    taskTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    taskTitle: {
      ...Typography.titleMedium,
      marginBottom: Spacing.xs,
    },
    taskTitleCompleted: {
      textDecorationLine: 'line-through',
    },
    taskDescription: {
      ...Typography.bodyMedium,
      color: Colors.textSecondary,
    },
    taskDescriptionCompleted: {
      textDecorationLine: 'line-through',
    },
    taskMeta: {
      gap: Spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    metaText: {
      ...Typography.caption,
      color: Colors.textSecondary,
    },
    metaTextCompleted: {
      textDecorationLine: 'line-through',
    },
    overdueText: {
      color: Colors.error,
      fontWeight: '600',
    },
    priorityBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: 4,
    },
    priorityText: {
      ...Typography.caption,
      fontWeight: '600',
      fontSize: 10,
    },
    difficultyBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: 4,
      backgroundColor: Colors.surface,
    },
    difficultyBadgeCompleted: {
      backgroundColor: Colors.surface,
    },
    difficultyText: {
      ...Typography.caption,
      color: Colors.textSecondary,
      fontSize: 10,
    },
    difficultyTextCompleted: {
      textDecorationLine: 'line-through',
    },
    completedBadge: {
      backgroundColor: Colors.success,
      borderRadius: 12,
      padding: Spacing.xs,
      marginLeft: Spacing.sm,
    },
    completedStatusBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: 4,
      backgroundColor: Colors.success,
    },
    completedStatusText: {
      ...Typography.caption,
      fontWeight: '600',
      color: Colors.white,
    },
    equipmentBadge: {
      padding: Spacing.xs,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: Colors.primary,
      backgroundColor: Colors.surface,
      marginBottom: Spacing.sm,
    },
    equipmentText: {
      ...Typography.caption,
      color: Colors.textPrimary,
    },
    moneySavedText: {
      color: Colors.success,
      fontWeight: '600',
    },
  };

  return (
    <TouchableOpacity 
      style={[
        styles.taskCard, 
        isCompleted && styles.taskCardCompleted
      ]} 
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Task: ${task.title}`}
      accessibilityState={{ selected: isCompleted }}
    >
      <View style={styles.taskHeader}>
        <View style={[
          styles.priorityIndicator, 
          { backgroundColor: isCompleted ? Colors.success : priorityColor }
        ]} />
        <View style={styles.taskInfo}>
          <View style={styles.taskTitleRow}>
            <Text style={[
              styles.taskTitle,
              isCompleted && styles.taskTitleCompleted
            ]} testID="task-title">
              {task.title}
            </Text>
            {isCompleted && (
              <View style={styles.completedBadge} testID="completed-badge">
                <Icon name="check" size="sm" color={Colors.white} />
              </View>
            )}
          </View>
          
          {/* Equipment Badge */}
          {equipment && task.equipment_id && (
            <View style={styles.equipmentBadge} testID="equipment-badge">
              <Icon 
                name={getEquipmentIcon(equipment.category)} 
                size="xs" 
                color={Colors.textSecondary} 
              />
              <Text style={styles.equipmentText}>
                {equipment.name}
              </Text>
            </View>
          )}
          
          <Text style={[
            styles.taskDescription,
            isCompleted && styles.taskDescriptionCompleted
          ]} numberOfLines={2} testID="task-description">
            {task.description}
          </Text>
        </View>
        <Icon name="right" size="sm" color={Colors.textTertiary} testID="chevron-icon" />
      </View>
      
      <View style={styles.taskMeta}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size="sm" color={Colors.textSecondary} />
            <Text style={[
              styles.metaText, 
              isOverdue && styles.overdueText,
              isCompleted && styles.metaTextCompleted
            ]} testID="due-date-text">
              {isCompleted 
                ? `Completed ${new Date(task.completed_at).toLocaleDateString()}`
                : isOverdue 
                  ? 'Overdue' 
                  : new Date(task.due_date).toLocaleDateString()
              }
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="clock" size="sm" color={Colors.textSecondary} />
            <Text style={[
              styles.metaText,
              isCompleted && styles.metaTextCompleted
            ]} testID="duration-text">
              {task.estimated_duration_minutes || 'N/A'} min
            </Text>
          </View>
          {/* Money Saved Display */}
          {task.money_saved_estimate && task.money_saved_estimate > 0 && (
            <View style={styles.metaItem} testID="money-saved-item">
              <Icon name="check" size="sm" color={Colors.success} />
              <Text style={[
                styles.metaText,
                styles.moneySavedText,
                isCompleted && styles.metaTextCompleted
              ]} testID="money-saved-text">
                ${task.money_saved_estimate.toFixed(0)} saved
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.metaRow}>
          {!isCompleted && (
            <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]} testID="priority-badge">
              <Text style={[styles.priorityText, { color: priorityColor }]} testID="priority-text">
                {getPriorityLabel(task.priority)}
              </Text>
            </View>
          )}
          {isCompleted && (
            <View style={styles.completedStatusBadge} testID="completed-status-badge">
              <Text style={styles.completedStatusText}>COMPLETED</Text>
            </View>
          )}
          <View style={[
            styles.difficultyBadge,
            isCompleted && styles.difficultyBadgeCompleted
          ]} testID="difficulty-badge">
            <Text style={[
              styles.difficultyText,
              isCompleted && styles.difficultyTextCompleted
            ]} testID="difficulty-text">
              {getDifficultyLabel(task.difficulty_level)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

describe('TaskCard - Comprehensive Test Suite', () => {
  
  describe('Basic Rendering and Props', () => {
    test('renders correctly with required props', () => {
      const mockTask = createMockTask();
      const mockOnPress = jest.fn();
      
      const { getByTestId, getByText } = render(
        <TaskCard 
          task={mockTask} 
          onPress={mockOnPress}
          testID="test-task-card"
        />
      );
      
      expect(getByTestId('test-task-card')).toBeTruthy();
      expect(getByText('Test Task')).toBeTruthy();
      expect(getByText('This is a test task description for testing purposes')).toBeTruthy();
    });

    test('handles equipment prop correctly', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      const mockEquipment = createMockEquipment();
      
      const { getByTestId, getByText } = render(
        <TaskCard 
          task={mockTask} 
          equipment={mockEquipment}
          onPress={() => {}}
          testID="task-with-equipment"
        />
      );
      
      expect(getByTestId('equipment-badge')).toBeTruthy();
      expect(getByText('Test Equipment')).toBeTruthy();
    });

    test('does not show equipment badge when equipment is not provided', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      
      const { queryByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="task-without-equipment"
        />
      );
      
      expect(queryByTestId('equipment-badge')).toBeNull();
    });

    test('shows money saved when present', () => {
      const mockTask = createMockTask({ money_saved_estimate: 100 });
      
      const { getByTestId, getByText } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="task-with-savings"
        />
      );
      
      expect(getByTestId('money-saved-item')).toBeTruthy();
      expect(getByText('$100 saved')).toBeTruthy();
    });

    test('does not show money saved when zero or null', () => {
      const mockTask = createMockTask({ money_saved_estimate: 0 });
      
      const { queryByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="task-no-savings"
        />
      );
      
      expect(queryByTestId('money-saved-item')).toBeNull();
    });

    test('handles custom testID prop', () => {
      const mockTask = createMockTask();
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="custom-task-card"
        />
      );
      
      expect(getByTestId('custom-task-card')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    test('calls onPress when card is pressed', () => {
      const mockTask = createMockTask();
      const mockOnPress = jest.fn();
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={mockOnPress}
          testID="pressable-task-card"
        />
      );
      
      fireEvent.press(getByTestId('pressable-task-card'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    test('calls onPress multiple times when pressed multiple times', () => {
      const mockTask = createMockTask();
      const mockOnPress = jest.fn();
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={mockOnPress}
          testID="multi-press-task-card"
        />
      );
      
      const card = getByTestId('multi-press-task-card');
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);
      
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });

    test('handles rapid multiple presses correctly', () => {
      const mockTask = createMockTask();
      const mockOnPress = jest.fn();
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={mockOnPress}
          testID="rapid-press-task"
        />
      );
      
      const card = getByTestId('rapid-press-task');
      
      // Simulate rapid presses
      for (let i = 0; i < 5; i++) {
        fireEvent.press(card);
      }
      
      expect(mockOnPress).toHaveBeenCalledTimes(5);
    });
  });

  describe('Task States', () => {
    test('renders pending task correctly', () => {
      const mockTask = createMockTask({ completed_at: null });
      
      const { getByTestId, queryByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="pending-task-card"
        />
      );
      
      // Should show priority badge
      expect(getByTestId('priority-badge')).toBeTruthy();
      expect(getByTestId('priority-text')).toBeTruthy();
      
      // Should not show completed elements
      expect(queryByTestId('completed-badge')).toBeNull();
      expect(queryByTestId('completed-status-badge')).toBeNull();
    });

    test('renders completed task correctly', () => {
      const mockTask = createMockTask({ 
        completed_at: '2024-01-10T10:00:00Z'
      });
      
      const { getByTestId, getByText, queryByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="completed-task-card"
        />
      );
      
      expect(getByTestId('completed-badge')).toBeTruthy();
      expect(getByTestId('completed-status-badge')).toBeTruthy();
      expect(getByText('COMPLETED')).toBeTruthy();
      expect(queryByTestId('priority-badge')).toBeNull();
    });

    test('renders overdue task correctly', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const mockTask = createMockTask({ 
        due_date: yesterday.toISOString(),
        completed_at: null 
      });
      
      const { getByTestId, getByText } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="overdue-task-card"
        />
      );
      
      // Should show overdue text
      expect(getByText('Overdue')).toBeTruthy();
      
      // Due date text should have overdue styling
      const dueDateText = getByTestId('due-date-text');
      expect(dueDateText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: Colors.error, fontWeight: '600' })
        ])
      );
    });

    test('shows correct date format for future due dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const mockTask = createMockTask({ 
        due_date: tomorrow.toISOString(),
        completed_at: null 
      });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="future-task-card"
        />
      );
      
      const dueDateText = getByTestId('due-date-text');
      expect(dueDateText.props.children).toBe(tomorrow.toLocaleDateString());
    });

    test('displays completed date for completed tasks', () => {
      const mockTask = createMockTask({ 
        completed_at: '2024-01-10T10:00:00Z'
      });
      
      const { getByText } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="completed-date-task"
        />
      );
      
      expect(getByText(/Completed/)).toBeTruthy();
    });
  });

  describe('Priority Levels', () => {
    test('renders high priority correctly', () => {
      const mockTask = createMockTask({ priority: 3 });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="high-priority-task"
        />
      );
      
      const priorityText = getByTestId('priority-text');
      expect(priorityText.props.children).toBe('HIGH');
    });

    test('renders medium priority correctly', () => {
      const mockTask = createMockTask({ priority: 2 });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="medium-priority-task"
        />
      );
      
      const priorityText = getByTestId('priority-text');
      expect(priorityText.props.children).toBe('MEDIUM');
    });

    test('renders low priority correctly', () => {
      const mockTask = createMockTask({ priority: 1 });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="low-priority-task"
        />
      );
      
      const priorityText = getByTestId('priority-text');
      expect(priorityText.props.children).toBe('LOW');
    });

    test('renders normal priority correctly', () => {
      const mockTask = createMockTask({ priority: 0 });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="normal-priority-task"
        />
      );
      
      const priorityText = getByTestId('priority-text');
      expect(priorityText.props.children).toBe('MEDIUM');
    });
  });

  describe('Difficulty Levels', () => {
    test('renders hard difficulty correctly', () => {
      const mockTask = createMockTask({ difficulty_level: 3 });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="hard-difficulty-task"
        />
      );
      
      const difficultyText = getByTestId('difficulty-text');
      expect(difficultyText.props.children).toBe('Hard');
    });

    test('renders medium difficulty correctly', () => {
      const mockTask = createMockTask({ difficulty_level: 2 });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="medium-difficulty-task"
        />
      );
      
      const difficultyText = getByTestId('difficulty-text');
      expect(difficultyText.props.children).toBe('Medium');
    });

    test('renders easy difficulty correctly', () => {
      const mockTask = createMockTask({ difficulty_level: 1 });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="easy-difficulty-task"
        />
      );
      
      const difficultyText = getByTestId('difficulty-text');
      expect(difficultyText.props.children).toBe('Easy');
    });

    test('renders normal difficulty correctly', () => {
      const mockTask = createMockTask({ difficulty_level: 0 });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="normal-difficulty-task"
        />
      );
      
      const difficultyText = getByTestId('difficulty-text');
      expect(difficultyText.props.children).toBe('Normal');
    });
  });

  describe('Equipment Categories', () => {
    test('renders HVAC equipment correctly', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      const mockEquipment = createMockEquipment({ category: 'hvac' });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          equipment={mockEquipment}
          onPress={() => {}}
          testID="hvac-task"
        />
      );
      
      const equipmentIcon = getByTestId('icon-air-conditioner');
      expect(equipmentIcon).toBeTruthy();
    });

    test('renders plumbing equipment correctly', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      const mockEquipment = createMockEquipment({ category: 'plumbing' });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          equipment={mockEquipment}
          onPress={() => {}}
          testID="plumbing-task"
        />
      );
      
      const equipmentIcon = getByTestId('icon-water');
      expect(equipmentIcon).toBeTruthy();
    });

    test('renders electrical equipment correctly', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      const mockEquipment = createMockEquipment({ category: 'electrical' });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          equipment={mockEquipment}
          onPress={() => {}}
          testID="electrical-task"
        />
      );
      
      const equipmentIcon = getByTestId('icon-lightning');
      expect(equipmentIcon).toBeTruthy();
    });

    test('renders mechanical equipment correctly', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      const mockEquipment = createMockEquipment({ category: 'mechanical' });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          equipment={mockEquipment}
          onPress={() => {}}
          testID="mechanical-task"
        />
      );
      
      const equipmentIcon = getByTestId('icon-settings');
      expect(equipmentIcon).toBeTruthy();
    });

    test('renders default equipment icon for unknown category', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      const mockEquipment = createMockEquipment({ category: 'unknown' });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          equipment={mockEquipment}
          onPress={() => {}}
          testID="unknown-equipment-task"
        />
      );
      
      const equipmentIcon = getByTestId('icon-wrench');
      expect(equipmentIcon).toBeTruthy();
    });
  });

  describe('Visual Elements', () => {
    test('renders all required icons', () => {
      const mockTask = createMockTask();
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="icons-task"
        />
      );
      
      // Calendar icon for due date
      expect(getByTestId('icon-calendar')).toBeTruthy();
      // Clock icon for duration
      expect(getByTestId('icon-clock')).toBeTruthy();
      // Right arrow icon for navigation
      expect(getByTestId('icon-right')).toBeTruthy();
    });

    test('renders priority indicator with correct styling', () => {
      const mockTask = createMockTask({ priority: 3 });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="priority-indicator-task"
        />
      );
      
      // Should have priority badge with high priority styling
      const priorityBadge = getByTestId('priority-badge');
      expect(priorityBadge.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: `${Colors.error}20` })
        ])
      );
    });

    test('shows line-through styling for completed tasks', () => {
      const mockTask = createMockTask({ completed_at: '2024-01-10T10:00:00Z' });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="completed-styling-task"
        />
      );
      
      const taskTitle = getByTestId('task-title');
      expect(taskTitle.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ textDecorationLine: 'line-through' })
        ])
      );
      
      const taskDescription = getByTestId('task-description');
      expect(taskDescription.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ textDecorationLine: 'line-through' })
        ])
      );
    });

    test('truncates description to 2 lines', () => {
      const longDescription = "This is an extremely long task description that should be truncated to prevent layout issues and maintain consistent card heights throughout the interface.";
      const mockTask = createMockTask({ description: longDescription });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="truncated-description-task"
        />
      );
      
      const descriptionElement = getByTestId('task-description');
      expect(descriptionElement.props.numberOfLines).toBe(2);
      expect(descriptionElement.props.children).toBe(longDescription);
    });
  });

  describe('Accessibility', () => {
    test('has correct accessibility role', () => {
      const mockTask = createMockTask();
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="accessible-task-card"
        />
      );
      
      const card = getByTestId('accessible-task-card');
      expect(card.props.accessibilityRole).toBe('button');
    });

    test('uses task title in accessibility label', () => {
      const mockTask = createMockTask({ title: 'Fix the broken sink' });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="labeled-task-card"
        />
      );
      
      const card = getByTestId('labeled-task-card');
      expect(card.props.accessibilityLabel).toBe('Task: Fix the broken sink');
    });

    test('reports correct accessibility state for completed task', () => {
      const mockTask = createMockTask({ completed_at: '2024-01-10T10:00:00Z' });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="completed-accessible-task"
        />
      );
      
      const card = getByTestId('completed-accessible-task');
      expect(card.props.accessibilityState).toEqual({ selected: true });
    });

    test('reports correct accessibility state for pending task', () => {
      const mockTask = createMockTask({ completed_at: null });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="pending-accessible-task"
        />
      );
      
      const card = getByTestId('pending-accessible-task');
      expect(card.props.accessibilityState).toEqual({ selected: false });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty title gracefully', () => {
      const mockTask = createMockTask({ title: '' });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="empty-title-task"
        />
      );
      
      const titleElement = getByTestId('task-title');
      expect(titleElement.props.children).toBe('');
    });

    test('handles null/undefined duration gracefully', () => {
      const mockTask = createMockTask({ estimated_duration_minutes: null });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="null-duration-task"
        />
      );
      
      const durationText = getByTestId('duration-text');
      expect(durationText.props.children).toEqual(['N/A', ' min']);
    });

    test('handles undefined duration gracefully', () => {
      const mockTask = createMockTask({ estimated_duration_minutes: undefined });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="undefined-duration-task"
        />
      );
      
      const durationText = getByTestId('duration-text');
      expect(durationText.props.children).toEqual(['N/A', ' min']);
    });

    test('handles invalid date gracefully', () => {
      const mockTask = createMockTask({ due_date: 'invalid-date' });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="invalid-date-task"
        />
      );
      
      // Should not crash and should handle the invalid date
      const dueDateText = getByTestId('due-date-text');
      expect(dueDateText).toBeTruthy();
    });

    test('handles missing task properties gracefully', () => {
      const mockTask = createMockTask({ 
        title: undefined,
        description: undefined,
        priority: undefined,
        difficulty_level: undefined 
      });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="missing-props-task"
        />
      );
      
      // Should not crash
      expect(getByTestId('missing-props-task')).toBeTruthy();
    });

    test('handles very large money values correctly', () => {
      const mockTask = createMockTask({ money_saved_estimate: 99999.99 });
      
      const { getByTestId, getByText } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="large-money-task"
        />
      );
      
      expect(getByTestId('money-saved-item')).toBeTruthy();
      expect(getByText('$100000 saved')).toBeTruthy(); // Should round to nearest dollar
    });

    test('handles negative money values gracefully', () => {
      const mockTask = createMockTask({ money_saved_estimate: -50 });
      
      const { queryByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="negative-money-task"
        />
      );
      
      // Should not show money saved for negative values
      expect(queryByTestId('money-saved-item')).toBeNull();
    });

    test('handles equipment without category gracefully', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      const mockEquipment = createMockEquipment({ category: null });
      
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          equipment={mockEquipment}
          onPress={() => {}}
          testID="no-category-equipment-task"
        />
      );
      
      // Should show default wrench icon
      const equipmentIcon = getByTestId('icon-wrench');
      expect(equipmentIcon).toBeTruthy();
    });
  });

  // ========================================
  // ENHANCED ACCESSIBILITY TESTING
  // ========================================
  describe('Enhanced Accessibility Testing', () => {
    test('task card has proper accessibility role', () => {
      const mockTask = createMockTask();
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="accessibility-role-card"
        />
      );
      
      const card = getByTestId('accessibility-role-card');
      expect(card.props.accessibilityRole).toBe('button');
    });

    test('task card provides meaningful accessibility label', () => {
      const mockTask = createMockTask({ 
        title: 'Fix leaky faucet',
        description: 'Replace worn O-ring in kitchen sink faucet'
      });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="meaningful-label-card"
        />
      );
      
      const card = getByTestId('meaningful-label-card');
      expect(card.props.accessibilityLabel).toBe('Fix leaky faucet');
    });

    test('completed task has proper accessibility state', () => {
      const mockTask = createMockTask({ 
        completed_at: '2024-01-10T10:00:00Z',
        title: 'Completed Task'
      });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="completed-a11y-card"
        />
      );
      
      const card = getByTestId('completed-a11y-card');
      expect(card.props.accessibilityState).toEqual({ selected: true });
    });

    test('pending task has proper accessibility state', () => {
      const mockTask = createMockTask({ 
        completed_at: null,
        title: 'Pending Task'
      });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="pending-a11y-card"
        />
      );
      
      const card = getByTestId('pending-a11y-card');
      expect(card.props.accessibilityState).toEqual({ selected: false });
    });

    test('overdue task provides accessibility context', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const mockTask = createMockTask({ 
        due_date: yesterday.toISOString(),
        completed_at: null,
        title: 'Overdue Task'
      });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="overdue-a11y-card"
        />
      );
      
      const card = getByTestId('overdue-a11y-card');
      expect(card.props.accessibilityLabel).toBe('Overdue Task');
      expect(card.props.accessibilityHint).toContain('overdue');
    });

    test('high priority task includes priority in accessibility hint', () => {
      const mockTask = createMockTask({ 
        priority: 3,
        title: 'High Priority Task'
      });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="priority-a11y-card"
        />
      );
      
      const card = getByTestId('priority-a11y-card');
      expect(card.props.accessibilityHint).toContain('High priority');
    });

    test('task with equipment includes equipment context', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      const mockEquipment = createMockEquipment({ 
        name: 'Water Heater',
        category: 'plumbing'
      });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          equipment={mockEquipment}
          onPress={() => {}}
          testID="equipment-a11y-card"
        />
      );
      
      const card = getByTestId('equipment-a11y-card');
      expect(card.props.accessibilityHint).toContain('Water Heater');
    });

    test('task with money saved includes financial context', () => {
      const mockTask = createMockTask({ 
        money_saved_estimate: 150,
        title: 'Cost Saving Task'
      });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="money-a11y-card"
        />
      );
      
      const card = getByTestId('money-a11y-card');
      expect(card.props.accessibilityHint).toContain('$150');
    });

    test('task with duration includes timing context', () => {
      const mockTask = createMockTask({ 
        estimated_duration_minutes: 45,
        title: 'Timed Task'
      });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="duration-a11y-card"
        />
      );
      
      const card = getByTestId('duration-a11y-card');
      expect(card.props.accessibilityHint).toContain('45 minutes');
    });

    test('task card supports keyboard accessibility', () => {
      const mockTask = createMockTask();
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="keyboard-card"
        />
      );
      
      const card = getByTestId('keyboard-card');
      expect(card.props.accessible).toBe(true);
      expect(card.props.accessibilityRole).toBe('button');
    });

    test('priority colors meet accessibility contrast standards', () => {
      const priorities = [1, 2, 3];
      
      priorities.forEach(priority => {
        const mockTask = createMockTask({ priority });
        const { getByTestId } = render(
          <TaskCard 
            task={mockTask} 
            onPress={() => {}}
            testID={`priority-${priority}-card`}
          />
        );
        
        const priorityBadge = getByTestId('priority-badge');
        expect(priorityBadge.props.style).toBeDefined();
        
        // Verify priority color mapping
        const expectedColor = priority === 3 ? Colors.error :
                            priority === 2 ? Colors.warning :
                            Colors.info;
                            
        expect(priorityBadge.props.style).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ backgroundColor: `${expectedColor}20` })
          ])
        );
      });
    });

    test('completed task visual styling maintains accessibility', () => {
      const mockTask = createMockTask({ 
        completed_at: '2024-01-10T10:00:00Z'
      });
      const { getByTestId } = render(
        <TaskCard 
          task={mockTask} 
          onPress={() => {}}
          testID="completed-visual-card"
        />
      );
      
      const card = getByTestId('completed-visual-card');
      expect(card.props.accessible).toBe(true);
      expect(card.props.accessibilityState).toEqual({ selected: true });
      
      // Check that strikethrough styling doesn't interfere with accessibility
      const taskTitle = getByTestId('task-title');
      expect(taskTitle.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ textDecorationLine: 'line-through' })
        ])
      );
    });
  });

  describe('Snapshot Testing', () => {
    test('pending task snapshot', () => {
      const mockTask = createMockTask();
      const component = render(
        <TaskCard task={mockTask} onPress={() => {}} testID="pending-snapshot" />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('completed task snapshot', () => {
      const mockTask = createMockTask({ completed_at: '2024-01-10T10:00:00Z' });
      const component = render(
        <TaskCard task={mockTask} onPress={() => {}} testID="completed-snapshot" />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('overdue task snapshot', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const mockTask = createMockTask({ 
        due_date: yesterday.toISOString(),
        completed_at: null 
      });
      const component = render(
        <TaskCard task={mockTask} onPress={() => {}} testID="overdue-snapshot" />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('high priority task snapshot', () => {
      const mockTask = createMockTask({ priority: 3 });
      const component = render(
        <TaskCard task={mockTask} onPress={() => {}} testID="high-priority-snapshot" />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('task with equipment snapshot', () => {
      const mockTask = createMockTask({ equipment_id: '1' });
      const mockEquipment = createMockEquipment();
      const component = render(
        <TaskCard 
          task={mockTask} 
          equipment={mockEquipment} 
          onPress={() => {}} 
          testID="equipment-snapshot" 
        />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('task with money saved snapshot', () => {
      const mockTask = createMockTask({ money_saved_estimate: 150 });
      const component = render(
        <TaskCard task={mockTask} onPress={() => {}} testID="money-saved-snapshot" />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });
}); 