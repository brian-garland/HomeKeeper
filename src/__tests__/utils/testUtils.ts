// Test utilities disabled - local-first architecture
// Database testing utilities are not needed in local-first mode

export interface TestUser {
  id: string;
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
  // Mock test user for local-first testing
  return {
    id: `test-user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`
  };
};

export const createTestHome = async (userId: string): Promise<TestHome> => {
  // Mock test home for local-first testing
  return {
    id: `test-home-${Date.now()}`,
    owner_id: userId,
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zip_code: '12345',
    created_at: new Date().toISOString()
  };
};

export const createTestEquipment = async (
  homeId: string,
  category: string = 'HVAC'
): Promise<TestEquipment> => {
  // Mock test equipment for local-first testing
  return {
    id: `test-equipment-${Date.now()}`,
    home_id: homeId,
    name: 'Test Equipment',
    category,
    type: 'Test Type',
    model: 'Test Model',
    serial_number: `TEST-${Date.now()}`,
    created_at: new Date().toISOString()
  };
};

export const cleanupTestData = async () => {
  // No cleanup needed for local-first testing
  console.log('Test cleanup not needed in local-first mode');
}; 