# HomeKeeper Platform Guidelines
**iOS and Android Optimization for Native Experience**

*"Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs*

---

**Document:** Platform-Specific Guidelines  
**Date:** June 11, 2025  
**Version:** 1.0 - React Native Implementation Guide  
**Target:** Week 3 Platform Excellence

---

## 📱 **Platform Philosophy**

### **Universal Design Principles**
- **Consistency:** Feel native on each platform while maintaining HomeKeeper identity
- **Performance:** Leverage platform strengths for optimal user experience  
- **Accessibility:** Exceed platform accessibility standards
- **Integration:** Deep integration with platform-specific features

### **Platform-Specific Adaptations**
- **iOS:** Embrace Human Interface Guidelines while adding HomeKeeper warmth
- **Android:** Follow Material Design principles with Cedar accent integration
- **Cross-Platform:** Maintain core experience consistency across platforms

---

## 🍎 **iOS Platform Guidelines**

### **iOS Design Language Integration**

#### **Navigation Patterns**
```typescript
// src/components/ios/IOSNavigationHeader.tsx
const IOSNavigationHeader: React.FC<IOSHeaderProps> = ({
  title,
  leftButton,
  rightButton,
  backgroundColor = Colors.background,
}) => {
  return (
    <IOSHeaderContainer backgroundColor={backgroundColor}>
      <IOSHeaderContent>
        <IOSHeaderLeft>
          {leftButton && (
            <IOSHeaderButton onPress={leftButton.onPress}>
              <IOSHeaderButtonText>{leftButton.title}</IOSHeaderButtonText>
            </IOSHeaderButton>
          )}
        </IOSHeaderLeft>
        
        <IOSHeaderCenter>
          <IOSHeaderTitle numberOfLines={1}>{title}</IOSHeaderTitle>
        </IOSHeaderCenter>
        
        <IOSHeaderRight>
          {rightButton && (
            <IOSHeaderButton onPress={rightButton.onPress}>
              <IOSHeaderButtonText>{rightButton.title}</IOSHeaderButtonText>
            </IOSHeaderButton>
          )}
        </IOSHeaderRight>
      </IOSHeaderContent>
    </IOSHeaderContainer>
  );
};

const IOSHeaderContainer = styled.View<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  padding-top: ${Platform.OS === 'ios' ? '44px' : '0px'};
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-bottom-color: ${Colors.border};
`;

const IOSHeaderTitle = styled.Text`
  ${Typography.headlineMedium}
  font-weight: 600;
  text-align: center;
`;

const IOSHeaderButtonText = styled.Text`
  ${Typography.bodyMedium}
  color: ${Colors.primary};
  font-weight: 500;
`;
```

#### **iOS Tab Bar Implementation**
```typescript
// src/components/ios/IOSTabBar.tsx
const IOSTabBar: React.FC<IOSTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <IOSTabBarContainer>
      <IOSTabBarBackground />
      <IOSTabBarContent>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <IOSTabBarItem
              key={route.key}
              focused={isFocused}
              onPress={onPress}
            >
              <IOSTabBarIcon>
                {options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? Colors.primary : Colors.gray400,
                  size: 24,
                })}
              </IOSTabBarIcon>
              <IOSTabBarLabel focused={isFocused}>
                {options.tabBarLabel || route.name}
              </IOSTabBarLabel>
            </IOSTabBarItem>
          );
        })}
      </IOSTabBarContent>
    </IOSTabBarContainer>
  );
};

const IOSTabBarContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${Platform.OS === 'ios' ? '83px' : '60px'};
  padding-bottom: ${Platform.OS === 'ios' ? '34px' : '0px'};
`;

const IOSTabBarBackground = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${Colors.background};
  border-top-width: ${StyleSheet.hairlineWidth}px;
  border-top-color: ${Colors.border};
`;

