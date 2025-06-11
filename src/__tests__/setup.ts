import { SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test environment configuration
const supabaseUrl = process.env.SUPABASE_TEST_URL;
const supabaseKey = process.env.SUPABASE_TEST_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase test environment variables');
}

// Create test client
export const testClient = new SupabaseClient(supabaseUrl, supabaseKey);

// Global test setup
beforeAll(async () => {
  // Setup test database
  // Clear test data
  // Set up test users
  console.log('Setting up test environment...');
});

// Global test teardown
afterAll(async () => {
  // Clean up test data
  // Close connections
  console.log('Cleaning up test environment...');
});

// Reset database between tests
beforeEach(async () => {
  // Clear relevant tables
  await testClient.from('tasks').delete().neq('id', 'dummy');
  await testClient.from('homes').delete().neq('id', 'dummy');
  await testClient.from('equipment').delete().neq('id', 'dummy');
}); 