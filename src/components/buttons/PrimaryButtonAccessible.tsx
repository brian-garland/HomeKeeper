/**
 * PrimaryButton Component - Accessible Version
 * Supports dynamic font scaling up to 3x for accessibility
 * WCAG AAA compliant with dynamic height adjustment
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
import { useAccessibleStyles } from '../../hooks/useAccessibleStyles';

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
  const accessibleStyles = useAccessibleStyles();

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

  // Get dynamic size styles based on font scaling
  const getSizeStyles = () => {
    const platformAdjustments = accessibleStyles.getPlatformAdjustments();
    
    switch (size) {
      case 'small':
        return {
          paddingVertical: accessibleStyles.getScaledSpacing(8) + platformAdjustments.additionalPadding,
          paddingHorizontal: accessibleStyles.getScaledSpacing(16),
          minHeight: Math.max(40, ButtonTypography.tertiary.fontSize * 2.5),
          fontSize: ButtonTypography.tertiary.fontSize,
        };
      case 'large':
        return {
          paddingVertical: accessibleStyles.getScaledSpacing(16) + platformAdjustments.additionalPadding,
          paddingHorizontal: accessibleStyles.getScaledSpacing(24),
          minHeight: Math.max(56, ButtonTypography.primary.fontSize * 3),
          fontSize: ButtonTypography.primary.fontSize,
        };
      default:
        return {
          paddingVertical: accessibleStyles.getScaledSpacing(12) + platformAdjustments.additionalPadding,
          paddingHorizontal: accessibleStyles.getScaledSpacing(20),
          minHeight: Math.max(48, accessibleStyles.scaledButtonHeight),
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
        <Text 
          style={textStyles} 
          numberOfLines={accessibleStyles.getTextLines(1)}
          allowFontScaling={true}
        >
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