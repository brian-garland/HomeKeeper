// Simple per-task recurrence settings
export interface TaskRecurrence {
  enabled: boolean
  frequency_months: number
  frequency_type: 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom'
}

// Frequency options for the UI
export const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly', months: 1 },
  { value: 'quarterly', label: 'Every 3 months', months: 3 },
  { value: 'biannual', label: 'Every 6 months', months: 6 },
  { value: 'annual', label: 'Yearly', months: 12 },
  { value: 'custom', label: 'Custom', months: 0 }
] as const

// Default recurrence settings
export const DEFAULT_RECURRENCE: TaskRecurrence = {
  enabled: false,
  frequency_months: 3,
  frequency_type: 'quarterly'
}

export type TaskFrequencyPreference = 'conservative' | 'standard' | 'aggressive'

export interface TaskFrequencyPreferences {
  hvac_filter: TaskFrequencyPreference
  smoke_detectors: TaskFrequencyPreference
  water_heater: TaskFrequencyPreference
  garage_door: TaskFrequencyPreference
  gutters: TaskFrequencyPreference
  winter_prep: TaskFrequencyPreference
}

export interface UserPreferences {
  taskFrequencies: TaskFrequencyPreferences
  notifications: {
    enabled: boolean
    reminderDays: number // Days before due date to remind
    style: 'gentle' | 'standard' | 'persistent'
  }
  maintenance: {
    style: 'reactive' | 'proactive' | 'preventive'
    availableTime: 'limited' | 'evenings' | 'weekends' | 'flexible'
  }
}

// Frequency multipliers for different preference levels
export const FREQUENCY_MULTIPLIERS: Record<TaskFrequencyPreference, number> = {
  conservative: 1.5,  // 50% longer intervals (e.g., 3 months → 4.5 months)
  standard: 1.0,      // Default intervals
  aggressive: 0.75    // 25% shorter intervals (e.g., 3 months → 2.25 months)
}

// Default preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  taskFrequencies: {
    hvac_filter: 'standard',
    smoke_detectors: 'standard', 
    water_heater: 'standard',
    garage_door: 'standard',
    gutters: 'standard',
    winter_prep: 'standard'
  },
  notifications: {
    enabled: true,
    reminderDays: 3,
    style: 'standard'
  },
  maintenance: {
    style: 'proactive',
    availableTime: 'evenings'
  }
} 