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
import { useEquipment } from '../hooks/useEquipment';

// Helper function for equipment icons
const getEquipmentIcon = (category: string) => {
  switch (category) {
    case 'hvac': return 'settings';
    case 'plumbing': return 'plumbing';
    case 'electrical': return 'electrical';
    case 'appliance': return 'home';
    case 'exterior': return 'house';
    case 'safety': return 'warning';
    case 'mechanical': return 'settings';
    default: return 'wrench';
  }
};

interface TaskCardProps {
  task: any;
  equipment?: any; // Equipment data for this task
  onPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, equipment, onPress }) => {
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
          
          {/* Equipment Badge - Only show for equipment-specific tasks */}
          {equipment && task.equipment_id && (
            <View style={styles.equipmentBadge}>
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
          {/* Money Saved Display */}
          {task.money_saved_estimate && task.money_saved_estimate > 0 && (
            <View style={styles.metaItem}>
              <Icon name="check" size="sm" color={Colors.success} />
              <Text style={[
                styles.metaText,
                styles.moneySavedText,
                isCompleted && styles.metaTextCompleted
              ]}>
                ${task.money_saved_estimate.toFixed(0)} saved
              </Text>
            </View>
          )}
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
  const { equipment } = useEquipment(); // Get equipment data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'done' | 'overdue'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string | null>(null);

  // Set initial filter from route params
  useEffect(() => {
    const params = route.params as { 
      filter?: 'all' | 'open' | 'done' | 'overdue';
      equipmentFilter?: string;
      equipmentName?: string;
    } | undefined;
    
    if (params?.filter) {
      setFilter(params.filter);
    }
    
    if (params?.equipmentFilter) {
      setEquipmentFilter(params.equipmentFilter);
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

  // Create equipment lookup map
  const equipmentMap = equipment.reduce((map, eq) => {
    map[eq.id] = eq;
    return map;
  }, {} as Record<string, any>);

  const getFilteredTasks = () => {
    let filtered: any[] = [];
    
    if (filter === 'all') {
      filtered = tasks;
    } else if (filter === 'open') {
      filtered = tasks.filter(task => !task.completed_at);
    } else if (filter === 'done') {
      filtered = tasks.filter(task => !!task.completed_at);
    } else if (filter === 'overdue') {
      filtered = tasks.filter(task => 
        !task.completed_at && 
        task.due_date && 
        new Date(task.due_date) < new Date()
      );
    }

    // Apply equipment filter if selected
    if (equipmentFilter) {
      filtered = filtered.filter(task => task.equipment_id === equipmentFilter);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  const getTaskCounts = () => {
    const openTasks = tasks.filter(task => !task.completed_at);
    const completedTasks = tasks.filter(task => !!task.completed_at);
    const overdueTasks = openTasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date()
    );

    return {
      all: tasks.length,
      open: openTasks.length,
      done: completedTasks.length,
      overdue: overdueTasks.length,
    };
  };

  const taskCounts = getTaskCounts();

  const handleStatPress = (filterType: 'open' | 'done' | 'overdue') => {
    setFilter(filterType);
  };

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
        {/* Add Task Button */}
        <View style={styles.addSection}>
          <PrimaryButton
            title="Add Task"
            onPress={handleAddTask}
            style={styles.addButton}
          />
        </View>

        {/* Overview Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={[
                styles.statCard,
                filter === 'open' && styles.statCardActive
              ]}
              onPress={() => handleStatPress('open')}
            >
              <Icon name="calendar" size="lg" color={Colors.info} />
              <Text style={styles.statValue}>{taskCounts.open}</Text>
              <Text style={styles.statLabel}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.statCard,
                filter === 'done' && styles.statCardActive
              ]}
              onPress={() => handleStatPress('done')}
            >
              <Icon name="check" size="lg" color={Colors.success} />
              <Text style={styles.statValue}>{taskCounts.done}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.statCard,
                filter === 'overdue' && styles.statCardActive
              ]}
              onPress={() => handleStatPress('overdue')}
            >
              <Icon name="warning" size="lg" color={Colors.error} />
              <Text style={styles.statValue}>{taskCounts.overdue}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Equipment Filter */}
        {equipment.length > 0 && (
          <View style={styles.equipmentFilterSection}>
            <Text style={styles.sectionTitle}>Filter by Equipment</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.equipmentFilterContainer}
            >
              <TouchableOpacity
                style={[
                  styles.equipmentFilterChip,
                  !equipmentFilter && styles.equipmentFilterChipActive
                ]}
                onPress={() => setEquipmentFilter(null)}
              >
                <Text style={[
                  styles.equipmentFilterText,
                  !equipmentFilter && styles.equipmentFilterTextActive
                ]}>
                  All Equipment
                </Text>
              </TouchableOpacity>
              
              {equipment.map((eq) => (
                <TouchableOpacity
                  key={eq.id}
                  style={[
                    styles.equipmentFilterChip,
                    equipmentFilter === eq.id && styles.equipmentFilterChipActive
                  ]}
                  onPress={() => setEquipmentFilter(eq.id)}
                >
                  <Icon 
                    name={getEquipmentIcon(eq.category)} 
                    size="xs" 
                    color={equipmentFilter === eq.id ? Colors.white : Colors.primary} 
                  />
                  <Text style={[
                    styles.equipmentFilterText,
                    equipmentFilter === eq.id && styles.equipmentFilterTextActive
                  ]}>
                    {eq.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Current Filter Indicator */}
        <View style={styles.filterIndicatorSection}>
          <Text style={styles.filterIndicatorText}>
            Showing: {filter === 'all' ? 'All Tasks' : filter === 'open' ? 'Open Tasks' : filter === 'done' ? 'Completed Tasks' : 'Overdue Tasks'}
            {equipmentFilter && ` for ${equipmentMap[equipmentFilter]?.name}`} ({filteredTasks.length})
          </Text>
          {(filter !== 'all' || equipmentFilter) && (
            <TouchableOpacity 
              onPress={() => {
                setFilter('all');
                setEquipmentFilter(null);
              }} 
              style={styles.showAllButton}
            >
              <Text style={styles.showAllText}>Show All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tasks List */}
        <View style={styles.tasksSection}>
          {filteredTasks.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="tasks" size="xl" color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>
                {filter === 'all' ? 'No Tasks Yet' : filter === 'open' ? 'No Open Tasks' : filter === 'done' ? 'No Completed Tasks' : 'No Overdue Tasks'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' 
                  ? 'Add your first task to get started'
                  : filter === 'open'
                    ? 'All your tasks are completed! Great job!'
                    : filter === 'done'
                      ? 'Complete some tasks to see them here'
                      : 'Great! No overdue tasks right now'
                }
              </Text>
            </View>
          )}

          {filteredTasks.length > 0 && (
            <View style={styles.tasksList}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  equipment={equipmentMap[task.equipment_id]}
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
  tasksSection: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.headlineMedium,
    marginBottom: Spacing.lg,
    color: Colors.textPrimary,
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
  statsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
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
  statCardActive: {
    borderColor: Colors.primary,
  },
  statValue: {
    ...Typography.displaySmall,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  filterIndicatorSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterIndicatorText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  showAllButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  showAllText: {
    ...Typography.labelMedium,
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
  equipmentFilterSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  equipmentFilterContainer: {
    paddingRight: Spacing.xl,
    gap: Spacing.sm,
  },
  equipmentFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    gap: Spacing.xs,
  },
  equipmentFilterChipActive: {
    backgroundColor: Colors.primary,
  },
  equipmentFilterText: {
    ...Typography.labelMedium,
    color: Colors.primary,
  },
  equipmentFilterTextActive: {
    color: Colors.white,
  },
  moneySavedText: {
    color: Colors.success,
    fontWeight: '600',
  },
}); 