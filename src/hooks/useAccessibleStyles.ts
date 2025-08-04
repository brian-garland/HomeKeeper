/**
 * useAccessibleStyles Hook
 * Provides dynamic styling that adapts to font scaling and accessibility settings
 * Ensures UI remains usable at all font scales (up to 3x)
 */

import { useMemo } from 'react';
import { PixelRatio, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const useAccessibleStyles = () => {
  const fontScale = useMemo(() => {
    try {
      const scale = PixelRatio.getFontScale();
      // Support up to 3x scaling for better accessibility
      const maxScale = 3.0;
      const minScale = 0.85;
      return Math.max(minScale, Math.min(maxScale, scale));
    } catch (error) {
      return 1.0;
    }
  }, []);

  // Dynamic spacing that scales with font size
  const getScaledSpacing = (baseSpacing: number) => {
    // Scale spacing more conservatively than fonts (50% of font scale delta)
    const scaleFactor = 1 + (fontScale - 1) * 0.5;
    return Math.round(baseSpacing * scaleFactor);
  };

  // Dynamic dimensions that adapt to content
  const getDynamicHeight = (baseHeight: number, includesPadding: boolean = true) => {
    // If height includes padding, scale more aggressively
    if (includesPadding) {
      return Math.round(baseHeight * fontScale);
    }
    // For heights without padding, use conservative scaling
    return Math.round(baseHeight * (1 + (fontScale - 1) * 0.5));
  };

  // Get responsive container width that accounts for larger text
  const getResponsiveWidth = (percentage: number = 100) => {
    const baseWidth = (screenWidth * percentage) / 100;
    // At larger font scales, reduce width slightly to prevent overflow
    if (fontScale > 1.5) {
      return baseWidth * 0.95;
    }
    return baseWidth;
  };

  // Check if we need to use compact layouts
  const useCompactLayout = fontScale > 2.0;

  // Get appropriate number of lines for text elements
  const getTextLines = (defaultLines: number = 1) => {
    if (fontScale > 2.5) return defaultLines + 2;
    if (fontScale > 2.0) return defaultLines + 1;
    return defaultLines;
  };

  // Platform-specific adjustments
  const getPlatformAdjustments = () => {
    if (Platform.OS === 'ios') {
      return {
        additionalPadding: fontScale > 1.5 ? 4 : 0,
        lineHeightMultiplier: 1.2,
      };
    }
    return {
      additionalPadding: fontScale > 1.5 ? 6 : 0,
      lineHeightMultiplier: 1.25,
    };
  };

  return {
    fontScale,
    getScaledSpacing,
    getDynamicHeight,
    getResponsiveWidth,
    useCompactLayout,
    getTextLines,
    getPlatformAdjustments,
    
    // Convenience methods
    isLargeTextMode: fontScale > 1.5,
    isExtraLargeTextMode: fontScale > 2.0,
    
    // Pre-calculated common values
    scaledButtonHeight: getDynamicHeight(48, true),
    scaledInputHeight: getDynamicHeight(56, true),
    scaledCardPadding: getScaledSpacing(16),
    scaledScreenPadding: getScaledSpacing(20),
  };
};

// Type exports
export type AccessibleStyles = ReturnType<typeof useAccessibleStyles>;