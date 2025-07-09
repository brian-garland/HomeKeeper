import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
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
import { useDataContext } from '../contexts/DataContext';
import { generateIntelligentTasks } from '../lib/services/taskGenerationService';
import { generateDefaultEquipment } from '../lib/services/defaultEquipmentGenerator';
import type { Task, Equipment } from '../types';
// Remove uuid import - will use Date.now() for ID generation

// Simple ID generator for React Native
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Convert task date to user-friendly timing
const getTaskTiming = (dueDate: string): string => {
  const today = new Date();
  const taskDate = new Date(dueDate);
  const daysDiff = Math.floor((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) return 'Overdue';
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Tomorrow';
  if (daysDiff <= 3) return 'This Week';
  if (daysDiff <= 7) return 'This Weekend';
  if (daysDiff <= 14) return 'Next Week';
  if (daysDiff <= 30) return 'This Month';
  return `In ${Math.ceil(daysDiff / 7)} weeks`;
};

// Get icon for task category
const getTaskIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'HVAC': 'maintenance',
    'Plumbing': 'plumbing',
    'Electrical': 'electrical',
    'Appliances': 'settings',
    'Safety': 'warning',
    'Exterior': 'home',
    'Interior': 'home',
    'Seasonal': 'clock',
  };
  return iconMap[category] || 'maintenance';
};

const { width: screenWidth } = Dimensions.get('window');

interface QuickStartScreenProps {
  onComplete: () => void;
}

type HomeType = 'single_family' | 'condo' | 'apartment';

