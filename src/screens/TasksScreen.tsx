import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Icon } from '../components/icons/Icon';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { useDataContext } from '../contexts/DataContext';

interface TaskCardProps {
  task: any;
  onPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
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
      default: return 'NORMAL';
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

  const isCompleted = !!task.completed_at;
  const isOverdue = !isCompleted && task.due_date && new Date(task.due_date) < new Date();
  const priorityColor = getPriorityColor(task.priority);

  return (
    <TouchableOpacity 
      style={[
        styles.taskCard, 
        isCompleted && styles.taskCardCompleted
      ]} 
      onPress={onPress}
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
            ]}>
              {task.title}
            </Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Icon name="check" size="sm" color={Colors.white} />
              </View>
            )}
          </View>
          <Text style={[
            styles.taskDescription,
            isCompleted && styles.taskDescriptionCompleted
          ]} numberOfLines={2}>
            {task.description}
          </Text>
        </View>
        <Icon name="right" size="sm" color={Colors.textTertiary} />
      </View>
      
      <View style={styles.taskMeta}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size="sm" color={Colors.textSecondary} />
            <Text style={[
              styles.metaText, 
              isOverdue && styles.overdueText,
              isCompleted && styles.metaTextCompleted
            ]}>
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
            ]}>
              {task.estimated_duration_minutes || 'N/A'} min
            </Text>
          </View>
        </View>
        
        <View style={styles.metaRow}>
          {!isCompleted && (
            <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {getPriorityLabel(task.priority)}
              </Text>
            </View>
          )}
          {isCompleted && (
            <View style={styles.completedStatusBadge}>
              <Text style={styles.completedStatusText}>COMPLETED</Text>
            </View>
          )}
          <View style={[
            styles.difficultyBadge,
            isCompleted && styles.difficultyBadgeCompleted
          ]}>
            <Text style={[
              styles.difficultyText,
              isCompleted && styles.difficultyTextCompleted
            ]}>
              {getDifficultyLabel(task.difficulty_level)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tasks } = useDataContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');

  // Set initial filter from route params
  useEffect(() => {
    const params = route.params as { filter?: 'all' | 'open' | 'done' } | undefined;
    if (params?.filter) {
      setFilter(params.filter);
    }
  }, [route.params]);

  // Refresh tasks when screen comes into focus (e.g., after adding a task)
  useFocusEffect(
    React.useCallback(() => {
      // Screen focused - tasks are already managed by DataContext
      // No need for logging or refresh calls
    }, [tasks.length])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // In MVP mode, refresh just updates the UI - no data fetching needed
    setRefreshing(false);
  };

  const handleAddTask = () => {
    (navigation as any).navigate('AddTask');
  };

  const handleTaskPress = (task: any) => {
    (navigation as any).navigate('TaskDetail', { task });
  };

  const getFilteredTasks = () => {
    let filtered: any[] = [];
    
    if (filter === 'all') {
      filtered = tasks;
    } else if (filter === 'open') {
      filtered = tasks.filter(task => !task.completed_at);
    } else if (filter === 'done') {
      filtered = tasks.filter(task => !!task.completed_at);
    }

    // Sort tasks: pending first, then completed at the bottom
    return filtered.sort((a, b) => {
      const aCompleted = !!a.completed_at;
      const bCompleted = !!b.completed_at;
      
      // If one is completed and other isn't, put completed at bottom
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }
      
      // If both have same completion status, sort by due date
      const aDate = new Date(a.due_date || '9999-12-31');
      const bDate = new Date(b.due_date || '9999-12-31');
      return aDate.getTime() - bDate.getTime();
    });
  };

  const filteredTasks = getFilteredTasks();

  // Debug logging - Removed for MVP production

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <Text style={styles.headerSubtitle}>
          Stay on top of your home maintenance
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Development Mode Banner - Removed for MVP */}

        {/* Add Task Button */}
        <View style={styles.addSection}>
          <PrimaryButton
            title="Add Task"
            onPress={handleAddTask}
            style={styles.addButton}
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter Tasks</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                All ({tasks.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'open' && styles.filterButtonActive]}
              onPress={() => setFilter('open')}
            >
              <Text style={[styles.filterButtonText, filter === 'open' && styles.filterButtonTextActive]}>
                Open ({tasks.filter(t => !t.completed_at).length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'done' && styles.filterButtonActive]}
              onPress={() => setFilter('done')}
            >
              <Text style={[styles.filterButtonText, filter === 'done' && styles.filterButtonTextActive]}>
                Done ({tasks.filter(t => !!t.completed_at).length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks List */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Your Tasks</Text>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="warning" size="md" color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && filteredTasks.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="tasks" size="xl" color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>
                {filter === 'all' ? 'No Tasks Yet' : `No ${filter} Tasks`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' 
                  ? 'Add your first task to get started'
                  : `You don't have any ${filter} tasks right now`
                }
              </Text>
            </View>
          )}

          {!loading && !error && filteredTasks.length > 0 && (
            <View style={styles.tasksList}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={() => handleTaskPress(task)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.displayMedium,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.huge,
  },
  devBanner: {
    backgroundColor: Colors.warningLight,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  devBannerText: {
    ...Typography.bodyMedium,
    color: Colors.warning,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  addSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  addButton: {
    width: '100%',
  },
  filterSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  filterTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.md,
    color: Colors.textPrimary,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  tasksSection: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.headlineMedium,
    marginBottom: Spacing.lg,
    color: Colors.textPrimary,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  errorContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Typography.headlineMedium,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tasksList: {
    gap: Spacing.md,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: Colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
  bottomSpacing: {
    height: Spacing.xl,
  },
}); 