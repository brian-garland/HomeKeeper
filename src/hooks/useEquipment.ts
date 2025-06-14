import { useState, useEffect } from 'react'
import { getDataManager } from '../lib/services/dataManager'
import { useDataContext } from '../contexts/DataContext'
import type { Tables } from '../types/database.types'

type Equipment = Tables<'equipment'>

export const useEquipment = (homeId?: string) => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { homes } = useDataContext()
  
  // Use provided homeId or first home's ID
  const currentHomeId = homeId || homes[0]?.id

  const loadEquipment = async () => {
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
    } catch (err) {
      console.error('Failed to load equipment:', err)
      setError('Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEquipment()
  }, [currentHomeId])

  const refreshEquipment = () => {
    loadEquipment()
  }

  const getEquipmentStatus = (equipment: Equipment) => {
    // Simple status logic - could be enhanced based on maintenance dates
    const today = new Date()
    const lastService = equipment.last_service_date ? new Date(equipment.last_service_date) : null
    const nextService = equipment.next_service_due ? new Date(equipment.next_service_due) : null
    
    if (nextService && nextService < today) {
      return 'maintenance' // Overdue
    } else if (nextService && (nextService.getTime() - today.getTime()) < (30 * 24 * 60 * 60 * 1000)) {
      return 'attention' // Due within 30 days
    } else {
      return 'good' // All good
    }
  }

  return {
    equipment,
    loading,
    error,
    refreshEquipment,
    getEquipmentStatus
  }
} 