import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database, Json } from '../types/database.types';

type Home = Database['public']['Tables']['homes']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Equipment = Database['public']['Tables']['equipment']['Row'];
type Maintenance = Database['public']['Tables']['maintenance']['Row'];

interface DashboardStats {
  homeCount: number;
  activeTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

interface UseSupabaseReturn {
  // Data
  homes: Home[];
  tasks: Task[];
  equipment: Equipment[];
  maintenance: Maintenance[];
  dashboardStats: DashboardStats;
  
  // Loading states
  loading: boolean;
  
  // Error states
  error: string | null;
  
  // Development mode indicator
  isDevelopmentMode: boolean;
  
  // Actions
  refresh: () => Promise<void>;
  addTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addMaintenance: (maintenanceData: Partial<Maintenance>) => Promise<void>;
  updateMaintenance: (id: string, updates: Partial<Maintenance>) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;
}

// Mock data for development mode
const MOCK_DASHBOARD_STATS: DashboardStats = {
  homeCount: 1,
  activeTasks: 3,
  overdueTasks: 1,
  completedTasks: 12,
};

const MOCK_HOMES: Home[] = [
  {
    id: 'demo-home-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'demo-user',
    name: 'My Home',
    address: '123 Demo Street',
    city: 'Demo City',
    state: 'DC',
    zip_code: '12345',
    country: 'USA',
    home_type: 'single_family',
    year_built: 2010,
    square_footage: 2500,
    bedrooms: 3,
    bathrooms: 2,
    lot_size: 0.25,
    floors: 2,
    heating_type: 'gas',
    cooling_type: 'central_air',
    water_heater_type: 'gas',
    latitude: null,
    longitude: null,
    location: null,
    maintenance_season_start: null,
    high_maintenance_mode: null,
    active: true,
    notes: null,
    photo_url: null
  }
];

const MOCK_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_id: 'demo-home-1',
    equipment_id: null,
    template_id: null,
    title: 'Clean HVAC Filter',
    description: 'Replace or clean the HVAC air filter',
    category: 'hvac',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, // 7 days from now
    priority: 2, // medium priority (1-3 scale)
    estimated_duration_minutes: 15,
    difficulty_level: 1, // easy (1-3 scale)
    instructions: ['Turn off HVAC system', 'Locate filter compartment', 'Remove old filter', 'Install new filter'] as Json,
    status: 'pending',
    completed_at: null,
    completed_by: null,
    auto_generated: false,
    reschedule_count: 0,
    weather_dependent: false,
    notes: null,
    tags: ['hvac', 'filter']
  },
  {
    id: 'demo-task-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_id: 'demo-home-1',
    equipment_id: null,
    template_id: null,
    title: 'Test Smoke Detectors',
    description: 'Test all smoke detectors and replace batteries if needed',
    category: 'safety',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, // 2 days ago (overdue)
    priority: 3, // high priority
    estimated_duration_minutes: 30,
    difficulty_level: 1, // easy
    instructions: ['Press test button on each detector', 'Replace batteries if beeping', 'Record test date'] as Json,
    status: 'pending',
    completed_at: null,
    completed_by: null,
    auto_generated: false,
    reschedule_count: 0,
    weather_dependent: false,
    notes: null,
    tags: ['safety', 'smoke-detector']
  },
  {
    id: 'demo-task-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_id: 'demo-home-1',
    equipment_id: null,
    template_id: null,
    title: 'Inspect Gutters',
    description: 'Check gutters for clogs and damage',
    category: 'exterior',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, // 14 days from now
    priority: 2, // medium priority
    estimated_duration_minutes: 45,
    difficulty_level: 2, // medium
    instructions: ['Set up ladder safely', 'Check for clogs', 'Look for damage', 'Clear debris'] as Json,
    status: 'pending',
    completed_at: null,
    completed_by: null,
    auto_generated: false,
    reschedule_count: 0,
    weather_dependent: true,
    notes: null,
    tags: ['exterior', 'gutters']
  }
];

const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'demo-equipment-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_id: 'demo-home-1',
    name: 'Main HVAC System',
    category: 'hvac',
    type: 'central_air',
    brand: 'Carrier',
    model: 'Infinity 19VS',
    serial_number: 'DEMO123456',
    purchase_date: '2020-05-15',
    install_date: '2020-05-20',
    warranty_expires: '2025-05-15',
    specifications: {
      capacity: '3 ton',
      efficiency: '19 SEER',
      fuel_type: 'electric'
    } as Json,
    location: 'Basement',
    room: null,
    maintenance_frequency_months: 3,
    last_service_date: null,
    next_service_due: null,
    photo_urls: null,
    manual_url: null,
    notes: 'Demo HVAC system for development',
    active: true,
    needs_attention: false
  }
];

