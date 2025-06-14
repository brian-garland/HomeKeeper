import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native'
import { Icon } from '../components/icons/Icon'
import { Colors } from '../theme/colors'
import { Typography } from '../theme/typography'
import { Spacing } from '../theme/spacing'
import { useDataContext } from '../contexts/DataContext'
import { useEquipment } from '../hooks/useEquipment'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

interface EquipmentCardProps {
  equipment: any
  taskCount: number
  onPress: () => void
  onSchedule: () => void
  onTasksPress: () => void
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ 
  equipment, 
  taskCount,
  onPress, 
  onSchedule,
  onTasksPress
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return Colors.success
      case 'attention': return Colors.warning
      case 'maintenance': return Colors.error
      default: return Colors.textSecondary
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return 'check'
      case 'attention': return 'warning'
      case 'maintenance': return 'error'
      default: return 'info'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return 'Good'
      case 'attention': return 'Attention'
      case 'maintenance': return 'Maintenance'
      default: return 'Unknown'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hvac': return 'settings'
      case 'plumbing': return 'plumbing'
      case 'electrical': return 'electrical'
      case 'appliance': return 'home'
      case 'exterior': return 'house'
      case 'safety': return 'warning'
      case 'mechanical': return 'settings'
      default: return 'wrench'
    }
  }

  return (
    <TouchableOpacity style={styles.equipmentCard} onPress={onPress}>
      <View style={styles.equipmentHeader}>
        <View style={styles.equipmentIconContainer}>
          <Icon 
            name={getCategoryIcon(equipment.category)} 
            size="lg" 
            color={Colors.primary} 
          />
        </View>
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{equipment.name}</Text>
          <Text style={styles.equipmentType}>
            {equipment.brand ? `${equipment.brand}` : equipment.category.charAt(0).toUpperCase() + equipment.category.slice(1)}
          </Text>
          {equipment.location && (
            <Text style={styles.equipmentLocation}>📍 {equipment.location}</Text>
          )}
        </View>
        <View style={styles.equipmentStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(equipment.status) }
          ]}>
            <Icon 
              name={getStatusIcon(equipment.status)} 
              size="sm" 
              color={Colors.white} 
            />
          </View>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(equipment.status) }
          ]}>
            {getStatusLabel(equipment.status)}
          </Text>
        </View>
      </View>

      {/* Task Count and Actions */}
      <View style={styles.equipmentFooter}>
        <TouchableOpacity style={styles.taskCountContainer} onPress={onTasksPress}>
          <Icon name="tasks" size="sm" color={Colors.textSecondary} />
          <Text style={styles.taskCountText}>
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.equipmentActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onSchedule}
          >
            <Icon name="calendar" size="sm" color={Colors.primary} />
            <Text style={styles.actionButtonText}>Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={onPress}
          >
            <Icon name="settings" size="sm" color={Colors.white} />
            <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>
              Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export const EquipmentScreen: React.FC = () => {
  const navigation = useNavigation()
  const { equipment, loading, error, refreshEquipment, getEquipmentStatus } = useEquipment()
  const { tasks } = useDataContext()
  const [refreshing, setRefreshing] = useState(false)

  // Refresh equipment when screen comes into focus (e.g., returning from edit screen)
  // Use a ref to track last refresh time to avoid excessive API calls
  const lastRefreshRef = React.useRef(0)
  
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now()
      // Only refresh if it's been more than 2 seconds since last refresh
      if (now - lastRefreshRef.current > 2000) {
        console.log('🔄 Equipment screen focused - refreshing equipment data')
        refreshEquipment()
        lastRefreshRef.current = now
      }
    }, [refreshEquipment])
  )

  const onRefresh = async () => {
    setRefreshing(true)
    refreshEquipment()
    setRefreshing(false)
  }

  const handleAddEquipment = () => {
    (navigation as any).navigate('AddEquipment')
  }

  const handleEquipmentPress = (equipment: any) => {
    (navigation as any).navigate('EquipmentDetail', { equipment })
  }

  const handleSchedulePress = (equipment: any) => {
    // Navigate to tasks screen filtered by this equipment
    (navigation as any).navigate('Tasks', { 
      equipmentFilter: equipment.id,
      equipmentName: equipment.name 
    })
  }

  // Calculate task counts for each equipment
  const getTaskCountForEquipment = (equipmentId: string) => {
    return tasks.filter(task => 
      task.equipment_id === equipmentId && !task.completed_at
    ).length
  }

  // Add status to equipment data
  const equipmentWithStatus = equipment.map(eq => ({
    ...eq,
    status: getEquipmentStatus(eq)
  }))

  // Sort equipment by status priority (maintenance > attention > good)
  const sortedEquipment = equipmentWithStatus.sort((a, b) => {
    const statusPriority: Record<string, number> = { maintenance: 3, attention: 2, good: 1 }
    return (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0)
  })

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Equipment</Text>
        <Text style={styles.headerSubtitle}>
          Manage your home's systems and appliances
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
        {/* Equipment Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{equipment.length}</Text>
              <Text style={styles.overviewStatLabel}>Total Equipment</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[
                styles.overviewStatValue,
                { color: Colors.error }
              ]}>
                {equipmentWithStatus.filter(eq => eq.status === 'maintenance').length}
              </Text>
              <Text style={styles.overviewStatLabel}>Need Maintenance</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[
                styles.overviewStatValue,
                { color: Colors.warning }
              ]}>
                {equipmentWithStatus.filter(eq => eq.status === 'attention').length}
              </Text>
              <Text style={styles.overviewStatLabel}>Need Attention</Text>
            </View>
          </View>
        </View>

        {/* Equipment List */}
        <View style={styles.equipmentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Equipment</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddEquipment}
            >
              <Icon name="add" size="sm" color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Equipment</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading equipment...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && sortedEquipment.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="equipment" size="xl" color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Equipment Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first piece of equipment to get started
              </Text>
            </View>
          )}

          {!loading && !error && sortedEquipment.length > 0 && (
            <View style={styles.equipmentList}>
              {sortedEquipment.map((eq) => (
                <EquipmentCard
                  key={eq.id}
                  equipment={eq}
                  taskCount={getTaskCountForEquipment(eq.id)}
                  onPress={() => handleEquipmentPress(eq)}
                  onSchedule={() => handleSchedulePress(eq)}
                  onTasksPress={() => handleSchedulePress(eq)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontFamily: Typography.displaySmall.fontFamily,
    fontSize: Typography.displaySmall.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  overviewSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.titleMedium.fontFamily,
    fontSize: Typography.titleMedium.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewStatValue: {
    fontFamily: Typography.titleLarge.fontFamily,
    fontSize: Typography.titleLarge.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  overviewStatLabel: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
  },
  equipmentSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: Spacing.sm,
    fontFamily: Typography.labelLarge.fontFamily,
    fontSize: Typography.labelLarge.fontSize,
    color: Colors.primary,
  },
  equipmentList: {
    paddingHorizontal: Spacing.lg,
  },
  equipmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  equipmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontFamily: Typography.titleMedium.fontFamily,
    fontSize: Typography.titleMedium.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  equipmentType: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
  },
  equipmentLocation: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
  },
  equipmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  statusText: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
  },
  equipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  taskCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCountText: {
    marginLeft: Spacing.xs,
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
  },
  equipmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  actionButtonText: {
    marginLeft: Spacing.xs,
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.primary,
  },
  primaryActionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  primaryActionButtonText: {
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Typography.bodyLarge.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Typography.bodyLarge.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
}) 