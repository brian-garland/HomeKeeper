import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
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

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
}

// Welcome Screen Component
const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <View style={styles.stepContainer}>
    <View>
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
      
      <View style={styles.socialProof}>
        <Text style={styles.socialProofText}>
          Join thousands of homeowners who've simplified their maintenance
        </Text>
        <View style={styles.trustIndicators}>
          <View style={styles.trustItem}>
            <Icon name="settings" size="sm" color={Colors.primary} />
            <Text style={styles.trustText}>Secure</Text>
          </View>
          <View style={styles.trustItem}>
            <Icon name="users" size="sm" color={Colors.primary} />
            <Text style={styles.trustText}>Community</Text>
          </View>
          <View style={styles.trustItem}>
            <Icon name="favorite" size="sm" color={Colors.primary} />
            <Text style={styles.trustText}>Expert Tips</Text>
          </View>
        </View>
      </View>
    </View>
    
    <View style={styles.buttonContainer}>
      <PrimaryButton
        title="Get Started"
        onPress={onNext}
        style={styles.primaryButton}
      />
    </View>
  </View>
);

// Address Input Component
const AddressStep: React.FC<{ onNext: (address: string) => void }> = ({ onNext }) => {
  const [address, setAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleNext = async () => {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter your home address to continue.');
      return;
    }
    
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      onNext(address);
    }, 1500);
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Where's your home?</Text>
        <Text style={styles.stepSubtitle}>
          We'll use this to provide local maintenance recommendations and weather-based scheduling
        </Text>
      </View>
      
      <View style={styles.inputSection}>
        <TextInput
          placeholder="Enter your home address"
          value={address}
          onChangeText={setAddress}
          style={styles.addressInput}
        />
        
        <View style={styles.privacyNote}>
          <Icon name="settings" size="sm" color={Colors.textSecondary} />
          <Text style={styles.privacyText}>
            Your address is kept private and secure
          </Text>
        </View>
      </View>
      
      <PrimaryButton
        title={isValidating ? "Validating..." : "Continue"}
        onPress={handleNext}
        disabled={!address.trim() || isValidating}
        style={styles.primaryButton}
      />
    </View>
  );
};

