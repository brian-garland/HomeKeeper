import { Tables } from '../../types/database.types'

type TaskTemplate = Tables<'task_templates'>

// Essential local task templates for MVP
export const LOCAL_TASK_TEMPLATES: TaskTemplate[] = [
  // HVAC System Tasks
  {
    id: 'hvac-filter-change',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Replace HVAC Air Filter',
    description: 'Replace the air filter in your HVAC system to maintain air quality and system efficiency.',
    category: 'hvac',
    frequency_type: 'quarterly',
    frequency_months: 3,
    seasonal_months: null,
    estimated_duration_minutes: 15,
    difficulty_level: 1,
    tools_needed: null,
    materials_needed: ['New air filter'],
    instructions: {
      steps: [
        'Turn off HVAC system',
        'Locate air filter compartment', 
        'Remove old filter and note size',
        'Insert new filter with airflow arrow pointing toward unit',
        'Turn system back on'
      ],
      safety_notes: ['Turn off system before replacing filter'],
      tips: ['Check filter monthly, replace when dirty']
    },
    applies_to_home_types: ['single_family', 'condo', 'townhouse'],
    applies_to_equipment_types: ['hvac_system'],
    climate_conditions: null,
    why_important: 'Clean filters improve air quality and system efficiency while reducing energy costs.',
    consequences_if_skipped: 'Dirty filters reduce efficiency, increase energy bills, and can damage equipment.',
    money_saved_estimate: 50.00,
    system_template: true,
    active: true
  },

  // Safety Equipment Tasks  
  {
    id: 'smoke-detector-test',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Test Smoke Detectors',
    description: 'Test all smoke detectors and replace batteries as needed.',
    category: 'safety',
    frequency_type: 'quarterly',
    frequency_months: 3,
    seasonal_months: null,
    estimated_duration_minutes: 10,
    difficulty_level: 1,
    tools_needed: null,
    materials_needed: ['9V batteries (as needed)'],
    instructions: {
      steps: [
        'Press and hold test button on each detector',
        'Verify loud alarm sounds',
        'Replace battery if chirping or alarm is weak',
        'Clean detector with vacuum if dusty'
      ],
      safety_notes: ['Test monthly for safety'],
      tips: ['Change batteries when clocks change', 'Replace detectors every 10 years']
    },
    applies_to_home_types: ['single_family', 'condo', 'townhouse', 'apartment'],
    applies_to_equipment_types: ['smoke_detector'],
    climate_conditions: null,
    why_important: 'Working smoke detectors save lives and are required by law.',
    consequences_if_skipped: 'Risk of death in fire, insurance issues, legal liability.',
    money_saved_estimate: 25.00,
    system_template: true,
    active: true
  },

  // Water Heater Tasks
  {
    id: 'water-heater-inspection',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Water Heater Safety Inspection',
    description: 'Inspect water heater for leaks, corrosion, and proper operation.',
    category: 'plumbing',
    frequency_type: 'quarterly',
    frequency_months: 3,
    seasonal_months: null,
    estimated_duration_minutes: 20,
    difficulty_level: 1,
    tools_needed: ['Flashlight'],
    materials_needed: null,
    instructions: {
      steps: [
        'Check around base for water leaks',
        'Inspect connections for corrosion',
        'Test temperature relief valve',
        'Check venting (gas units)',
        'Verify temperature setting (120°F recommended)'
      ],
      safety_notes: ['Do not touch hot pipes or surfaces'],
      tips: ['Look for rust-colored water as sign of tank corrosion']
    },
    applies_to_home_types: ['single_family', 'condo', 'townhouse'],
    applies_to_equipment_types: ['water_heater'],
    climate_conditions: null,
    why_important: 'Early detection of problems prevents water damage and ensures safety.',
    consequences_if_skipped: 'Potential flooding, gas leaks, or system failure.',
    money_saved_estimate: 500.00,
    system_template: true,
    active: true
  },

  // Exterior Tasks (Single Family Only)
  {
    id: 'gutter-cleaning',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Clean Gutters and Downspouts',
    description: 'Remove debris from gutters and ensure proper water flow.',
    category: 'exterior',
    frequency_type: 'biannual',
    frequency_months: 6,
    seasonal_months: [5, 11],
    estimated_duration_minutes: 120,
    difficulty_level: 3,
    tools_needed: ['Ladder', 'Gloves', 'Garden hose', 'Gutter scoop'],
    materials_needed: ['Trash bags'],
    instructions: {
      steps: [
        'Set up ladder safely',
        'Remove debris from gutters by hand',
        'Flush gutters with water',
        'Check downspouts for clogs',
        'Inspect for damage or loose connections'
      ],
      safety_notes: ['Use ladder safely', 'Have someone spot you', 'Avoid power lines'],
      tips: ['Install gutter guards to reduce cleaning frequency']
    },
    applies_to_home_types: ['single_family'],
    applies_to_equipment_types: ['gutters'],
    climate_conditions: null,
    why_important: 'Prevents water damage to foundation, roof, and siding.',
    consequences_if_skipped: 'Foundation damage, roof leaks, ice dams, expensive repairs.',
    money_saved_estimate: 1000.00,
    system_template: true,
    active: true
  },

  // Garage Door Tasks
  {
    id: 'garage-door-maintenance',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Garage Door Maintenance',
    description: 'Lubricate and inspect garage door components.',
    category: 'mechanical',
    frequency_type: 'quarterly',
    frequency_months: 3,
    seasonal_months: null,
    estimated_duration_minutes: 30,
    difficulty_level: 2,
    tools_needed: ['Ladder', 'Socket wrench set'],
    materials_needed: ['White lithium grease', 'Garage door lubricant'],
    instructions: {
      steps: [
        'Disconnect opener and operate door manually',
        'Lubricate hinges, rollers, and tracks',
        'Check and tighten hardware',
        'Test door balance',
        'Test safety features of opener'
      ],
      safety_notes: ['Never adjust springs yourself', 'Disconnect power before maintenance'],
      tips: ['Listen for unusual noises during operation']
    },
    applies_to_home_types: ['single_family'],
    applies_to_equipment_types: ['garage_door'],
    climate_conditions: null,
    why_important: 'Prevents expensive repairs and ensures safe operation.',
    consequences_if_skipped: 'Door failure, safety hazards, expensive repairs.',
    money_saved_estimate: 300.00,
    system_template: true,
    active: true
  },

  // Seasonal Tasks
  {
    id: 'winter-preparation',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Winter Home Preparation',
    description: 'Prepare home for winter weather and cold temperatures.',
    category: 'seasonal',
    frequency_type: 'annual',
    frequency_months: 12,
    seasonal_months: [10],
    estimated_duration_minutes: 90,
    difficulty_level: 2,
    tools_needed: ['Caulk gun', 'Weather stripping'],
    materials_needed: ['Caulk', 'Weather stripping', 'Pipe insulation'],
    instructions: {
      steps: [
        'Seal air leaks around windows and doors',
        'Insulate exposed pipes',
        'Service heating system',
        'Clean and store outdoor furniture',
        'Drain and store garden hoses'
      ],
      safety_notes: ['Check heating system before cold weather'],
      tips: ['Start preparations in early fall']
    },
    applies_to_home_types: ['single_family', 'condo', 'townhouse'],
    applies_to_equipment_types: null,
    climate_conditions: ['cold_winter'],
    why_important: 'Prevents freeze damage and reduces heating costs.',
    consequences_if_skipped: 'Pipe bursts, high energy bills, equipment damage.',
    money_saved_estimate: 200.00,
    system_template: true,
    active: true
  },

  // Water Heater Maintenance
  {
    id: 'water-heater-flush',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Flush Water Heater',
    description: 'Drain and flush water heater tank to remove sediment buildup.',
    category: 'plumbing',
    frequency_type: 'annual',
    frequency_months: 12,
    seasonal_months: null,
    estimated_duration_minutes: 60,
    difficulty_level: 2,
    tools_needed: ['Garden hose', 'Screwdriver'],
    materials_needed: null,
    instructions: {
      steps: [
        'Turn off power/gas to water heater',
        'Let water cool for several hours',
        'Connect hose to drain valve',
        'Open drain valve and hot water tap',
        'Flush until water runs clear',
        'Close valves and refill tank'
      ],
      safety_notes: ['Allow water to cool before draining', 'Turn off power/gas first'],
      tips: ['Do this annually to extend tank life', 'Consider professional service for gas units']
    },
    applies_to_home_types: ['single_family', 'condo', 'townhouse'],
    applies_to_equipment_types: ['water_heater'],
    climate_conditions: null,
    why_important: 'Removes sediment that reduces efficiency and shortens tank life.',
    consequences_if_skipped: 'Reduced efficiency, shorter tank life, higher energy bills.',
    money_saved_estimate: 300.00,
    system_template: true,
    active: true
  },

  // Seasonal Plumbing
  {
    id: 'winterize-outdoor-faucets',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Winterize Outdoor Faucets',
    description: 'Prepare outdoor faucets and irrigation for winter to prevent freeze damage.',
    category: 'plumbing',
    frequency_type: 'annual',
    frequency_months: 12,
    seasonal_months: [10, 11],
    estimated_duration_minutes: 45,
    difficulty_level: 2,
    tools_needed: ['Wrench', 'Screwdriver'],
    materials_needed: ['Faucet covers', 'Pipe insulation'],
    instructions: {
      steps: [
        'Shut off water supply to outdoor faucets',
        'Drain remaining water from pipes',
        'Remove and store garden hoses',
        'Install faucet covers or insulation',
        'Blow out irrigation system if applicable'
      ],
      safety_notes: ['Know location of main water shutoff'],
      tips: ['Do this before first freeze', 'Mark shutoff valve locations']
    },
    applies_to_home_types: ['single_family', 'townhouse'],
    applies_to_equipment_types: null,
    climate_conditions: ['cold_winter'],
    why_important: 'Prevents costly pipe bursts and water damage from freezing.',
    consequences_if_skipped: 'Burst pipes, water damage, expensive emergency repairs.',
    money_saved_estimate: 1500.00,
    system_template: true,
    active: true
  },

  // Appliance Maintenance
  {
    id: 'clean-refrigerator-coils',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Clean Refrigerator Coils',
    description: 'Clean condenser coils to maintain refrigerator efficiency.',
    category: 'appliance',
    frequency_type: 'biannual',
    frequency_months: 6,
    seasonal_months: null,
    estimated_duration_minutes: 30,
    difficulty_level: 1,
    tools_needed: ['Vacuum cleaner', 'Coil brush or cloth'],
    materials_needed: null,
    instructions: {
      steps: [
        'Unplug refrigerator',
        'Locate condenser coils (back or bottom)',
        'Remove access panel if needed',
        'Vacuum dust and debris from coils',
        'Use coil brush for stubborn buildup',
        'Replace panel and plug back in'
      ],
      safety_notes: ['Unplug appliance before cleaning'],
      tips: ['Clean more often if you have pets', 'Check coils every 6 months']
    },
    applies_to_home_types: ['single_family', 'condo', 'townhouse', 'apartment'],
    applies_to_equipment_types: ['refrigerator'],
    climate_conditions: null,
    why_important: 'Improves efficiency and extends appliance life.',
    consequences_if_skipped: 'Higher energy bills, premature appliance failure.',
    money_saved_estimate: 100.00,
    system_template: true,
    active: true
  },

  {
    id: 'service-dishwasher',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Service Dishwasher',
    description: 'Clean and maintain dishwasher for optimal performance.',
    category: 'appliance',
    frequency_type: 'annual',
    frequency_months: 12,
    seasonal_months: null,
    estimated_duration_minutes: 45,
    difficulty_level: 1,
    tools_needed: ['Toothbrush', 'Soft cloth'],
    materials_needed: ['Dishwasher cleaner', 'White vinegar'],
    instructions: {
      steps: [
        'Remove and clean bottom dish rack',
        'Clean filter at bottom of dishwasher',
        'Wipe down door seals and gaskets',
        'Clean spray arms (remove if possible)',
        'Run empty cycle with dishwasher cleaner',
        'Run second cycle with white vinegar'
      ],
      safety_notes: ['Turn off power before removing parts'],
      tips: ['Clean filter monthly', 'Use rinse aid for better drying']
    },
    applies_to_home_types: ['single_family', 'condo', 'townhouse'],
    applies_to_equipment_types: ['dishwasher'],
    climate_conditions: null,
    why_important: 'Prevents odors, improves cleaning performance, extends appliance life.',
    consequences_if_skipped: 'Poor cleaning, odors, premature appliance failure.',
    money_saved_estimate: 150.00,
    system_template: true,
    active: true
  },

  {
    id: 'clean-dryer-vent',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Clean Dryer Vent',
    description: 'Clean dryer vent and ductwork to prevent fire hazard and improve efficiency.',
    category: 'appliance',
    frequency_type: 'annual',
    frequency_months: 12,
    seasonal_months: null,
    estimated_duration_minutes: 60,
    difficulty_level: 2,
    tools_needed: ['Dryer vent brush', 'Vacuum cleaner', 'Screwdriver'],
    materials_needed: null,
    instructions: {
      steps: [
        'Unplug dryer and pull away from wall',
        'Disconnect vent hose from dryer',
        'Clean lint from hose and dryer connection',
        'Use vent brush to clean ductwork',
        'Vacuum exterior vent opening',
        'Reconnect everything securely'
      ],
      safety_notes: ['Unplug dryer before starting', 'Check for gas leaks on gas dryers'],
      tips: ['Clean lint filter after every load', 'Watch for longer drying times']
    },
    applies_to_home_types: ['single_family', 'condo', 'townhouse'],
    applies_to_equipment_types: ['dryer'],
    climate_conditions: null,
    why_important: 'Prevents house fires and improves dryer efficiency.',
    consequences_if_skipped: 'Fire hazard, higher energy bills, appliance damage.',
    money_saved_estimate: 200.00,
    system_template: true,
    active: true
  },

  // General Home Maintenance
  {
    id: 'deep-clean-home',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    title: 'Deep Clean Home',
    description: 'Thorough seasonal deep cleaning of entire home.',
    category: 'cleaning',
    frequency_type: 'quarterly',
    frequency_months: 3,
    seasonal_months: null,
    estimated_duration_minutes: 240,
    difficulty_level: 2,
    tools_needed: ['Vacuum cleaner', 'Mop', 'Cleaning cloths', 'Ladder'],
    materials_needed: ['All-purpose cleaner', 'Glass cleaner', 'Disinfectant'],
    instructions: {
      steps: [
        'Declutter and organize each room',
        'Deep clean bathrooms and kitchen',
        'Vacuum and mop all floors',
        'Clean windows and mirrors',
        'Dust all surfaces including baseboards',
        'Clean light fixtures and ceiling fans',
        'Organize closets and storage areas'
      ],
      safety_notes: ['Use proper ventilation with cleaning products', 'Use ladder safely'],
      tips: ['Work room by room', 'Play music to stay motivated', 'Consider hiring help for large homes']
    },
    applies_to_home_types: ['single_family', 'condo', 'townhouse', 'apartment'],
    applies_to_equipment_types: null,
    climate_conditions: null,
    why_important: 'Maintains healthy living environment and preserves home value.',
    consequences_if_skipped: 'Poor air quality, pest problems, reduced home value.',
    money_saved_estimate: 400.00,
    system_template: true,
    active: true
  }
]

// Helper functions for filtering templates
export function getTemplatesByEquipmentType(equipmentType: string): TaskTemplate[] {
  return LOCAL_TASK_TEMPLATES.filter(template => 
    template.applies_to_equipment_types?.includes(equipmentType)
  )
}

export function getTemplatesByHomeType(homeType: string): TaskTemplate[] {
  return LOCAL_TASK_TEMPLATES.filter(template => 
    !template.applies_to_home_types || template.applies_to_home_types.includes(homeType)
  )
}

export function getSeasonalTemplates(month: number): TaskTemplate[] {
  return LOCAL_TASK_TEMPLATES.filter(template => 
    template.seasonal_months?.includes(month)
  )
} 