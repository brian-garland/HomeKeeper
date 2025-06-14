import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '../types/database.types';

type Home = Database['public']['Tables']['homes']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Equipment = Database['public']['Tables']['equipment']['Row'];
type Maintenance = Database['public']['Tables']['maintenance']['Row'];

interface DataContextType {
  // Data
  homes: Home[];
  tasks: Task[];
  equipment: Equipment[];
  maintenance: Maintenance[];
  
  // Actions
  setHomes: (homes: Home[]) => void;
  setTasks: (tasks: Task[]) => void;
  setEquipment: (equipment: Equipment[]) => void;
  setMaintenance: (maintenance: Maintenance[]) => void;
  
  // Task operations
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Equipment operations
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  
  // Maintenance operations
  addMaintenance: (maintenance: Maintenance) => void;
  updateMaintenance: (id: string, updates: Partial<Maintenance>) => void;
  deleteMaintenance: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

// Storage keys
const STORAGE_KEYS = {
  HOMES: 'homekeeper_homes',
  TASKS: 'homekeeper_tasks',
  EQUIPMENT: 'homekeeper_equipment',
  MAINTENANCE: 'homekeeper_maintenance',
};

// Storage helper functions
const saveToStorage = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
  }
};

const loadFromStorage = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error);
    return [];
  }
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [homes, setHomes] = useState<Home[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);

  // Load data from storage on app start
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const [savedHomes, savedTasks, savedEquipment, savedMaintenance] = await Promise.all([
      loadFromStorage(STORAGE_KEYS.HOMES),
      loadFromStorage(STORAGE_KEYS.TASKS),
      loadFromStorage(STORAGE_KEYS.EQUIPMENT),
      loadFromStorage(STORAGE_KEYS.MAINTENANCE),
    ]);

    // Always check for local home from onboarding first
    let homesToSet = [];
    try {
      const localHomeData = await AsyncStorage.getItem('homekeeper_local_home');
      if (localHomeData) {
        const localHome = JSON.parse(localHomeData);
        homesToSet = [localHome];
        console.log('📍 DataContext loaded local home with coordinates:', localHome.latitude, localHome.longitude);
      } else if (savedHomes.length > 0) {
        // Use saved homes if no local home
        homesToSet = savedHomes;
        console.log('📍 DataContext loaded saved homes:', savedHomes.length);
      } else {
        // Create default home only as last resort
        homesToSet = [{
          id: 'default-home',
          name: 'My Home',
          address: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'default-user'
        }];
        console.log('📍 DataContext created default home (no local or saved homes found)');
      }
    } catch (error) {
      console.error('Failed to load local home:', error);
      homesToSet = savedHomes.length > 0 ? savedHomes : [{
        id: 'default-home',
        name: 'My Home',
        address: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'default-user'
      }];
    }

    setHomes(homesToSet);
    setTasks(savedTasks);
    
    // For equipment, if no saved equipment and we have homes, try to populate some default equipment
    if (savedEquipment.length === 0 && homesToSet.length > 0) {
      console.log('📦 DataContext: No saved equipment found, checking for default equipment data...');
      // For now, just set empty array - equipment will be added through the UI
      setEquipment([]);
    } else {
      console.log('📦 DataContext: Loading saved equipment:', savedEquipment.length);
      setEquipment(savedEquipment);
    }
    
    setMaintenance(savedMaintenance);

    // Save the home data if it was created
    if (savedHomes.length === 0 && homesToSet.length > 0 && homesToSet[0].id === 'default-home') {
      saveToStorage(STORAGE_KEYS.HOMES, homesToSet);
    }
  };

  // Task operations
  const addTask = (task: Task) => {
    const newTasks = [task, ...tasks];
    setTasks(newTasks);
    saveToStorage(STORAGE_KEYS.TASKS, newTasks);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    console.log('DataContext updateTask called with id:', id, 'updates:', updates);
    const newTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
    );
    console.log('Updated tasks array length:', newTasks.length);
    setTasks(newTasks);
    saveToStorage(STORAGE_KEYS.TASKS, newTasks);
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
    saveToStorage(STORAGE_KEYS.TASKS, newTasks);
  };

  // Maintenance operations
  const addMaintenance = (maintenanceItem: Maintenance) => {
    console.log('DataContext addMaintenance called with:', maintenanceItem.title);
    const newMaintenance = [maintenanceItem, ...maintenance];
    console.log('New maintenance array length:', newMaintenance.length);
    setMaintenance(newMaintenance);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, newMaintenance);
  };

  const updateMaintenance = (id: string, updates: Partial<Maintenance>) => {
    const newMaintenance = maintenance.map(item => 
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    setMaintenance(newMaintenance);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, newMaintenance);
  };

  const deleteMaintenance = (id: string) => {
    const newMaintenance = maintenance.filter(item => item.id !== id);
    setMaintenance(newMaintenance);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, newMaintenance);
  };

  // Equipment operations
  const addEquipment = (equipmentItem: Equipment) => {
    console.log('DataContext addEquipment called with:', equipmentItem.name);
    const newEquipment = [equipmentItem, ...equipment];
    console.log('New equipment array length:', newEquipment.length);
    setEquipment(newEquipment);
    saveToStorage(STORAGE_KEYS.EQUIPMENT, newEquipment);
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    const newEquipment = equipment.map(item => 
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    setEquipment(newEquipment);
    saveToStorage(STORAGE_KEYS.EQUIPMENT, newEquipment);
  };

  const deleteEquipment = (id: string) => {
    const newEquipment = equipment.filter(item => item.id !== id);
    setEquipment(newEquipment);
    saveToStorage(STORAGE_KEYS.EQUIPMENT, newEquipment);
  };

  const value: DataContextType = {
    // Data
    homes,
    tasks,
    equipment,
    maintenance,
    
    // Setters
    setHomes,
    setTasks,
    setEquipment,
    setMaintenance,
    
    // Task operations
    addTask,
    updateTask,
    deleteTask,
    
    // Equipment operations
    addEquipment,
    updateEquipment,
    deleteEquipment,
    
    // Maintenance operations
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 