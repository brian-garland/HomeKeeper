import { supabase } from '../supabase'
import { Tables, TablesInsert } from '../../types/database.types'
import { getApplicableTaskTemplates, getSeasonalTaskTemplates } from '../models/taskTemplates'
import { createTask } from '../models/tasks'
import { getCurrentWeather, getBestOutdoorTaskDays } from './weatherService'

// Type aliases
type Home = Tables<'homes'>
type Equipment = Tables<'equipment'>
type Task = Tables<'tasks'>
type TaskTemplate = Tables<'task_templates'>
type TaskInsert = TablesInsert<'tasks'>

export interface TaskGenerationResult {
  success: boolean
  tasksGenerated: number
  tasks: Task[]
  error?: string
}

export interface TaskGenerationOptions {
  includeWeatherOptimization?: boolean
  maxTasksPerCategory?: number
  prioritizeOverdue?: boolean
  lookAheadDays?: number
}

/**
 * Generate intelligent tasks for a home based on templates, equipment, and weather
 */
export async function generateIntelligentTasks(
  homeId: string,
  options: TaskGenerationOptions = {}
): Promise<TaskGenerationResult> {
  try {
    const {
      includeWeatherOptimization = true,
      maxTasksPerCategory = 5,
      prioritizeOverdue = true,
      lookAheadDays = 30
    } = options

    // Get home data
    const { data: home, error: homeError } = await supabase
      .from('homes')
      .select('*')
      .eq('id', homeId)
      .single()

    if (homeError || !home) {
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: 'Home not found'
      }
    }

    // Get equipment for the home
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select('*')
      .eq('home_id', homeId)
      .eq('active', true)

    if (equipmentError) {
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: 'Failed to fetch equipment data'
      }
    }

    // Get existing tasks to avoid duplicates
    const { data: existingTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('template_id, due_date')
      .eq('home_id', homeId)
      .in('status', ['pending', 'in_progress'])

    if (tasksError) {
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: 'Failed to fetch existing tasks'
      }
    }

    // Generate tasks based on different criteria
    const generatedTasks: Task[] = []
    const currentMonth = new Date().getMonth() + 1
    const equipmentTypes = equipment?.map(eq => eq.type) || []

    // 1. Generate seasonal tasks
    const seasonalResult = await generateSeasonalTasks(
      home,
      currentMonth,
      existingTasks || [],
      maxTasksPerCategory
    )
    generatedTasks.push(...seasonalResult)

    // 2. Generate equipment-based tasks
    const equipmentResult = await generateEquipmentTasks(
      home,
      equipment || [],
      existingTasks || [],
      maxTasksPerCategory
    )
    generatedTasks.push(...equipmentResult)

    // 3. Generate home-type specific tasks
    const homeTypeResult = await generateHomeTypeTasks(
      home,
      equipmentTypes,
      currentMonth,
      existingTasks || [],
      maxTasksPerCategory
    )
    generatedTasks.push(...homeTypeResult)

    // 4. Apply weather optimization if enabled
    if (includeWeatherOptimization) {
      await optimizeTasksForWeather(
        generatedTasks, 
        home.latitude ?? undefined, 
        home.longitude ?? undefined
      )
    }

    // 5. Apply intelligent scheduling
    const scheduledTasks = await applyIntelligentScheduling(
      generatedTasks,
      home,
      lookAheadDays,
      prioritizeOverdue
    )

    return {
      success: true,
      tasksGenerated: scheduledTasks.length,
      tasks: scheduledTasks,
      error: undefined
    }

  } catch (error) {
    return {
      success: false,
      tasksGenerated: 0,
      tasks: [],
      error: error instanceof Error ? error.message : 'Unknown error in task generation'
    }
  }
}

/**
 * Generate seasonal maintenance tasks
 */
async function generateSeasonalTasks(
  home: Home,
  currentMonth: number,
  existingTasks: any[],
  maxTasks: number
): Promise<Task[]> {
  const templatesResult = await getSeasonalTaskTemplates(currentMonth, home.home_type || undefined)
  
  if (!templatesResult.success) {
    return []
  }

  const tasks: Task[] = []
  const existingTemplateIds = new Set(existingTasks.map(t => t.template_id))

  for (const template of templatesResult.data.slice(0, maxTasks)) {
    if (existingTemplateIds.has(template.id)) {
      continue // Skip if task already exists
    }

    const dueDate = calculateSeasonalDueDate(template, currentMonth)
    const task = await createTaskFromTemplate(template, home.id, dueDate)
    
    if (task) {
      tasks.push(task)
    }
  }

  return tasks
}

