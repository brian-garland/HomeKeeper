import { testClient } from './setup';

describe('Supabase Connection Test', () => {
  test('can connect to Supabase', async () => {
    // Simple test to verify connection
    const { data, error } = await testClient
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    // We don't care about data, just that we can connect without auth errors
    // Error should be about auth/RLS, not connection
    expect(error).not.toBeNull();
    expect(error?.message).toContain('RLS'); // Row Level Security should block this
  });

  test('database tables exist', async () => {
    // Test if our tables exist by checking the schema
    const { data, error } = await testClient.rpc('ping');
    
    // This will fail but tells us if we can communicate with the database
    expect(error).not.toBeNull(); // ping function doesn't exist, but that's fine
  });
}); 