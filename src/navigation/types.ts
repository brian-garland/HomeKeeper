export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  Properties: undefined;
  PropertyDetail: { propertyId: string };
  Tasks: undefined;
  TaskDetail: { taskId: string };
  CreateTask: { propertyId?: string };
  Profile: undefined;
  Settings: undefined;
  Auth: undefined;
  Onboarding: undefined;
};

export type TabParamList = {
  Home: undefined;
  Tasks: undefined;
  Equipment: undefined;
  EquipmentDetail: { equipment: any };
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  PropertySetup: undefined;
  TaskPreferences: undefined;
  Complete: undefined;
};

export type TaskStackParamList = {
  TasksList: { 
    filter?: 'all' | 'pending' | 'overdue' | 'completed';
    equipmentFilter?: string;
    equipmentName?: string;
  };
  AddTask: undefined;
  TaskDetail: { task: any };
}; 