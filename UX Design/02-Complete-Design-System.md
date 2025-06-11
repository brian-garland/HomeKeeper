# HomeKeeper Complete Design System
**Professional Implementation Guide for Revolutionary UX**

*"Good design is obvious. Great design is transparent." - Joe Sparano*

---

**Document:** Complete Design System  
**Date:** June 11, 2025  
**Version:** 1.0 - React Native Implementation Guide  
**Target:** Week 3 Development Foundation

---

## 🎨 **Brand Identity & Visual Foundation**

### **The HomeKeeper Brand Essence**

**Visual Metaphor:** Warm craftsmanship meets intelligent technology  
**Emotional Tone:** Confident, approachable, trustworthy, empowering  
**Design Language:** Modern warmth with natural elements

---

## 🌈 **Color System - Warm Cedar Foundation**

### **Primary Brand Colors**

#### **Warm Cedar Primary**
```typescript
const WarmCedar = {
  50: '#FDF7ED',   // Lightest warmth for backgrounds
  100: '#F9ECCD',  // Subtle accents and hover states
  200: '#F2D89A',  // Light interactive elements
  300: '#E9BF66',  // Secondary buttons and highlights
  400: '#DFA532',  // Interactive elements
  500: '#B8860B',  // PRIMARY BRAND - main actions
  600: '#A67C0A',  // Pressed states and emphasis
  700: '#8B6508',  // Dark accents and borders
  800: '#725107',  // Deep text on light backgrounds
  900: '#5E4206',  // Darkest for high contrast text
};

// React Native Implementation
export const Colors = {
  primary: WarmCedar[500],      // #B8860B - Main brand color
  primaryLight: WarmCedar[100], // #F9ECCD - Backgrounds
  primaryDark: WarmCedar[700],  // #8B6508 - Text/borders
  // ... rest of system
};
```

#### **Natural Grays - Modern Neutral Palette**
```typescript
const NaturalGray = {
  25: '#FEFEFE',   // Pure white alternative
  50: '#F9FAFB',   // Background layers
  100: '#F2F4F7',  // Card backgrounds
  200: '#E4E7EC',  // Borders and dividers
  300: '#D0D5DD',  // Disabled states
  400: '#98A2B3',  // Supporting text
  500: '#667085',  // Body text
  600: '#475467',  // Headings
  700: '#344054',  // High emphasis text
  800: '#1D2939',  // Primary text
  900: '#101828',  // Maximum contrast
};
```

### **Semantic Color System**

#### **Success States - Natural Green**
```typescript
const SuccessGreen = {
  50: '#F0FDF4',   // Success backgrounds
  100: '#DCFCE7',  // Light success accents
  500: '#22C55E',  // Primary success color
  600: '#16A34A',  // Success button pressed
  700: '#15803D',  // Dark success text
};
```

#### **Warning States - Amber**
```typescript
const WarningAmber = {
  50: '#FFFBEB',   // Warning backgrounds
  100: '#FEF3C7',  // Light warning accents
  500: '#F59E0B',  // Primary warning color
  600: '#D97706',  // Warning button pressed
  700: '#B45309',  // Dark warning text
};
```

#### **Error States - Red**
```typescript
const ErrorRed = {
  50: '#FEF2F2',   // Error backgrounds
  100: '#FEE2E2',  // Light error accents
  500: '#EF4444',  // Primary error color
  600: '#DC2626',  // Error button pressed
  700: '#B91C1C',  // Dark error text
};
```

#### **Info States - Blue**
```typescript
const InfoBlue = {
  50: '#EFF6FF',   // Info backgrounds
  100: '#DBEAFE',  // Light info accents
  500: '#3B82F6',  // Primary info color
  600: '#2563EB',  // Info button pressed
  700: '#1D4ED8',  // Dark info text
};
```

