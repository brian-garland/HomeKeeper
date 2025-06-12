import { supabase } from '../supabase'
import { Tables, TablesInsert, TablesUpdate } from '../../types/database.types'

// Type aliases for better readability
type TaskTemplate = Tables<'task_templates'>
type TaskTemplateInsert = TablesInsert<'task_templates'>
type TaskTemplateUpdate = TablesUpdate<'task_templates'>

// Result type for consistent error handling
export type TaskTemplateResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

/**
 * Get task templates filtered by home characteristics
 */
export async function getApplicableTaskTemplates(
  homeType: string,
  equipmentTypes: string[],
  currentMonth: number,
  climateConditions?: string[]
): Promise<TaskTemplateResult<TaskTemplate[]>> {
  try {
    let query = supabase
      .from('task_templates')
      .select('*')
      .eq('active', true)

    // Filter by home type
    query = query.or(`applies_to_home_types.is.null,applies_to_home_types.cs.{${homeType}}`)

    // Filter by equipment types if provided
    if (equipmentTypes.length > 0) {
      const equipmentFilter = equipmentTypes.map(type => `"${type}"`).join(',')
      query = query.or(`applies_to_equipment_types.is.null,applies_to_equipment_types.ov.{${equipmentFilter}}`)
    }

    // Filter by seasonal months (current month)
    query = query.or(`seasonal_months.is.null,seasonal_months.cs.{${currentMonth}}`)

    // Filter by climate conditions if provided
    if (climateConditions && climateConditions.length > 0) {
      const climateFilter = climateConditions.map(condition => `"${condition}"`).join(',')
      query = query.or(`climate_conditions.is.null,climate_conditions.ov.{${climateFilter}}`)
    }

    const { data, error } = await query.order('category').order('title')

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
 * Get seasonal task templates for a specific month
 */
export async function getSeasonalTaskTemplates(
  month: number,
  homeType?: string
): Promise<TaskTemplateResult<TaskTemplate[]>> {
  try {
    let query = supabase
      .from('task_templates')
      .select('*')
      .eq('active', true)
      .contains('seasonal_months', [month])

    if (homeType) {
      query = query.or(`applies_to_home_types.is.null,applies_to_home_types.cs.{${homeType}}`)
    }

    const { data, error } = await query.order('category').order('title')

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
 * Get task templates by category
 */
export async function getTaskTemplatesByCategory(
  category: string,
  homeType?: string
): Promise<TaskTemplateResult<TaskTemplate[]>> {
  try {
    let query = supabase
      .from('task_templates')
      .select('*')
      .eq('active', true)
      .eq('category', category)

    if (homeType) {
      query = query.or(`applies_to_home_types.is.null,applies_to_home_types.cs.{${homeType}}`)
    }

    const { data, error } = await query.order('title')

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
 * Create a new task template
 */
export async function createTaskTemplate(templateData: TaskTemplateInsert): Promise<TaskTemplateResult<TaskTemplate>> {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .insert({
        ...templateData,
        active: templateData.active ?? true,
        system_template: templateData.system_template ?? false
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
 * Update a task template
 */
export async function updateTaskTemplate(
  templateId: string, 
  updates: TaskTemplateUpdate
): Promise<TaskTemplateResult<TaskTemplate>> {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
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
        error: 'Task template not found'
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
 * Get all task template categories
 */
export async function getTaskTemplateCategories(): Promise<TaskTemplateResult<string[]>> {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('category')
      .eq('active', true)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // Extract unique categories
    const categories = [...new Set(data?.map(item => item.category) || [])]
    
    return {
      success: true,
      data: categories
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
} 