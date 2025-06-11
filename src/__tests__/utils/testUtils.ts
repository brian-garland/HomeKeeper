import { testClient } from '../setup';
import { User } from '@supabase/supabase-js';

export interface TestUser extends User {
  email: string;
}

export interface TestHome {
  id: string;
  owner_id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  created_at: string;
}

export interface TestEquipment {
  id: string;
  home_id: string;
  name: string;
  category: string;
  type: string;
  model: string;
  serial_number?: string;
  created_at: string;
}

export const createTestUser = async (): Promise<TestUser> => {
  const { data, error } = await testClient.auth.signUp({
    email: `test-${Date.now()}@example.com`,
    password: 'test-password'
  });
  
  if (error) throw error;
  
  // Create matching user profile
  const { error: profileError } = await testClient
    .from('user_profiles')
    .insert([{
      id: data.user!.id,
      email: data.user!.email,
      first_name: 'Test',
      last_name: 'User'
    }]);
    
  if (profileError) throw profileError;
  
  return data.user as TestUser;
};

export const createTestHome = async (userId: string): Promise<TestHome> => {
  const { data, error } = await testClient
    .from('homes')
    .insert([{
      owner_id: userId,
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip_code: '12345'
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data as TestHome;
};

export const createTestEquipment = async (
  homeId: string,
  category: string = 'hvac'
): Promise<TestEquipment> => {
  const { data, error } = await testClient
    .from('equipment')
    .insert([{
      home_id: homeId,
      name: 'Test Equipment',
      category,
      type: 'Test Type',
      model: 'Test Model',
      serial_number: `TEST-${Date.now()}`
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data as TestEquipment;
};

export const cleanupTestData = async () => {
  await testClient.from('task_completions').delete().neq('id', 'dummy');
  await testClient.from('tasks').delete().neq('id', 'dummy');
  await testClient.from('equipment').delete().neq('id', 'dummy');
  await testClient.from('homes').delete().neq('id', 'dummy');
  await testClient.from('user_profiles').delete().neq('id', 'dummy');
  // Note: Auth user cleanup might require admin privileges
}; 