import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../components/icons/Icon';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { TabParamList } from './types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PropertiesScreen } from '../screens/PropertiesScreen';
import { TaskStackNavigator } from './TaskStackNavigator';
import { MaintenanceStackNavigator } from './MaintenanceStackNavigator';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Properties':
              iconName = 'properties';
              break;
            case 'Tasks':
              iconName = 'tasks';
              break;
            case 'Maintenance':
              iconName = 'maintenance';
              break;
            case 'Profile':
              iconName = 'profile';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: Spacing.xs,
          paddingBottom: Spacing.sm,
          height: 88,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.labelSmall.fontFamily,
          fontSize: Typography.labelSmall.fontSize,
          marginTop: Spacing.xs,
        },
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
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: 'HomeKeeper Dashboard'
        }}
      />
      <Tab.Screen 
        name="Properties" 
        component={PropertiesScreen}
        options={{
          title: 'Properties',
          headerTitle: 'My Properties'
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TaskStackNavigator}
        options={{
          title: 'Tasks',
          headerTitle: 'My Tasks'
        }}
      />
      <Tab.Screen 
        name="Maintenance" 
        component={MaintenanceStackNavigator}
        options={{
          title: 'Maintenance',
          headerTitle: 'Maintenance'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'My Profile'
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  title: {
    fontFamily: Typography.displayMedium.fontFamily,
    fontSize: Typography.displayMedium.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.bodyLarge.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
}); 