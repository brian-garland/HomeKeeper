import { testClient } from '../setup';
import { createTestUser, createTestHome, createTestEquipment } from '../utils/testUtils';

describe('Database Schema Tests', () => {
  let testUser: any;
  let testHome: any;
  let testEquipment: any;

  beforeAll(async () => {
    testUser = await createTestUser();
    testHome = await createTestHome(testUser.id);
    testEquipment = await createTestEquipment(testHome.id);
  });

  describe('User Profiles Table', () => {
    test('has required fields', async () => {
      const { data, error } = await testClient
        .from('user_profiles')
        .select('*')
        .eq('id', testUser.id)
        .single();
      
      expect(error).toBeNull();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('created_at');
      expect(data).toHaveProperty('updated_at');
    });

    test('enforces unique email constraint', async () => {
      const { error } = await testClient.auth.signUp({
        email: testUser.email,
        password: 'test-password'
      });
      
      expect(error).not.toBeNull();
      if (error) {
        expect(error.message).toContain('unique');
      }
    });
  });

  describe('Homes Table', () => {
    test('has required fields', async () => {
      const { data, error } = await testClient
        .from('homes')
        .select('*')
        .eq('id', testHome.id)
        .single();
      
      expect(error).toBeNull();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('owner_id');
      expect(data).toHaveProperty('address');
      expect(data).toHaveProperty('city');
      expect(data).toHaveProperty('state');
      expect(data).toHaveProperty('zip_code');
      expect(data).toHaveProperty('created_at');
    });

    test('enforces foreign key constraint with users', async () => {
      const { error } = await testClient
        .from('homes')
        .insert([{
          owner_id: 'non-existent-user-id',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip_code: '12345'
        }]);
      
      expect(error).not.toBeNull();
      if (error) {
        expect(error.message).toContain('foreign key');
      }
    });
  });

  describe('Equipment Table', () => {
    test('has required fields', async () => {
      const { data, error } = await testClient
        .from('equipment')
        .select('*')
        .eq('id', testEquipment.id)
        .single();
      
      expect(error).toBeNull();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('home_id');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('category');
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('created_at');
    });

    test('enforces foreign key constraint with homes', async () => {
      const { error } = await testClient
        .from('equipment')
        .insert([{
          home_id: 'non-existent-home-id',
          name: 'Test Equipment',
          category: 'hvac',
          type: 'HVAC',
          model: 'Test Model'
        }]);
      
      expect(error).not.toBeNull();
      if (error) {
        expect(error.message).toContain('foreign key');
      }
    });
  });

  describe('Tasks Table', () => {
    test('has required fields', async () => {
      const { data, error } = await testClient
        .from('tasks')
        .insert([{
          home_id: testHome.id,
          equipment_id: testEquipment.id,
          title: 'Test Task',
          description: 'Test Description',
          category: 'general',
          status: 'pending',
          priority: 3,
          due_date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();
      
      expect(error).toBeNull();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('home_id');
      expect(data).toHaveProperty('equipment_id');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('description');
      expect(data).toHaveProperty('category');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('priority');
      expect(data).toHaveProperty('due_date');
      expect(data).toHaveProperty('created_at');
    });

    test('enforces foreign key constraints', async () => {
      const { error } = await testClient
        .from('tasks')
        .insert([{
          home_id: 'non-existent-home-id',
          equipment_id: 'non-existent-equipment-id',
          title: 'Test Task',
          description: 'Test Description',
          category: 'general',
          status: 'pending',
          priority: 3,
          due_date: new Date().toISOString().split('T')[0]
        }]);
      
      expect(error).not.toBeNull();
      if (error) {
        expect(error.message).toContain('foreign key');
      }
    });
  });
}); 