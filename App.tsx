/**
 * HomeKeeper App - Revolutionary Home Maintenance
 * Week 3 Day 1: Design System Demonstration
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/theme/colors';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={Colors.white} />
      <AppNavigator />
    </NavigationContainer>
  );
}