const IOSTabBarItem = styled.TouchableOpacity<{ focused: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-vertical: 4px;
  opacity: ${({ focused }) => focused ? 1 : 0.7};
`;

const IOSTabBarLabel = styled.Text<{ focused: boolean }>`
  ${Typography.caption}
  color: ${({ focused }) => focused ? Colors.primary : Colors.gray400};
  font-weight: ${({ focused }) => focused ? '600' : '400'};
  margin-top: 2px;
`;
```

#### **iOS Gesture Integration**
```typescript
// src/components/ios/IOSSwipeGestures.tsx
const IOSSwipeGestures: React.FC<IOSSwipeProps> = ({
  children,
  onSwipeRight,
  onSwipeLeft,
  threshold = 100,
}) => {
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX > threshold && onSwipeRight) {
        // iOS-specific haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -threshold && onSwipeLeft) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(onSwipeLeft)();
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      {children}
    </GestureDetector>
  );
};
```

### **iOS Context Menus**
```typescript
// src/components/ios/IOSContextMenu.tsx
import { ContextMenuView } from 'react-native-ios-context-menu';

const IOSTaskCardWithContextMenu: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const menuConfig = {
    menuTitle: 'Task Options',
    menuItems: [
      {
        actionKey: 'complete',
        actionTitle: 'Mark Complete',
        icon: {
          type: 'IMAGE_SYSTEM',
          imageValue: 'checkmark.circle',
        },
      },
      {
        actionKey: 'reschedule',
        actionTitle: 'Reschedule',
        icon: {
          type: 'IMAGE_SYSTEM',
          imageValue: 'calendar',
        },
      },
      {
        actionKey: 'help',
        actionTitle: 'Get Help',
        icon: {
          type: 'IMAGE_SYSTEM',
          imageValue: 'questionmark.circle',
        },
      },
    ],
  };

  const handleMenuPress = (actionKey: string) => {
    switch (actionKey) {
      case 'complete':
        handleCompleteTask(task.id);
        break;
      case 'reschedule':
        navigation.navigate('TaskReschedule', { task });
        break;
      case 'help':
        navigation.navigate('TaskHelp', { taskId: task.id });
        break;
    }
  };

  return (
    <ContextMenuView
      menuConfig={menuConfig}
      onPressMenuItem={({ nativeEvent }) => handleMenuPress(nativeEvent.actionKey)}
    >
      <TaskCard task={task} onPress={onPress} />
    </ContextMenuView>
  );
};
```

### **iOS-Specific Features**

#### **Shortcuts Integration**
```typescript
// src/services/ios/ShortcutsService.ts
import { Shortcuts } from 'react-native-shortcuts';

export const IOSShortcutsService = {
  setupShortcuts: () => {
    if (Platform.OS !== 'ios') return;

    const shortcuts = [
      {
        type: 'add-task',
        title: 'Add Task',
        subtitle: 'Create a new maintenance task',
        iconName: 'plus',
        data: { action: 'add-task' },
      },
      {
        type: 'today-tasks',
        title: "Today's Tasks",
        subtitle: 'View tasks for today',
        iconName: 'list.bullet',
        data: { action: 'today-tasks' },
      },
      {
        type: 'home-health',
        title: 'Home Health',
        subtitle: 'Check your home health score',
        iconName: 'house',
        data: { action: 'home-health' },
      },
    ];

    Shortcuts.setShortcuts(shortcuts);
  },

  handleShortcutAction: (shortcut: any) => {
    switch (shortcut.data?.action) {
      case 'add-task':
        NavigationService.navigate('AddTask');
        break;
      case 'today-tasks':
        NavigationService.navigate('Tasks', { filter: 'today' });
        break;
      case 'home-health':
        NavigationService.navigate('HomeHealthDetails');
        break;
    }
  },
};
```

#### **Widget Integration**
```typescript
// src/services/ios/WidgetService.ts
import { SharedGroupPreferences } from 'react-native-shared-group-preferences';

export const IOSWidgetService = {
  updateWidgetData: async (data: WidgetData) => {
    if (Platform.OS !== 'ios') return;

    try {
      await SharedGroupPreferences.setItem(
        'group.homekeeper.widget',
        'todayTasks',
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Failed to update widget data:', error);
    }
  },

  getWidgetData: async (): Promise<WidgetData | null> => {
    if (Platform.OS !== 'ios') return null;

    try {
      const data = await SharedGroupPreferences.getItem(
        'group.homekeeper.widget',
        'todayTasks'
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get widget data:', error);
      return null;
    }
  },
};
```

---

## 🤖 **Android Platform Guidelines**

### **Material Design Integration**

#### **Material Navigation**
```typescript
// src/components/android/MaterialNavigationHeader.tsx
const MaterialNavigationHeader: React.FC<MaterialHeaderProps> = ({
  title,
  showBackButton,
  actions,
  elevation = 4,
}) => {
  return (
    <MaterialHeaderContainer elevation={elevation}>
      <MaterialHeaderContent>
        {showBackButton && (
          <MaterialBackButton onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={Colors.white} />
          </MaterialBackButton>
        )}
        
        <MaterialHeaderTitle numberOfLines={1}>{title}</MaterialHeaderTitle>
        
        <MaterialHeaderActions>
          {actions?.map((action, index) => (
            <MaterialHeaderAction key={index} onPress={action.onPress}>
              <Icon name={action.icon} size={24} color={Colors.white} />
            </MaterialHeaderAction>
          ))}
        </MaterialHeaderActions>
      </MaterialHeaderContent>
    </MaterialHeaderContainer>
  );
};

const MaterialHeaderContainer = styled.View<{ elevation: number }>`
  background-color: ${Colors.primary};
  elevation: ${({ elevation }) => elevation};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  padding-top: ${Platform.OS === 'android' ? '0px' : '44px'};
`;

const MaterialHeaderTitle = styled.Text`
  ${Typography.headlineMedium}
  color: ${Colors.white};
  font-weight: 500;
`;
```

#### **Floating Action Button**
```typescript
// src/components/android/MaterialFAB.tsx
const MaterialFAB: React.FC<MaterialFABProps> = ({
  icon,
  onPress,
  extended = false,
  label,
}) => {
  const { scaleAnimation, animatePress, animateRelease } = useScaleAnimation();

  return (
    <Animated.View style={[styles.fabContainer, scaleAnimation]}>
      <MaterialFABButton
        extended={extended}
        onPressIn={animatePress}
        onPressOut={animateRelease}
        onPress={onPress}
      >
        <MaterialFABIcon>
          <Icon name={icon} size={24} color={Colors.white} />
        </MaterialFABIcon>
        {extended && label && (
          <MaterialFABLabel>{label}</MaterialFABLabel>
        )}
      </MaterialFABButton>
    </Animated.View>
  );
};

const MaterialFABButton = styled.TouchableOpacity<{ extended: boolean }>`
  background-color: ${Colors.primary};
  border-radius: ${({ extended }) => extended ? '24px' : '28px'};
  padding-horizontal: ${({ extended }) => extended ? '16px' : '0px'};
  width: ${({ extended }) => extended ? 'auto' : '56px'};
  height: 56px;
  elevation: 6;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.27;
  shadow-radius: 4.65px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 1000,
  },
});
```

#### **Material Bottom Navigation**
```typescript
// src/components/android/MaterialBottomNavigation.tsx
const MaterialBottomNavigation: React.FC<MaterialBottomNavProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <MaterialBottomNavContainer>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        return (
          <MaterialBottomNavItem
            key={route.key}
            focused={isFocused}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            }}
          >
            <MaterialNavIcon focused={isFocused}>
              {options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? Colors.primary : Colors.gray400,
                size: 24,
              })}
            </MaterialNavIcon>
            <MaterialNavLabel focused={isFocused}>
              {options.tabBarLabel || route.name}
            </MaterialNavLabel>
          </MaterialBottomNavItem>
        );
      })}
    </MaterialBottomNavContainer>
  );
};

