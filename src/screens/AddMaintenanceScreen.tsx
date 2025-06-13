import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/icons/Icon';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { useDataContext } from '../contexts/DataContext';

interface MaintenanceFormData {
  title: string;
  description: string;
  category: string;
  scheduled_date: string;
  estimated_cost: number;
  vendor_name: string;
}

const categories = [
  { id: 'hvac', label: 'HVAC', icon: 'wrench' as const },
  { id: 'plumbing', label: 'Plumbing', icon: 'plumbing' as const },
  { id: 'electrical', label: 'Electrical', icon: 'electrical' as const },
  { id: 'exterior', label: 'Exterior', icon: 'home' as const },
  { id: 'interior', label: 'Interior', icon: 'house' as const },
  { id: 'appliances', label: 'Appliances', icon: 'settings' as const },
  { id: 'general', label: 'General', icon: 'hammer' as const },
];

export const AddMaintenanceScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addMaintenance, homes } = useDataContext();
  const [loading, setLoading] = useState(false);
  
  const getInitialFormData = (): MaintenanceFormData => ({
    title: '',
    description: '',
    category: 'general',
    scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
    estimated_cost: 0,
    vendor_name: '',
  });

  const [formData, setFormData] = useState<MaintenanceFormData>(getInitialFormData());

  // Reset form when screen is focused (when navigating to this screen)
  useFocusEffect(
    React.useCallback(() => {
      console.log('AddMaintenanceScreen focused - resetting form');
      setFormData(getInitialFormData());
    }, [])
  );

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a maintenance title');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a maintenance description');
      return;
    }

    setLoading(true);
    try {
      const maintenanceData = {
        id: `maintenance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        scheduled_date: formData.scheduled_date,
        estimated_cost: formData.estimated_cost,
        vendor_name: formData.vendor_name,
        home_id: homes[0]?.id || '', // Use first home or empty string
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Default values for required fields
        active: true,
        actual_cost: null,
        completed_date: null,
        equipment_id: null,
        maintenance_type: null,
        next_due_date: null,
        notes: null,
        photo_urls: null,
        priority: null,
        receipt_urls: null,
        recurring: false,
        recurring_frequency_months: null,
        vendor_contact: null,
        vendor_rating: null,
        warranty_work: false,
      };

      await addMaintenance(maintenanceData);
      
      Alert.alert('Success', 'Maintenance scheduled successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate specifically to MaintenanceList screen
            (navigation as any).navigate('MaintenanceList');
          }
        }
      ]);
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      Alert.alert('Error', 'Failed to schedule maintenance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof MaintenanceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
              <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
        >
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Maintenance Title *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
            placeholder="Enter maintenance title"
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
            placeholder="Describe the maintenance work needed"
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

        {/* Scheduled Date Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Scheduled Date</Text>
          <TextInput
            style={styles.textInput}
            value={formData.scheduled_date}
            onChangeText={(text) => updateFormData('scheduled_date', text)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textTertiary}
          />
          <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
        </View>

        {/* Estimated Cost Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Estimated Cost</Text>
          <View style={styles.costInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.costInput}
              value={formData.estimated_cost.toString()}
              onChangeText={(text) => updateFormData('estimated_cost', parseFloat(text) || 0)}
              placeholder="0.00"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Vendor Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Vendor/Service Provider</Text>
          <TextInput
            style={styles.textInput}
            value={formData.vendor_name}
            onChangeText={(text) => updateFormData('vendor_name', text)}
            placeholder="Enter vendor name (optional)"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="info" size="sm" color={Colors.info} />
          <Text style={styles.infoText}>
            You can update maintenance details, add photos, and track costs after scheduling.
          </Text>
        </View>
        
        {/* Action Buttons - Inside ScrollView */}
        <View style={styles.actions}>
          <SecondaryButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
          <PrimaryButton
            title={loading ? "Scheduling..." : "Schedule Maintenance"}
            onPress={handleSave}
            disabled={loading}
            style={styles.saveButton}
          />
        </View>
        
        {/* Extra spacing to ensure buttons are scrollable above keyboard */}
        <View style={styles.keyboardSpacer} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
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
  costInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  currencySymbol: {
    fontFamily: Typography.bodyLarge.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
    paddingLeft: Spacing.md,
  },
  costInput: {
    flex: 1,
    padding: Spacing.md,
    fontFamily: Typography.bodyLarge.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    color: Colors.textPrimary,
  },
  helperText: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '10',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  keyboardSpacer: {
    height: 200, // Extra space to ensure buttons are scrollable above keyboard
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
}); 