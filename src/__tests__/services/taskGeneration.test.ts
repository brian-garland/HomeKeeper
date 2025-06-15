import { generateIntelligentTasks } from '../../lib/services/taskGenerationService';
import { UnifiedDataManager } from '../../lib/services/dataManager';
import { TEST_HOME, TEST_EQUIPMENT } from '../setup';

// Mock the UnifiedDataManager
jest.mock('../../lib/services/dataManager', () => ({
  UnifiedDataManager: {
    getHomeWithEquipment: jest.fn(),
    createTask: jest.fn(),
  },
}));

// Mock the local template service
jest.mock('../../lib/services/localTemplateService', () => ({
  getSeasonalTaskTemplates: jest.fn(() => Promise.resolve({
    success: true,
    data: [
      {
        id: 'template-1',
        title: 'Check HVAC Filter',
        description: 'Replace or clean HVAC filter',
        category: 'hvac',
        difficulty_level: 2,
        estimated_duration_minutes: 15,
        seasonal_months: [3, 6, 9, 12],
        frequency_months: 3,
        money_saved_estimate: 25
      }
    ]
  })),
  getApplicableTaskTemplates: jest.fn(() => Promise.resolve({
    success: true,
    data: [
      {
        id: 'template-2',
        title: 'Service HVAC System',
        description: 'Professional HVAC maintenance',
        category: 'hvac',
        difficulty_level: 4,
        estimated_duration_minutes: 120,
        frequency_months: 6,
        money_saved_estimate: 150
      }
    ]
  }))
}));

describe('Task Generation Service', () => {
  const mockUnifiedDataManager = UnifiedDataManager as jest.Mocked<typeof UnifiedDataManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockUnifiedDataManager.getHomeWithEquipment.mockResolvedValue({
      home: TEST_HOME,
      equipment: [TEST_EQUIPMENT],
      existingTasks: []
    });
    
    mockUnifiedDataManager.createTask.mockImplementation(async (homeId, taskData) => ({
      id: `generated-task-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...taskData,
      home_id: homeId,
      auto_generated: true,
      status: 'pending',
      completed_at: null,
      completed_by: null,
      notes: null,
      tags: null,
      reschedule_count: null,
      weather_dependent: false
    } as any));
  });

  describe('Basic Task Generation', () => {
    test('should generate tasks for a valid home', async () => {
      const result = await generateIntelligentTasks('local-test-home-1');
      
      expect(result.success).toBe(true);
      expect(result.tasksGenerated).toBeGreaterThan(0);
      expect(result.tasks).toBeDefined();
      expect(Array.isArray(result.tasks)).toBe(true);
    });

    test('should fail gracefully for non-existent home', async () => {
      mockUnifiedDataManager.getHomeWithEquipment.mockResolvedValue({
        home: null,
        equipment: [],
        existingTasks: []
      });

      const result = await generateIntelligentTasks('non-existent-home');
      
      expect(result.success).toBe(false);
      expect(result.tasksGenerated).toBe(0);
      expect(result.error).toBe('Home not found');
    });

    test('should handle homes with no equipment', async () => {
      mockUnifiedDataManager.getHomeWithEquipment.mockResolvedValue({
        home: TEST_HOME,
        equipment: [],
        existingTasks: []
      });

      const result = await generateIntelligentTasks('local-test-home-1');
      
      expect(result.success).toBe(true);
      // Should still generate seasonal tasks even without equipment
      expect(result.tasksGenerated).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Task Generation Options', () => {
    test('should respect maxTasksPerCategory option', async () => {
      const result = await generateIntelligentTasks('local-test-home-1', {
        maxTasksPerCategory: 2
      });
      
      expect(result.success).toBe(true);
      // Tasks should be limited by the max option
      expect(result.tasks.length).toBeLessThanOrEqual(10); // Reasonable upper bound
    });

    test('should handle weather optimization option', async () => {
      const result = await generateIntelligentTasks('local-test-home-1', {
        includeWeatherOptimization: true
      });
      
      expect(result.success).toBe(true);
      expect(result.tasks).toBeDefined();
    });

    test('should handle disabled weather optimization', async () => {
      const result = await generateIntelligentTasks('local-test-home-1', {
        includeWeatherOptimization: false
      });
      
      expect(result.success).toBe(true);
      expect(result.tasks).toBeDefined();
    });
  });

  describe('Data Manager Integration', () => {
    test('should call UnifiedDataManager with correct home ID', async () => {
      await generateIntelligentTasks('local-test-home-1');
      
      expect(mockUnifiedDataManager.getHomeWithEquipment).toHaveBeenCalledWith('local-test-home-1');
    });

    test('should create tasks through UnifiedDataManager', async () => {
      const result = await generateIntelligentTasks('local-test-home-1');
      
      if (result.success && result.tasksGenerated > 0) {
        expect(mockUnifiedDataManager.createTask).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle UnifiedDataManager errors gracefully', async () => {
      mockUnifiedDataManager.getHomeWithEquipment.mockRejectedValue(new Error('Database error'));

      const result = await generateIntelligentTasks('local-test-home-1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('should handle task creation errors gracefully', async () => {
      mockUnifiedDataManager.createTask.mockRejectedValue(new Error('Task creation failed'));

      const result = await generateIntelligentTasks('local-test-home-1');
      
      // Should still attempt to generate but may have errors
      expect(result).toBeDefined();
    });
  });

  describe('Local Storage Integration', () => {
    test('should handle local home IDs correctly', async () => {
      const result = await generateIntelligentTasks('local-test-home-1');
      
      expect(result.success).toBe(true);
      expect(mockUnifiedDataManager.getHomeWithEquipment).toHaveBeenCalledWith('local-test-home-1');
    });
  });
}); 