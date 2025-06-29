import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Icon } from '../components/icons/Icon'
import { Colors } from '../theme/colors'
import { Typography } from '../theme/typography'
import { Spacing } from '../theme/spacing'
import { getDataManager } from '../lib/services/dataManager'
import type { Tables, TablesUpdate } from '../types/database.types'

type Equipment = Tables<'equipment'>

interface EditEquipmentScreenProps {
  route: { params: { equipment: Equipment } }
  navigation: any
}

export const EditEquipmentScreen: React.FC<EditEquipmentScreenProps> = ({ route, navigation }) => {
  const { equipment } = route.params

  const [formData, setFormData] = useState({
    name: equipment.name || '',
    type: equipment.type || '',
    category: equipment.category || 'other',
    brand: equipment.brand || '',
    model: equipment.model || '',
    serial_number: equipment.serial_number || '',
    install_date: equipment.install_date || '',
    purchase_date: equipment.purchase_date || '',
    warranty_expires: equipment.warranty_expires || '',
    maintenance_frequency_months: equipment.maintenance_frequency_months?.toString() || '',
    location: equipment.location || '',
    room: equipment.room || '',
    notes: equipment.notes || ''
  })

  const [loading, setLoading] = useState(false)

  const categories = [
    { value: 'hvac', label: 'HVAC' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'appliances', label: 'Appliances' },
    { value: 'security', label: 'Security' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'mechanical', label: 'Mechanical' },
    { value: 'safety', label: 'Safety' },
    { value: 'other', label: 'Other' }
  ]

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Equipment name is required')
      return false
    }
    if (!formData.type.trim()) {
      Alert.alert('Validation Error', 'Equipment type is required')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const dataManager = getDataManager(equipment.home_id)
      
      const equipmentData: TablesUpdate<'equipment'> = {
        name: formData.name.trim(),
        type: formData.type.trim(),
        category: formData.category,
        brand: formData.brand.trim() || null,
        model: formData.model.trim() || null,
        serial_number: formData.serial_number.trim() || null,
        install_date: formData.install_date || null,
        purchase_date: formData.purchase_date || null,
        warranty_expires: formData.warranty_expires || null,
        maintenance_frequency_months: formData.maintenance_frequency_months 
          ? parseInt(formData.maintenance_frequency_months) 
          : null,
        location: formData.location.trim() || null,
        room: formData.room.trim() || null,
        notes: formData.notes.trim() || null,
        updated_at: new Date().toISOString()
      }

      // FIXED: Actually save the equipment data instead of just simulating
      console.log('📝 Updating equipment:', equipment.id, equipmentData)
      
      // Save to AsyncStorage (where equipment data is stored and read from)
      const AsyncStorage = await import('@react-native-async-storage/async-storage')
      
      // Get current equipment from storage, update this item, and save back
      const savedEquipmentStr = await AsyncStorage.default.getItem('homekeeper_equipment')
      let savedEquipment = savedEquipmentStr ? JSON.parse(savedEquipmentStr) : []
      
      // Update the specific equipment item
      const updatedEquipment = savedEquipment.map((item: any) => 
        item.id === equipment.id ? { ...item, ...equipmentData } : item
      )
      
      // Save back to storage
      await AsyncStorage.default.setItem('homekeeper_equipment', JSON.stringify(updatedEquipment))
      console.log('✅ Equipment saved to AsyncStorage - changes should now persist!')
      
      // Navigate back immediately after saving
      navigation.goBack()
    } catch (error) {
      console.error('Failed to update equipment:', error)
      Alert.alert('Error', 'Failed to update equipment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderInput = (
    label: string, 
    field: string, 
    placeholder?: string, 
    multiline?: boolean,
    keyboardType?: 'default' | 'numeric'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={formData[field as keyof typeof formData]}
        onChangeText={(value) => updateFormData(field, value)}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  )

  const renderCategoryPicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryChip,
              formData.category === category.value && styles.categoryChipSelected
            ]}
            onPress={() => updateFormData('category', category.value)}
          >
            <Text style={[
              styles.categoryChipText,
              formData.category === category.value && styles.categoryChipTextSelected
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Equipment</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
      >
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {renderInput('Equipment Name *', 'name', 'e.g., HVAC System')}
          {renderInput('Type *', 'type', 'e.g., Central Air Conditioning')}
          {renderCategoryPicker()}
        </View>

        {/* Equipment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Details</Text>
          {renderInput('Brand', 'brand', 'e.g., Carrier')}
          {renderInput('Model', 'model', 'e.g., 24ANB736A003')}
          {renderInput('Serial Number', 'serial_number')}
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Dates</Text>
          {renderInput('Install Date', 'install_date', 'YYYY-MM-DD')}
          {renderInput('Purchase Date', 'purchase_date', 'YYYY-MM-DD')}
          {renderInput('Warranty Expires', 'warranty_expires', 'YYYY-MM-DD')}
          {renderInput('Maintenance Frequency (months)', 'maintenance_frequency_months', '6', false, 'numeric')}
        </View>

        {/* Location & Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Notes</Text>
          {renderInput('Location', 'location', 'e.g., Basement')}
          {renderInput('Room', 'room', 'e.g., Utility Room')}
          {renderInput('Notes', 'notes', 'Additional information...', true)}
        </View>

        <View style={styles.bottomSpacing} />
      </KeyboardAwareScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTitle: {
    fontFamily: Typography.titleLarge.fontFamily,
    fontSize: Typography.titleLarge.fontSize,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray400,
  },
  saveButtonText: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontFamily: Typography.titleMedium.fontFamily,
    fontSize: Typography.titleMedium.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontFamily: Typography.labelMedium.fontFamily,
    fontSize: Typography.labelMedium.fontSize,
    color: Colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
  scrollContentContainer: {
    paddingBottom: Spacing.xl,
  },
}) 