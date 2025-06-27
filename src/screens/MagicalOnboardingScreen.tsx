import React, { useState, useRef, useEffect } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { PrimaryButton } from '../components/buttons/PrimaryButton';
import { SecondaryButton } from '../components/buttons/SecondaryButton';
import { Icon } from '../components/icons/Icon';
import { TextInput } from '../components/inputs/TextInput';
import { useSupabase } from '../hooks/useSupabase';
import { createHome } from '../lib/models/homes';
import { generateIntelligentTasks } from '../lib/services/taskGenerationService';
import { geocodeAddress } from '../lib/services/geocodingService';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useDataContext } from '../contexts/DataContext';

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
    <ScrollView 
      style={styles.scrollableContent}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
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
            <Icon name="dollar" size="sm" color={Colors.primary} />
            <Text style={styles.trustText}>Save Money</Text>
          </View>
          <View style={styles.trustItem}>
            <Icon name="favorite" size="sm" color={Colors.primary} />
            <Text style={styles.trustText}>Confidence</Text>
          </View>
        </View>
      </View>
    </ScrollView>
    
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
  const insets = useSafeAreaInsets();

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
    <KeyboardAvoidingView 
      style={styles.stepContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + 50}
    >
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Where's your home?</Text>
        <Text style={styles.stepSubtitle}>
          We'll use this to provide local maintenance recommendations and weather-based scheduling
        </Text>
      </View>
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
        
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isValidating ? "Validating..." : "Continue"}
            onPress={handleNext}
            disabled={!address.trim() || isValidating}
            style={styles.primaryButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Home Characteristics Component
const HomeCharacteristicsStep: React.FC<{ onNext: (characteristics: any) => void }> = ({ onNext }) => {
  const [homeType, setHomeType] = useState<string>('');
  const [yearBuilt, setYearBuilt] = useState<string>('');
  const [squareFootage, setSquareFootage] = useState<string>('');
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<any>(null);

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

  const handleSquareFootageFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Tell us about your home</Text>
        <Text style={styles.stepSubtitle}>
          This helps us create a personalized maintenance schedule
        </Text>
      </View>
      
      <KeyboardAwareScrollView 
        ref={scrollViewRef}
        style={styles.characteristicsForm} 
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={140}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 200 }}
        enableResetScrollToCoords={false}
        keyboardOpeningTime={250}
        enableAutomaticScroll={true}
      >
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
        
        <View style={[styles.formSection, { marginBottom: 40 }]}>
          <Text style={styles.formLabel}>Square Footage (Optional)</Text>
          <TextInput
            placeholder="e.g., 2500"
            value={squareFootage}
            onChangeText={setSquareFootage}
            onFocus={handleSquareFootageFocus}
            style={styles.formInput}
          />
        </View>
        
        <View style={{ height: 60 }} />
        
        <PrimaryButton
          title="Continue"
          onPress={handleNext}
          disabled={!homeType}
          style={styles.primaryButton}
        />
      </KeyboardAwareScrollView>
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
const CalendarRevealStep: React.FC<{ onComplete: () => void; onboardingData: any }> = ({ onComplete, onboardingData }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [isGenerating, setIsGenerating] = useState(true);
  const { tasks, setTasks, setEquipment, setHomes } = useDataContext();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Generate tasks immediately when this step is reached
    generateTasksForOnboarding();
  }, []);

  const generateTasksForOnboarding = async () => {
    try {
      console.log('🎯 Step 5: Starting task generation with data:', onboardingData);
      
      // First, geocode the address to get coordinates
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (onboardingData.address) {
        console.log('🗺️ Geocoding address:', onboardingData.address);
        const { geocodeAddress } = await import('../lib/services/geocodingService');
        const geocodingResult = await geocodeAddress(onboardingData.address);
        
        if (geocodingResult.success) {
          latitude = geocodingResult.data.latitude;
          longitude = geocodingResult.data.longitude;
          console.log(`✅ Address geocoded to: ${latitude}, ${longitude}`);
        } else {
          console.warn('Geocoding failed:', geocodingResult.error);
        }
      }
      
      // Create local home object
      const localHome = {
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: null,
        name: 'My Home',
        address: onboardingData.address || '',
        city: null,
        state: null,
        zip_code: null,
        country: 'United States',
        latitude: latitude || null,
        longitude: longitude || null,
        location: null,
        home_type: onboardingData.characteristics?.homeType || 'single_family',
        year_built: onboardingData.characteristics?.yearBuilt || null,
        square_footage: onboardingData.characteristics?.squareFootage || null,
        lot_size: null,
        bedrooms: null,
        bathrooms: null,
        floors: 1,
        heating_type: null,
        cooling_type: null,
        water_heater_type: null,
        maintenance_season_start: 3,
        high_maintenance_mode: false,
        photo_url: null,
        notes: null,
        active: true,
        is_local: true,
      };

      // Clear existing data and store new home
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem('homekeeper_homes');
      await AsyncStorage.default.removeItem('homekeeper_tasks');
      await AsyncStorage.default.removeItem('homekeeper_equipment');
      await AsyncStorage.default.setItem('homekeeper_local_home', JSON.stringify(localHome));
      await AsyncStorage.default.setItem('homekeeper_onboarding_complete', 'true');

      // Generate equipment
      const { getDataManager } = await import('../lib/services/dataManager');
      const dataManager = getDataManager(localHome.id);
      const defaultEquipment = await dataManager.getEquipment(localHome.id);
      
      await AsyncStorage.default.setItem('homekeeper_equipment', JSON.stringify(defaultEquipment));
      setEquipment(defaultEquipment);
      setHomes([localHome as any]);

      // Generate tasks
      const { generateIntelligentTasks } = await import('../lib/services/taskGenerationService');
      const tasksResult = await generateIntelligentTasks(localHome.id);

      if (tasksResult.success && tasksResult.tasks.length > 0) {
        await AsyncStorage.default.setItem('homekeeper_tasks', JSON.stringify(tasksResult.tasks));
        setTasks(tasksResult.tasks);
        console.log(`✅ Generated ${tasksResult.tasks.length} tasks for Step 5`);
      }

      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating tasks in Step 5:', error);
      setIsGenerating(false);
    }
  };

  // Get the first 3 tasks to show in preview
  const previewTasks = tasks.slice(0, 3);

  // Helper function to get task scheduling text
  const getTaskSchedule = (task: any, index: number): string => {
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 0) return 'Ready to start';
    if (daysUntilDue <= 3) return 'This weekend';
    if (daysUntilDue <= 7) return 'Next week';
    if (daysUntilDue <= 14) return 'In 2 weeks';
    if (daysUntilDue <= 21) return 'Later this month';
    if (daysUntilDue <= 30) return 'End of month';
    return 'Next month';
  };

  // Helper function to get icon based on task category
  const getTaskIcon = (task: any): any => {
    switch (task.category) {
      case 'hvac': return 'maintenance';
      case 'plumbing': return 'plumbing';
      case 'safety': return 'electrical';
      case 'cleaning': return 'maintenance';
      case 'landscaping': return 'plumbing';
      default: return 'maintenance';
    }
  };

  // Helper function to get color based on task category
  const getTaskColor = (task: any): string => {
    switch (task.category) {
      case 'hvac': return Colors.primary;
      case 'plumbing': return Colors.info;
      case 'safety': return Colors.warning;
      case 'cleaning': return Colors.success;
      case 'landscaping': return Colors.success;
      default: return Colors.primary;
    }
  };

  // Show loading state while generating tasks
  if (isGenerating || tasks.length === 0) {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.revealContainer}>
          <View style={styles.celebrationHeader}>
            <View style={styles.celebrationIcon}>
              <Icon name="settings" size="xl" color={Colors.primary} />
            </View>
            <Text style={styles.celebrationTitle}>Creating your schedule... 🔄</Text>
            <Text style={styles.celebrationSubtitle}>
              We're generating personalized maintenance tasks for your home
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stepContainer}>
      <ScrollView 
        style={styles.scrollableContent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            {previewTasks.map((task, index) => (
              <View key={task.id} style={styles.taskPreview}>
                <Icon 
                  name={getTaskIcon(task)} 
                  size="md" 
                  color={getTaskColor(task)} 
                />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDate}>{getTaskSchedule(task, index)}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.valueHighlight}>
            <Text style={styles.valueHighlightText}>
              You're all set to keep your home in perfect condition! 🏠
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Start Using HomeKeeper"
          onPress={onComplete}
          style={styles.primaryButton}
        />
      </View>
    </View>
  );
};

