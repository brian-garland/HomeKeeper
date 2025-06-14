import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { PrimaryButton } from '../components/buttons/PrimaryButton';
import { SecondaryButton } from '../components/buttons/SecondaryButton';
import { Icon } from '../components/icons/Icon';
import DebugScreen from './DebugScreen';

export const ProfileScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will clear your onboarding status and show the welcome flow again when you restart the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await AsyncStorage.removeItem('hasLaunched');
              Alert.alert('Success', 'Onboarding has been reset. Restart the app to see the welcome flow.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset onboarding.');
            }
            setIsLoading(false);
          },
        },
      ]
    );
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: 'user', label: 'Personal Information', action: () => Alert.alert('Coming Soon', 'Personal information settings') },
        { icon: 'settings', label: 'Preferences', action: () => Alert.alert('Coming Soon', 'Preference settings') },
        { icon: 'reminder', label: 'Notifications', action: () => Alert.alert('Coming Soon', 'Notification settings') },
      ],
    },
    {
      title: 'Home Management',
      items: [
        { icon: 'home', label: 'My Properties', action: () => Alert.alert('Coming Soon', 'Property management') },
        { icon: 'users', label: 'Family Members', action: () => Alert.alert('Coming Soon', 'Family member management') },
        { icon: 'contact', label: 'Service Providers', action: () => Alert.alert('Coming Soon', 'Service provider contacts') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help', label: 'Help & FAQ', action: () => Alert.alert('Coming Soon', 'Help documentation') },
        { icon: 'email', label: 'Contact Support', action: () => Alert.alert('Coming Soon', 'Contact support') },
        { icon: 'share', label: 'Share HomeKeeper', action: () => Alert.alert('Coming Soon', 'Share with friends') },
      ],
    },
    {
      title: 'Development',
      items: [
        { icon: 'settings', label: 'Reset Onboarding', action: handleResetOnboarding },
        { icon: 'bug', label: 'Debug Screen', action: () => setShowDebug(true) },
      ],
    },
  ];

  if (showDebug) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <SecondaryButton
            title="← Back"
            onPress={() => setShowDebug(false)}
            style={{ marginRight: 16 }}
          />
          <Text style={Typography.titleLarge}>Debug Screen</Text>
        </View>
        <DebugScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Icon name="user" size="xl" color={Colors.primary} />
          </View>
          <Text style={styles.userName}>HomeKeeper User</Text>
          <Text style={styles.userEmail}>user@homekeeper.app</Text>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={item.label} style={styles.menuItem}>
                                     <SecondaryButton
                     title={item.label}
                     onPress={item.action}
                     style={styles.menuButton}
                   />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>HomeKeeper v1.0.0</Text>
          <Text style={styles.appInfoText}>Week 3 Development Build</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.titleLarge,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  
  // Section Styles
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    color: Colors.textSecondary,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuButton: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  // App Info Styles
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  appInfoText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
}); 