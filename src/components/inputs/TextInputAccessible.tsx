/**
 * TextInput Component - Accessible Version
 * Supports dynamic font scaling up to 3x for accessibility
 * WCAG AAA compliant with dynamic height adjustment
 */

import React, { useState, useRef } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
  Platform,
  Animated,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { InputTypography } from '../../theme/typography';
import { ComponentSpacing, AccessibilitySpacing } from '../../theme/spacing';
import { useAccessibleStyles } from '../../hooks/useAccessibleStyles';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helper,
  required = false,
  disabled = false,
  fullWidth = true,
  variant = 'default',
  leftIcon,
  rightIcon,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  inputStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedBorder = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<RNTextInput>(null);
  const accessibleStyles = useAccessibleStyles();

  // Handle focus animations
  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(animatedBorder, {
      toValue: 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(animatedBorder, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Get variant colors
  const getVariantColors = () => {
    if (error) {
      return {
        border: Colors.error,
        focusBorder: Colors.error,
        background: Colors.errorLight,
        label: Colors.error,
        helper: Colors.error,
      };
    }

    switch (variant) {
      case 'success':
        return {
          border: Colors.success,
          focusBorder: Colors.success,
          background: Colors.successLight,
          label: Colors.success,
          helper: Colors.success,
        };
      case 'warning':
        return {
          border: Colors.warning,
          focusBorder: Colors.warning,
          background: Colors.warningLight,
          label: Colors.warning,
          helper: Colors.warning,
        };
      case 'error':
        return {
          border: Colors.error,
          focusBorder: Colors.error,
          background: Colors.errorLight,
          label: Colors.error,
          helper: Colors.error,
        };
      default:
        return {
          border: isFocused ? Colors.primary : Colors.border,
          focusBorder: Colors.primary,
          background: Colors.white,
          label: Colors.textSecondary,
          helper: Colors.textTertiary,
        };
    }
  };

  const variantColors = getVariantColors();
  const platformAdjustments = accessibleStyles.getPlatformAdjustments();

  // Animated border color
  const animatedBorderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [variantColors.border, variantColors.focusBorder],
  });

  const containerStyle: ViewStyle = {
    ...styles.container,
    width: fullWidth ? '100%' : undefined,
    marginBottom: accessibleStyles.getScaledSpacing(ComponentSpacing.inputMargin),
    ...style,
  };

  const inputContainerStyle: ViewStyle = {
    ...styles.inputContainer,
    backgroundColor: disabled ? Colors.gray100 : variantColors.background,
    borderColor: disabled ? Colors.gray300 : variantColors.border,
    minHeight: Math.max(AccessibilitySpacing.largeTouchTarget, accessibleStyles.scaledInputHeight),
    paddingVertical: accessibleStyles.getScaledSpacing(12) + platformAdjustments.additionalPadding,
    paddingHorizontal: accessibleStyles.getScaledSpacing(ComponentSpacing.inputPadding),
  };

  const inputTextStyle: TextStyle = {
    ...styles.input,
    ...InputTypography.input,
    color: disabled ? Colors.textDisabled : Colors.textPrimary,
    minHeight: InputTypography.input.fontSize * platformAdjustments.lineHeightMultiplier,
    ...inputStyle,
  };

  const labelStyle: TextStyle = {
    ...styles.label,
    ...InputTypography.label,
    color: disabled ? Colors.textDisabled : variantColors.label,
    marginBottom: accessibleStyles.getScaledSpacing(ComponentSpacing.labelMargin),
  };

  const helperStyle: TextStyle = {
    ...styles.helper,
    ...(error ? InputTypography.error : InputTypography.helper),
    color: disabled ? Colors.textDisabled : (error ? Colors.error : variantColors.helper),
    marginTop: accessibleStyles.getScaledSpacing(ComponentSpacing.labelMargin),
  };

  return (
    <View style={containerStyle}>
      {/* Label */}
      {label && (
        <Text style={labelStyle} allowFontScaling={true}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          inputContainerStyle,
          {
            borderColor: disabled ? Colors.gray300 : animatedBorderColor,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={[
            styles.leftIconContainer,
            { marginRight: accessibleStyles.getScaledSpacing(ComponentSpacing.labelMargin) }
          ]}>
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <RNTextInput
          ref={inputRef}
          style={inputTextStyle}
          {...textInputProps}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          editable={!disabled}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint || helper}
          accessibilityState={{ disabled }}
          testID={testID}
          allowFontScaling={true}
          multiline={textInputProps.multiline ?? accessibleStyles.isExtraLargeTextMode}
          numberOfLines={
            textInputProps.numberOfLines ?? 
            (textInputProps.multiline || accessibleStyles.isExtraLargeTextMode ? 2 : 1)
          }
        />

        {/* Right Icon */}
        {rightIcon && (
          <View style={[
            styles.rightIconContainer,
            { marginLeft: accessibleStyles.getScaledSpacing(ComponentSpacing.labelMargin) }
          ]}>
            {rightIcon}
          </View>
        )}
      </Animated.View>

      {/* Helper/Error Text */}
      {(helper || error) && (
        <Text 
          style={helperStyle} 
          allowFontScaling={true}
          numberOfLines={accessibleStyles.getTextLines(2)}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Dynamic margins handled in component
  },
  label: {
    // Dynamic sizing handled in component
  },
  required: {
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    // Dynamic padding and height handled in component
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
  input: {
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 0,
        paddingBottom: 0,
      },
      android: {
        textAlignVertical: 'center',
        paddingVertical: 0,
        includeFontPadding: false,
      },
    }),
  },
  leftIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    // Dynamic sizing handled in component
  },
});