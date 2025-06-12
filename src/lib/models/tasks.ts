import { supabase } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '../../types/database.types'

// Type aliases for better readability
type Task = Tables<'tasks'>
type TaskInsert = TablesInsert<'tasks'>
type TaskUpdate = TablesUpdate<'tasks'>

// Result type for consistent error handling
export type TaskResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

/**
 * Create a new task
 */
export async function createTask(taskData: TaskInsert): Promise<TaskResult<Task>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        status: taskData.status || 'pending',
        priority: taskData.priority || 3
      })
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
 * Get a task by ID
 */
export async function getTask(taskId: string): Promise<TaskResult<Task>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select()
      .eq('id', taskId)
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
        error: 'Task not found'
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
 * Update a task
 */
export async function updateTask(taskId: string, updates: TaskUpdate): Promise<TaskResult<Task>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
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
        error: 'Task not found'
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
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<TaskResult<{ id: string }>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
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
        error: 'Task not found'
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
 * Get all tasks for a home
 */
export async function getHomeTasks(homeId: string): Promise<TaskResult<Task[]>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select()
      .eq('home_id', homeId)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })

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
 * Get tasks by status for a home
 */
export async function getTasksByStatus(homeId: string, status: string): Promise<TaskResult<Task[]>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select()
      .eq('home_id', homeId)
      .eq('status', status)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })

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
 * Get overdue tasks for a home
 */
export async function getOverdueTasks(homeId: string): Promise<TaskResult<Task[]>> {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('tasks')
      .select()
      .eq('home_id', homeId)
      .neq('status', 'completed')
      .lt('due_date', today)
      .order('due_date', { ascending: true })

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
 * Mark a task as completed
 */
export async function completeTask(taskId: string, completionNotes?: string, completionPhotos?: string[]): Promise<TaskResult<Task>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_date: new Date().toISOString(),
        completion_notes: completionNotes || null,
        completion_photos: completionPhotos || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
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
        error: 'Task not found'
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