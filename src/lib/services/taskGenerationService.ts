import { Tables, TablesInsert } from '../../types/database.types'
import { getApplicableTaskTemplates, getSeasonalTaskTemplates, getTaskTemplatesByCategory } from '../models/taskTemplates'
import { getCurrentWeather, getBestOutdoorTaskDays } from './weatherService'
import { UnifiedDataManager, getDataManager } from './dataManager'

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

    // Use unified data manager to get all needed data
    const { home, equipment, existingTasks } = await UnifiedDataManager.getHomeWithEquipment(homeId)

    if (!home) {
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: 'Home not found'
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

    // IMPROVED: Pass task index for proper spacing  
    const dueDate = calculateSeasonalDueDate(template, currentMonth, tasks.length)
    const task = await createTaskFromTemplate(template, home.id, dueDate)
    
    if (task) {
      tasks.push(task)
    }
  }

  return tasks
}

/**
 * Enhanced equipment-specific task generation with better intelligence
 */
async function generateEquipmentTasks(
  home: Home,
  equipment: Equipment[],
  existingTasks: any[],
  maxTasks: number
): Promise<Task[]> {
  const tasks: Task[] = []
  const existingTemplateIds = new Set(existingTasks.map(t => t.template_id))
  const usedTaskTitles = new Set(existingTasks.map(t => t.title.toLowerCase()))

  // Sort equipment by maintenance priority (overdue first, then by next service date)
  const sortedEquipment = equipment.sort((a, b) => {
    const aNextService = a.next_service_due ? new Date(a.next_service_due) : new Date('2099-12-31')
    const bNextService = b.next_service_due ? new Date(b.next_service_due) : new Date('2099-12-31')
    const today = new Date()
    
    // Overdue equipment gets highest priority
    const aOverdue = aNextService < today
    const bOverdue = bNextService < today
    
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    
    // Then sort by next service date
    return aNextService.getTime() - bNextService.getTime()
  })

  for (const item of sortedEquipment) {
    if (!item.type || tasks.length >= maxTasks) break

    // Get templates for this specific equipment type
    const templatesResult = await getApplicableTaskTemplates(
      home.home_type || 'single_family',
      [item.type, item.category], // Include both type and category for better matching
      new Date().getMonth() + 1
    )

    if (!templatesResult.success) continue

    // Sort templates by relevance to equipment
    const sortedTemplates = templatesResult.data.sort((a, b) => {
      // Prioritize templates that specifically mention this equipment type
      const aSpecific = a.applies_to_equipment_types?.includes(item.type) ? 1 : 0
      const bSpecific = b.applies_to_equipment_types?.includes(item.type) ? 1 : 0
      
      if (aSpecific !== bSpecific) return bSpecific - aSpecific
      
      // Then by frequency (more frequent = higher priority)
      const aFreq = a.frequency_months || 12
      const bFreq = b.frequency_months || 12
      return aFreq - bFreq
    })

    for (const template of sortedTemplates) {
      if (existingTemplateIds.has(template.id) || tasks.length >= maxTasks) {
        continue
      }

      // IMPROVED: Check for duplicate task titles to prevent similar tasks
      const potentialTitle = (template.title + ` for ${item.name}`).toLowerCase()
      const baseTitle = template.title.toLowerCase()
      
      if (usedTaskTitles.has(potentialTitle) || usedTaskTitles.has(baseTitle)) {
        console.log(`🚫 Skipping duplicate task: ${template.title}`)
        continue
      }

      // IMPROVED: Better due date calculation with minimum 1 week spacing
      const dueDate = calculateEquipmentDueDate(template, item, tasks.length)
      const task = await createTaskFromTemplate(template, home.id, dueDate, item.id)
      
      if (task) {
        tasks.push(task)
        existingTemplateIds.add(template.id) // Prevent template reuse
        usedTaskTitles.add(task.title.toLowerCase()) // Prevent title duplicates
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
  const usedTaskTitles = new Set(existingTasks.map(t => t.title.toLowerCase()))

  for (const template of templatesResult.data.slice(0, maxTasks)) {
    if (existingTemplateIds.has(template.id)) {
      continue
    }

    // Check for duplicate task titles
    const baseTitle = template.title.toLowerCase()
    if (usedTaskTitles.has(baseTitle)) {
      console.log(`🚫 Skipping duplicate home task: ${template.title}`)
      continue
    }

    const dueDate = calculateHomeDueDate(template, home, tasks.length)
    const task = await createTaskFromTemplate(template, home.id, dueDate)
    
    if (task) {
      tasks.push(task)
      usedTaskTitles.add(task.title.toLowerCase())
    }
  }

  return tasks
}

/**
 * Enhanced task creation with equipment intelligence
 */
async function createTaskFromTemplate(
  template: TaskTemplate,
  homeId: string,
  dueDate: string,
  equipmentId?: string
): Promise<Task | null> {
  // Get equipment details if provided
  let equipmentContext = ''
  if (equipmentId) {
    const dataManager = getDataManager(homeId)
    const equipment = await dataManager.getEquipment(homeId)
    const targetEquipment = equipment.find((e: Equipment) => e.id === equipmentId)
    
    if (targetEquipment) {
      equipmentContext = ` for ${targetEquipment.name}`
      if (targetEquipment.location) {
        equipmentContext += ` (${targetEquipment.location})`
      }
    }
  }

  const taskData: TaskInsert = {
    home_id: homeId,
    template_id: template.id,
    equipment_id: equipmentId || undefined,
    title: template.title + equipmentContext,
    description: enhanceDescriptionWithEquipment(template.description || '', equipmentId ? true : false),
    category: template.category,
    due_date: dueDate,
    priority: calculateTaskPriority(template, dueDate),
    difficulty_level: template.difficulty_level !== null ? template.difficulty_level : undefined,
    estimated_duration_minutes: template.estimated_duration_minutes !== null ? template.estimated_duration_minutes : undefined,
    instructions: template.instructions || undefined,
    auto_generated: true,
    weather_dependent: isWeatherDependent(template.category),
    status: 'pending'
  }

  // Use unified data manager for consistent task creation
  return await UnifiedDataManager.createTask(homeId, taskData)
}

/**
 * Enhance task description with equipment-specific context
 */
function enhanceDescriptionWithEquipment(description: string, hasEquipment: boolean): string {
  if (!hasEquipment || !description) return description
  
  // Add equipment-specific context to generic descriptions
  if (description.includes('Check') && !description.includes('your')) {
    return description.replace('Check', 'Check your equipment\'s')
  }
  
  if (description.includes('Inspect') && !description.includes('your')) {
    return description.replace('Inspect', 'Inspect your equipment\'s')
  }
  
  return description
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
 * Calculate due date for seasonal tasks with better spacing
 */
function calculateSeasonalDueDate(template: TaskTemplate, currentMonth: number, taskIndex: number = 0): string {
  const seasonalMonths = template.seasonal_months || []
  
  if (seasonalMonths.includes(currentMonth)) {
    // IMPROVED: Space seasonal tasks over 6-8 weeks instead of 2 weeks
    // This prevents overwhelming users with too many immediate tasks
    const dueDate = new Date()
    const spacingWeeks = 6 + Math.floor(Math.random() * 3) // 6-8 weeks
    const spacingDays = spacingWeeks * 7
    
    // Add task index to prevent all tasks from clustering on same dates
    const indexOffset = taskIndex * 3 // 3 days between each task minimum
    
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * spacingDays) + 7 + indexOffset)
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
 * Enhanced equipment due date calculation with user-friendly spacing
 */
function calculateEquipmentDueDate(template: TaskTemplate, equipment: Equipment, taskIndex: number = 0): string {
  const today = new Date()
  const minimumDaysOut = 7 // Never schedule tasks sooner than 1 week
  
  // If equipment is overdue, make task urgent but not immediate (2-4 weeks)
  if (equipment.next_service_due) {
    const nextServiceDate = new Date(equipment.next_service_due)
    if (nextServiceDate < today) {
      const urgentDate = new Date()
      // Give users 2-4 weeks for overdue equipment + spacing between tasks
      const urgentDays = 14 + Math.floor(Math.random() * 14) + (taskIndex * 3) // 14-28 days + spacing
      urgentDate.setDate(urgentDate.getDate() + Math.max(urgentDays, minimumDaysOut))
      return urgentDate.toISOString().split('T')[0]
    }
    
    // If service is due soon, use that date but ensure minimum spacing
    const daysUntilService = (nextServiceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    if (daysUntilService <= 60 && daysUntilService >= minimumDaysOut) { // Within 2 months but not too soon
      return equipment.next_service_due
    }
  }
  
  // IMPROVED: Space equipment tasks over time with reasonable minimum timing
  if (equipment.maintenance_frequency_months) {
    const dueDate = new Date()
    const frequencyDays = equipment.maintenance_frequency_months * 30 // Convert to days
    // Start at 20% of frequency but never less than 1 week, add spacing between tasks
    const spacedDays = Math.max(
      Math.floor(frequencyDays * 0.2) + (taskIndex * 7), // 20% of frequency + weekly spacing
      minimumDaysOut + (taskIndex * 3) // Minimum 1 week + 3 days per task
    )
    dueDate.setDate(dueDate.getDate() + spacedDays)
    return dueDate.toISOString().split('T')[0]
  }
  
  // Fall back to template frequency with spacing and minimum timing
  const frequencyMonths = template.frequency_months || 12
  const dueDate = new Date()
  // Start at 25% of full frequency but ensure minimum spacing
  const spacingDays = Math.max(
    Math.floor((frequencyMonths * 30) * 0.25) + (taskIndex * 5), // 25% of frequency + 5 days per task
    minimumDaysOut + (taskIndex * 3) // Minimum 1 week + 3 days per task
  )
  dueDate.setDate(dueDate.getDate() + spacingDays)
  
  return dueDate.toISOString().split('T')[0]
}

/**
 * Calculate due date for home-type tasks
 */
function calculateHomeDueDate(template: TaskTemplate, home: Home, taskIndex: number = 0): string {
  const dueDate = new Date()
  const minimumDaysOut = 7 // Never schedule tasks sooner than 1 week
  
  // Use template frequency to determine spacing
  const frequencyMonths = template.frequency_months || 12
  
  // Start at 30% of full frequency but ensure minimum spacing
  const spacingDays = Math.max(
    Math.floor((frequencyMonths * 30) * 0.3) + (taskIndex * 7), // 30% of frequency + weekly spacing
    minimumDaysOut + (taskIndex * 4) // Minimum 1 week + 4 days per task
  )
  
  dueDate.setDate(dueDate.getDate() + spacingDays)
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
    // Use unified data manager to get home data
    const { home } = await UnifiedDataManager.getHomeWithEquipment(homeId)

    if (!home) {
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: 'Home not found'
      }
    }

    // Get templates for the category using existing function
    const templatesResult = await getTaskTemplatesByCategory(category, home.home_type || undefined)
    
    if (!templatesResult.success) {
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: 'Failed to fetch task templates'
      }
    }

    const tasks: Task[] = []
    const templates = templatesResult.data.slice(0, maxTasks)
    
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