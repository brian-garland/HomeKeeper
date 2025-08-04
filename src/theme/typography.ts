/**
 * HomeKeeper Typography System - Inter Excellence
 * Professional Typography for Revolutionary UX
 * 
 * Font Strategy: Inter for clarity and warmth
 * Accessibility: WCAG AAA compliant with Dynamic Type support
 * Platform: Optimized for iOS and Android native feel
 */

import { Platform, PixelRatio } from 'react-native';
import { Colors } from './colors';

// Font scaling utility for accessibility
export const getFontScale = () => {
  try {
    const scale = PixelRatio.getFontScale();
    // Support up to 3x scaling for better accessibility
    // This ensures users with visual impairments can use the app
    const maxScale = 3.0; // Maximum 300% scaling for accessibility
    const minScale = 0.85; // Minimum 85% scaling
    return Math.max(minScale, Math.min(maxScale, scale));
  } catch (error) {
    // Fallback for test environments or when PixelRatio is not available
    return 1.0;
  }
};

// Helper function to create responsive font sizes
export const getResponsiveFontSize = (baseSize: number): number => {
  return Math.round(baseSize * getFontScale());
};

// Helper function to create responsive line heights
export const getResponsiveLineHeight = (baseSize: number, ratio: number = 1.4): number => {
  return Math.round(baseSize * getFontScale() * ratio);
};

// Font Family Strategy
const FontFamily = {
  regular: Platform.select({
    ios: 'Inter-Regular',
    android: 'Inter-Regular',
    default: 'Inter-Regular',
  }),
  medium: Platform.select({
    ios: 'Inter-Medium',
    android: 'Inter-Medium', 
    default: 'Inter-Medium',
  }),
  semibold: Platform.select({
    ios: 'Inter-SemiBold',
    android: 'Inter-SemiBold',
    default: 'Inter-SemiBold',
  }),
  bold: Platform.select({
    ios: 'Inter-Bold',
    android: 'Inter-Bold',
    default: 'Inter-Bold',
  }),
} as const;

// Typography Scale & Hierarchy
export const Typography = {
  // Large Display - Hero sections, onboarding
  displayLarge: {
    fontFamily: FontFamily.bold,
    fontSize: getResponsiveFontSize(32),
    lineHeight: getResponsiveLineHeight(32, 1.25),
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  
  // Medium Display - Section headers
  displayMedium: {
    fontFamily: FontFamily.bold,
    fontSize: getResponsiveFontSize(28),
    lineHeight: getResponsiveLineHeight(28, 1.29),
    letterSpacing: -0.25,
    color: Colors.textPrimary,
  },
  
  // Small Display - Card headers
  displaySmall: {
    fontFamily: FontFamily.bold,
    fontSize: getResponsiveFontSize(24),
    lineHeight: getResponsiveLineHeight(24, 1.33),
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Large Headline - Screen titles
  headlineLarge: {
    fontFamily: FontFamily.semibold,
    fontSize: getResponsiveFontSize(24),
    lineHeight: getResponsiveLineHeight(24, 1.33),
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Medium Headline - Card titles
  headlineMedium: {
    fontFamily: FontFamily.semibold,
    fontSize: getResponsiveFontSize(20),
    lineHeight: getResponsiveLineHeight(20, 1.4),
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Small Headline - Section titles
  headlineSmall: {
    fontFamily: FontFamily.semibold,
    fontSize: getResponsiveFontSize(18),
    lineHeight: getResponsiveLineHeight(18, 1.33),
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Large Title - Navigation titles
  titleLarge: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(18),
    lineHeight: getResponsiveLineHeight(18, 1.33),
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Medium Title - Form labels, important text
  titleMedium: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(16),
    lineHeight: getResponsiveLineHeight(16, 1.5),
    letterSpacing: 0.1,
    color: Colors.textPrimary,
  },
  
  // Small Title - Input labels
  titleSmall: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(14),
    lineHeight: getResponsiveLineHeight(14, 1.43),
    letterSpacing: 0.1,
    color: Colors.textSecondary,
  },
  
  // Large Label - Button text, tabs
  labelLarge: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(16),
    lineHeight: getResponsiveLineHeight(16, 1.25),
    letterSpacing: 0.1,
    color: Colors.textPrimary,
  },
  
  // Medium Label - Secondary buttons
  labelMedium: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(14),
    lineHeight: getResponsiveLineHeight(14, 1.43),
    letterSpacing: 0.2,
    color: Colors.textSecondary,
  },
  
  // Small Label - Tags, badges
  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(12),
    lineHeight: getResponsiveLineHeight(12, 1.33),
    letterSpacing: 0.4,
    color: Colors.textTertiary,
  },
  
  // Large Body - Main content
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(16),
    lineHeight: getResponsiveLineHeight(16, 1.5),
    letterSpacing: 0.1,
    color: Colors.textPrimary,
  },
  
  // Medium Body - Standard text
  bodyMedium: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(14),
    lineHeight: getResponsiveLineHeight(14, 1.43),
    letterSpacing: 0.2,
    color: Colors.textSecondary,
  },
  
  // Small Body - Captions, metadata
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(12),
    lineHeight: getResponsiveLineHeight(12, 1.33),
    letterSpacing: 0.3,
    color: Colors.textTertiary,
  },
  
  // Caption - Small supporting text
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(12),
    lineHeight: getResponsiveLineHeight(12, 1.33),
    letterSpacing: 0.4,
    color: Colors.textTertiary,
  },
  
  // Overline - Small caps labels
  overline: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(10),
    lineHeight: getResponsiveLineHeight(10, 1.6),
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
  },
} as const;

