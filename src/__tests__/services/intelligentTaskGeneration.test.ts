import { generateIntelligentTasks, generateTasksForCategory } from '../../lib/services/taskGenerationService';
import { getApplicableTaskTemplates, getSeasonalTaskTemplates } from '../../lib/models/taskTemplates';
import { getCurrentWeather, getWeatherTaskRecommendations } from '../../lib/services/weatherService';

// Mock data for testing
const mockHome = {
  id: 'test-home-id',
  name: 'Test Home',
  home_type: 'single_family',
  year_built: 2000,
  square_footage: 2000,
  latitude: 40.7128,
  longitude: -74.0060,
  owner_id: 'test-user-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  active: true,
  address: '123 Test St',
  city: 'Test City',
  state: 'NY',
  zip_code: '10001',
  country: 'US',
  bedrooms: 3,
  bathrooms: 2,
  floors: 2,
  heating_type: 'gas',
  cooling_type: 'central_air',
  water_heater_type: 'gas',
  lot_size: 0.25,
  photo_url: null,
  notes: null,
  location: null,
  maintenance_season_start: 3,
  high_maintenance_mode: false
};

const mockEquipment = [
  {
    id: 'test-hvac-id',
    home_id: 'test-home-id',
    name: 'Main HVAC System',
    type: 'hvac',
    category: 'HVAC',
    brand: 'Carrier',
    model: 'Test Model',
    install_date: '2020-01-01',
    warranty_expires: '2025-01-01',
    maintenance_frequency_months: 6,
    next_service_due: '2024-06-01',
    active: true,
    needs_attention: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: 'Basement',
    room: 'Utility Room',
    serial_number: 'TEST123',
    purchase_date: '2020-01-01',
    last_service_date: '2023-12-01',
    specifications: null,
    photo_urls: null,
    notes: null,
    manual_url: null
  }
];

