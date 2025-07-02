/**
 * DropdownPicker Component - Elegant Dropdown with HomeKeeper Design System
 * Consistent with existing input patterns and WCAG AAA compliant
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
  TextStyle,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Icon } from '../icons/Icon';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export interface DropdownOption {
  id: string | null;
  label: string;
  value?: any;
}

interface DropdownPickerProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedId: string | null;
  onSelect: (optionId: string | null) => void;
  disabled?: boolean;
  error?: string;
  helper?: string;
  required?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: ViewStyle;
}

const { height: screenHeight } = Dimensions.get('window');

export const DropdownPicker: React.FC<DropdownPickerProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  selectedId,
  onSelect,
  disabled = false,
  error,
  helper,
  required = false,
  fullWidth = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const animatedRotation = useRef(new Animated.Value(0)).current;
  const dropdownRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  const selectedOption = options.find(option => option.id === selectedId);

  const handleOpen = () => {
    if (disabled) return;

    dropdownRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      // Validate measure callback parameters to prevent positioning errors
      if (
        x !== undefined && y !== undefined && 
        width !== undefined && height !== undefined && 
        pageX !== undefined && pageY !== undefined &&
        width > 0 && height > 0
      ) {
        setDropdownLayout({ x: pageX, y: pageY, width, height });
        setIsVisible(true);
        
        Animated.spring(animatedRotation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } else {
        console.warn('DropdownPicker: Invalid measure parameters, skipping dropdown open');
      }
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    Animated.spring(animatedRotation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleSelect = (optionId: string | null) => {
    onSelect(optionId);
    handleClose();
  };

  const rotation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const getVariantColors = () => {
    if (error) {
      return {
        border: Colors.error,
        background: Colors.errorLight,
        label: Colors.error,
        helper: Colors.error,
      };
    }

    return {
      border: Colors.border,
      background: Colors.white,
      label: Colors.textSecondary,
      helper: Colors.textTertiary,
    };
  };

  const variantColors = getVariantColors();

  const containerStyle: ViewStyle = {
    ...styles.container,
    width: fullWidth ? '100%' : undefined,
    ...style,
  };

  const dropdownStyle: ViewStyle = {
    ...styles.dropdown,
    backgroundColor: disabled ? Colors.gray100 : variantColors.background,
    borderColor: disabled ? Colors.gray300 : variantColors.border,
  };

  const labelStyle: TextStyle = {
    ...styles.label,
    color: disabled ? Colors.textDisabled : variantColors.label,
  };

  const helperStyle: TextStyle = {
    ...styles.helper,
    color: disabled ? Colors.textDisabled : (error ? Colors.error : variantColors.helper),
  };

  const selectedTextStyle: TextStyle = {
    ...styles.selectedText,
    color: selectedOption 
      ? (disabled ? Colors.textDisabled : Colors.textPrimary)
      : (disabled ? Colors.textDisabled : Colors.textTertiary),
  };

  // Calculate modal position
  const modalTop = dropdownLayout.y + dropdownLayout.height + 4;
  const modalMaxHeight = screenHeight - modalTop - 100; // Leave some space at bottom

  return (
    <View style={containerStyle}>
      {/* Label */}
      {label && (
        <Text style={labelStyle}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Dropdown Trigger */}
      <TouchableOpacity
        ref={dropdownRef}
        style={dropdownStyle}
        onPress={handleOpen}
        disabled={disabled}
        accessible={true}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint || helper || 'Tap to open dropdown menu'}
        accessibilityState={{ disabled, expanded: isVisible }}
        accessibilityRole="button"
        testID={testID}
      >
        <Text style={selectedTextStyle} numberOfLines={1}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Icon 
            name="down" 
            size="sm" 
            color={disabled ? Colors.textDisabled : Colors.textSecondary} 
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Helper/Error Text */}
      {(helper || error) && (
        <Text style={helperStyle}>
          {error || helper}
        </Text>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleClose}
        >
          <View
            style={[
              styles.modalContent,
              {
                top: modalTop,
                left: dropdownLayout.x,
                width: dropdownLayout.width,
                maxHeight: modalMaxHeight,
              },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.id || 'all'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedId === item.id && styles.optionItemSelected,
                  ]}
                  onPress={() => handleSelect(item.id)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: selectedId === item.id }}
                >
                  <Text style={[
                    styles.optionText,
                    selectedId === item.id && styles.optionTextSelected,
                  ]}>
                    {item.label}
                  </Text>
                  {selectedId === item.id && (
                    <Icon name="check" size="sm" color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.labelMedium,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.error,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: Colors.gray900,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectedText: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  helper: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.gray900,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  optionItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default DropdownPicker;