### **Complete Color Implementation**
```typescript
// src/theme/colors.ts
export const Colors = {
  // Primary Brand
  primary: '#B8860B',
  primaryLight: '#F9ECCD',
  primaryDark: '#8B6508',
  
  // Natural Grays
  white: '#FEFEFE',
  gray50: '#F9FAFB',
  gray100: '#F2F4F7',
  gray200: '#E4E7EC',
  gray300: '#D0D5DD',
  gray400: '#98A2B3',
  gray500: '#667085',
  gray600: '#475467',
  gray700: '#344054',
  gray800: '#1D2939',
  gray900: '#101828',
  
  // Semantic Colors
  success: '#22C55E',
  successLight: '#F0FDF4',
  successDark: '#15803D',
  
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  warningDark: '#B45309',
  
  error: '#EF4444',
  errorLight: '#FEF2F2',
  errorDark: '#B91C1C',
  
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  infoDark: '#1D4ED8',
  
  // Backgrounds
  background: '#FEFEFE',
  surface: '#F9FAFB',
  card: '#F2F4F7',
  
  // Text
  textPrimary: '#101828',
  textSecondary: '#475467',
  textTertiary: '#667085',
  textDisabled: '#98A2B3',
  
  // Borders
  border: '#E4E7EC',
  borderLight: '#F2F4F7',
  borderDark: '#D0D5DD',
} as const;

export type ColorKey = keyof typeof Colors;
```

---

## 📝 **Typography System - Inter Excellence**

### **Font Family Strategy**

**Primary Font:** Inter (System Default)  
**Fallback:** System fonts for maximum performance and native feel

```typescript
// Font family implementation
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
};
```

### **Typography Scale & Hierarchy**

#### **Heading Styles**
```typescript
const Typography = {
  // Large Display - Hero sections, onboarding
  displayLarge: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  
  // Medium Display - Section headers
  displayMedium: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.25,
    color: Colors.textPrimary,
  },
  
  // Large Headline - Screen titles
  headlineLarge: {
    fontFamily: FontFamily.semibold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Medium Headline - Card titles
  headlineMedium: {
    fontFamily: FontFamily.semibold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Small Headline - Subsection titles
  headlineSmall: {
    fontFamily: FontFamily.medium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
};
```

#### **Body Text Styles**
```typescript
const BodyTypography = {
  // Large Body - Primary content
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Medium Body - Secondary content
  bodyMedium: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.textSecondary,
  },
  
  // Small Body - Supporting text
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    color: Colors.textTertiary,
  },
};
```

#### **Interactive Text Styles**
```typescript
const InteractiveTypography = {
  // Button Text - Large
  buttonLarge: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    color: Colors.white,
  },
  
  // Button Text - Medium
  buttonMedium: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.white,
  },
  
  // Link Text
  link: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  
  // Caption Text
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: Colors.textTertiary,
  },
  
  // Label Text
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
};
```

### **Complete Typography Implementation**
```typescript
// src/theme/typography.ts
export const Typography = {
  ...HeadingTypography,
  ...BodyTypography,
  ...InteractiveTypography,
} as const;

// Usage example
const TaskTitle = styled.Text`
  ${Typography.headlineMedium}
`;

const TaskDescription = styled.Text`
  ${Typography.bodyMedium}
`;
```

---

## 📏 **Spacing System - Consistent Rhythm**

### **Base Unit System**

**Foundation:** 4px base unit for mathematical consistency  
**Scale:** Progressive spacing that maintains visual rhythm

```typescript
// src/theme/spacing.ts
export const Spacing = {
  xs: 4,    // 4px  - Minimal spacing
  sm: 8,    // 8px  - Small gaps
  md: 12,   // 12px - Medium gaps
  lg: 16,   // 16px - Standard gaps
  xl: 20,   // 20px - Large gaps
  xxl: 24,  // 24px - Section spacing
  xxxl: 32, // 32px - Major spacing
  huge: 48, // 48px - Hero spacing
  giant: 64, // 64px - Maximum spacing
} as const;

// Component-specific spacing
export const ComponentSpacing = {
  // Card internal spacing
  cardPadding: Spacing.lg,        // 16px
  cardMargin: Spacing.md,         // 12px
  cardGap: Spacing.md,           // 12px
  
  // Button spacing
  buttonPaddingVertical: Spacing.sm,    // 8px
  buttonPaddingHorizontal: Spacing.lg,  // 16px
  buttonGap: Spacing.sm,               // 8px
  
  // Screen spacing
  screenPadding: Spacing.lg,           // 16px
  screenMargin: Spacing.xxl,          // 24px
  
  // List spacing
  listItemGap: Spacing.md,            // 12px
  listSectionGap: Spacing.xxl,       // 24px
} as const;
```