/**
 * Generate equipment-specific maintenance tasks
 */
async function generateEquipmentTasks(
  home: Home,
  equipment: Equipment[],
  existingTasks: any[],
  maxTasks: number
): Promise<Task[]> {
  const tasks: Task[] = []
  const existingTemplateIds = new Set(existingTasks.map(t => t.template_id))

  for (const item of equipment) {
    if (!item.type || tasks.length >= maxTasks) break

    // Get templates for this equipment type
    const templatesResult = await getApplicableTaskTemplates(
      home.home_type || 'single_family',
      [item.type],
      new Date().getMonth() + 1
    )

    if (!templatesResult.success) continue

    for (const template of templatesResult.data) {
      if (existingTemplateIds.has(template.id) || tasks.length >= maxTasks) {
        continue
      }

      const dueDate = calculateEquipmentDueDate(template, item)
      const task = await createTaskFromTemplate(template, home.id, dueDate, item.id)
      
      if (task) {
        tasks.push(task)
        existingTemplateIds.add(template.id) // Prevent duplicates
      }
    }
  }

  return tasks
}

/**
 * Generate home-type specific tasks
 */
async function generateHomeTypeTasks(
  home: Home,
  equipmentTypes: string[],
  currentMonth: number,
  existingTasks: any[],
  maxTasks: number
): Promise<Task[]> {
  const templatesResult = await getApplicableTaskTemplates(
    home.home_type || 'single_family',
    equipmentTypes,
    currentMonth
  )

  if (!templatesResult.success) {
    return []
  }

  const tasks: Task[] = []
  const existingTemplateIds = new Set(existingTasks.map(t => t.template_id))

  for (const template of templatesResult.data.slice(0, maxTasks)) {
    if (existingTemplateIds.has(template.id)) {
      continue
    }

    const dueDate = calculateHomeDueDate(template, home)
    const task = await createTaskFromTemplate(template, home.id, dueDate)
    
    if (task) {
      tasks.push(task)
    }
  }

  return tasks
}

/**
 * Create a task from a template
 */
async function createTaskFromTemplate(
  template: TaskTemplate,
  homeId: string,
  dueDate: string,
  equipmentId?: string
): Promise<Task | null> {
  const taskData: TaskInsert = {
    home_id: homeId,
    template_id: template.id,
    title: template.title,
    description: template.description || undefined,
    category: template.category,
    due_date: dueDate,
         priority: calculateTaskPriority(template, dueDate),
     difficulty_level: template.difficulty_level !== null ? template.difficulty_level : undefined,
     estimated_duration_minutes: template.estimated_duration_minutes !== null ? template.estimated_duration_minutes : undefined,
    instructions: template.instructions || undefined,
    equipment_id: equipmentId || undefined,
    auto_generated: true,
    weather_dependent: isWeatherDependent(template.category),
    status: 'pending'
  }

  const result = await createTask(taskData)
  return result.success ? result.data : null
}

/**
 * Calculate task priority based on template and due date
 */
function calculateTaskPriority(template: TaskTemplate, dueDate: string): number {
  const daysUntilDue = Math.ceil(
    (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  // Base priority from template or default
  let priority = 3 // Medium priority default

  // Adjust based on urgency
  if (daysUntilDue <= 7) {
    priority = 1 // High priority
  } else if (daysUntilDue <= 30) {
    priority = 2 // Medium-high priority
  } else if (daysUntilDue > 90) {
    priority = 4 // Low priority
  }

  // Adjust based on consequences
  if (template.consequences_if_skipped?.includes('damage') || 
      template.consequences_if_skipped?.includes('expensive')) {
    priority = Math.max(1, priority - 1) // Increase priority
  }

  return Math.max(1, Math.min(5, priority)) // Clamp between 1-5
}

/**
 * Determine if a task is weather dependent
 */
function isWeatherDependent(category: string): boolean {
  const outdoorCategories = [
    'exterior',
    'roofing',
    'gutters',
    'landscaping',
    'outdoor',
    'siding',
    'windows',
    'deck',
    'patio'
  ]
  
  return outdoorCategories.some(outdoor => 
    category.toLowerCase().includes(outdoor)
  )
}

/**
 * Calculate due date for seasonal tasks
 */
function calculateSeasonalDueDate(template: TaskTemplate, currentMonth: number): string {
  const seasonalMonths = template.seasonal_months || []
  
  if (seasonalMonths.includes(currentMonth)) {
    // Due within the next 2 weeks for current season
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) + 1)
    return dueDate.toISOString().split('T')[0]
  }
  
  // Find next seasonal month
  const nextMonth = seasonalMonths.find(month => month > currentMonth) || 
                   seasonalMonths[0] // Wrap to next year
  
  const dueDate = new Date()
  if (nextMonth && nextMonth > currentMonth) {
    dueDate.setMonth(nextMonth - 1) // JavaScript months are 0-indexed
  } else {
    dueDate.setFullYear(dueDate.getFullYear() + 1)
    dueDate.setMonth((nextMonth || 1) - 1)
  }
  
  return dueDate.toISOString().split('T')[0]
}

