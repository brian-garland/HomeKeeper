# HomeKeeper Core User Flows
**Week 2.5 UX Foundation - Navigation & State Management Guide**

## 🌊 **Primary User Flows**

### **1. First-Time User Onboarding Flow**

```
START → Welcome Screen
├─ [Get Started] → Authentication
│  ├─ [Sign Up] → Account Creation
│  │  ├─ SUCCESS → Address Input
│  │  └─ ERROR → Retry Authentication
│  └─ [Sign In] → Login
│     ├─ SUCCESS → Check if setup complete
│     │  ├─ INCOMPLETE → Address Input
│     │  └─ COMPLETE → Dashboard
│     └─ ERROR → Retry Authentication
├─ [I have account] → Authentication (Sign In flow)
└─ [Skip] → Guest Mode (limited features)

Address Input
├─ [Continue] → Address Validation
│  ├─ VALID → Equipment Discovery
│  └─ INVALID → Address Input (show error)
└─ [Skip] → Equipment Discovery (no address)

Equipment Discovery
├─ [Take Photo] → Camera View
│  ├─ Photo Captured → AI Analysis
│  │  ├─ Equipment Found → Add to List
│  │  └─ No Equipment → Try Again
│  └─ [Add Manually] → Manual Entry Form
├─ [Add Manually] → Equipment Form
│  ├─ [Save] → Add to List
│  └─ [Cancel] → Equipment Discovery
├─ [I'm Done] → Preferences Screen
└─ [Skip Tour] → Preferences Screen

Preferences Screen
├─ [Continue] → Save Preferences
│  ├─ SUCCESS → Calendar Generation
│  │  ├─ SUCCESS → Dashboard (onboarding complete)
│  │  └─ ERROR → Retry/Skip
│  └─ ERROR → Show Error, Allow Retry
└─ [Skip] → Dashboard (default preferences)
```

### **2. Daily Task Management Flow**

```
Dashboard → Task List
├─ View All Tasks
├─ Filter by Status [All/Due Soon/Overdue/Completed]
├─ Search Tasks
└─ [+ Add Task] → Create Task Flow

Task List → Task Detail
├─ View Task Information
├─ [📷 Start Task] → Task Execution Flow
├─ [✅ Mark Complete] → Complete Task Flow
├─ [📅 Reschedule] → Reschedule Flow
├─ [⋯ More Options] → Task Options Menu
│  ├─ Edit Task
│  ├─ Delete Task
│  ├─ Duplicate Task
│  └─ Share Task
└─ [← Back] → Task List

Task Execution Flow:
Task Detail → Start Task
├─ [📷 Take Before Photo] → Camera
│  ├─ Photo Taken → Task Progress
│  └─ [Skip] → Task Progress
├─ Task Progress → Step-by-step guide
│  ├─ Follow Instructions
│  ├─ [Need Help?] → Help Resources
│  └─ [Mark Step Complete] → Next Step
└─ Task Complete → After Photo
   ├─ [📷 Take After Photo] → Camera
   │  ├─ Photo Taken → Task Summary
   │  └─ [Skip] → Task Summary
   └─ Task Summary
      ├─ [Save & Complete] → Dashboard
      ├─ [Add Notes] → Notes Entry
      └─ [Schedule Next] → Create Recurring Task
```

### **3. Equipment Management Flow**

```
Equipment List
├─ View All Equipment
├─ Filter by Category [All/HVAC/Plumbing/Electrical/etc.]
├─ Search Equipment
├─ [+ Add Equipment] → Add Equipment Flow
└─ Select Equipment → Equipment Detail

Equipment Detail
├─ View Equipment Info
├─ View Maintenance History
├─ View Upcoming Tasks
├─ [📷 Add Photo] → Camera
├─ [✏️ Edit] → Edit Equipment Flow
├─ [🗑️ Delete] → Confirm Delete
├─ [📋 Create Task] → Create Task (pre-filled)
└─ [← Back] → Equipment List

Add Equipment Flow:
Add Equipment → Equipment Form
├─ Manual Entry
│  ├─ Basic Info (Name, Category, Type)
│  ├─ Details (Brand, Model, Serial)
│  ├─ Dates (Purchase, Install, Warranty)
│  ├─ [📷 Add Photo] → Camera
│  ├─ [Save] → Equipment List
│  └─ [Cancel] → Equipment List
└─ [📷 Photo Scan] → Camera
   ├─ Take Photo → AI Analysis
   │  ├─ Equipment Identified → Pre-filled Form
   │  └─ Not Recognized → Manual Entry
   └─ [Cancel] → Add Equipment
```

---

## 🎯 **Key User Scenarios**

### **Scenario 1: New User Gets Started (5 minutes)**
```
Goal: User creates account, adds home, discovers equipment, gets first tasks

Flow:
Welcome → Sign Up → Address → Equipment Tour (2-3 items) → Preferences → Dashboard

Success Metrics:
- Completes onboarding: 90%
- Adds at least 1 equipment: 80%
- Sees personalized tasks: 95%
- Time to first task: <5 minutes
```

### **Scenario 2: Daily Task Check (30 seconds)**
```
Goal: User quickly reviews today's tasks

Flow:
Dashboard → Review Today's Focus → Mark tasks complete OR Navigate to task detail

Success Metrics:
- Views today's tasks: 100%
- Completes at least 1 task: 60%
- Time to task completion: <2 minutes
```

