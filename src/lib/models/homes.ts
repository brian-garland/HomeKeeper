import { supabase } from '../supabase'
import { Home, HomeInsert, HomeUpdate } from '../../types/database.types'

// Result type for consistent error handling
export type HomeResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

/**
 * Create a new home
 */
export async function createHome(homeData: HomeInsert): Promise<HomeResult<Home>> {
  try {
    const { data, error } = await supabase
      .from('homes')
      .insert(homeData)
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
 * Get a home by ID
 */
export async function getHome(homeId: string): Promise<HomeResult<Home>> {
  try {
    const { data, error } = await supabase
      .from('homes')
      .select()
      .eq('id', homeId)
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
        error: 'Home not found'
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
 * Update a home
 */
export async function updateHome(homeId: string, updates: HomeUpdate): Promise<HomeResult<Home>> {
  try {
    const { data, error } = await supabase
      .from('homes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', homeId)
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
        error: 'Home not found'
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
 * Delete a home
 */
export async function deleteHome(homeId: string): Promise<HomeResult<{ id: string }>> {
  try {
    const { data, error } = await supabase
      .from('homes')
      .delete()
      .eq('id', homeId)
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
        error: 'Home not found'
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
 * Get all homes for a user
 */
export async function getUserHomes(userId: string): Promise<HomeResult<Home[]>> {
  try {
    const { data, error } = await supabase
      .from('homes')
      .select()
      .eq('owner_id', userId)
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