const MaterialBottomNavContainer = styled.View`
  flex-direction: row;
  background-color: ${Colors.white};
  elevation: 8;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  height: 56px;
`;

const MaterialBottomNavItem = styled.TouchableOpacity<{ focused: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  padding-horizontal: 8px;
  background-color: ${({ focused }) => 
    focused ? `${Colors.primary}20` : 'transparent'};
  border-radius: 16px;
  margin: 4px;
`;
```

### **Android-Specific Features**

#### **Back Button Handling**
```typescript
// src/hooks/android/useAndroidBackButton.ts
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export const useAndroidBackButton = (handler: () => boolean) => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handler);
    
    return () => backHandler.remove();
  }, [handler]);
};

// Usage in screens
const TaskDetailScreen: React.FC = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useAndroidBackButton(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
      return true; // Prevent default back action
    }
    return false; // Allow default back action
  });

  // ... rest of component
};
```

#### **Android Permissions Handling**
```typescript
// src/services/android/PermissionsService.ts
import { PermissionsAndroid, Platform } from 'react-native';

export const AndroidPermissionsService = {
  requestCameraPermission: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'HomeKeeper needs camera access to help identify your equipment',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.warn('Camera permission error:', error);
      return false;
    }
  },

  requestLocationPermission: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'HomeKeeper uses your location for weather-based maintenance recommendations',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.warn('Location permission error:', error);
      return false;
    }
  },

  requestNotificationPermission: async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || Platform.Version < 33) return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'HomeKeeper sends helpful reminders for maintenance tasks',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.warn('Notification permission error:', error);
      return false;
    }
  },
};
```

---

## 🔧 **Cross-Platform Optimizations**

### **Responsive Design System**
```typescript
// src/utils/responsive.ts
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Device = {
  isSmallScreen: width < 375,
  isMediumScreen: width >= 375 && width < 414,
  isLargeScreen: width >= 414,
  isShortScreen: height < 700,
  isTallScreen: height >= 700,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  hasNotch: Platform.OS === 'ios' && height >= 812,
};

export const getResponsiveValue = <T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  default: T;
}): T => {
  if (Device.isSmallScreen && values.small !== undefined) return values.small;
  if (Device.isMediumScreen && values.medium !== undefined) return values.medium;
  if (Device.isLargeScreen && values.large !== undefined) return values.large;
  return values.default;
};

export const getPlatformValue = <T>(values: {
  ios?: T;
  android?: T;
  default: T;
}): T => {
  if (Device.isIOS && values.ios !== undefined) return values.ios;
  if (Device.isAndroid && values.android !== undefined) return values.android;
  return values.default;
};
```

### **Platform-Specific Styling**
```typescript
// src/theme/platformStyles.ts
export const PlatformStyles = {
  button: {
    ...getPlatformValue({
      ios: {
        borderRadius: 8,
        fontSize: 17,
        fontWeight: '600',
      },
      android: {
        borderRadius: 4,
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase',
      },
      default: {
        borderRadius: 6,
        fontSize: 16,
        fontWeight: '500',
      },
    }),
  },

  card: {
    ...getPlatformValue({
      ios: {
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderRadius: 8,
        elevation: 2,
      },
      default: {
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },

  header: {
    height: getPlatformValue({
      ios: 44,
      android: 56,
      default: 50,
    }),
    ...getPlatformValue({
      ios: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
      },
      android: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      default: {},
    }),
  },
};
```

### **Universal Components**
```typescript
// src/components/universal/UniversalButton.tsx
const UniversalButton: React.FC<UniversalButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  ...props
}) => {
  const buttonStyles = useMemo(() => ({
    ...PlatformStyles.button,
    ...getResponsiveValue({
      small: { paddingHorizontal: 12, paddingVertical: 8 },
      medium: { paddingHorizontal: 16, paddingVertical: 12 },
      large: { paddingHorizontal: 20, paddingVertical: 16 },
      default: { paddingHorizontal: 16, paddingVertical: 12 },
    }),
  }), [size]);

  return (
    <UniversalButtonContainer
      style={buttonStyles}
      variant={variant}
      onPress={onPress}
      {...props}
    >
      <UniversalButtonText variant={variant} style={buttonStyles}>
        {title}
      </UniversalButtonText>
    </UniversalButtonContainer>
  );
};
```

---

## ♿ **Accessibility Excellence**

### **iOS Accessibility**
```typescript
// src/components/accessibility/IOSAccessibility.tsx
const AccessibleTaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const accessibilityLabel = `${task.title}, ${task.priority} priority, due ${formatDueDate(task.dueDate)}`;
  const accessibilityHint = 'Double tap to view details, swipe right to complete';

  return (
    <TaskCard
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityActions={[
        { name: 'complete', label: 'Mark complete' },
        { name: 'reschedule', label: 'Reschedule task' },
      ]}
      onAccessibilityAction={({ nativeEvent }) => {
        switch (nativeEvent.actionName) {
          case 'complete':
            handleCompleteTask(task.id);
            break;
          case 'reschedule':
            handleRescheduleTask(task);
            break;
        }
      }}
    >
      {/* Task content */}
    </TaskCard>
  );
};
```

### **Android Accessibility**
```typescript
// src/components/accessibility/AndroidAccessibility.tsx
const AndroidAccessibleComponent: React.FC = ({ children }) => {
  return (
    <View
      accessible={true}
      accessibilityRole="button"
      importantForAccessibility="yes"
      accessibilityLiveRegion="polite"
    >
      {children}
    </View>
  );
};
```

---

## ✅ **Platform Implementation Checklist**

### **iOS Optimization**
- [ ] Human Interface Guidelines compliance
- [ ] iOS navigation patterns implemented
- [ ] Context menus for iOS 13+ devices
- [ ] Shortcuts app integration
- [ ] Widget extension support
- [ ] Haptic feedback integration
- [ ] SF Symbols where appropriate
- [ ] Dynamic Type support

### **Android Optimization**
- [ ] Material Design 3 compliance
- [ ] Android navigation patterns
- [ ] Floating Action Button implementation
- [ ] Back button handling
- [ ] Permission request flows
- [ ] Notification optimization
- [ ] Adaptive icons support
- [ ] TalkBack accessibility

### **Cross-Platform Excellence**
- [ ] Responsive design system
- [ ] Platform-specific styling
- [ ] Universal component library
- [ ] Performance optimization
- [ ] Memory management
- [ ] Bundle size optimization
- [ ] Testing on both platforms
- [ ] Accessibility compliance

---

**These platform guidelines ensure HomeKeeper delivers a truly native experience on both iOS and Android while maintaining the revolutionary simplicity and warmth that defines the HomeKeeper brand. Every interaction feels natural to each platform while building user confidence in home maintenance.** 📱🤖 