### **Scenario 3: Complete HVAC Filter Task (10 minutes)**
```
Goal: User follows guided task completion

Flow:
Task List → HVAC Filter Task → Start Task → Before Photo → Follow Guide → After Photo → Complete

Success Metrics:
- Follows all steps: 85%
- Takes before/after photos: 70%
- Completes task fully: 90%
- Schedules next occurrence: 60%
```

---

## 🚀 **Navigation Architecture**

### **React Navigation Structure**
```typescript
// Navigation Hierarchy
RootNavigator (Stack)
├─ AuthNavigator (Stack)
│  ├─ Welcome
│  ├─ SignIn
│  └─ SignUp
├─ OnboardingNavigator (Stack)
│  ├─ AddressInput
│  ├─ EquipmentDiscovery
│  └─ Preferences
└─ MainNavigator (Tab)
   ├─ HomeStack (Stack)
   │  ├─ Dashboard
   │  └─ TaskDetail
   ├─ TasksStack (Stack)
   │  ├─ TaskList
   │  ├─ TaskDetail
   │  ├─ CreateTask
   │  └─ TaskExecution
   ├─ EquipmentStack (Stack)
   │  ├─ EquipmentList
   │  ├─ EquipmentDetail
   │  └─ AddEquipment
   └─ CalendarStack (Stack)
      ├─ Calendar
      └─ DayView
```

### **Navigation Patterns**
```typescript
// Deep Linking Support
const linking = {
  '/task/:id': 'TaskDetail',
  '/equipment/:id': 'EquipmentDetail',
  '/onboarding': 'OnboardingNavigator',
  '/auth': 'AuthNavigator'
}

// Navigation Actions
const navigationActions = {
  // From Dashboard
  goToTaskDetail: (taskId) => navigate('TaskDetail', { taskId }),
  goToTaskList: () => navigate('TasksStack'),
  
  // From Task List
  createTask: () => navigate('CreateTask'),
  startTask: (taskId) => navigate('TaskExecution', { taskId }),
  
  // Cross-tab navigation
  createTaskForEquipment: (equipmentId) => {
    navigate('TasksStack', { 
      screen: 'CreateTask', 
      params: { equipmentId } 
    })
  }
}
```

---

## 📱 **State Management Patterns**

### **App State Structure**
```typescript
// Global State (Context/Redux)
interface AppState {
  // Authentication
  auth: {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
  }
  
  // Onboarding
  onboarding: {
    isComplete: boolean
    currentStep: 'address' | 'equipment' | 'preferences'
    hasAddress: boolean
    equipmentCount: number
  }
  
  // Core Data
  homes: Home[]
  equipment: Equipment[]
  tasks: Task[]
  
  // UI State
  ui: {
    activeTab: 'home' | 'tasks' | 'equipment' | 'calendar'
    taskFilters: TaskFilter
    equipmentFilters: EquipmentFilter
    isOffline: boolean
  }
}
```

### **Data Synchronization Patterns**
```typescript
// Real-time Data Flow
useEffect(() => {
  // Subscribe to real-time updates
  const subscription = supabase
    .channel(`user-${user.id}`)
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          dispatch({ type: 'SYNC_TASK', payload })
        })
    .subscribe()
    
  return () => subscription.unsubscribe()
}, [user.id])

// Optimistic Updates
const completeTask = async (taskId) => {
  // Immediate UI update
  dispatch({ type: 'COMPLETE_TASK_OPTIMISTIC', taskId })
  
  try {
    // Sync with backend
    await supabase.from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)
  } catch (error) {
    // Revert on error
    dispatch({ type: 'COMPLETE_TASK_FAILED', taskId })
  }
}
```

---

## 🎨 **Screen Transition Animations**

### **Animation Patterns**
```typescript
// Stack Navigation Transitions
const stackOptions = {
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec
  }
}

// Tab Navigation Transitions
const tabOptions = {
  tabBarStyle: { animation: 'shift' },
  tabBarActiveTintColor: colors.primary[500],
  tabBarInactiveTintColor: colors.text.secondary
}

// Modal Presentations
const modalOptions = {
  presentation: 'modal',
  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
}
```

### **Loading States**
```typescript
// Screen Loading Patterns
const ScreenLoader = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary[500]} />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
)

// Skeleton Loading
const TaskListSkeleton = () => (
  <View>
    {[1,2,3].map(i => (
      <SkeletonCard key={i} />
    ))}
  </View>
)
```

---

## ✅ **User Flow Validation Checklist**

### **Onboarding Flow:**
- [ ] User can complete onboarding in <5 minutes
- [ ] Each step has clear progress indication
- [ ] User can skip optional steps
- [ ] Error states are handled gracefully
- [ ] User can go back to previous steps

### **Task Management:**
- [ ] User can quickly see today's priority tasks
- [ ] Task completion feels rewarding
- [ ] User can easily reschedule tasks
- [ ] Search and filtering work intuitively
- [ ] Offline functionality works smoothly

### **Equipment Management:**
- [ ] Adding equipment is simple and fast
- [ ] Photo scanning works reliably
- [ ] Equipment categories are logical
- [ ] Maintenance history is accessible
- [ ] Integration with tasks is seamless

### **Navigation:**
- [ ] Tab navigation is intuitive
- [ ] Deep linking works correctly
- [ ] Back navigation behaves predictably
- [ ] Cross-tab navigation maintains context
- [ ] No navigation dead ends

This user flow documentation provides **complete implementation guidance** for React Native navigation and state management in Week 3! 