/**
 * SecondaryButton Component - Outlined Actions with Warm Cedar
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

interface SecondaryButtonProps {
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

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
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
          border: Colors.success,
          text: Colors.success,
          textPressed: Colors.successDark,
          background: Colors.successLight,
          backgroundPressed: Colors.success,
        };
      case 'warning':
        return {
          border: Colors.warning,
          text: Colors.warning,
          textPressed: Colors.warningDark,
          background: Colors.warningLight,
          backgroundPressed: Colors.warning,
        };
      case 'error':
        return {
          border: Colors.error,
          text: Colors.error,
          textPressed: Colors.errorDark,
          background: Colors.errorLight,
          backgroundPressed: Colors.error,
        };
      default:
        return {
          border: Colors.primary,
          text: Colors.primary,
          textPressed: Colors.primaryDark,
          background: Colors.primaryLight,
          backgroundPressed: Colors.primary,
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
          fontSize: ButtonTypography.secondary.fontSize,
        };
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  const buttonStyles: ViewStyle = {
    ...styles.button,
    borderColor: disabled ? Colors.gray300 : variantColors.border,
    backgroundColor: disabled ? Colors.gray100 : Colors.white,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    minHeight: sizeStyles.minHeight,
    width: fullWidth ? '100%' : undefined,
    opacity: loading ? 0.8 : 1,
    ...style,
  };

  const textStyles: TextStyle = {
    ...styles.text,
    ...ButtonTypography.secondary,
    fontSize: sizeStyles.fontSize,
    color: disabled ? Colors.textDisabled : variantColors.text,
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
          color={variantColors.text}
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
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
  text: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default SecondaryButton; 