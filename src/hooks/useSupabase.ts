import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database, Json } from '../types/database.types';

type Home = Database['public']['Tables']['homes']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Equipment = Database['public']['Tables']['equipment']['Row'];

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
  dashboardStats: DashboardStats;
  
  // Loading states
  loading: boolean;
  
  // Error states
  error: string | null;
  
  // Development mode indicator
  isDevelopmentMode: boolean;
  
  // Actions
  refresh: () => Promise<void>;
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
    stories: 2,
    garage_spaces: 2,
    hvac_type: 'gas',
    roof_type: 'asphalt_shingle',
    foundation_type: 'concrete_slab',
    siding_type: 'vinyl'
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

export const useSupabase = (): UseSupabaseReturn => {
  // Check if we're in development mode (using fallback config)
  const isDevelopmentMode = !process.env.SUPABASE_URL && !process.env.EXPO_PUBLIC_SUPABASE_URL;
  
  // State
  const [homes, setHomes] = useState<Home[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
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

  // Fetch Homes
  const fetchHomes = async () => {
    if (isDevelopmentMode) {
      setHomes(MOCK_HOMES);
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
      setTasks(MOCK_TASKS);
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
      setEquipment(MOCK_EQUIPMENT);
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

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    if (isDevelopmentMode) {
      setDashboardStats(MOCK_DASHBOARD_STATS);
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
    setLoading(true);
    try {
      await Promise.all([
        fetchHomes(),
        fetchTasks(),
        fetchEquipment(),
        fetchDashboardStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    refresh();
  }, []);

  return {
    // Data
    homes,
    tasks,
    equipment,
    dashboardStats,
    
    // Loading state
    loading,
    
    // Error state
    error,
    
    // Development mode indicator
    isDevelopmentMode,
    
    // Actions
    refresh,
  };
}; 