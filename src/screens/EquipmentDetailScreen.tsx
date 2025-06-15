import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Icon } from '../components/icons/Icon'
import { Colors } from '../theme/colors'
import { Typography } from '../theme/typography'
import { Spacing } from '../theme/spacing'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { TabParamList } from '../navigation/types'
import type { Tables } from '../types/database.types'
import { useDataContext } from '../contexts/DataContext'

type Equipment = Tables<'equipment'>

interface EquipmentDetailScreenProps {
  route: { params: { equipment: Equipment } }
  navigation: any
}

export const EquipmentDetailScreen: React.FC<EquipmentDetailScreenProps> = ({ route, navigation }) => {
  const initialEquipment = route.params.equipment
  const [equipment, setEquipment] = useState<Equipment>(initialEquipment)
  const [isEditing, setIsEditing] = useState(false)
  const { tasks } = useDataContext()

  // Get tasks associated with this equipment
  const associatedTasks = tasks.filter(task => 
    task.equipment_id === equipment.id && !task.completed_at
  )

  // Refresh equipment data when screen comes into focus (e.g., returning from edit)
  const refreshEquipmentData = useCallback(async () => {
    try {
      const savedEquipmentStr = await AsyncStorage.getItem('homekeeper_equipment')
      if (savedEquipmentStr) {
        const savedEquipment = JSON.parse(savedEquipmentStr)
        const updatedEquipment = savedEquipment.find((eq: Equipment) => eq.id === initialEquipment.id)
        if (updatedEquipment) {
          console.log('🔄 EquipmentDetail: Refreshing equipment data for', updatedEquipment.name)
          setEquipment(updatedEquipment)
        }
      }
    } catch (error) {
      console.error('Failed to refresh equipment data:', error)
    }
  }, [initialEquipment.id])

  useFocusEffect(
    useCallback(() => {
      refreshEquipmentData()
    }, [refreshEquipmentData])
  )

  const getStatusColor = (equipment: Equipment) => {
    const today = new Date()
    const nextService = equipment.next_service_due ? new Date(equipment.next_service_due) : null
    
    if (nextService && nextService < today) {
      return Colors.error // Overdue
    } else if (nextService && (nextService.getTime() - today.getTime()) < (30 * 24 * 60 * 60 * 1000)) {
      return Colors.warning // Due within 30 days
    } else {
      return Colors.success // All good
    }
  }

  const getStatusText = (equipment: Equipment) => {
    const today = new Date()
    const nextService = equipment.next_service_due ? new Date(equipment.next_service_due) : null
    
    if (!nextService) return 'No service scheduled'
    if (nextService < today) return 'Service overdue'
    
    const daysUntil = Math.ceil((nextService.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
    if (daysUntil <= 30) return `Service due in ${daysUntil} days`
    return 'Service up to date'
  }

  const handleScheduleService = () => {
    Alert.alert(
      'Schedule Service',
      'Service scheduling functionality coming soon!',
      [{ text: 'OK' }]
    )
  }

  const handleEditEquipment = () => {
    navigation.navigate('EditEquipment', { equipment })
  }

  const handleDeleteEquipment = () => {
    Alert.alert(
      'Delete Equipment',
      `Are you sure you want to delete "${equipment.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement deletion
            Alert.alert('Coming Soon', 'Equipment deletion functionality will be added soon.')
          }
        }
      ]
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Equipment Details</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditEquipment}>
          <Icon name="edit" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Equipment Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>{equipment.name}</Text>
            <Text style={styles.equipmentType}>
              {equipment.brand ? `${equipment.brand}${equipment.model ? ` ${equipment.model}` : ''}` : 
               equipment.category.charAt(0).toUpperCase() + equipment.category.slice(1)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(equipment) }]}>
            <Icon name="check" size={16} color={Colors.white} />
          </View>
        </View>
        
        <View style={styles.statusRow}>
          <Icon name="calendar" size={16} color={getStatusColor(equipment)} />
          <Text style={[styles.statusText, { color: getStatusColor(equipment) }]}>
            {getStatusText(equipment)}
          </Text>
        </View>
      </View>

      {/* Service Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Service</Text>
            <Text style={styles.infoValue}>
              {equipment.last_service_date 
                ? new Date(equipment.last_service_date).toLocaleDateString()
                : 'Never'
              }
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Next Service Due</Text>
            <Text style={styles.infoValue}>
              {equipment.next_service_due 
                ? new Date(equipment.next_service_due).toLocaleDateString()
                : 'Not scheduled'
              }
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Service Frequency</Text>
            <Text style={styles.infoValue}>
              {equipment.maintenance_frequency_months 
                ? `Every ${equipment.maintenance_frequency_months} months`
                : 'Not set'
              }
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: getStatusColor(equipment) }]}>
              {getStatusText(equipment)}
            </Text>
          </View>
        </View>
      </View>

      {/* Equipment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipment Details</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{equipment.category.charAt(0).toUpperCase() + equipment.category.slice(1)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{equipment.type || 'Not specified'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Brand</Text>
            <Text style={styles.infoValue}>{equipment.brand || 'Not specified'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Model</Text>
            <Text style={styles.infoValue}>{equipment.model || 'Not specified'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Serial Number</Text>
            <Text style={styles.infoValue}>{equipment.serial_number || 'Not specified'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Install Date</Text>
            <Text style={styles.infoValue}>
              {equipment.install_date 
                ? new Date(equipment.install_date).toLocaleDateString()
                : 'Not specified'
              }
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Purchase Date</Text>
            <Text style={styles.infoValue}>
              {equipment.purchase_date 
                ? new Date(equipment.purchase_date).toLocaleDateString()
                : 'Not specified'
              }
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Warranty Expires</Text>
            <Text style={styles.infoValue}>
              {equipment.warranty_expires 
                ? new Date(equipment.warranty_expires).toLocaleDateString()
                : 'Not specified'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Location & Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location & Notes</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{equipment.location || 'Not specified'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Room</Text>
            <Text style={styles.infoValue}>{equipment.room || 'Not specified'}</Text>
          </View>
          {equipment.notes && (
            <View style={[styles.infoItem, styles.fullWidth]}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.infoValue}>{equipment.notes}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Associated Tasks */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Associated Tasks</Text>
          <TouchableOpacity 
            style={styles.addTaskButton}
            onPress={() => navigation.navigate('Tasks', { 
              screen: 'AddTask', 
              params: { equipmentId: equipment.id } 
            })}
          >
            <Icon name="add" size={16} color={Colors.primary} />
            <Text style={styles.addTaskButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
        
        {associatedTasks.length === 0 ? (
          <View style={styles.emptyTasksContainer}>
            <Icon name="tasks" size={32} color={Colors.textTertiary} />
            <Text style={styles.emptyTasksText}>No active tasks</Text>
            <Text style={styles.emptyTasksSubtext}>
              Create maintenance tasks for this equipment
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {associatedTasks.slice(0, 3).map((task) => (
              <TouchableOpacity 
                key={task.id}
                style={styles.taskItem}
                onPress={() => navigation.navigate('Tasks', { 
                  screen: 'TaskDetail', 
                  params: { task } 
                })}
              >
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDueDate}>
                    {task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                  </Text>
                </View>
                <View style={[
                  styles.taskPriorityBadge,
                  { backgroundColor: task.priority === 3 ? Colors.error : task.priority === 2 ? Colors.warning : Colors.info }
                ]}>
                  <Text style={styles.taskPriorityText}>
                    {task.priority === 3 ? 'HIGH' : task.priority === 2 ? 'MED' : 'LOW'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {associatedTasks.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllTasksButton}
                onPress={() => navigation.navigate('Tasks', { 
                  screen: 'TasksList',
                  params: {
                    equipmentFilter: equipment.id,
                    equipmentName: equipment.name 
                  }
                })}
              >
                <Text style={styles.viewAllTasksText}>
                  View all {associatedTasks.length} tasks
                </Text>
                <Icon name="right" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleScheduleService}>
          <Icon name="calendar" size={20} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Schedule Service</Text>
        </TouchableOpacity>
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleEditEquipment}>
            <Icon name="edit" size={18} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Edit Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEquipment}>
            <Icon name="delete" size={18} color={Colors.error} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTitle: {
    fontFamily: Typography.titleLarge.fontFamily,
    fontSize: Typography.titleLarge.fontSize,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm,
  },
  overviewCard: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontFamily: Typography.titleLarge.fontFamily,
    fontSize: Typography.titleLarge.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  equipmentType: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statusText: {
    marginLeft: Spacing.sm,
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    fontWeight: '500',
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontFamily: Typography.titleMedium.fontFamily,
    fontSize: Typography.titleMedium.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  infoLabel: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actionSection: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    marginLeft: Spacing.sm,
    fontFamily: Typography.labelLarge.fontFamily,
    fontSize: Typography.labelLarge.fontSize,
    color: Colors.white,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: 12,
    flex: 1,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    marginLeft: Spacing.sm,
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    flex: 1,
    marginLeft: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteButtonText: {
    marginLeft: Spacing.sm,
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.error,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addTaskButtonText: {
    marginLeft: Spacing.sm,
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTasksText: {
    fontFamily: Typography.titleLarge.fontFamily,
    fontSize: Typography.titleLarge.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  emptyTasksSubtext: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
  },
  tasksList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  taskDueDate: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
  },
  taskPriorityBadge: {
    padding: Spacing.xs,
    borderRadius: 12,
    marginLeft: Spacing.sm,
  },
  taskPriorityText: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.white,
    fontWeight: '500',
  },
  viewAllTasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewAllTasksText: {
    marginRight: Spacing.sm,
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
}) 