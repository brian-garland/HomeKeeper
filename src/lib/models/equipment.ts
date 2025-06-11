import { supabase } from '../supabase'
import { Equipment, EquipmentInsert, EquipmentUpdate } from '../../types/database.types'

// Result type for consistent error handling
export type EquipmentResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

/**
 * Create new equipment
 */
export async function createEquipment(equipmentData: EquipmentInsert): Promise<EquipmentResult<Equipment>> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipmentData)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get equipment by ID
 */
export async function getEquipment(equipmentId: string): Promise<EquipmentResult<Equipment>> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select()
      .eq('id', equipmentId)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    if (!data) {
      return {
        success: false,
        error: 'Equipment not found'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Update equipment
 */
export async function updateEquipment(equipmentId: string, updates: EquipmentUpdate): Promise<EquipmentResult<Equipment>> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', equipmentId)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    if (!data) {
      return {
        success: false,
        error: 'Equipment not found'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Delete equipment
 */
export async function deleteEquipment(equipmentId: string): Promise<EquipmentResult<{ id: string }>> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', equipmentId)
      .select('id')
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    if (!data) {
      return {
        success: false,
        error: 'Equipment not found'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get all equipment for a home
 */
export async function getHomeEquipment(homeId: string): Promise<EquipmentResult<Equipment[]>> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select()
      .eq('home_id', homeId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get equipment by category for a home
 */
export async function getEquipmentByCategory(homeId: string, category: string): Promise<EquipmentResult<Equipment[]>> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select()
      .eq('home_id', homeId)
      .eq('category', category)
      .order('name', { ascending: true })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
} 