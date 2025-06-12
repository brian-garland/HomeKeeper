/**
 * HomeKeeper Spacing System - 4px Base Unit Mathematics
 * Mathematical consistency for Revolutionary UX
 * 
 * Design Philosophy: Mathematical progression creates visual harmony
 * Base Unit: 4px for consistent rhythm throughout the app
 * Responsive: Scales appropriately for different screen sizes
 */

// Base 4px unit spacing system
const BASE_UNIT = 4;

export const Spacing = {
  // Micro spacing
  xs: BASE_UNIT,           // 4px  - Minimal spacing, border widths
  sm: BASE_UNIT * 2,       // 8px  - Small gaps between related elements
  
  // Standard spacing
  md: BASE_UNIT * 3,       // 12px - Medium gaps, compact layouts
  lg: BASE_UNIT * 4,       // 16px - Standard gaps, comfortable spacing
  xl: BASE_UNIT * 5,       // 20px - Large gaps, generous spacing
  
  // Section spacing
  xxl: BASE_UNIT * 6,      // 24px - Section spacing, card padding
  xxxl: BASE_UNIT * 8,     // 32px - Major spacing, screen padding
  huge: BASE_UNIT * 12,    // 48px - Hero spacing, large separations
  massive: BASE_UNIT * 16, // 64px - Maximum spacing for major sections
} as const;

// Component-specific spacing constants
export const ComponentSpacing = {
  // Button spacing
  buttonPaddingVertical: Spacing.md,      // 12px
  buttonPaddingHorizontal: Spacing.xl,    // 20px
  buttonGap: Spacing.sm,                  // 8px between buttons
  
  // Card spacing
  cardPadding: Spacing.lg,                // 16px internal padding
  cardMargin: Spacing.lg,                 // 16px between cards
  cardGap: Spacing.md,                    // 12px between card elements
  
  // Form spacing
  inputPadding: Spacing.lg,               // 16px input internal padding
  inputMargin: Spacing.lg,                // 16px between form fields
  labelMargin: Spacing.sm,                // 8px between label and input
  
  // Screen spacing
  screenPadding: Spacing.xl,              // 20px screen edge padding
  screenMargin: Spacing.xxxl,             // 32px top/bottom screen margins
  
  // Navigation spacing
  tabBarHeight: 72,                       // Standard tab bar height
  headerHeight: 64,                       // Standard header height
  navigationPadding: Spacing.lg,          // 16px navigation padding
  
  // Touch targets
  minTouchTarget: 44,                     // Minimum 44px touch target
  touchTargetPadding: Spacing.md,         // 12px around touch targets
} as const;

// Layout grid system
export const LayoutSpacing = {
  // Grid columns (based on 20px margins)
  gridMargin: Spacing.xl,                 // 20px outer margins
  gridGutter: Spacing.lg,                 // 16px between columns
  
  // Responsive breakpoints spacing
  mobile: {
    padding: Spacing.lg,                  // 16px on mobile
    margin: Spacing.xl,                   // 20px margins
  },
  tablet: {
    padding: Spacing.xl,                  // 20px on tablet
    margin: Spacing.xxl,                  // 24px margins
  },
  desktop: {
    padding: Spacing.xxl,                 // 24px on desktop
    margin: Spacing.xxxl,                 // 32px margins
  },
} as const;

// Animation and gesture spacing
export const InteractionSpacing = {
  // Swipe gesture thresholds
  swipeThreshold: 30,                     // 30px swipe distance to trigger
  swipeVelocityThreshold: 500,            // 500px/s velocity threshold
  
  // Pull to refresh
  pullToRefreshDistance: 80,              // 80px pull distance
  
  // Scroll indicators
  scrollIndicatorInset: Spacing.sm,       // 8px from edge
  
  // Shadow offsets
  shadowOffset: {
    small: { width: 0, height: 2 },       // Small shadow
    medium: { width: 0, height: 4 },      // Medium shadow
    large: { width: 0, height: 8 },       // Large shadow
  },
} as const;

// Accessibility spacing helpers
export const AccessibilitySpacing = {
  // Minimum spacing for accessibility
  minInteractiveSpacing: Spacing.sm,      // 8px minimum between interactive elements
  focusOutlineWidth: 2,                   // 2px focus outline
  focusOutlineOffset: 2,                  // 2px focus outline offset
  
  // Large touch targets for accessibility
  largeTouchTarget: 48,                   // 48px for better accessibility
  extraLargeTouchTarget: 56,              // 56px for critical actions
} as const;

// Platform-specific spacing adjustments
export const PlatformSpacing = {
  ios: {
    // iOS safe area adjustments
    safeAreaTopAdjustment: 44,            // iOS status bar + notch
    safeAreaBottomAdjustment: 34,         // iOS home indicator
    tabBarBottomPadding: 34,              // iOS tab bar bottom padding
  },
  android: {
    // Android status bar and navigation
    statusBarHeight: 24,                  // Android status bar
    navigationBarHeight: 48,              // Android navigation bar
    fabMargin: Spacing.lg,                // FAB margin from edges
  },
} as const;

// Spacing usage guidelines
export const SpacingUsage = {
  xs: [
    'Border widths',
    'Divider lines',
    'Icon padding',
    'Badge spacing'
  ],
  sm: [
    'Related element gaps',
    'List item internal spacing',
    'Chip padding',
    'Tag margins'
  ],
  md: [
    'Form field spacing',
    'Card internal gaps',
    'Button padding (vertical)',
    'Compact layouts'
  ],
  lg: [
    'Standard component spacing',
    'Screen edge padding',
    'Card padding',
    'Comfortable layouts'
  ],
  xl: [
    'Button padding (horizontal)',
    'Section spacing',
    'Generous layouts',
    'Important separations'
  ],
  xxl: [
    'Card spacing',
    'Section headers',
    'Feature separations',
    'Grouped content'
  ],
  xxxl: [
    'Screen sections',
    'Major feature groups',
    'Onboarding spacing',
    'Hero sections'
  ],
  huge: [
    'Page sections',
    'Major separations',
    'Welcome screens',
    'Empty states'
  ]
} as const;

// Helper functions for responsive spacing
export const getResponsiveSpacing = (size: keyof typeof Spacing, scale: number = 1) => {
  return Spacing[size] * scale;
};

export const getComponentSpacing = (component: keyof typeof ComponentSpacing) => {
  return ComponentSpacing[component];
};

export const getTouchTargetSpacing = (isAccessibilityEnabled: boolean = false) => {
  return isAccessibilityEnabled 
    ? AccessibilitySpacing.largeTouchTarget 
    : ComponentSpacing.minTouchTarget;
};

// Type exports
export type SpacingKey = keyof typeof Spacing;
export type ComponentSpacingKey = keyof typeof ComponentSpacing;
export type LayoutSpacingKey = keyof typeof LayoutSpacing; 