import { LOCAL_TASK_TEMPLATES, getTemplatesByEquipmentType, getTemplatesByHomeType, getSeasonalTemplates } from '../data/localTaskTemplates'
import { Tables } from '../../types/database.types'

type TaskTemplate = Tables<'task_templates'>

// Local implementation of template service functions
export async function getApplicableTaskTemplates(
  homeType: string,
  equipmentTypes: string[],
  currentMonth: number
): Promise<{ success: boolean; data: TaskTemplate[]; error?: string }> {
  try {
    console.log(`🔍 Local Templates: Getting templates for home type: ${homeType}, equipment: ${equipmentTypes.join(', ')}, month: ${currentMonth}`)
    console.log(`🔍 Total templates available: ${LOCAL_TASK_TEMPLATES.length}`)
    
    const applicableTemplates = LOCAL_TASK_TEMPLATES.filter(template => {
      // Check home type compatibility
      const homeTypeMatch = !template.applies_to_home_types || 
                           template.applies_to_home_types.includes(homeType)
      
      // Check equipment type compatibility
      const equipmentMatch = !template.applies_to_equipment_types || 
                            template.applies_to_equipment_types.some(type => 
                              equipmentTypes.includes(type)
                            )
      
      // Check seasonal relevance (if seasonal)
      const seasonalMatch = !template.seasonal_months || 
                           template.seasonal_months.includes(currentMonth) ||
                           // Include tasks for next 2 months for planning
                           template.seasonal_months.includes((currentMonth % 12) + 1) ||
                           template.seasonal_months.includes(((currentMonth + 1) % 12) + 1)
      
      const isActive = template.active !== false // Default to true if not specified
      
      // Debug logging
      if (!homeTypeMatch || !equipmentMatch || !seasonalMatch || !isActive) {
        console.log(`❌ Template ${template.id} filtered out:`, {
          homeTypeMatch,
          equipmentMatch,
          seasonalMatch,
          isActive,
          template_home_types: template.applies_to_home_types,
          template_equipment: template.applies_to_equipment_types,
          template_seasonal: template.seasonal_months
        })
      }
      
      return homeTypeMatch && equipmentMatch && seasonalMatch && isActive
    })

    console.log(`✅ Local Templates: Found ${applicableTemplates.length} applicable templates`)
    console.log(`📋 Templates:`, applicableTemplates.map(t => ({ title: t.title, category: t.category, equipment: t.applies_to_equipment_types })))

    return {
      success: true,
      data: applicableTemplates
    }
  } catch (error) {
    console.error('❌ Local Templates: Error getting applicable templates:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getSeasonalTaskTemplates(
  currentMonth: number,
  homeType?: string
): Promise<{ success: boolean; data: TaskTemplate[]; error?: string }> {
  try {
    console.log(`🌱 Local Templates: Getting seasonal templates for month: ${currentMonth}, home type: ${homeType}`)
    
    let seasonalTemplates = getSeasonalTemplates(currentMonth)
    
    // Filter by home type if provided
    if (homeType) {
      seasonalTemplates = seasonalTemplates.filter(template =>
        !template.applies_to_home_types || template.applies_to_home_types.includes(homeType)
      )
    }

    console.log(`✅ Local Templates: Found ${seasonalTemplates.length} seasonal templates`)

    return {
      success: true,
      data: seasonalTemplates
    }
  } catch (error) {
    console.error('❌ Local Templates: Error getting seasonal templates:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getTaskTemplatesByCategory(
  category: string,
  homeType?: string
): Promise<{ success: boolean; data: TaskTemplate[]; error?: string }> {
  try {
    console.log(`📂 Local Templates: Getting templates for category: ${category}, home type: ${homeType}`)
    
    let categoryTemplates = LOCAL_TASK_TEMPLATES.filter(template => 
      template.category === category && template.active
    )
    
    // Filter by home type if provided
    if (homeType) {
      categoryTemplates = categoryTemplates.filter(template =>
        !template.applies_to_home_types || template.applies_to_home_types.includes(homeType)
      )
    }

    console.log(`✅ Local Templates: Found ${categoryTemplates.length} templates for category ${category}`)

    return {
      success: true,
      data: categoryTemplates
    }
  } catch (error) {
    console.error('❌ Local Templates: Error getting templates by category:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to get templates for specific equipment
export async function getTemplatesForEquipment(
  equipmentType: string,
  homeType: string
): Promise<{ success: boolean; data: TaskTemplate[]; error?: string }> {
  try {
    console.log(`⚙️ Local Templates: Getting templates for equipment: ${equipmentType}, home type: ${homeType}`)
    
    const equipmentTemplates = getTemplatesByEquipmentType(equipmentType).filter(template => {
      const homeTypeMatch = !template.applies_to_home_types || 
                           template.applies_to_home_types.includes(homeType)
      return homeTypeMatch && template.active
    })

    console.log(`✅ Local Templates: Found ${equipmentTemplates.length} templates for equipment ${equipmentType}`)

    return {
      success: true,
      data: equipmentTemplates
    }
  } catch (error) {
    console.error('❌ Local Templates: Error getting templates for equipment:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 