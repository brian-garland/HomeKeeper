import { testClient } from '../setup';
import { createTestUser, createTestHome, createTestEquipment } from '../utils/testUtils';

describe('Real-time Subscription Tests', () => {
  let testUser: any;
  let testHome: any;
  let testEquipment: any;

  beforeAll(async () => {
    testUser = await createTestUser();
    testHome = await createTestHome(testUser.id);
    testEquipment = await createTestEquipment(testHome.id);
  });

  describe('Tasks Subscription', () => {
    test('receives real-time updates for task changes', async () => {
      return new Promise<void>(async (resolve) => {
        // Subscribe to task changes
        const channel = testClient
          .channel('tasks')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'tasks' },
            (payload) => {
              expect(payload).toHaveProperty('new');
              expect(payload).toHaveProperty('old');
              expect(payload).toHaveProperty('eventType');
              channel.unsubscribe();
              resolve();
            }
          )
          .subscribe();

        // Create a new task to trigger the subscription
        const { error } = await testClient
          .from('tasks')
          .insert([{
            home_id: testHome.id,
            equipment_id: testEquipment.id,
            title: 'Test Task',
            description: 'Test Description',
            category: 'general',
            status: 'pending',
            priority: 3,
            due_date: new Date().toISOString().split('T')[0]
          }]);

        expect(error).toBeNull();
      });
    });

    test('receives real-time updates for task status changes', async () => {
      return new Promise<void>(async (resolve) => {
        // Create a test task first
        const { data: task, error: createError } = await testClient
          .from('tasks')
          .insert([{
            home_id: testHome.id,
            equipment_id: testEquipment.id,
            title: 'Status Test Task',
            description: 'Test Description',
            category: 'general',
            status: 'pending',
            priority: 3,
            due_date: new Date().toISOString().split('T')[0]
          }])
          .select()
          .single();

        expect(createError).toBeNull();
        expect(task).not.toBeNull();

        // Subscribe to task changes
        const channel = testClient
          .channel('tasks')
          .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'tasks' },
            (payload) => {
              expect(payload.new.status).toBe('completed');
              expect(payload.old.status).toBe('pending');
              channel.unsubscribe();
              resolve();
            }
          )
          .subscribe();

        // Update the task status
        const { error: updateError } = await testClient
          .from('tasks')
          .update({ status: 'completed' })
          .eq('id', task.id);

        expect(updateError).toBeNull();
      });
    });
  });

  describe('Equipment Subscription', () => {
    test('receives real-time updates for equipment changes', async () => {
      return new Promise<void>(async (resolve) => {
        // Subscribe to equipment changes
        const channel = testClient
          .channel('equipment')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'equipment' },
            (payload) => {
              expect(payload).toHaveProperty('new');
              expect(payload).toHaveProperty('old');
              expect(payload).toHaveProperty('eventType');
              channel.unsubscribe();
              resolve();
            }
          )
          .subscribe();

        // Create new equipment to trigger the subscription
        const { error } = await testClient
          .from('equipment')
          .insert([{
            home_id: testHome.id,
            name: 'Test Equipment',
            category: 'hvac',
            type: 'Test Type',
            model: 'Test Model',
            serial_number: `TEST-${Date.now()}`
          }]);

        expect(error).toBeNull();
      });
    });
  });

  describe('Homes Subscription', () => {
    test('receives real-time updates for home changes', async () => {
      return new Promise<void>(async (resolve) => {
        // Subscribe to home changes
        const channel = testClient
          .channel('homes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'homes' },
            (payload) => {
              expect(payload).toHaveProperty('new');
              expect(payload).toHaveProperty('old');
              expect(payload).toHaveProperty('eventType');
              channel.unsubscribe();
              resolve();
            }
          )
          .subscribe();

        // Update home to trigger the subscription
        const { error } = await testClient
          .from('homes')
          .update({ address: 'Updated Test Address' })
          .eq('id', testHome.id);

        expect(error).toBeNull();
      });
    });
  });
}); 