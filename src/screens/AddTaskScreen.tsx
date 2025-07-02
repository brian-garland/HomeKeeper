import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from '../components/icons/Icon';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { useDataContext } from '../contexts/DataContext';
import { useEquipment } from '../hooks/useEquipment';
import { TaskRecurrence, FREQUENCY_OPTIONS, DEFAULT_RECURRENCE } from '../types/preferences';

interface TaskFormData {
  title: string;
  description: string;
  category: string;
  priority: number;
  difficulty_level: number;
  estimated_duration_minutes: number;
  due_date: string;
}

const categories = [
  { id: 'hvac', label: 'HVAC', icon: 'wrench' as const },
  { id: 'plumbing', label: 'Plumbing', icon: 'plumbing' as const },
  { id: 'electrical', label: 'Electrical', icon: 'electrical' as const },
  { id: 'exterior', label: 'Exterior', icon: 'home' as const },
  { id: 'interior', label: 'Interior', icon: 'house' as const },
  { id: 'appliances', label: 'Appliances', icon: 'settings' as const },
  { id: 'safety', label: 'Safety', icon: 'warning' as const },
  { id: 'general', label: 'General', icon: 'hammer' as const },
];

const priorities = [
  { value: 1, label: 'Low', color: Colors.info },
  { value: 2, label: 'Medium', color: Colors.warning },
  { value: 3, label: 'High', color: Colors.error },
];

const difficulties = [
  { value: 1, label: 'Easy', description: 'Basic task, minimal tools' },
  { value: 2, label: 'Medium', description: 'Some experience needed' },
  { value: 3, label: 'Hard', description: 'Advanced skills required' },
];

