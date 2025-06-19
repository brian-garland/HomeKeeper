import AsyncStorage from '@react-native-async-storage/async-storage';

// Type assertion to access our custom mock methods
const mockAsyncStorage = AsyncStorage as any;

describe('AsyncStorage Mock', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockAsyncStorage.__resetMocks();
  });

  describe('Basic Operations', () => {
    test('should set and get items correctly', async () => {
      const key = 'test_key';
      const value = 'test_value';

      await AsyncStorage.setItem(key, value);
      const retrievedValue = await AsyncStorage.getItem(key);

      expect(retrievedValue).toBe(value);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, value);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
    });

    test('should return null for non-existent keys', async () => {
      const result = await AsyncStorage.getItem('non_existent_key');
      expect(result).toBeNull();
    });

    test('should remove items correctly', async () => {
      const key = 'test_key';
      const value = 'test_value';

      await AsyncStorage.setItem(key, value);
      await AsyncStorage.removeItem(key);
      const result = await AsyncStorage.getItem(key);

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
    });

    test('should clear all items', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.setItem('key2', 'value2');
      
      await AsyncStorage.clear();
      
      const result1 = await AsyncStorage.getItem('key1');
      const result2 = await AsyncStorage.getItem('key2');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(AsyncStorage.clear).toHaveBeenCalled();
    });
  });

  describe('Batch Operations', () => {
    test('should handle multiGet correctly', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.setItem('key2', 'value2');

      const result = await AsyncStorage.multiGet(['key1', 'key2', 'key3']);

      expect(result).toEqual([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', null]
      ]);
    });

    test('should handle multiSet correctly', async () => {
      const pairs: [string, string][] = [
        ['key1', 'value1'],
        ['key2', 'value2']
      ];

      await AsyncStorage.multiSet(pairs);

      const value1 = await AsyncStorage.getItem('key1');
      const value2 = await AsyncStorage.getItem('key2');

      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
    });

    test('should handle multiRemove correctly', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.setItem('key2', 'value2');
      await AsyncStorage.setItem('key3', 'value3');

      await AsyncStorage.multiRemove(['key1', 'key2']);

      const value1 = await AsyncStorage.getItem('key1');
      const value2 = await AsyncStorage.getItem('key2');
      const value3 = await AsyncStorage.getItem('key3');

      expect(value1).toBeNull();
      expect(value2).toBeNull();
      expect(value3).toBe('value3');
    });

    test('should get all keys correctly', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.setItem('key2', 'value2');

      const keys = await AsyncStorage.getAllKeys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });
  });

  describe('Error Simulation', () => {
    test('should simulate getItem failure', async () => {
      mockAsyncStorage.__simulateFailure('Storage read error');

      await expect(AsyncStorage.getItem('test_key')).rejects.toThrow('Storage read error');
    });

    test('should simulate setItem failure', async () => {
      mockAsyncStorage.__simulateFailure('Storage write error');

      await expect(AsyncStorage.setItem('test_key', 'test_value')).rejects.toThrow('Storage write error');
    });

    test('should simulate removeItem failure', async () => {
      mockAsyncStorage.__simulateFailure('Storage remove error');

      await expect(AsyncStorage.removeItem('test_key')).rejects.toThrow('Storage remove error');
    });

    test('should simulate clear failure', async () => {
      mockAsyncStorage.__simulateFailure('Storage clear error');

      await expect(AsyncStorage.clear()).rejects.toThrow('Storage clear error');
    });

    test('should simulate getAllKeys failure', async () => {
      mockAsyncStorage.__simulateFailure('Storage keys error');

      await expect(AsyncStorage.getAllKeys()).rejects.toThrow('Storage keys error');
    });

    test('should simulate multiGet failure', async () => {
      mockAsyncStorage.__simulateFailure('Storage multi-get error');

      await expect(AsyncStorage.multiGet(['key1', 'key2'])).rejects.toThrow('Storage multi-get error');
    });

    test('should simulate multiSet failure', async () => {
      mockAsyncStorage.__simulateFailure('Storage multi-set error');

      await expect(AsyncStorage.multiSet([['key1', 'value1']])).rejects.toThrow('Storage multi-set error');
    });

    test('should simulate multiRemove failure', async () => {
      mockAsyncStorage.__simulateFailure('Storage multi-remove error');

      await expect(AsyncStorage.multiRemove(['key1'])).rejects.toThrow('Storage multi-remove error');
    });
  });

  describe('Test Utilities', () => {
    test('should provide access to internal store state', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.setItem('key2', 'value2');

      const store = mockAsyncStorage.__getStore();

      expect(store).toEqual({
        key1: 'value1',
        key2: 'value2'
      });
    });

    test('should allow setting store state directly', async () => {
      mockAsyncStorage.__setStore({
        key1: 'value1',
        key2: 'value2'
      });

      const value1 = await AsyncStorage.getItem('key1');
      const value2 = await AsyncStorage.getItem('key2');

      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
    });

    test('should allow clearing store state directly', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      mockAsyncStorage.__clearStore();

      const value1 = await AsyncStorage.getItem('key1');
      expect(value1).toBeNull();
    });

    test('should reset mock call counts', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.getItem('key1');

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);

      mockAsyncStorage.__resetMocks();

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(0);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(0);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle JSON data persistence', async () => {
      const testData = {
        id: 'test-id',
        name: 'Test Object',
        data: [1, 2, 3]
      };

      await AsyncStorage.setItem('json_data', JSON.stringify(testData));
      const retrieved = await AsyncStorage.getItem('json_data');
      const parsedData = JSON.parse(retrieved!);

      expect(parsedData).toEqual(testData);
    });

    test('should handle concurrent operations', async () => {
      const operations = [
        AsyncStorage.setItem('key1', 'value1'),
        AsyncStorage.setItem('key2', 'value2'),
        AsyncStorage.setItem('key3', 'value3')
      ];

      await Promise.all(operations);

      const values = await Promise.all([
        AsyncStorage.getItem('key1'),
        AsyncStorage.getItem('key2'),
        AsyncStorage.getItem('key3')
      ]);

      expect(values).toEqual(['value1', 'value2', 'value3']);
    });

    test('should handle large data sets', async () => {
      const largeObject = {
        array: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item_${i}` })),
        metadata: {
          count: 1000,
          timestamp: Date.now()
        }
      };

      const jsonString = JSON.stringify(largeObject);
      await AsyncStorage.setItem('large_data', jsonString);
      const retrieved = await AsyncStorage.getItem('large_data');
      const parsed = JSON.parse(retrieved!);

      expect(parsed.array).toHaveLength(1000);
      expect(parsed.metadata.count).toBe(1000);
    });
  });
}); 