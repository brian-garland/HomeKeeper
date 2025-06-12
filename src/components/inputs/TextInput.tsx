/**
 * TextInput Component - Revolutionary Form Input with Validation
 * WCAG AAA compliant with educational feedback and warm design
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

  // Animated border color
  const animatedBorderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [variantColors.border, variantColors.focusBorder],
  });

  const containerStyle: ViewStyle = {
    ...styles.container,
    width: fullWidth ? '100%' : undefined,
    ...style,
  };

  const inputContainerStyle: ViewStyle = {
    ...styles.inputContainer,
    backgroundColor: disabled ? Colors.gray100 : variantColors.background,
    borderColor: disabled ? Colors.gray300 : variantColors.border,
    minHeight: AccessibilitySpacing.largeTouchTarget,
  };

  const inputTextStyle: TextStyle = {
    ...styles.input,
    ...InputTypography.input,
    color: disabled ? Colors.textDisabled : Colors.textPrimary,
    ...inputStyle,
  };

  const labelStyle: TextStyle = {
    ...styles.label,
    ...InputTypography.label,
    color: disabled ? Colors.textDisabled : variantColors.label,
  };

  const helperStyle: TextStyle = {
    ...styles.helper,
    ...(error ? InputTypography.error : InputTypography.helper),
    color: disabled ? Colors.textDisabled : (error ? Colors.error : variantColors.helper),
  };

  return (
    <View style={containerStyle}>
      {/* Label */}
      {label && (
        <Text style={labelStyle}>
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
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <RNTextInput
          ref={inputRef}
          style={inputTextStyle}
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
          {...textInputProps}
        />

        {/* Right Icon */}
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </Animated.View>

      {/* Helper/Error Text */}
      {(helper || error) && (
        <Text style={helperStyle}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: ComponentSpacing.inputMargin,
  },
  label: {
    marginBottom: ComponentSpacing.labelMargin,
  },
  required: {
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: ComponentSpacing.inputPadding,
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
    paddingVertical: ComponentSpacing.inputPadding,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  leftIconContainer: {
    marginRight: ComponentSpacing.labelMargin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconContainer: {
    marginLeft: ComponentSpacing.labelMargin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    marginTop: ComponentSpacing.labelMargin,
  },
});

export default TextInput; 