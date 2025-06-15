/**
 * Load Testing Utility
 * Tests app performance with larger datasets and multiple properties
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../services/logger';
import { performanceMonitor } from '../services/performance';
import type { Home, Equipment, Task } from '../../types';

interface LoadTestConfig {
  numHomes: number;
  equipmentPerHome: number;
  tasksPerHome: number;
  simulateUserActions: boolean;
}

interface LoadTestResults {
  dataGenerationTime: number;
  storageWriteTime: number;
  storageReadTime: number;
  memoryUsage?: number;
  totalDataSize: number;
  success: boolean;
  errors: string[];
}

class LoadTester {
  private readonly LOAD_TEST_PREFIX = 'loadtest_';

  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResults> {
    logger.info('Starting load test', config);
    
    const results: LoadTestResults = {
      dataGenerationTime: 0,
      storageWriteTime: 0,
      storageReadTime: 0,
      totalDataSize: 0,
      success: false,
      errors: [],
    };

    try {
      // Clean up any previous load test data
      await this.cleanup();

      // Generate test data
      const dataGenStart = Date.now();
      const testData = await this.generateTestData(config);
      results.dataGenerationTime = Date.now() - dataGenStart;

      // Test storage write performance
      const writeStart = Date.now();
      await this.writeTestData(testData);
      results.storageWriteTime = Date.now() - writeStart;

      // Test storage read performance
      const readStart = Date.now();
      const readData = await this.readTestData();
      results.storageReadTime = Date.now() - readStart;

      // Calculate data size
      results.totalDataSize = this.calculateDataSize(testData);

      // Verify data integrity
      const dataIntegrityCheck = this.verifyDataIntegrity(testData, readData);
      if (!dataIntegrityCheck.success) {
        results.errors.push(`Data integrity check failed: ${dataIntegrityCheck.error}`);
      }

      // Simulate user actions if requested
      if (config.simulateUserActions) {
        await this.simulateUserActions(testData);
      }

      results.success = results.errors.length === 0;

      logger.info('Load test completed', results);
      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(errorMessage);
      results.success = false;
      logger.error('Load test failed', error);
      return results;
    } finally {
      // Clean up test data
      await this.cleanup();
    }
  }

  private async generateTestData(config: LoadTestConfig): Promise<{
    homes: Home[];
    equipment: Equipment[];
    tasks: Task[];
  }> {
    const homes: Home[] = [];
    const equipment: Equipment[] = [];
    const tasks: Task[] = [];

    // Generate homes
    for (let i = 0; i < config.numHomes; i++) {
      const home: Home = {
        id: `${this.LOAD_TEST_PREFIX}home_${i}`,
        name: `Test Home ${i + 1}`,
        address: `${100 + i} Test Street, Test City, TC ${10000 + i}`,
        home_type: i % 3 === 0 ? 'single_family' : i % 3 === 1 ? 'apartment' : 'condo',
        year_built: 1950 + (i % 70),
        square_footage: 1000 + (i * 100),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: 'load_test_user',
        active: true,
        bathrooms: null,
        bedrooms: null,
        city: null,
        cooling_type: null,
        country: null,
        floors: null,
        heating_type: null,
        high_maintenance_mode: null,
        latitude: null,
        location: null,
        longitude: null,
        lot_size: null,
        maintenance_season_start: null,
        notes: null,
        photo_url: null,
        state: null,
        water_heater_type: null,
        zip_code: null,
      };
      homes.push(home);

      // Generate equipment for each home
      for (let j = 0; j < config.equipmentPerHome; j++) {
        const equipmentTypes = [
          'hvac_system', 'water_heater', 'dishwasher', 'washing_machine',
          'dryer', 'refrigerator', 'oven', 'garbage_disposal'
        ];
        const type = equipmentTypes[j % equipmentTypes.length];
        
        const equipmentItem: Equipment = {
          id: `${this.LOAD_TEST_PREFIX}equipment_${i}_${j}`,
          home_id: home.id,
          name: `Test ${type.replace('_', ' ')} ${j + 1}`,
          type,
          category: this.getEquipmentCategory(type),
          brand: `Brand${j % 5 + 1}`,
          model: `Model-${i}-${j}`,
          serial_number: `SN${i}${j}${Date.now()}`,
          purchase_date: new Date(Date.now() - (j * 365 * 24 * 60 * 60 * 1000)).toISOString(),
          warranty_expires: new Date(Date.now() + ((5 - j) * 365 * 24 * 60 * 60 * 1000)).toISOString(),
          install_date: new Date(Date.now() - (j * 365 * 24 * 60 * 60 * 1000)).toISOString(),
          room: `Room ${j + 1}`,
          notes: `Test equipment ${j + 1} for load testing`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          active: true,
          last_service_date: null,
          location: null,
          maintenance_frequency_months: null,
          manual_url: null,
          needs_attention: null,
          next_service_due: null,
          photo_urls: null,
          specifications: null,
        };
        equipment.push(equipmentItem);
      }

      // Generate tasks for each home
      for (let k = 0; k < config.tasksPerHome; k++) {
        const task: Task = {
          id: `${this.LOAD_TEST_PREFIX}task_${i}_${k}`,
          home_id: home.id,
          title: `Test Task ${k + 1} for Home ${i + 1}`,
          description: `This is a test task ${k + 1} generated for load testing purposes. It includes detailed instructions and notes.`,
          category: ['maintenance', 'cleaning', 'inspection', 'repair'][k % 4],
          priority: (k % 3) + 1, // 1, 2, or 3
          status: k % 4 === 0 ? 'completed' : k % 4 === 1 ? 'in_progress' : 'pending',
          due_date: new Date(Date.now() + (k * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          estimated_duration_minutes: (k % 4 + 1) * 30, // 30, 60, 90, or 120 minutes
          difficulty_level: (k % 3) + 1, // 1, 2, or 3
          auto_generated: k % 2 === 0,
          recurrence: k % 5 === 0 ? { type: 'monthly' } : k % 5 === 1 ? { type: 'quarterly' } : null,
          weather_dependent: k % 3 === 0,
          equipment_id: equipment.length > 0 ? equipment[equipment.length - 1].id : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: k % 4 === 0 ? new Date().toISOString() : null,
          completed_by: k % 4 === 0 ? 'Load Tester' : null,
          notes: k % 4 === 0 ? 'Completed during load test' : null,
          tags: k % 2 === 0 ? ['load-test', 'automated'] : null,
          reschedule_count: k % 10 === 0 ? 1 : null,
          instructions: null,
          money_saved_estimate: null,
          template_id: null,
        };
        tasks.push(task);
      }
    }

    return { homes, equipment, tasks };
  }

  private getEquipmentCategory(type: string): string {
    const categoryMap: Record<string, string> = {
      'hvac_system': 'hvac',
      'water_heater': 'plumbing',
      'dishwasher': 'appliances',
      'washing_machine': 'appliances',
      'dryer': 'appliances',
      'refrigerator': 'appliances',
      'oven': 'appliances',
      'garbage_disposal': 'plumbing',
    };
    return categoryMap[type] || 'other';
  }

  private async writeTestData(data: {
    homes: Home[];
    equipment: Equipment[];
    tasks: Task[];
  }): Promise<void> {
    const writeOperations = [
      AsyncStorage.setItem(`${this.LOAD_TEST_PREFIX}homes`, JSON.stringify(data.homes)),
      AsyncStorage.setItem(`${this.LOAD_TEST_PREFIX}equipment`, JSON.stringify(data.equipment)),
      AsyncStorage.setItem(`${this.LOAD_TEST_PREFIX}tasks`, JSON.stringify(data.tasks)),
    ];

    await Promise.all(writeOperations);
  }

  private async readTestData(): Promise<{
    homes: Home[];
    equipment: Equipment[];
    tasks: Task[];
  }> {
    const [homesData, equipmentData, tasksData] = await Promise.all([
      AsyncStorage.getItem(`${this.LOAD_TEST_PREFIX}homes`),
      AsyncStorage.getItem(`${this.LOAD_TEST_PREFIX}equipment`),
      AsyncStorage.getItem(`${this.LOAD_TEST_PREFIX}tasks`),
    ]);

    return {
      homes: homesData ? JSON.parse(homesData) : [],
      equipment: equipmentData ? JSON.parse(equipmentData) : [],
      tasks: tasksData ? JSON.parse(tasksData) : [],
    };
  }

  private calculateDataSize(data: {
    homes: Home[];
    equipment: Equipment[];
    tasks: Task[];
  }): number {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  }

  private verifyDataIntegrity(
    original: { homes: Home[]; equipment: Equipment[]; tasks: Task[] },
    read: { homes: Home[]; equipment: Equipment[]; tasks: Task[] }
  ): { success: boolean; error?: string } {
    if (original.homes.length !== read.homes.length) {
      return { success: false, error: `Homes count mismatch: ${original.homes.length} vs ${read.homes.length}` };
    }
    if (original.equipment.length !== read.equipment.length) {
      return { success: false, error: `Equipment count mismatch: ${original.equipment.length} vs ${read.equipment.length}` };
    }
    if (original.tasks.length !== read.tasks.length) {
      return { success: false, error: `Tasks count mismatch: ${original.tasks.length} vs ${read.tasks.length}` };
    }

    // Verify a sample of data integrity
    if (original.homes.length > 0 && original.homes[0].id !== read.homes[0].id) {
      return { success: false, error: 'First home ID mismatch' };
    }

    return { success: true };
  }

  private async simulateUserActions(data: {
    homes: Home[];
    equipment: Equipment[];
    tasks: Task[];
  }): Promise<void> {
    logger.info('Simulating user actions for load test');

    // Simulate rapid data access patterns
    const operations = [];

    // Simulate filtering and searching
    for (let i = 0; i < 10; i++) {
      operations.push(
        performanceMonitor.trackAsyncOperation(`load_test_filter_${i}`, async () => {
          // Simulate filtering tasks by status
          const pendingTasks = data.tasks.filter(task => task.status === 'pending');
          const completedTasks = data.tasks.filter(task => task.status === 'completed');
          
          // Simulate sorting
          pendingTasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
          
          return { pendingTasks: pendingTasks.length, completedTasks: completedTasks.length };
        })
      );
    }

    // Simulate concurrent operations
    await Promise.all(operations);

    // Simulate memory-intensive operations
    await performanceMonitor.trackAsyncOperation('load_test_memory_intensive', async () => {
      // Create large temporary arrays to test memory handling
      const largeArray = new Array(10000).fill(0).map((_, i) => ({
        id: i,
        data: `Large data string ${i}`.repeat(100),
      }));
      
      // Process the array
      const processed = largeArray.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now(),
      }));

      return processed.length;
    });

    logger.info('User action simulation completed');
  }

  async cleanup(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const loadTestKeys = keys.filter(key => key.startsWith(this.LOAD_TEST_PREFIX));
      
      if (loadTestKeys.length > 0) {
        await AsyncStorage.multiRemove(loadTestKeys);
        logger.info(`Cleaned up ${loadTestKeys.length} load test keys`);
      }
    } catch (error) {
      logger.error('Failed to cleanup load test data', error);
    }
  }

  // Predefined test configurations
  static readonly TEST_CONFIGS = {
    LIGHT: {
      numHomes: 2,
      equipmentPerHome: 5,
      tasksPerHome: 10,
      simulateUserActions: false,
    } as LoadTestConfig,

    MEDIUM: {
      numHomes: 5,
      equipmentPerHome: 10,
      tasksPerHome: 25,
      simulateUserActions: true,
    } as LoadTestConfig,

    HEAVY: {
      numHomes: 10,
      equipmentPerHome: 15,
      tasksPerHome: 50,
      simulateUserActions: true,
    } as LoadTestConfig,

    STRESS: {
      numHomes: 20,
      equipmentPerHome: 20,
      tasksPerHome: 100,
      simulateUserActions: true,
    } as LoadTestConfig,
  };
}

// Export singleton instance
export const loadTester = new LoadTester();

// Convenience functions
export const runLoadTest = {
  light: () => loadTester.runLoadTest(LoadTester.TEST_CONFIGS.LIGHT),
  medium: () => loadTester.runLoadTest(LoadTester.TEST_CONFIGS.MEDIUM),
  heavy: () => loadTester.runLoadTest(LoadTester.TEST_CONFIGS.HEAVY),
  stress: () => loadTester.runLoadTest(LoadTester.TEST_CONFIGS.STRESS),
  custom: (config: LoadTestConfig) => loadTester.runLoadTest(config),
}; 