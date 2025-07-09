import type { Equipment } from '../../types';

type HomeType = 'single_family' | 'condo' | 'apartment' | 'townhouse';

// Simple ID generator for React Native
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

interface DefaultEquipmentConfig {
  name: string;
  type: string;
  category: string;
  maintenance_frequency_months: number;
  room?: string;
}

// Default equipment configurations by home type
const defaultEquipmentByHomeType: Record<HomeType, DefaultEquipmentConfig[]> = {
  single_family: [
    {
      name: 'HVAC System',
      type: 'hvac_system',
      category: 'Climate Control',
      maintenance_frequency_months: 6,
      room: 'Utility Room'
    },
    {
      name: 'Water Heater',
      type: 'water_heater',
      category: 'Plumbing',
      maintenance_frequency_months: 12,
      room: 'Basement/Utility'
    },
    {
      name: 'Kitchen Refrigerator',
      type: 'refrigerator',
      category: 'Appliances',
      maintenance_frequency_months: 6,
      room: 'Kitchen'
    },
    {
      name: 'Washer',
      type: 'washer',
      category: 'Appliances',
      maintenance_frequency_months: 3,
      room: 'Laundry Room'
    },
    {
      name: 'Dryer',
      type: 'dryer',
      category: 'Appliances',
      maintenance_frequency_months: 3,
      room: 'Laundry Room'
    },
    {
      name: 'Garage Door Opener',
      type: 'garage_door',
      category: 'Mechanical',
      maintenance_frequency_months: 12,
      room: 'Garage'
    },
    {
      name: 'Smoke Detectors',
      type: 'smoke_detector',
      category: 'Safety',
      maintenance_frequency_months: 6,
      room: 'Throughout House'
    },
    {
      name: 'Gutters',
      type: 'gutters',
      category: 'Exterior',
      maintenance_frequency_months: 6,
      room: 'Exterior'
    }
  ],
  condo: [
    {
      name: 'HVAC System',
      type: 'hvac_system',
      category: 'Climate Control',
      maintenance_frequency_months: 6,
      room: 'Utility Closet'
    },
    {
      name: 'Water Heater',
      type: 'water_heater',
      category: 'Plumbing',
      maintenance_frequency_months: 12,
      room: 'Utility Closet'
    },
    {
      name: 'Kitchen Refrigerator',
      type: 'refrigerator',
      category: 'Appliances',
      maintenance_frequency_months: 6,
      room: 'Kitchen'
    },
    {
      name: 'Washer/Dryer Combo',
      type: 'washer_dryer',
      category: 'Appliances',
      maintenance_frequency_months: 3,
      room: 'Laundry Closet'
    },
    {
      name: 'Smoke Detectors',
      type: 'smoke_detector',
      category: 'Safety',
      maintenance_frequency_months: 6,
      room: 'Throughout Unit'
    },
    {
      name: 'Balcony/Patio',
      type: 'balcony',
      category: 'Exterior',
      maintenance_frequency_months: 3,
      room: 'Balcony'
    }
  ],
  apartment: [
    {
      name: 'Kitchen Refrigerator',
      type: 'refrigerator',
      category: 'Appliances',
      maintenance_frequency_months: 6,
      room: 'Kitchen'
    },
    {
      name: 'Smoke Detectors',
      type: 'smoke_detector',
      category: 'Safety',
      maintenance_frequency_months: 6,
      room: 'Throughout Unit'
    },
    {
      name: 'Air Conditioner (Window/Portable)',
      type: 'air_conditioner',
      category: 'Climate Control',
      maintenance_frequency_months: 3,
      room: 'Living Room/Bedroom'
    }
  ],
  townhouse: [
    {
      name: 'HVAC System',
      type: 'hvac_system',
      category: 'Climate Control',
      maintenance_frequency_months: 6,
      room: 'Utility Room'
    },
    {
      name: 'Water Heater',
      type: 'water_heater',
      category: 'Plumbing',
      maintenance_frequency_months: 12,
      room: 'Utility Room'
    },
    {
      name: 'Kitchen Refrigerator',
      type: 'refrigerator',
      category: 'Appliances',
      maintenance_frequency_months: 6,
      room: 'Kitchen'
    },
    {
      name: 'Washer',
      type: 'washer',
      category: 'Appliances',
      maintenance_frequency_months: 3,
      room: 'Laundry Room'
    },
    {
      name: 'Dryer',
      type: 'dryer',
      category: 'Appliances',
      maintenance_frequency_months: 3,
      room: 'Laundry Room'
    },
    {
      name: 'Smoke Detectors',
      type: 'smoke_detector',
      category: 'Safety',
      maintenance_frequency_months: 6,
      room: 'Throughout House'
    }
  ]
};

/**
 * Generate default equipment for a home based on its type
 */
export function generateDefaultEquipment(homeId: string, homeType: HomeType): Equipment[] {
  const configs = defaultEquipmentByHomeType[homeType] || defaultEquipmentByHomeType.single_family;
  const currentDate = new Date().toISOString();
  
  return configs.map(config => {
    // Calculate next service date based on maintenance frequency
    const nextServiceDate = new Date();
    nextServiceDate.setMonth(nextServiceDate.getMonth() + config.maintenance_frequency_months);
    
    return {
      id: generateId(),
      home_id: homeId,
      name: config.name,
      type: config.type,
      category: config.category,
      room: config.room,
      maintenance_frequency_months: config.maintenance_frequency_months,
      next_service_due: nextServiceDate.toISOString(),
      active: true,
      needs_attention: false,
      created_at: currentDate,
      updated_at: currentDate,
      // Optional fields
      brand: null,
      model: null,
      serial_number: null,
      install_date: null,
      purchase_date: null,
      warranty_expires: null,
      last_service_date: null,
      location: config.room,
      manual_url: null,
      notes: null,
      photo_urls: null,
      specifications: null
    };
  });
}

/**
 * Get a description of equipment that will be generated for a home type
 */
export function getEquipmentPreviewForHomeType(homeType: HomeType): string[] {
  const configs = defaultEquipmentByHomeType[homeType] || defaultEquipmentByHomeType.single_family;
  return configs.map(config => config.name);
}