### **Layout Grid System**

```typescript
// src/theme/layout.ts
export const Layout = {
  // Screen dimensions
  screenPadding: 16,
  screenPaddingHorizontal: 16,
  screenPaddingVertical: 24,
  
  // Container widths
  containerMaxWidth: 400,
  contentMaxWidth: 360,
  
  // Component heights
  buttonHeight: 44,
  inputHeight: 44,
  cardMinHeight: 80,
  headerHeight: 60,
  tabBarHeight: 80,
  
  // Border radius
  radiusSmall: 4,
  radiusMedium: 8,
  radiusLarge: 12,
  radiusXLarge: 16,
  radiusRound: 999,
} as const;
```

---

## 🎯 **Component System - Building Blocks**

### **Button Component System**

#### **Primary Button - Call to Action**
```typescript
// src/components/Button/PrimaryButton.tsx
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  size = 'large',
  disabled = false,
  loading = false,
  icon,
}) => {
  return (
    <PrimaryButtonContainer
      size={size}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <>
          {icon && <Icon name={icon} size={16} color={Colors.white} />}
          <PrimaryButtonText size={size}>{title}</PrimaryButtonText>
        </>
      )}
    </PrimaryButtonContainer>
  );
};

const PrimaryButtonContainer = styled.TouchableOpacity<{
  size: string;
  disabled: boolean;
}>`
  background-color: ${({ disabled }) => 
    disabled ? Colors.gray300 : Colors.primary};
  padding-vertical: ${({ size }) => 
    size === 'large' ? '12px' : size === 'medium' ? '10px' : '8px'};
  padding-horizontal: ${({ size }) => 
    size === 'large' ? '24px' : size === 'medium' ? '20px' : '16px'};
  border-radius: ${Layout.radiusMedium}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${Spacing.sm}px;
  min-height: ${({ size }) => 
    size === 'large' ? '44px' : size === 'medium' ? '40px' : '36px'};
`;

const PrimaryButtonText = styled.Text<{ size: string }>`
  ${({ size }) => 
    size === 'large' ? Typography.buttonLarge : Typography.buttonMedium}
  color: ${Colors.white};
`;
```

#### **Secondary Button - Alternative Actions**
```typescript
// src/components/Button/SecondaryButton.tsx
const SecondaryButton: React.FC<SecondaryButtonProps> = ({ ...props }) => {
  return (
    <SecondaryButtonContainer {...props}>
      <SecondaryButtonText>{props.title}</SecondaryButtonText>
    </SecondaryButtonContainer>
  );
};

const SecondaryButtonContainer = styled.TouchableOpacity`
  background-color: ${Colors.white};
  border: 1px solid ${Colors.border};
  padding-vertical: 12px;
  padding-horizontal: 24px;
  border-radius: ${Layout.radiusMedium}px;
  align-items: center;
  justify-content: center;
  min-height: 44px;
`;

const SecondaryButtonText = styled.Text`
  ${Typography.buttonLarge}
  color: ${Colors.textPrimary};
`;
```

### **Card Component System**