/**
 * Calculate due date for equipment-based tasks
 */
function calculateEquipmentDueDate(template: TaskTemplate, equipment: Equipment): string {
  const dueDate = new Date()
  
  // Use equipment's next service due date if available
  if (equipment.next_service_due) {
    return equipment.next_service_due
  }
  
  // Use template frequency
  const frequencyMonths = template.frequency_months || 12
  dueDate.setMonth(dueDate.getMonth() + frequencyMonths)
  
  return dueDate.toISOString().split('T')[0]
}

/**
 * Calculate due date for home-type tasks
 */
function calculateHomeDueDate(template: TaskTemplate, home: Home): string {
  const dueDate = new Date()
  
  // Consider home age for certain tasks
  const homeAge = home.year_built ? new Date().getFullYear() - home.year_built : 10
  
  // Older homes need more frequent maintenance
  let frequencyMultiplier = 1
  if (homeAge > 20) {
    frequencyMultiplier = 0.8 // 20% more frequent
  } else if (homeAge > 50) {
    frequencyMultiplier = 0.6 // 40% more frequent
  }
  
  const frequencyMonths = Math.ceil((template.frequency_months || 12) * frequencyMultiplier)
  dueDate.setMonth(dueDate.getMonth() + frequencyMonths)
  
  return dueDate.toISOString().split('T')[0]
}

/**
 * Optimize task scheduling based on weather
 */
async function optimizeTasksForWeather(
  tasks: Task[],
  latitude?: number,
  longitude?: number
): Promise<void> {
  if (!latitude || !longitude) return

  const bestOutdoorDaysResult = await getBestOutdoorTaskDays(latitude, longitude)
  
  if (!bestOutdoorDaysResult.success) return

  const bestDays = bestOutdoorDaysResult.data
  let bestDayIndex = 0

  for (const task of tasks) {
    if (task.weather_dependent && bestDays.length > 0) {
      // Assign outdoor tasks to best weather days
      task.due_date = bestDays[bestDayIndex % bestDays.length]
      bestDayIndex++
    }
  }
}

/**
 * Apply intelligent scheduling algorithms
 */
async function applyIntelligentScheduling(
  tasks: Task[],
  home: Home,
  lookAheadDays: number,
  prioritizeOverdue: boolean
): Promise<Task[]> {
  // Sort tasks by priority and due date
  tasks.sort((a, b) => {
    if (prioritizeOverdue) {
      const aDaysUntilDue = Math.ceil(
        (new Date(a.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      const bDaysUntilDue = Math.ceil(
        (new Date(b.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (aDaysUntilDue !== bDaysUntilDue) {
        return aDaysUntilDue - bDaysUntilDue // Earlier due dates first
      }
    }
    
    return (a.priority || 3) - (b.priority || 3) // Higher priority first (lower number)
  })

  // Filter tasks within look-ahead window
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() + lookAheadDays)
  
  return tasks.filter(task => 
    new Date(task.due_date) <= cutoffDate
  )
}

/**
 * Generate tasks for a specific category
 */
export async function generateTasksForCategory(
  homeId: string,
  category: string,
  maxTasks: number = 3
): Promise<TaskGenerationResult> {
  try {
    const { data: home } = await supabase
      .from('homes')
      .select('*')
      .eq('id', homeId)
      .single()

    if (!home) {
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: 'Home not found'
      }
    }

    // Get templates for the category
    const { data: templates, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('category', category)
      .eq('active', true)
      .limit(maxTasks)

    if (error || !templates) {
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: 'Failed to fetch task templates'
      }
    }

    const tasks: Task[] = []
    
    for (const template of templates) {
      const dueDate = calculateHomeDueDate(template, home)
      const task = await createTaskFromTemplate(template, homeId, dueDate)
      
      if (task) {
        tasks.push(task)
      }
    }

    return {
      success: true,
      tasksGenerated: tasks.length,
      tasks,
      error: undefined
    }

  } catch (error) {
    return {
      success: false,
      tasksGenerated: 0,
      tasks: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 