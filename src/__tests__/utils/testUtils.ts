import { supabase } from '../../lib/supabase';
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
  const email = `test-${Date.now()}@example.com`;
  const password = 'test-password';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  
  // Sign in the user to set authentication context
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (signInError) throw signInError;
  
  // Create matching user profile
  const { error: profileError } = await supabase
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
  const { data, error } = await supabase
    .from('homes')
    .insert([{
      owner_id: userId,
      name: 'Test Home',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip_code: '12345',
      country: 'US',
      home_type: 'house'
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data as TestHome;
};

export const createTestEquipment = async (
  homeId: string,
  category: string = 'HVAC'
): Promise<TestEquipment> => {
  const { data, error } = await supabase
    .from('equipment')
    .insert([{
      home_id: homeId,
      name: 'Test Equipment',
      category,
      type: 'Test Type',
      brand: 'Test Brand',
      model: 'Test Model',
      serial_number: `TEST-${Date.now()}`
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data as TestEquipment;
};

export const cleanupTestData = async () => {
  await supabase.from('task_completions').delete().neq('id', 'dummy');
  await supabase.from('tasks').delete().neq('id', 'dummy');
  await supabase.from('equipment').delete().neq('id', 'dummy');
  await supabase.from('homes').delete().neq('id', 'dummy');
  await supabase.from('user_profiles').delete().neq('id', 'dummy');
  // Note: Auth user cleanup might require admin privileges
}; 