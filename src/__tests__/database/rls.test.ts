import { testClient } from '../setup';
import { createTestUser, createTestHome, createTestEquipment } from '../utils/testUtils';

describe('Row Level Security Tests', () => {
  let testUser: any;
  let testHome: any;
  let testEquipment: any;
  let otherUser: any;

  beforeAll(async () => {
    // Create two test users
    testUser = await createTestUser();
    otherUser = await createTestUser();
    
    // Create test data for first user
    testHome = await createTestHome(testUser.id);
    testEquipment = await createTestEquipment(testHome.id);
  });

  describe('Users Table RLS', () => {
    test('users can only read their own data', async () => {
      // Test reading own data
      const { data: ownData, error: ownError } = await testClient
        .from('users')
        .select('*')
        .eq('id', testUser.id)
        .single();
      
      expect(ownError).toBeNull();
      expect(ownData).not.toBeNull();

      // Test reading other user's data
      const { data: otherData, error: otherError } = await testClient
        .from('users')
        .select('*')
        .eq('id', otherUser.id)
        .single();
      
      expect(otherError).not.toBeNull();
      expect(otherData).toBeNull();
    });
  });

  describe('Homes Table RLS', () => {
    test('users can only access their own homes', async () => {
      // Test reading own home
      const { data: ownData, error: ownError } = await testClient
        .from('homes')
        .select('*')
        .eq('id', testHome.id)
        .single();
      
      expect(ownError).toBeNull();
      expect(ownData).not.toBeNull();

      // Test reading other user's home
      const { data: otherData, error: otherError } = await testClient
        .from('homes')
        .select('*')
        .eq('user_id', otherUser.id)
        .single();
      
      expect(otherError).toBeNull();
      expect(otherData).toBeNull();
    });

    test('users can only modify their own homes', async () => {
      // Test updating own home
      const { error: ownError } = await testClient
        .from('homes')
        .update({ address: 'Updated Address' })
        .eq('id', testHome.id);
      
      expect(ownError).toBeNull();

      // Test updating other user's home
      const { error: otherError } = await testClient
        .from('homes')
        .update({ address: 'Updated Address' })
        .eq('user_id', otherUser.id);
      
      expect(otherError).not.toBeNull();
    });
  });

  describe('Equipment Table RLS', () => {
    test('users can only access equipment in their homes', async () => {
      // Test reading own equipment
      const { data: ownData, error: ownError } = await testClient
        .from('equipment')
        .select('*')
        .eq('id', testEquipment.id)
        .single();
      
      expect(ownError).toBeNull();
      expect(ownData).not.toBeNull();

      // Test reading equipment from other user's home
      const { data: otherData, error: otherError } = await testClient
        .from('equipment')
        .select('*')
        .eq('home_id', otherUser.id)
        .single();
      
      expect(otherError).toBeNull();
      expect(otherData).toBeNull();
    });

    test('users can only modify equipment in their homes', async () => {
      // Test updating own equipment
      const { error: ownError } = await testClient
        .from('equipment')
        .update({ model: 'Updated Model' })
        .eq('id', testEquipment.id);
      
      expect(ownError).toBeNull();

      // Test updating equipment in other user's home
      const { error: otherError } = await testClient
        .from('equipment')
        .update({ model: 'Updated Model' })
        .eq('home_id', otherUser.id);
      
      expect(otherError).not.toBeNull();
    });
  });

  describe('Tasks Table RLS', () => {
    test('users can only access tasks for their homes', async () => {
      // Create a test task
      const { data: task, error: createError } = await testClient
        .from('tasks')
        .insert([{
          home_id: testHome.id,
          equipment_id: testEquipment.id,
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
          priority: 'medium',
          due_date: new Date().toISOString()
        }])
        .select()
        .single();
      
      expect(createError).toBeNull();
      expect(task).not.toBeNull();

      // Test reading own task
      const { data: ownData, error: ownError } = await testClient
        .from('tasks')
        .select('*')
        .eq('id', task.id)
        .single();
      
      expect(ownError).toBeNull();
      expect(ownData).not.toBeNull();

      // Test reading task from other user's home
      const { data: otherData, error: otherError } = await testClient
        .from('tasks')
        .select('*')
        .eq('home_id', otherUser.id)
        .single();
      
      expect(otherError).toBeNull();
      expect(otherData).toBeNull();
    });

    test('users can only modify tasks for their homes', async () => {
      // Test updating own task
      const { error: ownError } = await testClient
        .from('tasks')
        .update({ status: 'completed' })
        .eq('home_id', testHome.id);
      
      expect(ownError).toBeNull();

      // Test updating task in other user's home
      const { error: otherError } = await testClient
        .from('tasks')
        .update({ status: 'completed' })
        .eq('home_id', otherUser.id);
      
      expect(otherError).not.toBeNull();
    });
  });
}); 