#### **Task Card - Primary Content Container**
```typescript
// src/components/Card/TaskCard.tsx
interface TaskCardProps {
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  onPress?: () => void;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  status,
  priority,
  dueDate,
  onPress,
  onSwipeRight,
  onSwipeLeft,
}) => {
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX > 100 && onSwipeRight) {
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -100 && onSwipeLeft) {
        runOnJS(onSwipeLeft)();
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <TaskCardContainer onPress={onPress} status={status}>
        <TaskCardHeader>
          <TaskCardTitle numberOfLines={1}>{title}</TaskCardTitle>
          <PriorityIndicator priority={priority} />
        </TaskCardHeader>
        
        {description && (
          <TaskCardDescription numberOfLines={2}>
            {description}
          </TaskCardDescription>
        )}
        
        <TaskCardFooter>
          <StatusBadge status={status} />
          {dueDate && (
            <DueDateText>
              Due {format(dueDate, 'MMM d')}
            </DueDateText>
          )}
        </TaskCardFooter>
      </TaskCardContainer>
    </GestureDetector>
  );
};

const TaskCardContainer = styled.TouchableOpacity<{ status: string }>`
  background-color: ${Colors.white};
  border-radius: ${Layout.radiusLarge}px;
  padding: ${ComponentSpacing.cardPadding}px;
  margin-bottom: ${ComponentSpacing.cardMargin}px;
  border-left-width: 4px;
  border-left-color: ${({ status }) => 
    status === 'completed' ? Colors.success :
    status === 'in-progress' ? Colors.warning : Colors.gray300};
  shadow-color: ${Colors.gray900};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 1;
`;

const TaskCardTitle = styled.Text`
  ${Typography.headlineSmall}
  flex: 1;
`;

const TaskCardDescription = styled.Text`
  ${Typography.bodyMedium}
  margin-top: ${Spacing.sm}px;
`;
```

### **Input Component System**

#### **Text Input - Form Fields**
```typescript
// src/components/Input/TextInput.tsx
interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: string;
  rightIcon?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  multiline = false,
  secureTextEntry = false,
  keyboardType = 'default',
  leftIcon,
  rightIcon,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <InputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      
      <InputWrapper error={!!error} focused={isFocused} disabled={disabled}>
        {leftIcon && (
          <InputIcon>
            <Icon name={leftIcon} size={20} color={Colors.gray400} />
          </InputIcon>
        )}
        
        <StyledTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray400}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
        
        {rightIcon && (
          <InputIcon>
            <Icon name={rightIcon} size={20} color={Colors.gray400} />
          </InputIcon>
        )}
      </InputWrapper>
      
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  );
};

const InputContainer = styled.View`
  margin-bottom: ${Spacing.lg}px;
`;

const InputLabel = styled.Text`
  ${Typography.label}
  margin-bottom: ${Spacing.sm}px;
`;

const InputWrapper = styled.View<{
  error: boolean;
  focused: boolean;
  disabled: boolean;
}>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ disabled }) => 
    disabled ? Colors.gray100 : Colors.white};
  border: 1px solid ${({ error, focused }) =>
    error ? Colors.error :
    focused ? Colors.primary : Colors.border};
  border-radius: ${Layout.radiusMedium}px;
  padding-horizontal: ${Spacing.lg}px;
  min-height: ${Layout.inputHeight}px;
`;

const StyledTextInput = styled.TextInput`
  ${Typography.bodyLarge}
  flex: 1;
  padding-vertical: ${Spacing.sm}px;
`;

const ErrorText = styled.Text`
  ${Typography.caption}
  color: ${Colors.error};
  margin-top: ${Spacing.xs}px;
`;
```

---

## 🎨 **Icon System - Visual Communication**

### **Icon Library Strategy**

**Primary:** Expo Vector Icons (comprehensive and optimized)  
**Categories:** Interface, Equipment, Weather, Status, Navigation

```typescript
// src/theme/icons.ts
export const IconSets = {
  interface: 'MaterialIcons',
  equipment: 'MaterialCommunityIcons', 
  weather: 'Feather',
  status: 'AntDesign',
  navigation: 'Ionicons',
} as const;

export const IconSizes = {
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
  hero: 48,
} as const;