export const QuickStartScreen: React.FC<QuickStartScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'homeType' | 'preview'>('welcome');
  const [selectedHomeType, setSelectedHomeType] = useState<HomeType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewTasks, setPreviewTasks] = useState<Array<{ title: string; timing: string; icon: string }>>([]);
  const [actualTasks, setActualTasks] = useState<Task[]>([]);
  
  console.log('QuickStartScreen render - currentStep:', currentStep, 'isGenerating:', isGenerating);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const { addHome, addTask, addEquipment } = useDataContext();

  // Animate screen transitions
  useEffect(() => {
    // Reset animations before starting new ones
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, fadeAnim, slideAnim]);

  const handleSkip = async () => {
    console.log('QuickStartScreen: handleSkip called');
    try {
      // Create a minimal "ghost" home for skip users - ID must start with 'local-'
      const ghostHome = {
        id: `local-${generateId()}`,
        address: 'My Home',
        home_type: 'single_family' as HomeType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('QuickStartScreen: About to add home:', ghostHome);
      await addHome(ghostHome);
      console.log('QuickStartScreen: Home added successfully');
      console.log('QuickStartScreen: Calling onComplete');
      onComplete();
    } catch (error) {
      console.error('QuickStartScreen: Error in handleSkip:', error);
    }
  };

  const handleHomeTypeSelect = async (type: HomeType) => {
    console.log('QuickStartScreen: Home type selected:', type);
    setSelectedHomeType(type);
    setIsGenerating(true);
    setCurrentStep('preview');

    // Create home with minimal data - ID must start with 'local-' for dataManager
    const newHome = {
      id: `local-${generateId()}`,
      address: 'My Home',
      home_type: type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await addHome(newHome);
    
    // Add a small delay to ensure home is saved to AsyncStorage
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate default equipment for the home
    try {
      console.log('QuickStartScreen: Generating equipment for home type:', type);
      const equipment = generateDefaultEquipment(newHome.id, type);
      console.log('QuickStartScreen: Generated', equipment.length, 'equipment items');
      
      // Add each equipment item
      for (const item of equipment) {
        await addEquipment(item);
      }
      
      // Small delay to ensure equipment is saved
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('QuickStartScreen: Error generating equipment:', error);
    }

    // Set loading state and minimum delay
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate actual tasks using the proper service
    try {
      console.log('QuickStartScreen: Generating tasks for home:', newHome.id);
      const result = await generateIntelligentTasks(newHome.id);
      console.log('QuickStartScreen: Task generation result:', result);
      
      if (result.success && result.tasks && result.tasks.length > 0) {
        console.log('QuickStartScreen: Generated', result.tasks.length, 'tasks');
        console.log('QuickStartScreen: First 3 tasks:', result.tasks.slice(0, 3).map(t => ({
          title: t.title,
          date: t.due_date,
          category: t.category
        })));
        
        // Add all tasks to context
        for (const task of result.tasks) {
          await addTask(task);
        }
        
        // Take first 3 tasks for preview, sorted by due date
        const sortedTasks = [...result.tasks].sort((a, b) => 
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
        
        const previewData = sortedTasks.slice(0, 3).map(task => ({
          title: task.title,
          timing: getTaskTiming(task.due_date),
          icon: getTaskIcon(task.category)
        }));
        
        console.log('QuickStartScreen: Preview data:', previewData);
        
        // Wait for minimum delay before showing preview
        await minDelay;
        setPreviewTasks(previewData);
        setIsGenerating(false);
      } else {
        // No tasks generated, use static previews
        console.log('QuickStartScreen: No tasks generated, using static preview');
        const taskPreviews = getTaskPreviewsForHomeType(type);
        await minDelay;
        setPreviewTasks(taskPreviews);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('QuickStartScreen: Error generating tasks:', error);
      // Fallback to static previews
      const taskPreviews = getTaskPreviewsForHomeType(type);
      await minDelay;
      setPreviewTasks(taskPreviews);
      setIsGenerating(false);
    }
  };

  const getTaskPreviewsForHomeType = (type: HomeType) => {
    const baseTaskPreviews = [
      { title: 'Check HVAC Filter', timing: 'This Weekend', icon: 'maintenance' },
      { title: 'Test Smoke Detectors', timing: 'Next Week', icon: 'electrical' },
    ];

    if (type === 'single_family') {
      baseTaskPreviews.push({ title: 'Clean Gutters', timing: 'This Month', icon: 'plumbing' });
    } else if (type === 'condo') {
      baseTaskPreviews.push({ title: 'Check Balcony Drainage', timing: 'This Month', icon: 'plumbing' });
    } else {
      baseTaskPreviews.push({ title: 'Replace Air Filters', timing: 'This Month', icon: 'maintenance' });
    }

    return baseTaskPreviews;
  };

  const renderWelcomeStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.contentContainer}>
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Icon name="home" size="xl" color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Keep Your Home in Perfect Condition</Text>
          <Text style={styles.heroSubtitle}>
            Get personalized maintenance reminders in under 30 seconds
          </Text>
        </View>

        <View style={styles.valuePoints}>
          <View style={styles.valueItem}>
            <Icon name="clock" size="md" color={Colors.success} />
            <Text style={styles.valueText}>Never miss important maintenance</Text>
          </View>
          <View style={styles.valueItem}>
            <Icon name="money" size="md" color={Colors.success} />
            <Text style={styles.valueText}>Save thousands in repair costs</Text>
          </View>
          <View style={styles.valueItem}>
            <Icon name="check" size="md" color={Colors.success} />
            <Text style={styles.valueText}>Expert guidance for every task</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <PrimaryButton
          title="Get My Schedule (30 seconds)"
          onPress={() => setCurrentStep('homeType')}
          style={styles.primaryButton}
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>I'll explore first →</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderHomeTypeStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.contentContainer}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>What type of home do you have?</Text>
          <Text style={styles.stepSubtitle}>
            We'll create a maintenance schedule tailored to your home
          </Text>
        </View>

        <View style={styles.homeTypeGrid}>
          <TouchableOpacity
            style={styles.homeTypeCard}
            onPress={() => handleHomeTypeSelect('single_family')}
          >
            <Icon name="home" size="lg" color={Colors.primary} />
            <Text style={styles.homeTypeLabel}>House</Text>
            <Text style={styles.homeTypeDescription}>Single family home with yard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeTypeCard}
            onPress={() => handleHomeTypeSelect('condo')}
          >
            <Icon name="settings" size="lg" color={Colors.primary} />
            <Text style={styles.homeTypeLabel}>Condo</Text>
            <Text style={styles.homeTypeDescription}>Owned unit in a building</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeTypeCard}
            onPress={() => handleHomeTypeSelect('apartment')}
          >
            <Icon name="users" size="lg" color={Colors.primary} />
            <Text style={styles.homeTypeLabel}>Apartment</Text>
            <Text style={styles.homeTypeDescription}>Rental unit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for now →</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderPreviewStep = () => {
    console.log('QuickStartScreen: Rendering preview step, isGenerating:', isGenerating, 'previewTasks:', previewTasks.length);
    return (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {isGenerating ? (
        <View style={styles.generatingContainer}>
          <Animated.View style={styles.generatingIcon}>
            <Icon name="settings" size="xl" color={Colors.primary} />
          </Animated.View>
          <Text style={styles.generatingTitle}>Creating your schedule...</Text>
          <Text style={styles.generatingSubtitle}>This takes just a moment</Text>
        </View>
      ) : (
        <>
          <View style={styles.contentContainer}>
            <View style={styles.successHeader}>
              <View style={styles.successIcon}>
                <Icon name="check" size="lg" color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>Your schedule is ready!</Text>
              <Text style={styles.successSubtitle}>
                Here's a preview of tasks we'll track for you:
              </Text>
            </View>

            <View style={styles.taskPreviewContainer}>
              {previewTasks.map((task, index) => (
                <Animated.View 
                  key={index} 
                  style={[
                    styles.taskPreviewCard,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: slideAnim,
                      }],
                    },
                  ]}
                >
                  <Icon name={task.icon as any} size="md" color={Colors.primary} />
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskTiming}>{task.timing}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>$2,400</Text>
                <Text style={styles.statLabel}>Avg. yearly savings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selectedHomeType === 'single_family' ? '8' : selectedHomeType === 'condo' ? '6' : '3'}</Text>
                <Text style={styles.statLabel}>Equipment tracked</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>15 min</Text>
                <Text style={styles.statLabel}>Weekly time needed</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <PrimaryButton
              title="Start Maintaining My Home"
              onPress={onComplete}
              style={styles.primaryButton}
            />
            <Text style={styles.addMoreLater}>
              You can add more details anytime in settings
            </Text>
          </View>
        </>
      )}
    </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'homeType' && renderHomeTypeStep()}
        {currentStep === 'preview' && renderPreviewStep()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  actionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  
  // Welcome Step Styles
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
  valuePoints: {
    marginTop: Spacing.xl,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  valueText: {
    ...Typography.bodyLarge,
    marginLeft: Spacing.md,
    flex: 1,
  },
  
  // Home Type Step Styles
  stepHeader: {
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    ...Typography.displaySmall,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  homeTypeGrid: {
    marginTop: Spacing.lg,
  },
  homeTypeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  homeTypeLabel: {
    ...Typography.titleMedium,
    marginLeft: Spacing.md,
    flex: 1,
  },
  homeTypeDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
  },
  
  // Preview Step Styles
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingIcon: {
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
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    ...Typography.displaySmall,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  taskPreviewContainer: {
    marginBottom: Spacing.xl,
  },
  taskPreviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  taskTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  taskTiming: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...Typography.titleLarge,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  
  // Button Styles
  primaryButton: {
    marginBottom: Spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  skipText: {
    ...Typography.bodyLarge,
    color: Colors.primary,
  },
  addMoreLater: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});