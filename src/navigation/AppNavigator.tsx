import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MagicalOnboardingScreen } from '../screens/MagicalOnboardingScreen';
import { TabNavigator } from './TabNavigator';

export default function AppNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      setIsFirstLaunch(hasCompletedOnboarding === null);
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(true); // Default to showing onboarding if there's an error
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      // Still proceed to main app even if saving fails
      setIsFirstLaunch(false);
    }
  };

  // Show loading state while checking first launch
  if (isFirstLaunch === null) {
    return null; // Or a loading screen
  }

  return isFirstLaunch ? (
    <MagicalOnboardingScreen onComplete={handleOnboardingComplete} />
  ) : (
    <TabNavigator />
  );
} 