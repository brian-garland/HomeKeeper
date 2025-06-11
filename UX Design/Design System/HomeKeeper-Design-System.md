# HomeKeeper Design System
**Week 2.5 UX Foundation - Development Implementation Guide**

## 🎨 **Color Palette**

### **Primary Colors**
```typescript
// Primary Brand Colors
const colors = {
  primary: {
    50:  '#f0f9ff',  // Very light blue
    100: '#e0f2fe',  // Light blue
    500: '#0ea5e9',  // Main brand blue
    600: '#0284c7',  // Darker blue
    700: '#0369a1',  // Dark blue
    900: '#0c4a6e'   // Very dark blue
  },
```

### **Status Colors**
```typescript
  // Task Status Colors
  status: {
    success: '#10b981',   // Green - Completed
    warning: '#f59e0b',   // Amber - Due soon
    danger:  '#ef4444',   // Red - Overdue
    info:    '#06b6d4',   // Cyan - In progress
    neutral: '#6b7280'    // Gray - Inactive
  },
```

### **Semantic Colors**
```typescript
  // UI Colors
  background: {
    primary:   '#ffffff',  // Main background
    secondary: '#f8fafc',  // Card background
    accent:    '#f1f5f9'   // Section background
  },
  
  text: {
    primary:   '#1f2937',  // Main text
    secondary: '#6b7280',  // Secondary text
    muted:     '#9ca3af'   // Muted text
  },
  
  border: {
    light:  '#e5e7eb',     // Light borders
    medium: '#d1d5db',     // Medium borders
    dark:   '#9ca3af'      // Dark borders
  }
}
```

---

## 📝 **Typography Scale**

### **Font Families**
```typescript
const fonts = {
  heading: 'Inter-Bold',      // Headings
  body:    'Inter-Regular',   // Body text
  mono:    'SF-Mono-Regular'  // Code/technical
}
```

### **Text Styles**
```typescript
const textStyles = {
  // Headings
  h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600',  lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600',  lineHeight: 24 },
  
  // Body Text
  body:     { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 28 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  
  // UI Text
  button:   { fontSize: 16, fontWeight: '600', lineHeight: 20 },
  label:    { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  caption:  { fontSize: 12, fontWeight: '400', lineHeight: 16 }
}
```

---

## 📏 **Spacing System**

### **Base Spacing Unit: 4px**
```typescript
const spacing = {
  xs:  4,   // 4px  - Tiny gaps
  sm:  8,   // 8px  - Small gaps
  md:  16,  // 16px - Default spacing
  lg:  24,  // 24px - Large spacing
  xl:  32,  // 32px - Section spacing
  xxl: 48   // 48px - Screen margins
}
```

### **Component Spacing**
```typescript
const componentSpacing = {
  // Padding
  buttonPadding: { vertical: 12, horizontal: 24 },
  cardPadding:   { vertical: 16, horizontal: 16 },
  screenPadding: { vertical: 16, horizontal: 16 },
  
  // Margins
  sectionMargin: 24,
  itemMargin:    16,
  groupMargin:   8
}
```

---

## 🎯 **Component Specifications**

### **Button Variants**
```typescript
// Primary Button
const PrimaryButton = {
  backgroundColor: colors.primary[500],
  color: '#ffffff',
  borderRadius: 8,
  padding: componentSpacing.buttonPadding,
  fontSize: textStyles.button.fontSize,
  fontWeight: textStyles.button.fontWeight,
  
  // States
  pressed: { backgroundColor: colors.primary[600] },
  disabled: { backgroundColor: colors.neutral, opacity: 0.5 }
}

// Secondary Button  
const SecondaryButton = {
  backgroundColor: 'transparent',
  color: colors.primary[500],
  borderWidth: 1,
  borderColor: colors.primary[500],
  borderRadius: 8,
  padding: componentSpacing.buttonPadding
}

// Text Button
const TextButton = {
  backgroundColor: 'transparent',
  color: colors.primary[500],
  padding: { vertical: 8, horizontal: 16 }
}
```

