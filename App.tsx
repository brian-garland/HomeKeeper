/**
 * HomeKeeper App - Revolutionary Home Maintenance  
 * Week 3 Day 1: Design System Demonstration
 * Beta Testing - Automated Updates Active! 🚀
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { DataProvider } from './src/contexts/DataContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme/colors';
import { useNotificationSetup } from './src/hooks/useNotificationSetup';

// Inner component to use hooks after providers are set up
function AppWithNotifications() {
  const { isInitialized, notificationsEnabled } = useNotificationSetup();
  
  React.useEffect(() => {
    if (isInitialized) {
      console.log('🔔 Notification system ready!', { notificationsEnabled });
    }
  }, [isInitialized, notificationsEnabled]);

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={Colors.white} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <DataProvider>
          <NotificationProvider>
            <AppWithNotifications />
          </NotificationProvider>
        </DataProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
