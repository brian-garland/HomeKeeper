import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MagicalOnboardingScreen } from '../screens/MagicalOnboardingScreen';
import { QuickStartScreen } from '../screens/QuickStartScreen';
import { TabNavigator } from './TabNavigator';
import { isFeatureEnabled } from '../config/featureFlags';

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
    console.log('AppNavigator: handleOnboardingComplete called');
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      console.log('AppNavigator: Setting isFirstLaunch to false');
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

  // Determine which onboarding flow to use
  if (isFirstLaunch) {
    if (isFeatureEnabled('useProgressiveOnboarding')) {
      return <QuickStartScreen onComplete={handleOnboardingComplete} />;
    } else {
      return <MagicalOnboardingScreen onComplete={handleOnboardingComplete} />;
    }
  }
  
  return <TabNavigator />;
} 