// Common icon mappings
export const Icons = {
  // Navigation
  home: { set: 'Ionicons', name: 'home-outline' },
  tasks: { set: 'MaterialIcons', name: 'assignment' },
  equipment: { set: 'MaterialCommunityIcons', name: 'wrench' },
  calendar: { set: 'Ionicons', name: 'calendar-outline' },
  
  // Actions
  add: { set: 'Ionicons', name: 'add' },
  edit: { set: 'MaterialIcons', name: 'edit' },
  delete: { set: 'MaterialIcons', name: 'delete' },
  check: { set: 'Ionicons', name: 'checkmark' },
  close: { set: 'Ionicons', name: 'close' },
  
  // Status
  pending: { set: 'MaterialIcons', name: 'schedule' },
  inProgress: { set: 'MaterialIcons', name: 'hourglass-empty' },
  completed: { set: 'Ionicons', name: 'checkmark-circle' },
  
  // Priority
  low: { set: 'MaterialIcons', name: 'keyboard-arrow-down' },
  medium: { set: 'MaterialIcons', name: 'remove' },
  high: { set: 'MaterialIcons', name: 'keyboard-arrow-up' },
  
  // Weather
  sunny: { set: 'Feather', name: 'sun' },
  cloudy: { set: 'Feather', name: 'cloud' },
  rainy: { set: 'Feather', name: 'cloud-rain' },
  snowy: { set: 'Feather', name: 'cloud-snow' },
} as const;
```

### **Icon Component Implementation**
```typescript
// src/components/Icon/Icon.tsx
interface IconProps {
  name: keyof typeof Icons;
  size?: keyof typeof IconSizes | number;
  color?: string;
  style?: ViewStyle;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color = Colors.textPrimary,
  style,
}) => {
  const iconConfig = Icons[name];
  const iconSize = typeof size === 'string' ? IconSizes[size] : size;
  
  const IconComponent = getIconComponent(iconConfig.set);
  
  return (
    <IconComponent
      name={iconConfig.name}
      size={iconSize}
      color={color}
      style={style}
    />
  );
};

const getIconComponent = (set: string) => {
  switch (set) {
    case 'Ionicons': return Ionicons;
    case 'MaterialIcons': return MaterialIcons;
    case 'MaterialCommunityIcons': return MaterialCommunityIcons;
    case 'Feather': return Feather;
    case 'AntDesign': return AntDesign;
    default: return MaterialIcons;
  }
};
```

---

## 🎭 **Animation System - Delightful Interactions**

### **Animation Principles**

**Philosophy:** Purposeful motion that enhances understanding  
**Timing:** Fast enough to feel responsive, slow enough to follow  
**Easing:** Natural curves that feel organic

```typescript
// src/theme/animations.ts
export const AnimationDurations = {
  fast: 150,      // Quick feedback
  normal: 250,    // Standard transitions
  slow: 350,      // Complex animations
  slower: 500,    // Hero animations
} as const;

export const AnimationEasing = {
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeIn: [0.55, 0.06, 0.68, 0.19],
  easeInOut: [0.42, 0, 0.58, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// Reanimated 3 configurations
export const SpringConfig = {
  gentle: {
    damping: 20,
    stiffness: 120,
  },
  bouncy: {
    damping: 15,
    stiffness: 150,
  },
  swift: {
    damping: 25,
    stiffness: 200,
  },
} as const;
```

### **Common Animation Patterns**

#### **Scale Animation - Button Press**
```typescript
// src/animations/ScaleAnimation.tsx
export const useScaleAnimation = () => {
  const scale = useSharedValue(1);
  
  const animatePress = () => {
    scale.value = withSpring(0.96, SpringConfig.swift);
  };
  
  const animateRelease = () => {
    scale.value = withSpring(1, SpringConfig.gentle);
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return { animatedStyle, animatePress, animateRelease };
};
```

#### **Slide Animation - Screen Transitions**
```typescript
// src/animations/SlideAnimation.tsx
export const useSlideAnimation = (direction: 'left' | 'right' | 'up' | 'down' = 'right') => {
  const translateX = useSharedValue(direction === 'right' ? 300 : direction === 'left' ? -300 : 0);
  const translateY = useSharedValue(direction === 'down' ? 300 : direction === 'up' ? -300 : 0);
  const opacity = useSharedValue(0);
  
  const slideIn = () => {
    translateX.value = withSpring(0, SpringConfig.gentle);
    translateY.value = withSpring(0, SpringConfig.gentle);
    opacity.value = withTiming(1, { duration: AnimationDurations.normal });
  };
  
  const slideOut = () => {
    translateX.value = withSpring(direction === 'right' ? 300 : direction === 'left' ? -300 : 0);
    translateY.value = withSpring(direction === 'down' ? 300 : direction === 'up' ? -300 : 0);
    opacity.value = withTiming(0, { duration: AnimationDurations.fast });
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));
  
  return { animatedStyle, slideIn, slideOut };
};
```

#### **Success Animation - Task Completion**
```typescript
// src/animations/SuccessAnimation.tsx
export const useSuccessAnimation = () => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  const celebrateSuccess = () => {
    // Scale up with bounce
    scale.value = withSpring(1, SpringConfig.bouncy);
    
    // Subtle rotation for dynamic feel
    rotation.value = withSequence(
      withTiming(-5, { duration: AnimationDurations.fast }),
      withTiming(5, { duration: AnimationDurations.fast }),
      withTiming(0, { duration: AnimationDurations.fast })
    );
    
    // Fade in
    opacity.value = withTiming(1, { duration: AnimationDurations.normal });
    
    // Auto hide after celebration
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: AnimationDurations.normal });
      scale.value = withSpring(0, SpringConfig.gentle);
    }, 2000);
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));
  
  return { animatedStyle, celebrateSuccess };
};
```

---

## 📱 **Responsive Design System**

### **Screen Size Breakpoints**

```typescript
// src/theme/responsive.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const ScreenSizes = {
  small: width < 375,      // iPhone SE, small Android
  medium: width >= 375 && width < 414,  // iPhone 12/13/14
  large: width >= 414,     // iPhone Plus, large Android
  
  // Height considerations for navigation
  shortScreen: height < 700,
  tallScreen: height >= 700,
} as const;

