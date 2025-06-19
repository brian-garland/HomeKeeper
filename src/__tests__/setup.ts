import AsyncStorage from '@react-native-async-storage/async-storage';

// Define __DEV__ for React Native testing
(global as any).__DEV__ = true;

// Mock React Native to prevent module resolution issues  
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default || obj.native),
  },
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

// Enhanced AsyncStorage mock for comprehensive testing
jest.mock('@react-native-async-storage/async-storage', () => {
  let store: { [key: string]: string } = {};
  let shouldFailNext = false;
  let failureReason = 'Storage operation failed';
  
  const mockAsyncStorage = {
    getItem: jest.fn((key: string) => {
      if (shouldFailNext) {
        shouldFailNext = false;
        return Promise.reject(new Error(failureReason));
      }
      return Promise.resolve(store[key] || null);
    }),
    setItem: jest.fn((key: string, value: string) => {
      if (shouldFailNext) {
        shouldFailNext = false;
        return Promise.reject(new Error(failureReason));
      }
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      if (shouldFailNext) {
        shouldFailNext = false;
        return Promise.reject(new Error(failureReason));
      }
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      if (shouldFailNext) {
        shouldFailNext = false;
        return Promise.reject(new Error(failureReason));
      }
      store = {};
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      if (shouldFailNext) {
        shouldFailNext = false;
        return Promise.reject(new Error(failureReason));
      }
      return Promise.resolve(Object.keys(store));
    }),
    multiGet: jest.fn((keys: string[]) => {
      if (shouldFailNext) {
        shouldFailNext = false;
        return Promise.reject(new Error(failureReason));
      }
      return Promise.resolve(keys.map(key => [key, store[key] || null]));
    }),
    multiSet: jest.fn((pairs: [string, string][]) => {
      if (shouldFailNext) {
        shouldFailNext = false;
        return Promise.reject(new Error(failureReason));
      }
      pairs.forEach(([key, value]) => {
        store[key] = value;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      if (shouldFailNext) {
        shouldFailNext = false;
        return Promise.reject(new Error(failureReason));
      }
      keys.forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    
    // Test utilities for controlling mock behavior
    __getStore: () => ({ ...store }),
    __setStore: (newStore: { [key: string]: string }) => {
      store = { ...newStore };
    },
    __clearStore: () => {
      store = {};
    },
    __simulateFailure: (reason: string = 'Storage operation failed') => {
      shouldFailNext = true;
      failureReason = reason;
    },
    __resetMocks: () => {
      shouldFailNext = false;
      failureReason = 'Storage operation failed';
      store = {};
      // Reset all jest mock call counts
      Object.values(mockAsyncStorage).forEach(mockFn => {
        if (jest.isMockFunction(mockFn)) {
          mockFn.mockClear();
        }
      });
    }
  };
  
  return mockAsyncStorage;
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock weather service to avoid API calls in tests
jest.mock('../lib/services/weatherService', () => ({
  getWeatherData: jest.fn(() => Promise.resolve({
    temperature: 72,
    condition: 'Clear',
    description: 'clear sky',
    isOutdoorFriendly: true,
    todayRecommendations: ['Check gutters', 'Trim bushes'],
    weekRecommendations: ['Clean deck', 'Wash exterior'],
    avoidRecommendations: []
  })),
  getWeatherRecommendations: jest.fn(() => Promise.resolve({
    todayRecommendations: ['Check gutters'],
    weekRecommendations: ['Clean deck'],
    avoidRecommendations: []
  })),
  getBestOutdoorTaskDays: jest.fn(() => Promise.resolve({
    success: true,
    data: [
      { date: '2024-06-15', condition: 'sunny', temp: 75 },
      { date: '2024-06-16', condition: 'partly_cloudy', temp: 73 }
    ]
  })),
  getCurrentWeather: jest.fn(() => Promise.resolve({
    temperature: 72,
    condition: 'Clear',
    description: 'clear sky',
    isOutdoorFriendly: true
  }))
}));

// Mock geocoding service
jest.mock('../lib/services/geocodingService', () => ({
  geocodeAddress: jest.fn(() => Promise.resolve({
    latitude: 39.0,
    longitude: -94.5,
    city: 'Kansas City',
    state: 'MO'
  }))
}));

// Test data constants - matching actual local data structures
export const TEST_HOME = {
  id: 'local-test-home-1',
  name: 'Test Home',
  address: '123 Test St, Test City, TS 12345',
  home_type: 'single_family',
  year_built: 2000,
  square_footage: 2000,
  bedrooms: 3,
  bathrooms: 2,
  latitude: 39.0,
  longitude: -94.5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  owner_id: 'test-user',
  // Fill in other required fields with reasonable defaults
  active: true,
  city: 'Test City',
  state: 'TS',
  zip_code: '12345',
  country: 'US',
  cooling_type: null,
  heating_type: null,
  water_heater_type: null,
  floors: 2,
  lot_size: null,
  high_maintenance_mode: false,
  maintenance_season_start: 3,
  notes: null,
  photo_url: null,
  location: null
};

export const TEST_EQUIPMENT = {
  id: 'local-test-equipment-1',
  home_id: 'local-test-home-1',
  name: 'Test HVAC System',
  type: 'hvac_system',
  category: 'hvac',
  brand: 'Carrier',
  model: 'TestModel',
  install_date: '2020-01-01',
  warranty_expires: '2025-01-01',
  maintenance_frequency_months: 6,
  last_service_date: null,
  next_service_due: null,
  notes: 'Test equipment',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  // Fill in other required fields
  active: true,
  location: null,
  manual_url: null,
  needs_attention: false,
  photo_urls: null,
  purchase_date: null,
  room: null,
  serial_number: null,
  specifications: null
};

export const TEST_TASK = {
  id: 'local-test-task-1',
  home_id: 'local-test-home-1',
  equipment_id: 'local-test-equipment-1',
  title: 'Test Task',
  description: 'Test task description',
  category: 'hvac',
  due_date: '2024-12-31',
  priority: 3,
  difficulty_level: 2,
  estimated_duration_minutes: 30,
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  money_saved_estimate: 50,
  // Fill in other required fields
  auto_generated: true,
  completed_at: null,
  completed_by: null,
  instructions: null,
  notes: null,
  recurrence: null,
  reschedule_count: null,
  tags: null,
  template_id: null,
  weather_dependent: false
};

// Storage keys (matching DataContext)
export const STORAGE_KEYS = {
  HOMES: 'homekeeper_homes',
  TASKS: 'homekeeper_tasks',
  EQUIPMENT: 'homekeeper_equipment'
};

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up local-first test environment...');
});

// Clean AsyncStorage between tests
beforeEach(async () => {
  const mockAsyncStorage = AsyncStorage as any;
  await mockAsyncStorage.clear();
});

// Global test teardown
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
});

// Helper functions for testing
export const loadTestData = async () => {
  const mockAsyncStorage = AsyncStorage as any;
  await mockAsyncStorage.setItem(STORAGE_KEYS.HOMES, JSON.stringify([TEST_HOME]));
  await mockAsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify([TEST_EQUIPMENT]));
  await mockAsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([TEST_TASK]));
};

export const getStorageData = async (key: string) => {
  const mockAsyncStorage = AsyncStorage as any;
  const data = await mockAsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const clearStorageData = async () => {
  const mockAsyncStorage = AsyncStorage as any;
  await mockAsyncStorage.clear();
}; 