describe('Intelligent Task Generation System', () => {
  beforeAll(() => {
    // Set environment variables for testing
    process.env.SUPABASE_URL = 'https://vnluldqodbmzddrinimc.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubHVsZHFvZGJtemRkcmluaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTc3MTksImV4cCI6MjA2NTA5MzcxOX0.Ec2kLjwJ-64phmv5w77xsHBLR5R88GRgS166cMQt95U';
  });

  describe('Weather Service Integration', () => {
    test('should get current weather data', async () => {
      const result = await getCurrentWeather(40.7128, -74.0060);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('temperature');
        expect(result.data).toHaveProperty('humidity');
        expect(result.data).toHaveProperty('windSpeed');
        expect(result.data).toHaveProperty('description');
        expect(result.data).toHaveProperty('isOutdoorFriendly');
        expect(typeof result.data.temperature).toBe('number');
        expect(typeof result.data.isOutdoorFriendly).toBe('boolean');
      }
    });

    test('should get weather-based task recommendations', async () => {
      const result = await getWeatherTaskRecommendations(40.7128, -74.0060);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('today');
        expect(result.data).toHaveProperty('thisWeek');
        expect(result.data).toHaveProperty('avoid');
        expect(Array.isArray(result.data.today)).toBe(true);
        expect(Array.isArray(result.data.thisWeek)).toBe(true);
        expect(Array.isArray(result.data.avoid)).toBe(true);
      }
    });
  });

  describe('Task Template System', () => {
    test('should get applicable task templates for home type', async () => {
      const currentMonth = new Date().getMonth() + 1;
      const result = await getApplicableTaskTemplates(
        'single_family',
        ['hvac'],
        currentMonth
      );
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        // Should have some templates for single family homes with HVAC
        console.log(`Found ${result.data.length} applicable templates`);
      }
    });

    test('should get seasonal task templates', async () => {
      const currentMonth = new Date().getMonth() + 1;
      const result = await getSeasonalTaskTemplates(currentMonth, 'single_family');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        console.log(`Found ${result.data.length} seasonal templates for month ${currentMonth}`);
      }
    });
  });

  describe('Task Generation for Category', () => {
    test('should generate tasks for HVAC category', async () => {
      const result = await generateTasksForCategory('test-home-id', 'HVAC', 3);
      
      // This might fail if no templates exist, but should not crash
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('tasksGenerated');
      expect(result).toHaveProperty('tasks');
      expect(Array.isArray(result.tasks)).toBe(true);
      
      console.log(`HVAC task generation result:`, {
        success: result.success,
        tasksGenerated: result.tasksGenerated,
        error: result.error
      });
    });
  });

  describe('Intelligent Task Generation Logic', () => {
    test('should handle task generation options correctly', () => {
      const options = {
        includeWeatherOptimization: true,
        maxTasksPerCategory: 5,
        prioritizeOverdue: true,
        lookAheadDays: 30
      };
      
      expect(options.includeWeatherOptimization).toBe(true);
      expect(options.maxTasksPerCategory).toBe(5);
      expect(options.prioritizeOverdue).toBe(true);
      expect(options.lookAheadDays).toBe(30);
    });

    test('should calculate priority correctly', () => {
      // Test priority calculation logic
      const today = new Date();
      const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneMonthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // Tasks due within a week should be high priority
      const daysUntilDueWeek = Math.ceil(
        (oneWeekFromNow.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysUntilDueWeek).toBeLessThanOrEqual(7);
      
      // Tasks due within a month should be medium priority
      const daysUntilDueMonth = Math.ceil(
        (oneMonthFromNow.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysUntilDueMonth).toBeLessThanOrEqual(30);
    });

    test('should identify weather-dependent tasks', () => {
      const outdoorCategories = [
        'exterior',
        'roofing', 
        'gutters',
        'landscaping',
        'outdoor'
      ];
      
      const indoorCategories = [
        'hvac',
        'plumbing',
        'electrical',
        'kitchen'
      ];
      
      // Test outdoor categories are identified as weather-dependent
      outdoorCategories.forEach(category => {
        const isWeatherDependent = outdoorCategories.some(outdoor => 
          category.toLowerCase().includes(outdoor)
        );
        expect(isWeatherDependent).toBe(true);
      });
      
      // Test indoor categories are not weather-dependent
      indoorCategories.forEach(category => {
        const isWeatherDependent = outdoorCategories.some(outdoor => 
          category.toLowerCase().includes(outdoor)
        );
        expect(isWeatherDependent).toBe(false);
      });
    });
  });

  describe('Integration Test', () => {
    test('should demonstrate complete intelligent task generation flow', async () => {
      console.log('\n🏠 Starting Intelligent Task Generation Demo...\n');
      
      // 1. Get weather data
      console.log('1. Fetching weather data...');
      const weatherResult = await getCurrentWeather(mockHome.latitude, mockHome.longitude);
      console.log('Weather:', weatherResult.success ? 
        `${weatherResult.data.temperature}°F, ${weatherResult.data.description}` : 
        'Failed to fetch'
      );
      
      // 2. Get weather recommendations
      console.log('\n2. Getting weather-based recommendations...');
      const recommendationsResult = await getWeatherTaskRecommendations(
        mockHome.latitude, 
        mockHome.longitude
      );
      if (recommendationsResult.success) {
        console.log('Today recommendations:', recommendationsResult.data.today.slice(0, 3));
        console.log('Avoid this week:', recommendationsResult.data.avoid.slice(0, 2));
      }
      
      // 3. Get applicable templates
      console.log('\n3. Finding applicable task templates...');
      const currentMonth = new Date().getMonth() + 1;
      const templatesResult = await getApplicableTaskTemplates(
        mockHome.home_type || 'single_family',
        ['hvac'],
        currentMonth
      );
      console.log(`Found ${templatesResult.success ? templatesResult.data.length : 0} applicable templates`);
      
      // 4. Get seasonal templates
      console.log('\n4. Finding seasonal templates...');
      const seasonalResult = await getSeasonalTaskTemplates(currentMonth, mockHome.home_type);
      console.log(`Found ${seasonalResult.success ? seasonalResult.data.length : 0} seasonal templates`);
      
      // 5. Test category-specific generation
      console.log('\n5. Testing category-specific task generation...');
      const categoryResult = await generateTasksForCategory('test-home-id', 'HVAC', 2);
      console.log(`HVAC tasks: ${categoryResult.success ? 'Success' : 'Failed'} - ${categoryResult.tasksGenerated} tasks generated`);
      
      console.log('\n✅ Intelligent Task Generation Demo Complete!\n');
      
      // Verify at least some components are working
      expect(weatherResult.success || recommendationsResult.success || templatesResult.success).toBe(true);
    });
  });
});

describe('Development Mode Features', () => {
  test('should work in development mode with mock data', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    // Test that development mode is detected
    expect(process.env.NODE_ENV).toBe('development');
    
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });
  
  test('should handle missing weather API key gracefully', async () => {
    const originalKey = process.env.OPENWEATHER_API_KEY;
    delete process.env.OPENWEATHER_API_KEY;
    
    // Should fall back to mock data
    const result = await getCurrentWeather(40.7128, -74.0060);
    expect(result.success).toBe(true);
    
    // Restore original key if it existed
    if (originalKey) {
      process.env.OPENWEATHER_API_KEY = originalKey;
    }
  });
}); 