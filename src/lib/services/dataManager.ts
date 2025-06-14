import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../supabase'
import { createTask as dbCreateTask } from '../models/tasks'
import type { Tables, TablesInsert } from '../../types/database.types'
import type { Task, TaskInsert } from '../../types'

type Home = Tables<'homes'>
type Equipment = Tables<'equipment'>

export interface DataManagerInterface {
  getHome(homeId: string): Promise<Home | null>
  getEquipment(homeId: string): Promise<Equipment[]>
  getExistingTasks(homeId: string): Promise<{ template_id: string | null; due_date: string }[]>
  createTask(taskData: TaskInsert): Promise<Task | null>
}

class LocalDataManager implements DataManagerInterface {
  async getHome(homeId: string): Promise<Home | null> {
    if (!homeId.startsWith('local-')) return null
    
    const localHomeData = await AsyncStorage.getItem('homekeeper_local_home')
    if (localHomeData) {
      return JSON.parse(localHomeData) as Home
    }
    return null
  }

  async getEquipment(homeId: string): Promise<Equipment[]> {
    // First try to get equipment from AsyncStorage
    try {
      const savedEquipmentStr = await AsyncStorage.getItem('homekeeper_equipment')
      if (savedEquipmentStr) {
        const savedEquipment = JSON.parse(savedEquipmentStr)
        if (savedEquipment && savedEquipment.length > 0) {
          console.log('📦 LocalDataManager: Loading equipment from AsyncStorage:', savedEquipment.length)
          return savedEquipment
        }
      }
    } catch (error) {
      console.error('Failed to load equipment from AsyncStorage:', error)
    }
    
    // Fallback to default equipment based on home type
    const home = await this.getHome(homeId)
    if (!home) return []
    
    console.log('📦 LocalDataManager: No saved equipment found, returning defaults')
    return this.getDefaultEquipmentForHomeType(home.home_type || 'single_family')
  }

  async getExistingTasks(homeId: string): Promise<{ template_id: string | null; due_date: string }[]> {
    // Local homes start fresh, no existing tasks
    return []
  }

  async createTask(taskData: TaskInsert): Promise<Task | null> {
    // Create local task with proper validation
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      home_id: taskData.home_id,
      template_id: taskData.template_id || null,
      title: taskData.title,
      description: taskData.description || null,
      category: taskData.category,
      due_date: taskData.due_date,
      priority: taskData.priority || 3,
      difficulty_level: taskData.difficulty_level || null,
      estimated_duration_minutes: taskData.estimated_duration_minutes || null,
      instructions: taskData.instructions || null,
      equipment_id: taskData.equipment_id || null,
      money_saved_estimate: taskData.money_saved_estimate || null,
      recurrence: (taskData as any).recurrence || null, // Preserve recurrence info
      completed_at: null,
      completed_by: null,
      notes: null,
      tags: null,
      reschedule_count: null,
      auto_generated: taskData.auto_generated || true,
      weather_dependent: taskData.weather_dependent || false,
      status: taskData.status || 'pending'
    }

    // Apply the same validation logic as database tasks
    if (!this.validateTask(task)) {
      return null
    }

    return task as Task
  }

  private validateTask(task: Task): boolean {
    // Apply same validation rules as database
    if (!task.title || task.title.trim().length === 0) return false
    if (!task.category || task.category.trim().length === 0) return false
    if (!task.due_date) return false
    if (task.priority && (task.priority < 1 || task.priority > 5)) return false
    
    return true
  }

  private getDefaultEquipmentForHomeType(homeType: string): Equipment[] {
    const baseEquipment: Partial<Equipment>[] = []
    const now = new Date().toISOString()
    
    // Common equipment for all home types
    const commonEquipment = [
      { type: 'hvac_system', name: 'HVAC System', category: 'hvac' },
      { type: 'water_heater', name: 'Water Heater', category: 'plumbing' },
      { type: 'smoke_detector', name: 'Smoke Detectors', category: 'safety' },
      { type: 'carbon_monoxide_detector', name: 'CO Detectors', category: 'safety' }
    ]

    // Add home-type specific equipment
    switch (homeType) {
      case 'single_family':
        baseEquipment.push(
          ...commonEquipment,
          { type: 'roof', name: 'Roof', category: 'exterior' },
          { type: 'gutters', name: 'Gutters & Downspouts', category: 'exterior' },
          { type: 'siding', name: 'Exterior Siding', category: 'exterior' },
          { type: 'driveway', name: 'Driveway', category: 'exterior' },
          { type: 'garage_door', name: 'Garage Door', category: 'mechanical' }
        )
        break
      
      case 'condo':
      case 'townhouse':
        baseEquipment.push(
          ...commonEquipment,
          { type: 'balcony', name: 'Balcony/Patio', category: 'exterior' },
          { type: 'windows', name: 'Windows', category: 'exterior' }
        )
        break
      
      case 'apartment':
        baseEquipment.push(
          ...commonEquipment.filter(eq => eq.type !== 'hvac_system'), // Often centralized
          { type: 'windows', name: 'Windows', category: 'exterior' }
        )
        break
      
      default:
        baseEquipment.push(...commonEquipment)
    }

    // Convert to full Equipment objects
    return baseEquipment.map((eq, index) => ({
      id: `local-equipment-${index}`,
      created_at: now,
      updated_at: now,
      home_id: 'local-home',
      type: eq.type!,
      name: eq.name!,
      category: eq.category!,
      brand: null,
      model: null,
      serial_number: null,
      install_date: null,
      warranty_expires: null,
      manual_url: null,
      notes: null,
      active: true,
      next_service_due: null
    } as Equipment))
  }
}

class DatabaseDataManager implements DataManagerInterface {
  async getHome(homeId: string): Promise<Home | null> {
    if (homeId.startsWith('local-')) return null
    
    const { data, error } = await supabase
      .from('homes')
      .select('*')
      .eq('id', homeId)
      .single()
    
    return error ? null : data
  }

  async getEquipment(homeId: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('home_id', homeId)
      .eq('active', true)
    
    return error ? [] : data || []
  }

  async getExistingTasks(homeId: string): Promise<{ template_id: string | null; due_date: string }[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('template_id, due_date')
      .eq('home_id', homeId)
      .in('status', ['pending', 'in_progress'])
    
    return error ? [] : data || []
  }

  async createTask(taskData: TaskInsert): Promise<Task | null> {
    const result = await dbCreateTask(taskData as any) // Cast to handle type mismatch
    return result.success ? result.data : null
  }
}

// Factory function to get the appropriate data manager
export function getDataManager(homeId: string): DataManagerInterface {
  return homeId.startsWith('local-') 
    ? new LocalDataManager() 
    : new DatabaseDataManager()
}

// Convenience function for common operations
export class UnifiedDataManager {
  static async getHomeWithEquipment(homeId: string): Promise<{
    home: Home | null
    equipment: Equipment[]
    existingTasks: { template_id: string | null; due_date: string }[]
  }> {
    const manager = getDataManager(homeId)
    
    const [home, equipment, existingTasks] = await Promise.all([
      manager.getHome(homeId),
      manager.getEquipment(homeId),
      manager.getExistingTasks(homeId)
    ])
    
    return { home, equipment, existingTasks }
  }

  static async createTask(homeId: string, taskData: TaskInsert): Promise<Task | null> {
    const manager = getDataManager(homeId)
    return manager.createTask(taskData)
  }
} 