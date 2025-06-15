/**
 * HomeKeeper App - Revolutionary Home Maintenance  
 * Week 3 Day 1: Design System Demonstration
 * Beta Testing - Automated Updates Active! 🚀
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { DataProvider } from './src/contexts/DataContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme/colors';

export default function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor={Colors.white} />
          <AppNavigator />
        </NavigationContainer>
      </DataProvider>
    </ErrorBoundary>
  );
}