const MOCK_MAINTENANCE: Maintenance[] = [
  {
    id: 'demo-maintenance-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_id: 'demo-home-1',
    equipment_id: null,
    title: 'HVAC System Service',
    description: 'Annual HVAC system maintenance and inspection',
    category: 'hvac',
    status: 'scheduled',
    scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
    completed_date: null,
    estimated_cost: 150,
    actual_cost: null,
    vendor_name: 'ABC HVAC Services',
    vendor_contact: null,
    vendor_rating: null,
    maintenance_type: null,
    priority: 2,
    recurring: false,
    recurring_frequency_months: null,
    next_due_date: null,
    warranty_work: false,
    notes: null,
    photo_urls: null,
    receipt_urls: null,
    active: true
  },
  {
    id: 'demo-maintenance-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_id: 'demo-home-1',
    equipment_id: null,
    title: 'Plumbing Inspection',
    description: 'Check all faucets, pipes, and water pressure',
    category: 'plumbing',
    status: 'completed',
    scheduled_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
    completed_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
    estimated_cost: 85,
    actual_cost: 85,
    vendor_name: 'Pro Plumbing Co',
    vendor_contact: null,
    vendor_rating: 4,
    maintenance_type: null,
    priority: 2,
    recurring: false,
    recurring_frequency_months: null,
    next_due_date: null,
    warranty_work: false,
    notes: null,
    photo_urls: null,
    receipt_urls: null,
    active: true
  },
  {
    id: 'demo-maintenance-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_id: 'demo-home-1',
    equipment_id: null,
    title: 'Electrical Panel Check',
    description: 'Inspect electrical panel and test GFCI outlets',
    category: 'electrical',
    status: 'overdue',
    scheduled_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
    completed_date: null,
    estimated_cost: 120,
    actual_cost: null,
    vendor_name: 'Elite Electric',
    vendor_contact: null,
    vendor_rating: null,
    maintenance_type: null,
    priority: 3,
    recurring: false,
    recurring_frequency_months: null,
    next_due_date: null,
    warranty_work: false,
    notes: null,
    photo_urls: null,
    receipt_urls: null,
    active: true
  }
];

// Global state to share between components - start clean for MVP
let globalTasks: Task[] = [];
let globalMaintenance: Maintenance[] = [];
let globalHomes: Home[] = [];
let globalEquipment: Equipment[] = [];

// Global state update callbacks
let globalStateCallbacks: (() => void)[] = [];

// Function to notify all hook instances of state changes
const notifyGlobalStateChange = () => {
  // Use setTimeout to avoid updating components during render
  setTimeout(() => {
    globalStateCallbacks.forEach(callback => callback());
  }, 0);
};