export const ResponsiveSpacing = {
  screenPadding: ScreenSizes.small ? 12 : 16,
  cardMargin: ScreenSizes.small ? 8 : 12,
  buttonHeight: ScreenSizes.small ? 40 : 44,
} as const;

export const ResponsiveTypography = {
  displayLarge: {
    fontSize: ScreenSizes.small ? 28 : 32,
    lineHeight: ScreenSizes.small ? 36 : 40,
  },
  headlineLarge: {
    fontSize: ScreenSizes.small ? 20 : 24,
    lineHeight: ScreenSizes.small ? 28 : 32,
  },
} as const;
```

---

## ✅ **Design System Implementation Checklist**

### **Foundation Setup**
- [ ] Colors implemented with TypeScript definitions
- [ ] Typography system with Inter font family
- [ ] Spacing system with 4px base unit
- [ ] Layout system with consistent dimensions
- [ ] Icon system with Expo Vector Icons

### **Component Development**
- [ ] Button components (Primary, Secondary, Text)
- [ ] Card components (Task, Equipment, Info)
- [ ] Input components (Text, Search, Select)
- [ ] Navigation components (Tab Bar, Header)
- [ ] Feedback components (Toast, Loading, Empty)

### **Animation Integration**
- [ ] Scale animations for button interactions
- [ ] Slide animations for screen transitions
- [ ] Success animations for task completion
- [ ] Loading animations for async operations
- [ ] Gesture animations for swipe interactions

### **Responsive Testing**
- [ ] Small screen optimization (iPhone SE)
- [ ] Medium screen optimization (iPhone 14)
- [ ] Large screen optimization (iPhone 14 Plus)
- [ ] Android device testing across sizes
- [ ] Accessibility testing with larger text sizes

---

## 🚀 **Implementation Priority for Week 3**

### **Day 1: Core Foundation**
1. Set up color system and typography
2. Create base spacing and layout constants
3. Implement primary button and text input components
4. Set up icon system with common icons

### **Day 2: Essential Components** 
1. Build task card component with swipe gestures
2. Create navigation components (header, tab bar)
3. Implement loading and feedback components
4. Add basic animations for interactions

### **Day 3: Advanced Components**
1. Build form components with validation
2. Create list components with empty states
3. Implement search and filter components
4. Add complex animations and transitions

### **Quality Assurance:**
- All components tested on multiple screen sizes
- Accessibility verified with screen readers
- Performance optimized for smooth animations
- Design system documentation complete

---

**This design system provides the complete foundation for HomeKeeper's revolutionary user experience. Every component, color, and interaction is designed to build user confidence and make home maintenance delightful.** 🎨 