// Button Typography Variants
export const ButtonTypography = {
  primary: {
    fontFamily: FontFamily.semibold,
    fontSize: getResponsiveFontSize(16),
    lineHeight: getResponsiveLineHeight(16, 1.25),
    letterSpacing: 0.1,
    color: Colors.white,
  },
  secondary: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(16),
    lineHeight: getResponsiveLineHeight(16, 1.25),
    letterSpacing: 0.1,
    color: Colors.primary,
  },
  tertiary: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(14),
    lineHeight: getResponsiveLineHeight(14, 1.43),
    letterSpacing: 0.2,
    color: Colors.textSecondary,
  },
} as const;

// Input Typography
export const InputTypography = {
  input: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(16),
    lineHeight: getResponsiveLineHeight(16, 1.5),
    letterSpacing: 0.1,
    color: Colors.textPrimary,
  },
  placeholder: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(16),
    lineHeight: getResponsiveLineHeight(16, 1.5),
    letterSpacing: 0.1,
    color: Colors.textTertiary,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(14),
    lineHeight: getResponsiveLineHeight(14, 1.43),
    letterSpacing: 0.1,
    color: Colors.textSecondary,
  },
  helper: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(12),
    lineHeight: getResponsiveLineHeight(12, 1.33),
    letterSpacing: 0.3,
    color: Colors.textTertiary,
  },
  error: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(12),
    lineHeight: getResponsiveLineHeight(12, 1.33),
    letterSpacing: 0.3,
    color: Colors.error,
  },
} as const;

// Educational Content Typography
export const EducationalTypography = {
  stepTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: getResponsiveFontSize(18),
    lineHeight: getResponsiveLineHeight(18, 1.33),
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  stepDescription: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(16),
    lineHeight: getResponsiveLineHeight(16, 1.5),
    letterSpacing: 0.1,
    color: Colors.textSecondary,
  },
  safetyTip: {
    fontFamily: FontFamily.medium,
    fontSize: getResponsiveFontSize(14),
    lineHeight: getResponsiveLineHeight(14, 1.43),
    letterSpacing: 0.1,
    color: Colors.warning,
  },
  learningObjective: {
    fontFamily: FontFamily.regular,
    fontSize: getResponsiveFontSize(14),
    lineHeight: getResponsiveLineHeight(14, 1.43),
    letterSpacing: 0.1,
    color: Colors.info,
  },
} as const;

// Accessibility Typography Helpers
export const AccessibilityTypography = {
  // Minimum sizes for accessibility
  minimumTouchTarget: 44,
  minimumTextSize: 12,
  
  // High contrast variants for accessibility mode
  highContrast: {
    textPrimary: Colors.gray900,
    textSecondary: Colors.gray800,
    background: Colors.white,
  },
  
  // Dynamic Type scale factors for iOS
  dynamicTypeScale: {
    xSmall: 0.82,
    small: 0.88,
    medium: 1.0,
    large: 1.12,
    xLarge: 1.23,
    xxLarge: 1.35,
    xxxLarge: 1.48,
  },
} as const;

// Typography Usage Guidelines
export const TypographyUsage = {
  display: [
    'Welcome screen headlines',
    'Onboarding section titles',
    'Achievement celebrations',
    'Major milestone announcements'
  ],
  headline: [
    'Screen titles',
    'Card section headers',
    'Feature introductions',
    'Important notifications'
  ],
  title: [
    'Navigation bar titles',
    'Form section headers',
    'Settings categories',
    'Task categories'
  ],
  label: [
    'Button text',
    'Tab labels',
    'Form field labels',
    'Status indicators'
  ],
  body: [
    'Task descriptions',
    'Educational content',
    'Help text',
    'User input content'
  ],
  caption: [
    'Timestamps',
    'Image captions',
    'Metadata',
    'Legal text'
  ]
} as const;

// Platform-specific adjustments
export const PlatformTypography = {
  ios: {
    // iOS prefers slightly tighter letter spacing
    letterSpacingAdjustment: -0.05,
    // iOS text appears slightly heavier
    fontWeightAdjustment: -100,
  },
  android: {
    // Android prefers slightly more letter spacing
    letterSpacingAdjustment: 0.05,
    // Android text can handle regular weights
    fontWeightAdjustment: 0,
  },
} as const;

export type TypographyKey = keyof typeof Typography;
export type ButtonTypographyKey = keyof typeof ButtonTypography;
export type InputTypographyKey = keyof typeof InputTypography; 