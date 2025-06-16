import { useState, useEffect, useCallback, useRef } from 'react'
import { getDataManager } from '../lib/services/dataManager'
import { useDataContext } from '../contexts/DataContext'
import type { Tables } from '../types/database.types'

type Equipment = Tables<'equipment'>

export const useEquipment = (homeId?: string) => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { homes, setEquipment: setDataContextEquipment } = useDataContext()
  
  // Use provided homeId or first home's ID
  const currentHomeId = homeId || homes[0]?.id
  
  // Use ref to track if we've already synced to avoid infinite loops
  const hasSyncedRef = useRef(false)

  const loadEquipment = useCallback(async () => {
    if (!currentHomeId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const dataManager = getDataManager(currentHomeId)
      const equipmentData = await dataManager.getEquipment(currentHomeId)
      setEquipment(equipmentData)
      
      // Only sync to DataContext once to avoid infinite loops
      if (!hasSyncedRef.current) {
        console.log('📦 useEquipment: Syncing equipment to DataContext:', equipmentData.length)
        setDataContextEquipment(equipmentData)
        hasSyncedRef.current = true
      }
    } catch (err) {
      console.error('Failed to load equipment:', err)
      setError('Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }, [currentHomeId]) // Removed setDataContextEquipment from dependencies

  useEffect(() => {
    loadEquipment()
  }, [loadEquipment])

  const refreshEquipment = useCallback(() => {
    // Reset sync flag when manually refreshing
    hasSyncedRef.current = false
    loadEquipment()
  }, [loadEquipment])

  const getEquipmentStatus = useCallback((equipment: Equipment, tasks?: any[]) => {
    const today = new Date()
    const lastService = equipment.last_service_date ? new Date(equipment.last_service_date) : null
    const nextService = equipment.next_service_due ? new Date(equipment.next_service_due) : null
    
    // Task-aware logic: Check for associated tasks first
    if (tasks) {
      const equipmentTasks = tasks.filter(task => 
        task.equipment_id === equipment.id && !task.completed_at
      )
      
      // Check if any tasks are overdue
      const overdueTasks = equipmentTasks.filter(task => 
        task.due_date && new Date(task.due_date) < today
      )
      
      if (overdueTasks.length > 0) {
        return 'maintenance' // Critical: has overdue tasks
      }
      
      // Key task-aware improvement: If tasks exist for upcoming issues, show as "scheduled"
      const upcomingTasks = equipmentTasks.filter(task => 
        task.due_date && 
        new Date(task.due_date) >= today && 
        (new Date(task.due_date).getTime() - today.getTime()) < (30 * 24 * 60 * 60 * 1000)
      )
      
      if (upcomingTasks.length > 0) {
        return 'scheduled' // User already knows - task exists in system
      }
    }
    
    // Check equipment service dates ONLY if no tasks exist
    if (nextService && nextService < today) {
      return 'maintenance' // Equipment service overdue, no active task
    } else if (nextService && (nextService.getTime() - today.getTime()) < (30 * 24 * 60 * 60 * 1000)) {
      return 'attention' // Equipment needs attention, no active task to handle it
    } else {
      return 'good' // All good
    }
  }, [])

  return {
    equipment,
    loading,
    error,
    refreshEquipment,
    getEquipmentStatus
  }
} 