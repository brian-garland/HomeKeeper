import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { PrimaryButton } from '../components/buttons/PrimaryButton';
import { SecondaryButton } from '../components/buttons/SecondaryButton';
import { Icon } from '../components/icons/Icon';
import { TextInput } from '../components/inputs/TextInput';

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export const SimpleOnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [address, setAddress] = useState('');
  const [homeType, setHomeType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Simulate onboarding completion
    setTimeout(() => {
      setIsLoading(false);
      onComplete?.();
    }, 2000);
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Icon name="home" size="xl" color={Colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Welcome to HomeKeeper</Text>
        <Text style={styles.heroSubtitle}>
          Your home's personal maintenance assistant
        </Text>
      </View>
      
      <View style={styles.valueProposition}>
        <View style={styles.valueItem}>
          <Icon name="check" size="md" color={Colors.success} />
          <Text style={styles.valueText}>Know what maintenance you need</Text>
        </View>
        <View style={styles.valueItem}>
          <Icon name="clock" size="md" color={Colors.success} />
          <Text style={styles.valueText}>When you need to do it</Text>
        </View>
        <View style={styles.valueItem}>
          <Icon name="help" size="md" color={Colors.success} />
          <Text style={styles.valueText}>How to do it properly</Text>
        </View>
      </View>
      
      <PrimaryButton
        title="Get Started"
        onPress={handleNext}
        style={styles.button}
      />
    </View>
  );

  const renderAddressStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Where's your home?</Text>
        <Text style={styles.stepSubtitle}>
          We'll use this to provide local maintenance recommendations
        </Text>
      </View>
      
      <View style={styles.inputSection}>
        <TextInput
          placeholder="Enter your home address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />
        
        <View style={styles.privacyNote}>
          <Icon name="settings" size="sm" color={Colors.textSecondary} />
          <Text style={styles.privacyText}>
            Your address is kept private and secure
          </Text>
        </View>
      </View>
      
      <PrimaryButton
        title="Continue"
        onPress={handleNext}
        disabled={!address.trim()}
        style={styles.button}
      />
    </View>
  );

  const renderHomeTypeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What type of home do you have?</Text>
        <Text style={styles.stepSubtitle}>
          This helps us create a personalized maintenance schedule
        </Text>
      </View>
      
      <View style={styles.homeTypeSection}>
        {[
          { id: 'single_family', label: 'Single Family Home' },
          { id: 'townhouse', label: 'Townhouse' },
          { id: 'condo', label: 'Condominium' },
          { id: 'apartment', label: 'Apartment' },
        ].map((type) => (
          <View key={type.id} style={styles.homeTypeOption}>
            {homeType === type.id ? (
              <PrimaryButton
                title={type.label}
                onPress={() => setHomeType(type.id)}
                style={styles.homeTypeButton}
              />
            ) : (
              <SecondaryButton
                title={type.label}
                onPress={() => setHomeType(type.id)}
                style={styles.homeTypeButton}
              />
            )}
          </View>
        ))}
      </View>
      
      <PrimaryButton
        title={isLoading ? "Setting up your home..." : "Complete Setup"}
        onPress={handleNext}
        disabled={!homeType || isLoading}
        style={styles.button}
      />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderAddressStep();
      case 2:
        return renderHomeTypeStep();
      default:
        return renderWelcomeStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / 3) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of 3
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    justifyContent: 'space-between',
    minHeight: 600,
  },
  
  // Welcome Step Styles
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    ...Typography.displayMedium,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  valueProposition: {
    paddingVertical: Spacing.lg,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  valueText: {
    ...Typography.bodyLarge,
    marginLeft: Spacing.md,
    flex: 1,
  },
  
  // Step Header Styles
  stepHeader: {
    paddingVertical: Spacing.lg,
  },
  stepTitle: {
    ...Typography.displaySmall,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  
  // Form Styles
  inputSection: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginBottom: Spacing.md,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  
  // Home Type Styles
  homeTypeSection: {
    flex: 1,
    justifyContent: 'center',
  },
  homeTypeOption: {
    marginBottom: Spacing.sm,
  },
  homeTypeButton: {
    width: '100%',
  },
  
  // Button Styles
  button: {
    marginTop: Spacing.lg,
  },
}); 