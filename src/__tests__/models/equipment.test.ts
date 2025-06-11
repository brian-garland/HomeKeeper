import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { supabase } from '../../lib/supabase'
import { createTestUser, createTestHome, cleanupTestData } from '../utils/testUtils'
import { createEquipment, getEquipment, getHomeEquipment } from '../../lib/models/equipment'
import { EquipmentInsert } from '../../types/database.types'

describe('Equipment Model - Core Functions', () => {
  let testUserId: string
  let testHomeId: string

  beforeAll(async () => {
    const testUser = await createTestUser()
    testUserId = testUser.id
    
    const testHome = await createTestHome(testUserId)
    testHomeId = testHome.id
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  beforeEach(async () => {
    await supabase.from('equipment').delete().like('name', 'Test Equipment%')
  })

  test('creates equipment with required fields', async () => {
    const equipmentData: EquipmentInsert = {
      home_id: testHomeId,
      name: 'Test Equipment Core',
      category: 'hvac',
      type: 'furnace'
    }

    const result = await createEquipment(equipmentData)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Test Equipment Core')
      expect(result.data.category).toBe('hvac')
      expect(result.data.type).toBe('furnace')
      expect(result.data.id).toBeDefined()
    }
  })

  test('retrieves equipment by id', async () => {
    const equipmentData: EquipmentInsert = {
      home_id: testHomeId,
      name: 'Test Equipment Get',
      category: 'plumbing',
      type: 'water_heater'
    }

    const createResult = await createEquipment(equipmentData)
    expect(createResult.success).toBe(true)
    
    if (createResult.success) {
      const getResult = await getEquipment(createResult.data.id)
      
      expect(getResult.success).toBe(true)
      if (getResult.success) {
        expect(getResult.data.name).toBe('Test Equipment Get')
        expect(getResult.data.type).toBe('water_heater')
      }
    }
  })

  test('retrieves all equipment for a home', async () => {
    const equipment1: EquipmentInsert = {
      home_id: testHomeId,
      name: 'Test Equipment List 1',
      category: 'hvac',
      type: 'furnace'
    }

    const equipment2: EquipmentInsert = {
      home_id: testHomeId,
      name: 'Test Equipment List 2',
      category: 'appliance',
      type: 'dishwasher'
    }

    const create1 = await createEquipment(equipment1)
    const create2 = await createEquipment(equipment2)
    
    expect(create1.success).toBe(true)
    expect(create2.success).toBe(true)

    const result = await getHomeEquipment(testHomeId)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.length).toBeGreaterThanOrEqual(2)
      
      const names = result.data.map(eq => eq.name)
      expect(names).toContain('Test Equipment List 1')
      expect(names).toContain('Test Equipment List 2')
    }
  })
}) 