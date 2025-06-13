export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  Properties: undefined;
  PropertyDetail: { propertyId: string };
  Tasks: undefined;
  TaskDetail: { taskId: string };
  CreateTask: { propertyId?: string };
  Maintenance: undefined;
  MaintenanceDetail: { maintenanceId: string };
  CreateMaintenance: { propertyId?: string };
  Profile: undefined;
  Settings: undefined;
  Auth: undefined;
  Onboarding: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Properties: undefined;
  Tasks: undefined;
  Maintenance: undefined;
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
  TasksList: { filter?: 'all' | 'pending' | 'overdue' | 'completed' };
  AddTask: undefined;
  TaskDetail: { task: any };
};

export type MaintenanceStackParamList = {
  MaintenanceList: undefined;
  AddMaintenance: undefined;
  MaintenanceDetail: { maintenance: any };
}; 