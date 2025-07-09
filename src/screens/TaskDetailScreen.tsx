import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from '../components/icons/Icon';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { useDataContext } from '../contexts/DataContext';
import { useEquipment } from '../hooks/useEquipment';
import { TaskRecurrence, FREQUENCY_OPTIONS, DEFAULT_RECURRENCE } from '../types/preferences';
import { createRecurringTask } from '../lib/services/recurringTaskService';

const categories = [
  { id: 'hvac', label: 'HVAC', icon: 'wrench' as const },
  { id: 'plumbing', label: 'Plumbing', icon: 'plumbing' as const },
  { id: 'electrical', label: 'Electrical', icon: 'electrical' as const },
  { id: 'exterior', label: 'Exterior', icon: 'home' as const },
  { id: 'interior', label: 'Interior', icon: 'house' as const },
  { id: 'appliances', label: 'Appliances', icon: 'settings' as const },
  { id: 'safety', label: 'Safety', icon: 'warning' as const },
  { id: 'general', label: 'General', icon: 'hammer' as const },
];

const priorities = [
  { value: 1, label: 'Low', color: Colors.info },
  { value: 2, label: 'Medium', color: Colors.warning },
  { value: 3, label: 'High', color: Colors.error },
];

const difficulties = [
  { value: 1, label: 'Easy', description: 'Basic task, minimal tools' },
  { value: 2, label: 'Medium', description: 'Some experience needed' },
  { value: 3, label: 'Hard', description: 'Advanced skills required' },
];

interface TaskDetailRouteParams {
  task: any;
}

