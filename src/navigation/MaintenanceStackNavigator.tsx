import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { MaintenanceStackParamList } from './types';
import { MaintenanceScreen } from '../screens/MaintenanceScreen';
import { AddMaintenanceScreen } from '../screens/AddMaintenanceScreen';

const Stack = createStackNavigator<MaintenanceStackParamList>();

export const MaintenanceStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.white,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontFamily: Typography.titleLarge.fontFamily,
          fontSize: Typography.titleLarge.fontSize,
          color: Colors.textPrimary,
        },
        headerTintColor: Colors.primary,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen 
        name="MaintenanceList" 
        component={MaintenanceScreen}
        options={{
          headerShown: false, // Tab navigator handles the header
        }}
      />
      <Stack.Screen 
        name="AddMaintenance" 
        component={AddMaintenanceScreen}
        options={{
          title: 'Schedule Maintenance',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}; 