export const MagicalOnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();
  const { setTasks, setEquipment, setHomes } = useDataContext();

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
      console.log('✅ Onboarding completed successfully - immediate value provided');
      onComplete?.();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      onComplete?.();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Progress Indicator */}
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
      <View style={styles.stepsContainer}>
        <View style={styles.stepWrapper}>
          {currentStep === 0 && (
            <WelcomeStep onNext={handleNext} />
          )}
          {currentStep === 1 && (
            <AddressStep onNext={(address) => handleStepData('address', address)} />
          )}
          {currentStep === 2 && (
            <HomeCharacteristicsStep onNext={(characteristics) => handleStepData('characteristics', characteristics)} />
          )}
          {currentStep === 3 && (
            <PersonalizationStep onNext={(preferences) => handleStepData('personalization', preferences)} />
          )}
          {currentStep === 4 && (
            <CalendarRevealStep onComplete={handleComplete} onboardingData={onboardingData} />
          )}
        </View>
      </View>
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
    paddingTop: Spacing.massive, // 64px - Maximum generous spacing for perfect visual balance
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
    flex: 1,
    width: '100%',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    minHeight: 500,
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.lg,
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
    justifyContent: 'space-evenly',
    alignItems: 'center',
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    justifyContent: 'center',
    flex: 1,
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
    marginTop: Spacing.xl,
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
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.xl,
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
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryButton: {
    width: '100%',
  },
}); 