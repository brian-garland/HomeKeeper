import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { supabase } from '../../lib/supabase'
import { createTestUser, createTestHome, cleanupTestData } from '../utils/testUtils'
import { createTask, getTask, getHomeTasks } from '../../lib/models/tasks'
import { TaskInsert } from '../../types/database.types'

describe('Task Model - Core Functions', () => {
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
    await supabase.from('tasks').delete().like('title', 'Test Task%')
  })

  test('creates task with required fields', async () => {
    const taskData: TaskInsert = {
      home_id: testHomeId,
      title: 'Test Task Core',
      category: 'Maintenance',
      due_date: '2024-12-31'
    }

    const result = await createTask(taskData)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Test Task Core')
      expect(result.data.category).toBe('Maintenance')
      expect(result.data.due_date).toBe('2024-12-31')
      expect(result.data.status).toBe('pending')
      expect(result.data.priority).toBe(3) // Default value
      expect(result.data.id).toBeDefined()
    }
  })

  test('retrieves task by id', async () => {
    const taskData: TaskInsert = {
      home_id: testHomeId,
      title: 'Test Task Get',
      category: 'Cleaning',
      due_date: '2024-12-15',
      priority: 5
    }

    const createResult = await createTask(taskData)
    expect(createResult.success).toBe(true)
    
    if (createResult.success) {
      const getResult = await getTask(createResult.data.id)
      
      expect(getResult.success).toBe(true)
      if (getResult.success) {
        expect(getResult.data.title).toBe('Test Task Get')
        expect(getResult.data.priority).toBe(5)
        expect(getResult.data.category).toBe('Cleaning')
      }
    }
  })

  test('retrieves all tasks for a home', async () => {
    const task1: TaskInsert = {
      home_id: testHomeId,
      title: 'Test Task List 1',
      category: 'Maintenance',
      due_date: '2024-12-31',
      priority: 1
    }

    const task2: TaskInsert = {
      home_id: testHomeId,
      title: 'Test Task List 2',
      category: 'Cleaning', 
      due_date: '2025-01-15',
      priority: 5
    }

    const create1 = await createTask(task1)
    const create2 = await createTask(task2)
    
    expect(create1.success).toBe(true)
    expect(create2.success).toBe(true)

    const result = await getHomeTasks(testHomeId)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.length).toBeGreaterThanOrEqual(2)
      
      const titles = result.data.map(task => task.title)
      expect(titles).toContain('Test Task List 1')
      expect(titles).toContain('Test Task List 2')
    }
  })
}) 