// Home Characteristics Component
const HomeCharacteristicsStep: React.FC<{ onNext: (characteristics: any) => void }> = ({ onNext }) => {
  const [homeType, setHomeType] = useState<string>('');
  const [yearBuilt, setYearBuilt] = useState<string>('');
  const [squareFootage, setSquareFootage] = useState<string>('');

  const homeTypes = [
    { id: 'single_family', label: 'Single Family Home' },
    { id: 'townhouse', label: 'Townhouse' },
    { id: 'condo', label: 'Condominium' },
    { id: 'apartment', label: 'Apartment' },
  ];

  const handleNext = () => {
    const characteristics = {
      homeType,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
      squareFootage: squareFootage ? parseInt(squareFootage) : null,
    };
    onNext(characteristics);
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Tell us about your home</Text>
        <Text style={styles.stepSubtitle}>
          This helps us create a personalized maintenance schedule
        </Text>
      </View>
      
      <ScrollView style={styles.characteristicsForm} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Home Type</Text>
          <View style={styles.homeTypeGrid}>
            {homeTypes.map((type) => (
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
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Year Built (Optional)</Text>
          <TextInput
            placeholder="e.g., 2010"
            value={yearBuilt}
            onChangeText={setYearBuilt}
            style={styles.formInput}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Square Footage (Optional)</Text>
          <TextInput
            placeholder="e.g., 2500"
            value={squareFootage}
            onChangeText={setSquareFootage}
            style={styles.formInput}
          />
        </View>
      </ScrollView>
      
      <PrimaryButton
        title="Continue"
        onPress={handleNext}
        disabled={!homeType}
        style={styles.primaryButton}
      />
    </View>
  );
};

// Personalization Component
const PersonalizationStep: React.FC<{ onNext: (preferences: any) => void }> = ({ onNext }) => {
  const [maintenanceStyle, setMaintenanceStyle] = useState<string>('');
  const [availableTime, setAvailableTime] = useState<string>('');
  const [notifications, setNotifications] = useState<string>('');

  const maintenanceStyles = [
    { id: 'proactive', label: 'Proactive', description: 'Stay ahead of issues' },
    { id: 'balanced', label: 'Balanced', description: 'Mix of prevention & fixes' },
    { id: 'reactive', label: 'As-Needed', description: 'Fix things when they break' },
  ];

  const timeOptions = [
    { id: 'weekends', label: 'Weekends Only' },
    { id: 'evenings', label: 'Weekday Evenings' },
    { id: 'flexible', label: 'Flexible Schedule' },
  ];

  const notificationOptions = [
    { id: 'gentle', label: 'Gentle Reminders' },
    { id: 'standard', label: 'Standard Notifications' },
    { id: 'minimal', label: 'Minimal Notifications' },
  ];

  const handleNext = () => {
    const preferences = {
      maintenanceStyle,
      availableTime,
      notifications,
    };
    onNext(preferences);
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Personalize your experience</Text>
        <Text style={styles.stepSubtitle}>
          Help us tailor HomeKeeper to your lifestyle
        </Text>
      </View>
      
      <ScrollView style={styles.preferencesForm} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Maintenance Approach</Text>
          {maintenanceStyles.map((style) => (
            <View key={style.id} style={styles.preferenceOption}>
              {maintenanceStyle === style.id ? (
                <PrimaryButton
                  title={`${style.label} - ${style.description}`}
                  onPress={() => setMaintenanceStyle(style.id)}
                  style={styles.preferenceButton}
                />
              ) : (
                <SecondaryButton
                  title={`${style.label} - ${style.description}`}
                  onPress={() => setMaintenanceStyle(style.id)}
                  style={styles.preferenceButton}
                />
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>When do you prefer to do maintenance?</Text>
          {timeOptions.map((option) => (
            <View key={option.id} style={styles.preferenceOption}>
              {availableTime === option.id ? (
                <PrimaryButton
                  title={option.label}
                  onPress={() => setAvailableTime(option.id)}
                  style={styles.preferenceButton}
                />
              ) : (
                <SecondaryButton
                  title={option.label}
                  onPress={() => setAvailableTime(option.id)}
                  style={styles.preferenceButton}
                />
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Notification Style</Text>
          {notificationOptions.map((option) => (
            <View key={option.id} style={styles.preferenceOption}>
              {notifications === option.id ? (
                <PrimaryButton
                  title={option.label}
                  onPress={() => setNotifications(option.id)}
                  style={styles.preferenceButton}
                />
              ) : (
                <SecondaryButton
                  title={option.label}
                  onPress={() => setNotifications(option.id)}
                  style={styles.preferenceButton}
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      
      <PrimaryButton
        title="Continue"
        onPress={handleNext}
        disabled={!maintenanceStyle || !availableTime || !notifications}
        style={styles.primaryButton}
      />
    </View>
  );
};

// Calendar Reveal Component
const CalendarRevealStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    setTimeout(() => {
      setIsGenerating(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);
  }, []);

  if (isGenerating) {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.generatingContainer}>
          <View style={styles.loadingIcon}>
            <Icon name="settings" size="xl" color={Colors.primary} />
          </View>
          <Text style={styles.generatingTitle}>Creating your personalized schedule...</Text>
          <Text style={styles.generatingSubtitle}>
            Analyzing your home and preferences to build the perfect maintenance plan
          </Text>
          <View style={styles.generatingSteps}>
            <Text style={styles.generatingStep}>✓ Analyzing home characteristics</Text>
            <Text style={styles.generatingStep}>✓ Checking local weather patterns</Text>
            <Text style={styles.generatingStep}>✓ Optimizing task timing</Text>
            <Text style={styles.generatingStep}>⏳ Finalizing your schedule</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stepContainer}>
      <Animated.View 
        style={[
          styles.revealContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.celebrationHeader}>
          <View style={styles.celebrationIcon}>
            <Icon name="check" size="xl" color={Colors.success} />
          </View>
          <Text style={styles.celebrationTitle}>Your schedule is ready! 🎉</Text>
          <Text style={styles.celebrationSubtitle}>
            We've created a personalized maintenance plan just for you
          </Text>
        </View>
        
        <View style={styles.schedulePreview}>
          <Text style={styles.previewTitle}>Coming up this month:</Text>
          <View style={styles.taskPreview}>
            <Icon name="maintenance" size="md" color={Colors.primary} />
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>Check HVAC Filter</Text>
              <Text style={styles.taskDate}>This Weekend</Text>
            </View>
          </View>
          <View style={styles.taskPreview}>
            <Icon name="plumbing" size="md" color={Colors.success} />
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>Clean Gutters</Text>
              <Text style={styles.taskDate}>Next Week</Text>
            </View>
          </View>
          <View style={styles.taskPreview}>
            <Icon name="electrical" size="md" color={Colors.warning} />
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>Test Smoke Detectors</Text>
              <Text style={styles.taskDate}>End of Month</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.valueHighlight}>
          <Text style={styles.valueHighlightText}>
            You're all set to keep your home in perfect condition! 🏠
          </Text>
        </View>
      </Animated.View>
      
      <PrimaryButton
        title="Start Using HomeKeeper"
        onPress={onComplete}
        style={styles.primaryButton}
      />
    </View>
  );
};

export const MagicalOnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const steps: OnboardingStep[] = [
    { id: 'welcome', title: 'Welcome', subtitle: 'Get started with HomeKeeper' },
    { id: 'address', title: 'Address', subtitle: 'Where is your home?' },
    { id: 'characteristics', title: 'Home Details', subtitle: 'Tell us about your home' },
    { id: 'personalization', title: 'Preferences', subtitle: 'Personalize your experience' },
    { id: 'reveal', title: 'Ready!', subtitle: 'Your schedule is ready' },
  ];

  const handleNext = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    scrollViewRef.current?.scrollTo({ x: nextStep * screenWidth, animated: true });
  };

  const handleStepData = (stepId: string, data: any) => {
    setOnboardingData((prev: any) => ({ ...prev, [stepId]: data }));
    handleNext();
  };

  const handleComplete = async () => {
    try {
      // Here we would save the onboarding data to Supabase
      console.log('Onboarding completed with data:', onboardingData);
      
      // Call the completion callback
      onComplete?.();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Setup Error', 'There was an issue setting up your home. Please try again.');
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
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Step Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.stepsContainer}
        >
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepWrapper}>
              {index === 0 && (
                <WelcomeStep onNext={handleNext} />
              )}
              {index === 1 && (
                <AddressStep onNext={(address) => handleStepData('address', address)} />
              )}
              {index === 2 && (
                <HomeCharacteristicsStep onNext={(characteristics) => handleStepData('characteristics', characteristics)} />
              )}
              {index === 3 && (
                <PersonalizationStep onNext={(preferences) => handleStepData('personalization', preferences)} />
              )}
              {index === 4 && (
                <CalendarRevealStep onComplete={handleComplete} />
              )}
            </View>
          ))}
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
  stepsContainer: {
    flex: 1,
  },
  stepWrapper: {
    width: screenWidth,
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    minHeight: 500,
  },
  
  // Welcome Step Styles
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
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
    paddingVertical: Spacing.md,
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
  socialProof: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  socialProofText: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  trustItem: {
    alignItems: 'center',
  },
  trustText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
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
  addressInput: {
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
  characteristicsForm: {
    flex: 1,
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    ...Typography.titleMedium,
    marginBottom: Spacing.md,
  },
  homeTypeGrid: {
    gap: Spacing.sm,
  },
  homeTypeOption: {
    marginBottom: Spacing.sm,
  },
  homeTypeButton: {
    width: '100%',
  },
  formInput: {
    marginBottom: Spacing.sm,
  },
  preferencesForm: {
    flex: 1,
  },
  preferenceOption: {
    marginBottom: Spacing.sm,
  },
  preferenceButton: {
    width: '100%',
  },
  
  // Calendar Reveal Styles
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    marginBottom: Spacing.lg,
  },
  generatingTitle: {
    ...Typography.displaySmall,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  generatingSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  generatingSteps: {
    alignItems: 'flex-start',
  },
  generatingStep: {
    ...Typography.bodyLarge,
    marginBottom: Spacing.sm,
  },
  revealContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  celebrationIcon: {
    marginBottom: Spacing.md,
  },
  celebrationTitle: {
    ...Typography.displaySmall,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  celebrationSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  schedulePreview: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  previewTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.md,
  },
  taskPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  taskInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  taskTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  taskDate: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  valueHighlight: {
    backgroundColor: Colors.successLight,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  valueHighlightText: {
    ...Typography.bodyLarge,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Button Styles
  buttonContainer: {
    paddingTop: Spacing.lg,
  },
  primaryButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
});