### **Card Component**
```typescript
const Card = {
  backgroundColor: colors.background.secondary,
  borderRadius: 12,
  padding: componentSpacing.cardPadding,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3 // Android
}
```

### **Input Fields**
```typescript
const TextInput = {
  backgroundColor: colors.background.primary,
  borderWidth: 1,
  borderColor: colors.border.light,
  borderRadius: 8,
  padding: { vertical: 12, horizontal: 16 },
  fontSize: textStyles.body.fontSize,
  
  // States
  focused: { borderColor: colors.primary[500] },
  error:   { borderColor: colors.status.danger }
}
```

### **Task Item Component**
```typescript
const TaskItem = {
  backgroundColor: colors.background.secondary,
  borderRadius: 8,
  padding: 16,
  marginBottom: 8,
  borderLeftWidth: 4,
  
  // Priority Variants
  high:   { borderLeftColor: colors.status.danger },
  medium: { borderLeftColor: colors.status.warning },
  low:    { borderLeftColor: colors.status.success },
  done:   { borderLeftColor: colors.border.light, opacity: 0.7 }
}
```

---

## 🎭 **Icons & Imagery**

### **Icon System**
```typescript
// Using Expo Vector Icons
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'

const iconSizes = {
  sm: 16,  // Small icons
  md: 20,  // Default icons  
  lg: 24,  // Large icons
  xl: 32   // Extra large icons
}

// Common Icons
const icons = {
  home:     { name: 'home', family: Ionicons },
  tasks:    { name: 'checkmark-circle', family: Ionicons },
  equipment: { name: 'settings', family: Ionicons },
  calendar: { name: 'calendar', family: Ionicons },
  add:      { name: 'add-circle', family: Ionicons },
  search:   { name: 'search', family: Ionicons }
}
```

### **Image Guidelines**
```typescript
const imageStyles = {
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  
  equipmentPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  
  taskPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8
  }
}
```

---

## 📱 **Layout & Grid System**

### **Screen Layout**
```typescript
const layout = {
  screenPadding: 16,
  sectionSpacing: 24,
  
  // Safe Area
  safeArea: {
    paddingTop: 44,    // iOS status bar
    paddingBottom: 34  // iOS home indicator
  },
  
  // Tab Bar
  tabBar: {
    height: 60,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light
  }
}
```

### **Grid System**
```typescript
// 12-column grid for responsive layouts
const grid = {
  columns: 12,
  gutter: 16,
  
  // Breakpoints (for tablets/larger screens)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024
  }
}
```

---

## ⚡ **Animation & Transitions**

### **Animation Values**
```typescript
const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500
  },
  
  easing: {
    default: 'ease-out',
    bounce: 'spring',
    smooth: 'ease-in-out'
  }
}

// Common Animations
const commonAnimations = {
  fadeIn:     { opacity: [0, 1] },
  slideUp:    { translateY: [20, 0] },
  scaleIn:    { scale: [0.9, 1] },
  buttonPress: { scale: [1, 0.95] }
}
```

---

## 🎯 **Usage Guidelines**

### **Color Usage**
- **Primary Blue**: Main actions, links, active states
- **Status Colors**: Task priorities, completion states
- **Gray Scale**: Text hierarchy, borders, backgrounds

### **Typography Hierarchy**
- **h1**: Screen titles
- **h2**: Section headers
- **h3**: Card titles
- **body**: Main content
- **caption**: Metadata, timestamps

### **Spacing Rules**
- **4px base**: All spacing should be multiples of 4
- **Consistent margins**: Use system values, not arbitrary numbers
- **Touch targets**: Minimum 44px for interactive elements

### **Component States**
- **Normal**: Default appearance
- **Pressed**: Visual feedback on touch
- **Disabled**: Reduced opacity, no interaction
- **Loading**: Spinner or skeleton states

This design system provides **clear implementation guidance** for Week 3 React Native development! 