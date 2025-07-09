// Removed import for deleted taskTemplates model
import * as LocalTemplateService from './localTemplateService'
const { getSeasonalTaskTemplates, getApplicableTaskTemplates, getTaskTemplatesByCategory } = LocalTemplateService
import { getCurrentWeather, getBestOutdoorTaskDays } from './weatherService'
import { UnifiedDataManager, getDataManager } from './dataManager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Home, Equipment, Task, TaskTemplate, TaskInsert } from '../../types'

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
    const usedTemplateIds = new Set<string>() // Track used templates to prevent duplicates
    const currentMonth = new Date().getMonth() + 1
    const equipmentTypes = equipment?.map(eq => eq.type) || []

    // 1. Generate seasonal tasks
    const seasonalResult = await generateSeasonalTasks(
      home,
      currentMonth,
      existingTasks || [],
      maxTasksPerCategory
    )
    console.log(`📊 Seasonal tasks generated: ${seasonalResult.length}`)
    seasonalResult.forEach(task => {
      if (task.template_id && !usedTemplateIds.has(task.template_id)) {
        generatedTasks.push(task)
        usedTemplateIds.add(task.template_id)
      }
    })

    // 2. Generate equipment-specific tasks
    const equipmentResult = await generateEquipmentTasks(
      home,
      equipment || [],
      existingTasks || [],
      maxTasksPerCategory,
      usedTemplateIds // Pass used templates to prevent duplicates
    )
    console.log(`📊 Equipment tasks generated: ${equipmentResult.length}`)
    // Add all equipment tasks (duplicate prevention already handled inside function)
    generatedTasks.push(...equipmentResult)
    
    // 3. Generate general tasks (non-equipment specific)
    const generalResult = await generateGeneralTasks(
      home,
      equipment || [],
      existingTasks || [],
      maxTasksPerCategory,
      usedTemplateIds
    )
    console.log(`📊 General tasks generated: ${generalResult.length}`)
    generatedTasks.push(...generalResult)

    // 4. Apply weather optimization if enabled
    if (includeWeatherOptimization) {
      await optimizeTasksForWeather(
        generatedTasks, 
        home.latitude ?? undefined, 
        home.longitude ?? undefined
      )
    }

    // 5. Return the generated tasks - they'll be added via DataContext in the calling code
    // Don't save directly to AsyncStorage here as that bypasses the DataContext
    console.log(`✅ Returning ${generatedTasks.length} tasks to be added via DataContext`)

    console.log(`✅ Generated ${generatedTasks.length} initial tasks`)

    return {
      success: true,
      tasksGenerated: generatedTasks.length,
      tasks: generatedTasks,
      error: undefined
    }

  } catch (error) {
    console.error('❌ Error generating intelligent tasks:', error)
    return {
      success: false,
      tasksGenerated: 0,
      tasks: [],
      error: error instanceof Error ? error.message : 'Unknown error'
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
  const templatesResult = home.id.startsWith('local-')
    ? await LocalTemplateService.getSeasonalTaskTemplates(currentMonth, home.home_type || undefined)
    : await getSeasonalTaskTemplates(currentMonth, home.home_type || undefined)
  
  console.log(`🌱 Seasonal tasks for month ${currentMonth}: ${templatesResult.success ? templatesResult.data.length : 'ERROR: ' + templatesResult.error}`)
  
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
 * Generate general maintenance tasks (not equipment-specific)
 */
async function generateGeneralTasks(
  home: Home,
  equipment: Equipment[],
  existingTasks: any[],
  maxTasks: number,
  usedTemplateIds: Set<string>
): Promise<Task[]> {
  const tasks: Task[] = []
  const currentMonth = new Date().getMonth() + 1

  // Get templates that don't require specific equipment
  const templatesResult = home.id.startsWith('local-')
    ? await LocalTemplateService.getApplicableTaskTemplates(
        home.home_type || 'single_family',
        [], // Empty equipment array to get general tasks
        currentMonth
      )
    : await getApplicableTaskTemplates(
        home.home_type || 'single_family',
        [],
        currentMonth
      )

  console.log(`🏠 General tasks query returned: ${templatesResult.success ? templatesResult.data.length : 'ERROR'}`)
  
  if (!templatesResult.success) {
    return []
  }

  // Filter to only general tasks (no equipment requirements)
  const generalTemplates = templatesResult.data.filter((t: TaskTemplate) => !t.applies_to_equipment_types)
  console.log(`🏠 Found ${generalTemplates.length} general maintenance templates`)

  // Check what equipment types we have to avoid duplicates
  const hasEquipment = {
    smokeDetectors: equipment.some(e => e.type === 'smoke_detector'),
    securitySystem: equipment.some(e => e.type === 'security_system')
  }

  for (const template of generalTemplates) {
    const templateKey = `${template.title}-${template.category}`
    
    // Skip if already used
    if (usedTemplateIds.has(templateKey)) {
      continue
    }

    // Skip "Test All Safety Alarms" if we already have smoke detector equipment
    // (since we'll have a specific smoke detector test task)
    if (template.id === 'test-all-alarms' && hasEquipment.smokeDetectors) {
      console.log(`🚫 Skipping "${template.title}" - smoke detector task already exists`)
      continue
    }

    // Check if task already exists
    const existingTask = existingTasks.find(task => 
      task.title === template.title
    )

    if (existingTask) {
      continue
    }

    // Generate the task
    const dueDate = calculateSeasonalDueDate(template, currentMonth, tasks.length)
    const task = await createTaskFromTemplate(template, home.id, dueDate)
    
    if (task) {
      task.template_id = templateKey
      tasks.push(task)
      usedTemplateIds.add(templateKey)
      console.log(`✅ Generated general task: ${task.title}`)
    }

    if (tasks.length >= maxTasks) break
  }

  return tasks
}

/**
 * Generate tasks for specific equipment
 */
async function generateEquipmentTasks(
  home: Home,
  equipment: Equipment[],
  existingTasks: any[],
  maxTasks: number,
  usedTemplateIds: Set<string>
): Promise<Task[]> {
  const tasks: Task[] = []
  const currentMonth = new Date().getMonth() + 1
  
  // Get ALL equipment types at once
  const allEquipmentTypes = equipment.map(eq => eq.type)
  console.log(`🔧 All equipment types: ${allEquipmentTypes.join(', ')}`)

  // Get all templates that match ANY of our equipment
  const templatesResult = home.id.startsWith('local-')
    ? await LocalTemplateService.getApplicableTaskTemplates(
        home.home_type || 'single_family',
        allEquipmentTypes,
        currentMonth
      )
    : await getApplicableTaskTemplates(
        home.home_type || 'single_family',
        allEquipmentTypes,
        currentMonth
      )

  if (!templatesResult.success) {
    console.log(`❌ Failed to get templates: ${templatesResult.error}`)
    return []
  }

  console.log(`📋 Found ${templatesResult.data.length} total templates matching equipment`)
  
  // Filter to only equipment-specific templates
  const equipmentSpecificTemplates = templatesResult.data.filter((t: TaskTemplate) => 
    t.applies_to_equipment_types && t.applies_to_equipment_types.length > 0
  )
  
  console.log(`🔧 Equipment-specific templates: ${equipmentSpecificTemplates.length}`)

  // Create a map of equipment by type for quick lookup
  const equipmentByType = new Map<string, Equipment>()
  equipment.forEach(eq => equipmentByType.set(eq.type, eq))

  // Process each equipment-specific template
  for (const template of equipmentSpecificTemplates) {
    // Find which equipment this template applies to
    const applicableEquipment = template.applies_to_equipment_types
      ?.map(type => equipmentByType.get(type))
      .filter(eq => eq !== undefined) || []
    
    if (applicableEquipment.length === 0) {
      console.log(`⚠️ No matching equipment for template: ${template.title}`)
      continue
    }

    // Generate task for the first matching equipment
    const targetEquipment = applicableEquipment[0]!
    
    // Create template key for duplicate detection
    const templateKey = `${template.title}-${template.category}`
    
    // Skip if already used
    if (usedTemplateIds.has(templateKey)) {
      console.log(`🚫 Skipping duplicate template: ${template.title}`)
      continue
    }

    // Check if task already exists for this equipment
    const existingTask = existingTasks.find(task => 
      task.title === template.title && 
      task.equipment_id === targetEquipment.id
    )

    if (existingTask) {
      console.log(`⏭️ Task already exists: ${template.title} for ${targetEquipment.name}`)
      continue
    }

    // Generate the task
    const dueDate = calculateEquipmentDueDate(template, targetEquipment, tasks.length)
    const task = await createTaskFromTemplate(template, home.id, dueDate, targetEquipment.id)
    
    if (task) {
      task.template_id = templateKey
      tasks.push(task)
      usedTemplateIds.add(templateKey)
      console.log(`✅ Generated equipment task: ${task.title} for ${targetEquipment.name}`)
    }

    if (tasks.length >= maxTasks) break
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
  // 🚀 Set up recurrence information based on template frequency
  let recurrence = undefined
  if (template.frequency_months && template.frequency_months > 0) {
    // Determine frequency type based on months
    let frequency_type: 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom' = 'custom'
    if (template.frequency_months === 1) frequency_type = 'monthly'
    else if (template.frequency_months === 3) frequency_type = 'quarterly'
    else if (template.frequency_months === 6) frequency_type = 'biannual'
    else if (template.frequency_months === 12) frequency_type = 'annual'
    
    recurrence = {
      enabled: true,
      frequency_months: template.frequency_months,
      frequency_type: frequency_type
    }
    
    console.log(`🔄 Setting up recurring task: ${template.title} every ${template.frequency_months} months (${frequency_type})`);
  }

  const taskData: TaskInsert = {
    home_id: homeId,
    template_id: template.id,
    equipment_id: equipmentId || undefined,
    title: template.title,
    description: enhanceDescriptionWithEquipment(template.description || '', equipmentId ? true : false),
    category: template.category,
    due_date: dueDate,
    priority: calculateTaskPriority(template, dueDate),
    difficulty_level: template.difficulty_level !== null ? template.difficulty_level : undefined,
    estimated_duration_minutes: template.estimated_duration_minutes !== null ? template.estimated_duration_minutes : undefined,
    instructions: template.instructions || undefined,
    money_saved_estimate: template.money_saved_estimate || undefined,
    auto_generated: true,
    weather_dependent: isWeatherDependent(template.category),
    status: 'pending',
    // Pass recurrence information
    ...(recurrence && { recurrence })
  }

  // Use unified data manager for consistent task creation
  const createdTask = await UnifiedDataManager.createTask(homeId, taskData)
  
  // Return the task with our extended type
  return createdTask as Task
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
    // IMPROVED: Space seasonal tasks over 8-12 weeks instead of immediately
    // This prevents overwhelming users with too many immediate tasks
    const dueDate = new Date()
    const spacingWeeks = 8 + Math.floor(Math.random() * 5) // 8-12 weeks
    const spacingDays = spacingWeeks * 7
    
    // Add task index to prevent all tasks from clustering on same dates
    const indexOffset = taskIndex * 7 // 7 days between each task minimum
    
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * spacingDays) + 14 + indexOffset)
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
  const minimumDaysOut = 14 // IMPROVED: Never schedule tasks sooner than 2 weeks
  
  // If equipment is overdue, make task urgent but not immediate (3-6 weeks)
  if (equipment.next_service_due) {
    const nextServiceDate = new Date(equipment.next_service_due)
    if (nextServiceDate < today) {
      const urgentDate = new Date()
      // Give users 3-6 weeks for overdue equipment + spacing between tasks
      const urgentDays = 21 + Math.floor(Math.random() * 21) + (taskIndex * 7) // 21-42 days + weekly spacing
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
    // Start at 25% of frequency but never less than 2 weeks, add spacing between tasks
    const spacedDays = Math.max(
      Math.floor(frequencyDays * 0.25) + (taskIndex * 14), // 25% of frequency + bi-weekly spacing
      minimumDaysOut + (taskIndex * 7) // Minimum 2 weeks + weekly spacing per task
    )
    dueDate.setDate(dueDate.getDate() + spacedDays)
    return dueDate.toISOString().split('T')[0]
  }
  
  // Fall back to template frequency with spacing and minimum timing
  const frequencyMonths = template.frequency_months || 12
  const dueDate = new Date()
  // Start at 30% of full frequency but ensure minimum spacing
  const spacingDays = Math.max(
    Math.floor((frequencyMonths * 30) * 0.3) + (taskIndex * 10), // 30% of frequency + 10 days per task
    minimumDaysOut + (taskIndex * 7) // Minimum 2 weeks + weekly spacing per task
  )
  dueDate.setDate(dueDate.getDate() + spacingDays)
  
  return dueDate.toISOString().split('T')[0]
}

/**
 * Optimize task scheduling based on weather (IMPROVED to respect original due dates)
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
  
  for (const task of tasks) {
    if (task.weather_dependent && bestDays.length > 0) {
      // IMPROVED: Only suggest weather optimization if original due date is far out
      const originalDueDate = new Date(task.due_date)
      const today = new Date()
      const daysUntilDue = Math.ceil(
        (originalDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      // Only optimize if task is more than 2 weeks out
      // This prevents overriding our carefully spaced due dates with immediate weather windows
      if (daysUntilDue > 14) {
        // Find the best weather day that's closest to the original due date
        const bestDay = bestDays.reduce((closest, day) => {
          const dayDate = new Date(day)
          const closestDate = new Date(closest)
          
          const dayDiff = Math.abs(dayDate.getTime() - originalDueDate.getTime())
          const closestDiff = Math.abs(closestDate.getTime() - originalDueDate.getTime())
          
          return dayDiff < closestDiff ? day : closest
        })
        
        const bestDayDate = new Date(bestDay)
        const daysDifference = Math.abs(
          (bestDayDate.getTime() - originalDueDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        // Only use weather day if it's within 7 days of original date
        if (daysDifference <= 7) {
          task.due_date = bestDay
          console.log(`🌤️ Weather-optimized task "${task.title}" from ${task.due_date} to ${bestDay}`)
        }
      }
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

    // Get templates for the category using unified approach
    const templatesResult = home.id.startsWith('local-')
      ? await LocalTemplateService.getTaskTemplatesByCategory(category, home.home_type || undefined)
      : await getTaskTemplatesByCategory(category, home.home_type || undefined)
    
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
      // Use equipment due date calculation with a default equipment object
      const defaultEquipment: Equipment = {
        id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        home_id: homeId,
        type: 'general',
        name: 'General',
        category: template.category,
        brand: null,
        model: null,
        serial_number: null,
        install_date: null,
        warranty_expires: null,
        manual_url: null,
        notes: null,
        active: true,
        next_service_due: null,
        last_service_date: null,
        location: null,
        maintenance_frequency_months: null,
        needs_attention: null,
        photo_urls: null,
        purchase_date: null,
        room: null,
        specifications: null
      }
      
      const dueDate = calculateEquipmentDueDate(template, defaultEquipment)
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