import { HomeInsert, EquipmentInsert, TaskInsert } from '../types/database.types'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Validate Home data
 */
export function validateHome(homeData: Partial<HomeInsert>): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  if (!homeData.owner_id) {
    errors.push({ field: 'owner_id', message: 'Owner ID is required' })
  }
  
  if (!homeData.name || homeData.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Home name is required' })
  }
  
  if (!homeData.address || homeData.address.trim().length === 0) {
    errors.push({ field: 'address', message: 'Address is required' })
  }
  
  if (!homeData.city || homeData.city.trim().length === 0) {
    errors.push({ field: 'city', message: 'City is required' })
  }
  
  if (!homeData.state || homeData.state.trim().length === 0) {
    errors.push({ field: 'state', message: 'State is required' })
  }
  
  if (!homeData.zip_code || homeData.zip_code.trim().length === 0) {
    errors.push({ field: 'zip_code', message: 'ZIP code is required' })
  }
  
  if (!homeData.home_type || homeData.home_type.trim().length === 0) {
    errors.push({ field: 'home_type', message: 'Home type is required' })
  }

  // Optional field validation
  if (homeData.year_built && (homeData.year_built < 1800 || homeData.year_built > new Date().getFullYear())) {
    errors.push({ field: 'year_built', message: 'Year built must be between 1800 and current year' })
  }
  
  if (homeData.square_footage && homeData.square_footage <= 0) {
    errors.push({ field: 'square_footage', message: 'Square footage must be positive' })
  }
  
  if (homeData.bedrooms && homeData.bedrooms < 0) {
    errors.push({ field: 'bedrooms', message: 'Bedrooms cannot be negative' })
  }
  
  if (homeData.bathrooms && homeData.bathrooms < 0) {
    errors.push({ field: 'bathrooms', message: 'Bathrooms cannot be negative' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate Equipment data
 */
export function validateEquipment(equipmentData: Partial<EquipmentInsert>): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  if (!equipmentData.home_id) {
    errors.push({ field: 'home_id', message: 'Home ID is required' })
  }
  
  if (!equipmentData.name || equipmentData.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Equipment name is required' })
  }
  
  if (!equipmentData.category || equipmentData.category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Equipment category is required' })
  }

  // Optional field validation  
  if (equipmentData.install_date) {
    const installDate = new Date(equipmentData.install_date)
    if (installDate > new Date()) {
      errors.push({ field: 'install_date', message: 'Installation date cannot be in the future' })
    }
  }
  
  if (equipmentData.warranty_expires && equipmentData.install_date) {
    const installDate = new Date(equipmentData.install_date)
    const warrantyDate = new Date(equipmentData.warranty_expires)
    if (warrantyDate < installDate) {
      errors.push({ field: 'warranty_expires', message: 'Warranty expiry cannot be before installation date' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate Task data
 */
export function validateTask(taskData: Partial<TaskInsert>): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  if (!taskData.home_id) {
    errors.push({ field: 'home_id', message: 'Home ID is required' })
  }
  
  if (!taskData.title || taskData.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Task title is required' })
  }
  
  if (!taskData.category || taskData.category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Task category is required' })
  }

  // Priority validation
  if (taskData.priority && (taskData.priority < 1 || taskData.priority > 5)) {
    errors.push({ field: 'priority', message: 'Priority must be between 1 and 5' })
  }
  
  // Status validation
  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'deferred']
  if (taskData.status && !validStatuses.includes(taskData.status)) {
    errors.push({ field: 'status', message: `Status must be one of: ${validStatuses.join(', ')}` })
  }
  
  // Duration validation
  if (taskData.estimated_duration_minutes && taskData.estimated_duration_minutes <= 0) {
    errors.push({ field: 'estimated_duration_minutes', message: 'Estimated duration must be positive' })
  }
  
  // Difficulty level validation
  if (taskData.difficulty_level && (taskData.difficulty_level < 1 || taskData.difficulty_level > 5)) {
    errors.push({ field: 'difficulty_level', message: 'Difficulty level must be between 1 and 5' })
  }
  
  // Date validation
  if (taskData.due_date) {
    const dueDate = new Date(taskData.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (dueDate < today) {
      errors.push({ field: 'due_date', message: 'Due date cannot be in the past' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Utility function to format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => `${error.field}: ${error.message}`).join('; ')
} 