export const useSupabase = (): UseSupabaseReturn => {
  // Check if we're in development mode (using fallback config)
  const isDevelopmentMode = !process.env.SUPABASE_URL && !process.env.EXPO_PUBLIC_SUPABASE_URL;
  
  // State - initialize with global state
  const [homes, setHomes] = useState<Home[]>(globalHomes);
  const [tasks, setTasks] = useState<Task[]>(globalTasks);
  const [equipment, setEquipment] = useState<Equipment[]>(globalEquipment);
  const [maintenance, setMaintenance] = useState<Maintenance[]>(globalMaintenance);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    homeCount: 0,
    activeTasks: 0,
    overdueTasks: 0,
    completedTasks: 0,
  });
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Register this hook instance for global state updates
  useEffect(() => {
    const updateLocalState = () => {
      console.log('updateLocalState called - globalTasks length:', globalTasks.length);
      setTasks([...globalTasks]);
      setHomes([...globalHomes]);
      setEquipment([...globalEquipment]);
      setMaintenance([...globalMaintenance]);
    };

    globalStateCallbacks.push(updateLocalState);

    return () => {
      globalStateCallbacks = globalStateCallbacks.filter(cb => cb !== updateLocalState);
    };
  }, []);

  // Fetch Homes
  const fetchHomes = async () => {
    if (isDevelopmentMode) {
      // For MVP: In development mode, preserve existing homes during refresh
      setHomes([...globalHomes]);
      return;
    }
    
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('homes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setHomes(data || []);
    } catch (err) {
      console.error('Error fetching homes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch homes');
    }
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    if (isDevelopmentMode) {
      // For MVP: In development mode, preserve existing tasks during refresh
      // Don't reset to empty - keep whatever tasks the user has created
      console.log('fetchTasks called - globalTasks length:', globalTasks.length);
      console.log('fetchTasks - setting tasks to:', globalTasks.map(t => t.title));
      setTasks([...globalTasks]);
      return;
    }
    
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          homes (
            id,
            name,
            address
          )
        `)
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;
      
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    }
  };

  // Fetch Equipment
  const fetchEquipment = async () => {
    if (isDevelopmentMode) {
      // For MVP: In development mode, preserve existing equipment during refresh
      setEquipment([...globalEquipment]);
      return;
    }
    
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('equipment')
        .select(`
          *,
          homes (
            id,
            name,
            address
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setEquipment(data || []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch equipment');
    }
  };

  // Fetch Maintenance
  const fetchMaintenance = async () => {
    if (isDevelopmentMode) {
      // For MVP: In development mode, preserve existing maintenance during refresh
      setMaintenance([...globalMaintenance]);
      return;
    }
    
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('maintenance')
        .select(`
          *,
          homes (
            id,
            name,
            address
          ),
          equipment (
            id,
            name,
            category
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (fetchError) throw fetchError;
      
      setMaintenance(data || []);
    } catch (err) {
      console.error('Error fetching maintenance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance');
      // Fallback to mock data if database query fails
      setMaintenance(MOCK_MAINTENANCE);
    }
  };

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    if (isDevelopmentMode) {
      // For MVP: Calculate stats from actual user data
      const activeTasks = globalTasks.filter(task => task.status === 'pending').length;
      const overdueTasks = globalTasks.filter(task => 
        task.status === 'pending' && 
        task.due_date && 
        new Date(task.due_date) < new Date()
      ).length;
      const completedTasks = globalTasks.filter(task => task.status === 'completed').length;
      
      setDashboardStats({
        homeCount: globalHomes.length,
        activeTasks,
        overdueTasks,
        completedTasks,
      });
      return;
    }
    
    try {
      setError(null);
      
      // Get home count
      const { count: homeCount } = await supabase
        .from('homes')
        .select('*', { count: 'exact', head: true });

      // Get active tasks count
      const { count: activeTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get overdue tasks count
      const today = new Date().toISOString().split('T')[0];
      const { count: overdueTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('due_date', today);

      // Get completed tasks count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: completedTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', thirtyDaysAgo.toISOString());

      setDashboardStats({
        homeCount: homeCount || 0,
        activeTasks: activeTasks || 0,
        overdueTasks: overdueTasks || 0,
        completedTasks: completedTasks || 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    }
  };

  // Refresh all data
  const refresh = async () => {
    console.log('refresh() called - globalTasks before:', globalTasks.length);
    setLoading(true);
    try {
      await Promise.all([
        fetchHomes(),
        fetchTasks(),
        fetchEquipment(),
        fetchMaintenance(),
        fetchDashboardStats(),
      ]);
      console.log('refresh() completed - globalTasks after:', globalTasks.length);
    } finally {
      setLoading(false);
    }
  };

  // Add Task
  const addTask = async (taskData: Partial<Task>) => {
    // Always use development mode for now since we don't have auth set up
    if (true || isDevelopmentMode) {
      // In development mode, just add to local state
      const newTask: Task = {
        id: `demo-task-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        home_id: taskData.home_id || 'demo-home-1',
        equipment_id: null,
        template_id: null,
        title: taskData.title || '',
        description: taskData.description || '',
        category: taskData.category || 'general',
        due_date: taskData.due_date || new Date().toISOString().split('T')[0]!,
        priority: taskData.priority || 2,
        estimated_duration_minutes: taskData.estimated_duration_minutes || 30,
        difficulty_level: taskData.difficulty_level || 1,
        instructions: null,
        status: 'pending',
        completed_at: null,
        completed_by: null,
        auto_generated: false,
        reschedule_count: 0,
        weather_dependent: false,
        notes: null,
        tags: []
      };
      setTasks(prev => {
        console.log('addTask - prev tasks length:', prev.length);
        const updatedTasks = [newTask, ...prev];
        console.log('addTask - new tasks length:', updatedTasks.length);
        console.log('addTask - task titles:', updatedTasks.map(t => t.title));
        
        // Update global state so other components can see it
        globalTasks = updatedTasks;
        console.log('addTask - globalTasks updated to length:', globalTasks.length);
        
        // Notify other hook instances
        notifyGlobalStateChange();
        
        return updatedTasks;
      });
      
      // Recalculate dashboard stats after adding task
      await fetchDashboardStats();
      return;
    }

    try {
      setError(null);
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(taskData as any);

      if (insertError) throw insertError;
      
      // Refresh tasks to get the new one
      await fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err instanceof Error ? err.message : 'Failed to add task');
      throw err;
    }
  };

  // Update Task
  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (true || isDevelopmentMode) {
      setTasks(prev => {
        const updatedTasks = prev.map(task => 
          task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
        );
        
        // Update global state so other components can see the change
        globalTasks = updatedTasks;
        
        // Notify other hook instances
        notifyGlobalStateChange();
        
        return updatedTasks;
      });
      
      // Recalculate dashboard stats after task update
      await fetchDashboardStats();
      return;
    }

    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Refresh tasks to get the updated one
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  // Delete Task
  const deleteTask = async (id: string) => {
    if (isDevelopmentMode) {
      setTasks(prev => {
        const updatedTasks = prev.filter(task => task.id !== id);
        
        // Update global state so other components can see the change
        globalTasks = updatedTasks;
        
        // Notify other hook instances
        notifyGlobalStateChange();
        
        return updatedTasks;
      });
      
      // Recalculate dashboard stats after task deletion
      await fetchDashboardStats();
      return;
    }

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Refresh tasks to remove the deleted one
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  // Add Maintenance
  const addMaintenance = async (maintenanceData: Partial<Maintenance>) => {
    // Always use development mode for now since we don't have auth set up
    if (true || isDevelopmentMode) {
      const newMaintenance: Maintenance = {
        id: `demo-maintenance-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        home_id: maintenanceData.home_id || 'demo-home-1',
        equipment_id: null,
        title: maintenanceData.title || '',
        description: maintenanceData.description || '',
        category: maintenanceData.category || 'general',
        status: 'scheduled',
        scheduled_date: maintenanceData.scheduled_date || new Date().toISOString().split('T')[0]!,
        completed_date: null,
        estimated_cost: maintenanceData.estimated_cost || null,
        actual_cost: null,
        vendor_name: maintenanceData.vendor_name || null,
        vendor_contact: null,
        notes: null,
        photo_urls: null,
        receipt_urls: null,
        warranty_work: null,
        active: true,
        maintenance_type: null,
        next_due_date: null,
        priority: 2,
        recurring_frequency_months: null,

      };
      setMaintenance(prev => [newMaintenance, ...prev]);
      return;
    }

    try {
      setError(null);
      const { error: insertError } = await supabase
        .from('maintenance')
        .insert(maintenanceData as any);

      if (insertError) throw insertError;
      
      await fetchMaintenance();
    } catch (err) {
      console.error('Error adding maintenance:', err);
      setError(err instanceof Error ? err.message : 'Failed to add maintenance');
      throw err;
    }
  };

  // Update Maintenance
  const updateMaintenance = async (id: string, updates: Partial<Maintenance>) => {
    if (isDevelopmentMode) {
      setMaintenance(prev => prev.map(maintenance => 
        maintenance.id === id ? { ...maintenance, ...updates, updated_at: new Date().toISOString() } : maintenance
      ));
      return;
    }

    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('maintenance')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      
      await fetchMaintenance();
    } catch (err) {
      console.error('Error updating maintenance:', err);
      setError(err instanceof Error ? err.message : 'Failed to update maintenance');
      throw err;
    }
  };

  // Delete Maintenance
  const deleteMaintenance = async (id: string) => {
    if (isDevelopmentMode) {
      setMaintenance(prev => prev.filter(maintenance => maintenance.id !== id));
      return;
    }

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('maintenance')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      await fetchMaintenance();
    } catch (err) {
      console.error('Error deleting maintenance:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete maintenance');
      throw err;
    }
  };

  // Initial data fetch - Removed automatic refresh to prevent state reset
  // useEffect(() => {
  //   refresh();
  // }, []);

  return {
    // Data
    homes,
    tasks,
    equipment,
    maintenance,
    dashboardStats,
    
    // Loading state
    loading,
    
    // Error state
    error,
    
    // Development mode indicator
    isDevelopmentMode,
    
    // Actions
    refresh,
    addTask,
    updateTask,
    deleteTask,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
  };
}; 