export const TaskDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { task: initialTask } = route.params as TaskDetailRouteParams;
  const { updateTask, deleteTask, addTask, tasks } = useDataContext();
  const { equipment } = useEquipment(); // Get equipment data
  
  // Get the current task from the global state (in case it was updated)
  const task = tasks.find(t => t.id === initialTask.id) || initialTask;
  
  // Find associated equipment
  const associatedEquipment = task.equipment_id 
    ? equipment.find(eq => eq.id === task.equipment_id)
    : null;
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    ...task,
    recurrence: task.recurrence || DEFAULT_RECURRENCE
  });

  // Update editedTask when task changes or when entering edit mode
  React.useEffect(() => {
    setEditedTask({
      ...task,
      recurrence: task.recurrence || DEFAULT_RECURRENCE
    });
  }, [task]);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return Colors.error;
      case 2: return Colors.warning;
      case 1: return Colors.info;
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

  const handleMarkComplete = async () => {
    Alert.alert(
      'Mark Complete',
      'Are you sure you want to mark this task as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('🔧 TaskDetailScreen: About to call updateTask for task:', task.id);
              
              // Mark the current task as complete
              const completedDate = new Date().toISOString();
              await updateTask(task.id, {
                status: 'completed',
                completed_at: completedDate,
              });
              console.log('🔧 TaskDetailScreen: updateTask completed successfully');
              
              // Check if this is a recurring task and create the next one
              if (task.recurrence?.enabled) {
                console.log('🔄 TaskDetailScreen: Creating next recurring task');
                const nextTask = createRecurringTask(task, new Date(completedDate));
                
                if (nextTask) {
                  await addTask(nextTask);
                  console.log('🔄 TaskDetailScreen: Next recurring task created:', nextTask.title, 'due:', nextTask.due_date);
                }
              }
              
              Alert.alert('Success', 'Task marked as complete!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('TaskDetailScreen: Error completing task:', error);
              Alert.alert('Error', 'Failed to mark task as complete');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      // Only pass the fields that can be updated
      const updates = {
        title: editedTask.title,
        description: editedTask.description,
        due_date: editedTask.due_date,
        estimated_duration_minutes: editedTask.estimated_duration_minutes,
        category: editedTask.category,
        priority: editedTask.priority,
        difficulty_level: editedTask.difficulty_level,
        notes: editedTask.notes,
        recurrence: editedTask.recurrence,
      };
      
      console.log('Updating task with:', updates);
      updateTask(task.id, updates);
      console.log('Task updated successfully');
      Alert.alert('Success', 'Task updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteTask(task.id);
              Alert.alert('Success', 'Task deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const priorityColor = getPriorityColor(task.priority);
  const isCompleted = task.status === 'completed';

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="back" size="lg" color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              {!isCompleted && (
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.actionButton}>
                  <Icon name={isEditing ? "close" : "edit"} size="md" color={Colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Icon name="delete" size="md" color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
          
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={editedTask.title}
              onChangeText={(text) => setEditedTask((prev: any) => ({ ...prev, title: text }))}
              placeholder="Task title"
            />
          ) : (
            <Text style={styles.title}>{task.title}</Text>
          )}
          
          {isCompleted && (
            <View style={styles.completedBanner}>
              <Icon name="check" size="sm" color={Colors.success} />
              <Text style={styles.completedText}>
                Completed {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          {isEditing ? (
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={editedTask.description}
                             onChangeText={(text) => setEditedTask((prev: any) => ({ ...prev, description: text }))}
              placeholder="Task description"
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.description}>{task.description}</Text>
          )}
        </View>

        {/* Task Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          {isEditing ? (
            <View style={styles.editDetailsContainer}>
              {/* Due Date */}
              <View style={styles.editDetailItem}>
                <Text style={styles.editDetailLabel}>Due Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={editedTask.due_date}
                  onChangeText={(text) => setEditedTask((prev: any) => ({ ...prev, due_date: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              {/* Duration */}
              <View style={styles.editDetailItem}>
                <Text style={styles.editDetailLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={editedTask.estimated_duration_minutes?.toString() || ''}
                  onChangeText={(text) => setEditedTask((prev: any) => ({ ...prev, estimated_duration_minutes: parseInt(text) || 0 }))}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>

              {/* Category */}
              <View style={styles.editDetailItem}>
                <Text style={styles.editDetailLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        editedTask.category === category.id && styles.categoryButtonActive
                      ]}
                      onPress={() => setEditedTask((prev: any) => ({ ...prev, category: category.id }))}
                    >
                      <Icon 
                        name={category.icon} 
                        size="sm" 
                        color={editedTask.category === category.id ? Colors.white : Colors.textSecondary} 
                      />
                      <Text style={[
                        styles.categoryButtonText,
                        editedTask.category === category.id && styles.categoryButtonTextActive
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Priority */}
              <View style={styles.editDetailItem}>
                <Text style={styles.editDetailLabel}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority.value}
                      style={[
                        styles.priorityButton,
                        editedTask.priority === priority.value && { backgroundColor: `${priority.color}20` }
                      ]}
                      onPress={() => setEditedTask((prev: any) => ({ ...prev, priority: priority.value }))}
                    >
                      <View style={[
                        styles.priorityIndicator,
                        { backgroundColor: priority.color }
                      ]} />
                      <Text style={[
                        styles.priorityButtonText,
                        editedTask.priority === priority.value && { color: priority.color }
                      ]}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Difficulty */}
              <View style={styles.editDetailItem}>
                <Text style={styles.editDetailLabel}>Difficulty</Text>
                <View style={styles.difficultyContainer}>
                  {difficulties.map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty.value}
                      style={[
                        styles.difficultyButton,
                        editedTask.difficulty_level === difficulty.value && styles.difficultyButtonActive
                      ]}
                      onPress={() => setEditedTask((prev: any) => ({ ...prev, difficulty_level: difficulty.value }))}
                    >
                      <Text style={[
                        styles.difficultyButtonText,
                        editedTask.difficulty_level === difficulty.value && styles.difficultyButtonTextActive
                      ]}>
                        {difficulty.label}
                      </Text>
                      <Text style={styles.difficultyDescription}>{difficulty.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Recurrence */}
              <View style={styles.editDetailItem}>
                <View style={styles.recurrenceHeader}>
                  <Text style={styles.editDetailLabel}>Recurring Task</Text>
                  <Switch
                    value={editedTask.recurrence?.enabled || false}
                    onValueChange={(enabled) => 
                      setEditedTask((prev: any) => ({ 
                        ...prev, 
                        recurrence: { 
                          ...DEFAULT_RECURRENCE, 
                          ...prev.recurrence, 
                          enabled 
                        } 
                      }))
                    }
                    trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                    thumbColor={editedTask.recurrence?.enabled ? Colors.primary : Colors.textSecondary}
                  />
                </View>
                
                {editedTask.recurrence?.enabled && (
                  <View style={styles.recurrenceOptions}>
                    <Text style={styles.recurrenceSubLabel}>Repeat every:</Text>
                    <View style={styles.frequencyContainer}>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.frequencyButton,
                            editedTask.recurrence?.frequency_type === option.value && styles.frequencyButtonActive
                          ]}
                          onPress={() => 
                            setEditedTask((prev: any) => ({ 
                              ...prev, 
                              recurrence: { 
                                ...prev.recurrence, 
                                frequency_type: option.value,
                                frequency_months: option.months || prev.recurrence?.frequency_months || 3
                              } 
                            }))
                          }
                        >
                          <Text style={[
                            styles.frequencyButtonText,
                            editedTask.recurrence?.frequency_type === option.value && styles.frequencyButtonTextActive
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    {editedTask.recurrence?.frequency_type === 'custom' && (
                      <View style={styles.customFrequencyContainer}>
                        <Text style={styles.recurrenceSubLabel}>Custom frequency (months):</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={editedTask.recurrence?.frequency_months?.toString() || ''}
                          onChangeText={(text) => 
                            setEditedTask((prev: any) => ({ 
                              ...prev, 
                              recurrence: { 
                                ...prev.recurrence, 
                                frequency_months: parseInt(text) || 1
                              } 
                            }))
                          }
                          placeholder="3"
                          keyboardType="numeric"
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Icon name="calendar" size="sm" color={Colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Due Date</Text>
                  <Text style={[styles.detailValue, isOverdue && styles.overdueText]}>
                    {isOverdue ? 'Overdue - ' : ''}{new Date(task.due_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Icon name="clock" size="sm" color={Colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{task.estimated_duration_minutes} minutes</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Priority</Text>
                  <Text style={[styles.detailValue, { color: priorityColor }]}>
                    {getPriorityLabel(task.priority)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Icon name="settings" size="sm" color={Colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Difficulty</Text>
                  <Text style={styles.detailValue}>{getDifficultyLabel(task.difficulty_level)}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Icon name="properties" size="sm" color={Colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{task.category?.toUpperCase()}</Text>
                </View>
              </View>

              {/* Equipment Association */}
              {associatedEquipment && (
                <View style={styles.detailItem}>
                  <Icon name="wrench" size="sm" color={Colors.textSecondary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Equipment</Text>
                    <Text style={styles.detailValue}>{associatedEquipment.name}</Text>
                    {associatedEquipment.location && (
                      <Text style={styles.detailSubValue}>({associatedEquipment.location})</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Money Saved */}
              {task.money_saved_estimate && task.money_saved_estimate > 0 && (
                <View style={styles.detailItem}>
                  <Icon name="check" size="sm" color={Colors.success} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Money Saved</Text>
                    <Text style={[styles.detailValue, styles.moneySavedText]}>
                      ${task.money_saved_estimate.toFixed(0)}
                    </Text>
                    <Text style={styles.detailSubValue}>by doing this yourself</Text>
                  </View>
                </View>
              )}

              {/* Recurrence */}
              {task.recurrence?.enabled && (
                <View style={styles.detailItem}>
                  <Icon name="clock" size="sm" color={Colors.textSecondary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Recurrence</Text>
                    <Text style={styles.detailValue}>
                      {task.recurrence.frequency_type === 'custom' 
                        ? `Every ${task.recurrence.frequency_months} month${task.recurrence.frequency_months > 1 ? 's' : ''}`
                        : FREQUENCY_OPTIONS.find(opt => opt.value === task.recurrence?.frequency_type)?.label || 'Unknown'
                      }
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Instructions */}
        {task.instructions && Array.isArray(task.instructions) && task.instructions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsList}>
              {task.instructions.map((instruction: string, index: number) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>{index + 1}</Text>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {isEditing ? (
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={editedTask.notes || ''}
                             onChangeText={(text) => setEditedTask((prev: any) => ({ ...prev, notes: text }))}
              placeholder="Add notes..."
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.notes}>{task.notes || 'No notes added'}</Text>
          )}
        </View>
      </KeyboardAwareScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isEditing ? (
          <>
            <SecondaryButton
              title="Cancel"
              onPress={() => {
                setIsEditing(false);
                setEditedTask(task);
              }}
              style={styles.actionButtonStyle}
            />
            <PrimaryButton
              title={loading ? "Saving..." : "Save Changes"}
              onPress={handleSaveEdit}
              disabled={loading}
              style={styles.actionButtonStyle}
            />
          </>
        ) : (
          !isCompleted && (
            <PrimaryButton
              title={loading ? "Completing..." : "Mark Complete"}
              onPress={handleMarkComplete}
              disabled={loading}
              style={styles.completeButton}
            />
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  title: {
    fontFamily: Typography.titleLarge.fontFamily,
    fontSize: Typography.titleLarge.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  titleInput: {
    fontFamily: Typography.titleLarge.fontFamily,
    fontSize: Typography.titleLarge.fontSize,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    marginBottom: Spacing.sm,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    padding: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  completedText: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.success,
  },
  section: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.titleMedium.fontFamily,
    fontSize: Typography.titleMedium.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontFamily: Typography.bodyLarge.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontFamily: Typography.bodyLarge.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  detailsGrid: {
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: Typography.labelSmall.fontFamily,
    fontSize: Typography.labelSmall.fontSize,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textPrimary,
  },
  detailSubValue: {
    fontFamily: Typography.labelSmall.fontFamily,
    fontSize: Typography.labelSmall.fontSize,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  overdueText: {
    color: Colors.error,
  },
  priorityIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  instructionsList: {
    gap: Spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  instructionNumber: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.primary,
    backgroundColor: Colors.primary + '20',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionText: {
    flex: 1,
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  notes: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  actionButtonStyle: {
    flex: 1,
  },
  completeButton: {
    flex: 1,
  },
  // Edit mode styles
  editDetailsContainer: {
    gap: Spacing.lg,
  },
  editDetailItem: {
    marginBottom: Spacing.md,
  },
  editDetailLabel: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  categoryScroll: {
    marginTop: Spacing.xs,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontFamily: Typography.labelSmall.fontFamily,
    fontSize: Typography.labelSmall.fontSize,
    color: Colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: Colors.white,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing.xs,
  },
  priorityButtonText: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.textSecondary,
  },
  difficultyContainer: {
    gap: Spacing.sm,
  },
  difficultyButton: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  difficultyButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  difficultyButtonText: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  difficultyButtonTextActive: {
    color: Colors.primary,
  },
  difficultyDescription: {
    fontFamily: Typography.labelSmall.fontFamily,
    fontSize: Typography.labelSmall.fontSize,
    color: Colors.textTertiary,
  },
  // Recurrence styles
  recurrenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  recurrenceOptions: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  recurrenceSubLabel: {
    fontFamily: Typography.labelSmall.fontFamily,
    fontSize: Typography.labelSmall.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  frequencyButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  frequencyButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  frequencyButtonText: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.textSecondary,
  },
  frequencyButtonTextActive: {
    color: Colors.white,
  },
  customFrequencyContainer: {
    marginTop: Spacing.sm,
  },
  moneySavedText: {
    color: Colors.success,
    fontWeight: '600',
  },
}); 