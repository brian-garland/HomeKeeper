/**
 * PrimaryButton Component - Warm Cedar Primary Actions
 * Revolutionary UX with WCAG AAA compliance and premium interactions
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { ButtonTypography } from '../../theme/typography';
import { ComponentSpacing, AccessibilitySpacing } from '../../theme/spacing';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'success' | 'warning' | 'error';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'medium',
  variant = 'default',
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  textStyle,
}) => {
  // Get variant colors
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          background: Colors.success,
          backgroundPressed: Colors.successDark,
          backgroundDisabled: Colors.gray300,
        };
      case 'warning':
        return {
          background: Colors.warning,
          backgroundPressed: Colors.warningDark,
          backgroundDisabled: Colors.gray300,
        };
      case 'error':
        return {
          background: Colors.error,
          backgroundPressed: Colors.errorDark,
          backgroundDisabled: Colors.gray300,
        };
      default:
        return {
          background: Colors.primary,
          backgroundPressed: Colors.primaryDark,
          backgroundDisabled: Colors.gray300,
        };
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: ComponentSpacing.buttonPaddingVertical - 4,
          paddingHorizontal: ComponentSpacing.buttonPaddingHorizontal - 4,
          minHeight: 40,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingVertical: ComponentSpacing.buttonPaddingVertical + 4,
          paddingHorizontal: ComponentSpacing.buttonPaddingHorizontal + 4,
          minHeight: 56,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: ComponentSpacing.buttonPaddingVertical,
          paddingHorizontal: ComponentSpacing.buttonPaddingHorizontal,
          minHeight: AccessibilitySpacing.largeTouchTarget,
          fontSize: ButtonTypography.primary.fontSize,
        };
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  const buttonStyles: ViewStyle = {
    ...styles.button,
    backgroundColor: disabled 
      ? variantColors.backgroundDisabled 
      : variantColors.background,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    minHeight: sizeStyles.minHeight,
    width: fullWidth ? '100%' : undefined,
    opacity: loading ? 0.8 : 1,
    ...style,
  };

  const textStyles: TextStyle = {
    ...styles.text,
    ...ButtonTypography.primary,
    fontSize: sizeStyles.fontSize,
    color: disabled ? Colors.textDisabled : Colors.white,
    ...textStyle,
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={Colors.white}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text style={textStyles} numberOfLines={1}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: Colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default PrimaryButton; 