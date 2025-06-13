import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/icons/Icon';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { useDataContext } from '../contexts/DataContext';

interface MaintenanceCardProps {
  maintenance: any;
  onPress: () => void;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ maintenance, onPress }) => {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'hvac': return Colors.info;
      case 'plumbing': return Colors.primary;
      case 'electrical': return Colors.warning;
      case 'general': return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'hvac': return 'wrench';
      case 'plumbing': return 'plumbing';
      case 'electrical': return 'electrical';
      case 'general': return 'hammer';
      default: return 'maintenance';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return Colors.success;
      case 'scheduled': return Colors.info;
      case 'overdue': return Colors.error;
      case 'in_progress': return Colors.warning;
      default: return Colors.textSecondary;
    }
  };

  // Safely get values with fallbacks
  const title = maintenance?.title || 'Untitled';
  const description = maintenance?.description || 'No description';
  const category = maintenance?.category || 'general';
  const status = maintenance?.status || 'scheduled';
  const scheduledDate = maintenance?.scheduled_date || '';
  const actualCost = maintenance?.actual_cost || 0;
  const estimatedCost = maintenance?.estimated_cost || 0;
  const vendorName = maintenance?.vendor_name || '';
  const completedDate = maintenance?.completed_date || '';

  const categoryColor = getCategoryColor(category);
  const statusColor = getStatusColor(status);
  const isOverdue = status === 'overdue';
  const isCompleted = status === 'completed';

  return (
    <TouchableOpacity style={styles.maintenanceCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: `${categoryColor}20` }]}>
          <Icon 
            name={getCategoryIcon(category)} 
            size="md" 
            color={categoryColor} 
          />
        </View>
        <View style={styles.maintenanceInfo}>
          <Text style={styles.maintenanceTitle}>{title}</Text>
          <Text style={styles.maintenanceDescription} numberOfLines={2}>
            {description}
          </Text>
          <View style={styles.metaInfo}>
            <Text style={styles.categoryText}>
              {category.toUpperCase()}
            </Text>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        <Icon name="right" size="sm" color={Colors.textTertiary} />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Icon name="calendar" size="sm" color={Colors.textSecondary} />
          <Text style={[styles.footerText, isOverdue && styles.overdueText]}>
            {scheduledDate 
              ? new Date(scheduledDate).toLocaleDateString()
              : 'No date set'
            }
          </Text>
        </View>
        
        {(actualCost > 0 || estimatedCost > 0) && (
          <View style={styles.footerItem}>
            <Icon name="settings" size="sm" color={Colors.textSecondary} />
            <Text style={styles.footerText}>
              ${actualCost > 0 ? actualCost.toString() : estimatedCost.toString()}
            </Text>
          </View>
        )}

        {vendorName && (
          <View style={styles.footerItem}>
            <Icon name="user" size="sm" color={Colors.textSecondary} />
            <Text style={styles.footerText} numberOfLines={1}>
              {vendorName}
            </Text>
          </View>
        )}
      </View>

      {isCompleted && completedDate && (
        <View style={styles.completedBanner}>
          <Icon name="check" size="sm" color={Colors.success} />
          <Text style={styles.completedText}>
            Completed {new Date(completedDate).toLocaleDateString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const MaintenanceScreen: React.FC = () => {
  const navigation = useNavigation();
  const { maintenance } = useDataContext();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'overdue'>('all');

  // Debug: Log when MaintenanceScreen is rendered
  console.log('MaintenanceScreen rendered, maintenance count:', maintenance.length);

  const onRefresh = async () => {
    setRefreshing(true);
    // In development mode, we don't need to refresh from server
    // The data is already managed by the DataContext
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleAddMaintenance = () => {
    (navigation as any).navigate('AddMaintenance');
  };

  const handleMaintenancePress = (maintenanceItem: any) => {
    // Navigate to maintenance detail screen (to be implemented)
  };

  const getFilteredMaintenance = () => {
    if (filter === 'all') return maintenance;
    return maintenance.filter(item => item.status === filter);
  };

  const filteredMaintenance = getFilteredMaintenance();

  const getFilterCounts = () => {
    return {
      all: maintenance.length,
      scheduled: maintenance.filter(m => m.status === 'scheduled').length,
      completed: maintenance.filter(m => m.status === 'completed').length,
      overdue: maintenance.filter(m => m.status === 'overdue').length,
    };
  };

  const filterCounts = getFilterCounts();

  const handleStatPress = (filterType: 'scheduled' | 'completed' | 'overdue') => {
    setFilter(filterType);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maintenance</Text>
        <Text style={styles.headerSubtitle}>
          Keep your home running smoothly
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


        {/* Add Maintenance Button */}
        <View style={styles.addSection}>
          <PrimaryButton
            title="Schedule Maintenance"
            onPress={handleAddMaintenance}
            style={styles.addButton}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={[
                styles.statCard,
                filter === 'scheduled' && styles.statCardActive
              ]}
              onPress={() => handleStatPress('scheduled')}
            >
              <Icon name="calendar" size="lg" color={Colors.info} />
              <Text style={styles.statValue}>{filterCounts.scheduled}</Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.statCard,
                filter === 'completed' && styles.statCardActive
              ]}
              onPress={() => handleStatPress('completed')}
            >
              <Icon name="check" size="lg" color={Colors.success} />
              <Text style={styles.statValue}>{filterCounts.completed}</Text>
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
              <Text style={styles.statValue}>{filterCounts.overdue}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Filter Indicator */}
        <View style={styles.filterIndicatorSection}>
          <Text style={styles.filterIndicatorText}>
            Showing: {filter === 'all' ? 'All Maintenance' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Maintenance`} ({filteredMaintenance.length})
          </Text>
          {filter !== 'all' && (
            <TouchableOpacity onPress={() => setFilter('all')} style={styles.showAllButton}>
              <Text style={styles.showAllText}>Show All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Maintenance List */}
        <View style={styles.maintenanceSection}>
          <Text style={styles.sectionTitle}>Maintenance History</Text>
          
          {filteredMaintenance.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="maintenance" size="xl" color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>
                {filter === 'all' ? 'No Maintenance Yet' : `No ${filter} Maintenance`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' 
                  ? 'Schedule your first maintenance to get started'
                  : `You don't have any ${filter} maintenance right now`
                }
              </Text>
            </View>
          )}

          {filteredMaintenance.length > 0 && (
            <View style={styles.maintenanceList}>
              {filteredMaintenance.map((maintenanceItem) => (
                <MaintenanceCard
                  key={maintenanceItem.id}
                  maintenance={maintenanceItem}
                  onPress={() => handleMaintenancePress(maintenanceItem)}
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
  statsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.headlineMedium,
    marginBottom: Spacing.lg,
    color: Colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    color: Colors.textSecondary,
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
  maintenanceSection: {
    paddingHorizontal: Spacing.xl,
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
  maintenanceList: {
    gap: Spacing.md,
  },
  maintenanceCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.xs,
  },
  maintenanceDescription: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontWeight: '600',
    fontSize: 10,
  },
  metaDivider: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.xs,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  overdueText: {
    color: Colors.error,
    fontWeight: '600',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.successLight,
    borderRadius: 6,
    gap: Spacing.xs,
  },
  completedText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
}); 