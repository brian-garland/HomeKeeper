import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { TaskStackParamList } from './types';
import { TasksScreen } from '../screens/TasksScreen';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';

const Stack = createStackNavigator<TaskStackParamList>();

export const TaskStackNavigator: React.FC = () => {
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
        name="TasksList" 
        component={TasksScreen}
        options={{
          headerShown: false, // Tab navigator handles the header
        }}
      />
      <Stack.Screen 
        name="AddTask" 
        component={AddTaskScreen}
        options={{
          title: 'Add Task',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{
          title: 'Task Details',
        }}
      />
    </Stack.Navigator>
  );
}; 