export const AddTaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addTask, homes } = useDataContext();
  const { equipment } = useEquipment();
  const [loading, setLoading] = useState(false);
  
  // Get equipmentId from navigation params if available
  const params = route.params as { equipmentId?: string } | undefined;
  const specificEquipmentId = params?.equipmentId;
  const specificEquipment = specificEquipmentId 
    ? equipment.find(eq => eq.id === specificEquipmentId)
    : null;

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    specificEquipmentId || null
  );

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: specificEquipment?.category || 'general',
    priority: 2,
    difficulty_level: 1,
    estimated_duration_minutes: 30,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
  });

  const [recurrence, setRecurrence] = useState<TaskRecurrence>({ ...DEFAULT_RECURRENCE });

  // Update category when specific equipment is found (handles timing issues)
  React.useEffect(() => {
    if (specificEquipment && specificEquipment.category && formData.category === 'general') {
      setFormData(prev => ({ ...prev, category: specificEquipment.category }));
    }
  }, [specificEquipment, formData.category]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }
    setLoading(true);
    try {
      // Use specific equipment if navigated from equipment detail, otherwise use selectedEquipmentId
      const targetEquipment = specificEquipment || (selectedEquipmentId ? equipment.find(eq => eq.id === selectedEquipmentId) : null);
      console.log('💾 Creating task with equipment:', targetEquipment ? targetEquipment.name : 'No equipment');
      const newTask = {
        id: `demo-task-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        home_id: homes[0]?.id || 'demo-home-1',
        equipment_id: targetEquipment?.id || null,
        template_id: null,
        title: formData.title,
        description: formData.description + (targetEquipment && targetEquipment.location ? ` (${targetEquipment.location})` : ''),
        category: formData.category,
        due_date: formData.due_date,
        priority: formData.priority,
        estimated_duration_minutes: formData.estimated_duration_minutes,
        difficulty_level: formData.difficulty_level,
        instructions: null,
        status: 'pending',
        completed_at: null,
        completed_by: null,
        auto_generated: false,
        reschedule_count: 0,
        weather_dependent: false,
        notes: null,
        tags: [],
        money_saved_estimate: null,
        recurrence: recurrence.enabled ? recurrence : null
      };
      addTask(newTask as any); // Type assertion needed due to database vs local type mismatch
      const successMessage = targetEquipment 
        ? `Task created and associated with ${targetEquipment.name}!`
        : 'Task created successfully!';
      Alert.alert('Success', successMessage, [
        { 
          text: 'OK', 
          onPress: () => {
            if (specificEquipmentId) {
              (navigation as any).reset({
                index: 0,
                routes: [{ name: 'TasksList' }],
              });
              (navigation as any).navigate('Equipment');
            } else {
              navigation.goBack();
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAwareScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={20}
      contentContainerStyle={styles.contentContainer}
    >
        {/* Equipment Context (if applicable) */}
        {specificEquipment && (
          <View style={styles.equipmentContext}>
            <Icon name="equipment" size="sm" color={Colors.primary} />
            <Text style={styles.equipmentContextText}>
              Creating task for: <Text style={styles.equipmentName}>{specificEquipment.name}</Text>
            </Text>
          </View>
        )}

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
            placeholder={specificEquipment 
              ? `e.g., "Check for leaks" or "Inspect ${specificEquipment.name}"`
              : "Enter task title"
            }
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            placeholder="Describe what needs to be done"
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  formData.category === category.id && styles.categoryButtonActive
                ]}
                onPress={() => updateFormData('category', category.id)}
              >
                <Icon 
                  name={category.icon} 
                  size="md" 
                  color={formData.category === category.id ? Colors.white : Colors.textSecondary} 
                />
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Equipment Picker */}
        {!specificEquipment && (
          <View style={styles.section}>
            <Text style={styles.label}>Equipment</Text>
            <View style={styles.equipmentPickerContainer}>
              <TouchableOpacity
                style={styles.equipmentPickerHeader}
                onPress={() => {}}
                disabled
              >
                <Text style={styles.equipmentPickerHeaderText}>
                  Select the equipment this task is for (optional)
                </Text>
              </TouchableOpacity>
              <ScrollView style={styles.equipmentPickerScroll}>
                <TouchableOpacity
                  style={[styles.equipmentOption, selectedEquipmentId === null && styles.equipmentOptionSelected]}
                  onPress={() => setSelectedEquipmentId(null)}
                >
                  <Text style={[styles.equipmentOptionText, selectedEquipmentId === null && styles.equipmentOptionTextSelected]}>
                    No equipment (general task)
                  </Text>
                </TouchableOpacity>
                {equipment.map(eq => (
                  <TouchableOpacity
                    key={eq.id}
                    style={[styles.equipmentOption, selectedEquipmentId === eq.id && styles.equipmentOptionSelected]}
                    onPress={() => setSelectedEquipmentId(eq.id)}
                  >
                    <Text style={[styles.equipmentOptionText, selectedEquipmentId === eq.id && styles.equipmentOptionTextSelected]}>
                      {eq.name} {eq.location ? `(${eq.location})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Priority Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.priorityButton,
                  formData.priority === priority.value && { backgroundColor: `${priority.color}20` }
                ]}
                onPress={() => updateFormData('priority', priority.value)}
              >
                <View style={[
                  styles.priorityIndicator,
                  { backgroundColor: priority.color }
                ]} />
                <Text style={[
                  styles.priorityText,
                  formData.priority === priority.value && { color: priority.color }
                ]}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.value}
                style={[
                  styles.difficultyButton,
                  formData.difficulty_level === difficulty.value && styles.difficultyButtonActive
                ]}
                onPress={() => updateFormData('difficulty_level', difficulty.value)}
              >
                <Text style={[
                  styles.difficultyLabel,
                  formData.difficulty_level === difficulty.value && styles.difficultyLabelActive
                ]}>
                  {difficulty.label}
                </Text>
                <Text style={[
                  styles.difficultyDescription,
                  formData.difficulty_level === difficulty.value && styles.difficultyDescriptionActive
                ]}>
                  {difficulty.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Estimated Duration (minutes)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.estimated_duration_minutes.toString()}
            onChangeText={(text) => updateFormData('estimated_duration_minutes', parseInt(text) || 0)}
            placeholder="30"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
          />
        </View>

        {/* Due Date Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.textInput}
            value={formData.due_date}
            onChangeText={(text) => updateFormData('due_date', text)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textTertiary}
            returnKeyType="done"
            blurOnSubmit={true}
          />
          <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
        </View>

        {/* Recurring Task Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.label}>Recurring Task</Text>
            <Switch
              value={recurrence.enabled}
              onValueChange={(enabled) =>
                setRecurrence(prev => ({ ...DEFAULT_RECURRENCE, ...prev, enabled }))
              }
              trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              thumbColor={recurrence.enabled ? Colors.primary : Colors.textSecondary}
            />
          </View>
          {recurrence.enabled && (
            <View style={{ marginTop: Spacing.md }}>
              <Text style={styles.helperText}>Repeat every:</Text>
              <View style={styles.frequencyWrapRow}>
                {FREQUENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.frequencyButton,
                      recurrence.frequency_type === option.value && styles.frequencyButtonActive
                    ]}
                    onPress={() =>
                      setRecurrence(prev => ({
                        ...prev,
                        frequency_type: option.value,
                        frequency_months: option.months || prev.frequency_months || 3
                      }))
                    }
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      recurrence.frequency_type === option.value && styles.frequencyButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {recurrence.frequency_type === 'custom' && (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={styles.helperText}>Custom frequency (months):</Text>
                  <TextInput
                    style={[styles.textInput, { marginTop: Spacing.xs, width: 100 }]}
                    value={recurrence.frequency_months?.toString() || ''}
                    onChangeText={(text) =>
                      setRecurrence(prev => ({
                        ...prev,
                        frequency_months: parseInt(text) || 1
                      }))
                    }
                    placeholder="3"
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Extra spacing to ensure form is scrollable above keyboard */}
        <View style={styles.keyboardSpacer} />

        {/* Action Buttons */}
        <View style={styles.actions}>
          <SecondaryButton
            title="Cancel"
            onPress={() => {
              if (specificEquipmentId) {
                (navigation as any).reset({
                  index: 0,
                  routes: [{ name: 'TasksList' }],
                });
                (navigation as any).navigate('Equipment');
              } else {
                navigation.goBack();
              }
            }}
            style={styles.cancelButton}
          />
          <PrimaryButton
            title={loading ? "Creating..." : "Create Task"}
            onPress={handleSave}
            disabled={loading}
            style={styles.saveButton}
          />
        </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontFamily: Typography.labelLarge.fontFamily,
    fontSize: Typography.labelLarge.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontFamily: Typography.bodyLarge.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: Spacing.sm,
  },
  categoryButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: Spacing.md,
    marginRight: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontFamily: Typography.labelSmall.fontFamily,
    fontSize: Typography.labelSmall.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  categoryButtonTextActive: {
    color: Colors.white,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  priorityText: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textPrimary,
  },
  difficultyContainer: {
    gap: Spacing.sm,
  },
  difficultyButton: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  difficultyButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  difficultyLabel: {
    fontFamily: Typography.labelLarge.fontFamily,
    fontSize: Typography.labelLarge.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  difficultyLabelActive: {
    color: Colors.primary,
  },
  difficultyDescription: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
  },
  difficultyDescriptionActive: {
    color: Colors.primary,
  },
  helperText: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  keyboardSpacer: {
    height: 200, // Extra space to ensure content is scrollable above keyboard
  },
  equipmentContext: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  equipmentContextText: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  equipmentName: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.primary,
    fontWeight: '600',
  },
  frequencyWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  frequencyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 0,
    marginBottom: Spacing.sm,
  },
  frequencyButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  frequencyButtonText: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.textPrimary,
  },
  frequencyButtonTextActive: {
    color: Colors.white,
  },
  equipmentPickerContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  equipmentPickerHeader: {
    padding: Spacing.md,
  },
  equipmentPickerHeaderText: {
    color: Colors.textSecondary,
  },
  equipmentPickerScroll: {
    maxHeight: 150,
  },
  equipmentOption: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  equipmentOptionSelected: {
    backgroundColor: Colors.primary + '10',
  },
  equipmentOptionText: {
    color: Colors.textPrimary,
  },
  equipmentOptionTextSelected: {
    color: Colors.primary,
  },
}); 