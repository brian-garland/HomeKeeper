import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, TEST_HOME, TEST_EQUIPMENT, TEST_TASK } from '../setup';

describe('Local Data Management', () => {
  
  describe('AsyncStorage Operations', () => {
    test('should store and retrieve home data', async () => {
      // Store home data
      await AsyncStorage.setItem(STORAGE_KEYS.HOMES, JSON.stringify([TEST_HOME]));
      
      // Retrieve and verify
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.HOMES);
      expect(storedData).toBeTruthy();
      
      const parsedHomes = JSON.parse(storedData!);
      expect(parsedHomes).toHaveLength(1);
      expect(parsedHomes[0].id).toBe(TEST_HOME.id);
      expect(parsedHomes[0].name).toBe(TEST_HOME.name);
      expect(parsedHomes[0].address).toBe(TEST_HOME.address);
    });

    test('should store and retrieve equipment data', async () => {
      // Store equipment data
      await AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify([TEST_EQUIPMENT]));
      
      // Retrieve and verify
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.EQUIPMENT);
      expect(storedData).toBeTruthy();
      
      const parsedEquipment = JSON.parse(storedData!);
      expect(parsedEquipment).toHaveLength(1);
      expect(parsedEquipment[0].id).toBe(TEST_EQUIPMENT.id);
      expect(parsedEquipment[0].name).toBe(TEST_EQUIPMENT.name);
      expect(parsedEquipment[0].type).toBe(TEST_EQUIPMENT.type);
    });

    test('should store and retrieve task data', async () => {
      // Store task data
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([TEST_TASK]));
      
      // Retrieve and verify
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      expect(storedData).toBeTruthy();
      
      const parsedTasks = JSON.parse(storedData!);
      expect(parsedTasks).toHaveLength(1);
      expect(parsedTasks[0].id).toBe(TEST_TASK.id);
      expect(parsedTasks[0].title).toBe(TEST_TASK.title);
      expect(parsedTasks[0].status).toBe(TEST_TASK.status);
    });

    test('should handle empty storage gracefully', async () => {
      // Clear storage
      await AsyncStorage.clear();
      
      // Try to retrieve non-existent data
      const homeData = await AsyncStorage.getItem(STORAGE_KEYS.HOMES);
      const equipmentData = await AsyncStorage.getItem(STORAGE_KEYS.EQUIPMENT);
      const taskData = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      
      expect(homeData).toBeNull();
      expect(equipmentData).toBeNull();
      expect(taskData).toBeNull();
    });

    test('should update existing data', async () => {
      // Store initial data
      await AsyncStorage.setItem(STORAGE_KEYS.HOMES, JSON.stringify([TEST_HOME]));
      
      // Update the home
      const updatedHome = { ...TEST_HOME, name: 'Updated Test Home' };
      await AsyncStorage.setItem(STORAGE_KEYS.HOMES, JSON.stringify([updatedHome]));
      
      // Verify update
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.HOMES);
      const parsedHomes = JSON.parse(storedData!);
      expect(parsedHomes[0].name).toBe('Updated Test Home');
    });
  });

  describe('Data Validation', () => {
    test('should validate required home fields', () => {
      expect(TEST_HOME.id).toBeTruthy();
      expect(TEST_HOME.name).toBeTruthy();
      expect(TEST_HOME.address).toBeTruthy();
      expect(TEST_HOME.home_type).toBeTruthy();
      expect(typeof TEST_HOME.latitude).toBe('number');
      expect(typeof TEST_HOME.longitude).toBe('number');
    });

    test('should validate required equipment fields', () => {
      expect(TEST_EQUIPMENT.id).toBeTruthy();
      expect(TEST_EQUIPMENT.home_id).toBeTruthy();
      expect(TEST_EQUIPMENT.name).toBeTruthy();
      expect(TEST_EQUIPMENT.type).toBeTruthy();
      expect(TEST_EQUIPMENT.category).toBeTruthy();
    });

    test('should validate required task fields', () => {
      expect(TEST_TASK.id).toBeTruthy();
      expect(TEST_TASK.home_id).toBeTruthy();
      expect(TEST_TASK.title).toBeTruthy();
      expect(TEST_TASK.category).toBeTruthy();
      expect(TEST_TASK.due_date).toBeTruthy();
      expect(TEST_TASK.status).toBeTruthy();
    });
  });

  describe('Data Relationships', () => {
    test('should maintain home-equipment relationships', () => {
      expect(TEST_EQUIPMENT.home_id).toBe(TEST_HOME.id);
    });

    test('should maintain home-task relationships', () => {
      expect(TEST_TASK.home_id).toBe(TEST_HOME.id);
    });

    test('should maintain equipment-task relationships', () => {
      expect(TEST_TASK.equipment_id).toBe(TEST_EQUIPMENT.id);
    });
  });

  describe('Data Integrity', () => {
    test('should handle multiple homes', async () => {
      const home2 = { ...TEST_HOME, id: 'local-test-home-2', name: 'Second Home' };
      const homes = [TEST_HOME, home2];
      
      await AsyncStorage.setItem(STORAGE_KEYS.HOMES, JSON.stringify(homes));
      
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.HOMES);
      const parsedHomes = JSON.parse(storedData!);
      
      expect(parsedHomes).toHaveLength(2);
      expect(parsedHomes.find((h: any) => h.id === TEST_HOME.id)).toBeTruthy();
      expect(parsedHomes.find((h: any) => h.id === home2.id)).toBeTruthy();
    });

    test('should handle task completion tracking', async () => {
      const completedTask = {
        ...TEST_TASK,
        status: 'completed',
        completed_at: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([completedTask]));
      
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      const parsedTasks = JSON.parse(storedData!);
      
      expect(parsedTasks[0].status).toBe('completed');
      expect(parsedTasks[0].completed_at).toBeTruthy();
    });

    test('should handle money saved tracking', () => {
      expect(typeof TEST_TASK.money_saved_estimate).toBe('number');
      expect(TEST_TASK.money_saved_estimate).toBeGreaterThan(0);
    });
  });
}); 