# HomeKeeper Screen Specifications
**Detailed Implementation Guide for Every Screen**

*"The details are not the details. They make the design." - Charles Eames*

---

**Document:** Complete Screen Specifications  
**Date:** June 11, 2025  
**Version:** 1.0 - React Native Implementation Guide  
**Target:** Week 3 Screen Development

---

## 🏗️ **Screen Architecture Overview**

### **App Navigation Structure**

```
HomeKeeper App
├── Onboarding Stack
│   ├── Welcome Screen
│   ├── Address Input Screen
│   ├── Equipment Discovery Screen
│   └── Preferences Screen
├── Main App (Tab Navigator)
│   ├── Home Tab
│   │   ├── Dashboard Screen
│   │   └── Home Health Details Screen
│   ├── Tasks Tab
│   │   ├── Task List Screen
│   │   ├── Task Detail Screen
│   │   └── Task Completion Screen
│   ├── Equipment Tab
│   │   ├── Equipment List Screen
│   │   ├── Equipment Detail Screen
│   │   └── Add Equipment Screen
│   └── Calendar Tab
│       ├── Calendar View Screen
│       └── Schedule Management Screen
└── Modal Stack
    ├── Settings Screen
    ├── Profile Screen
    └── Help & Support Screen
```

---

## 🚀 **Onboarding Flow Screens**

### **1. Welcome Screen**

**Purpose:** First impression that establishes trust and value proposition  
**User Goal:** Understand app benefits and feel confident to proceed  
**Success Metric:** 90%+ proceed to address input

#### **Screen Wireframe**
```
┌─────────────────────────────────┐
│          Status Bar             │
├─────────────────────────────────┤
│                                 │
│         [App Logo]              │
│                                 │
│    🏠 HomeKeeper                │
│                                 │
│  "Transform home maintenance    │
│   from overwhelming to          │
│   empowering"                   │
│                                 │
│   ✓ Know what needs doing       │
│   ✓ Get perfect timing          │
│   ✓ Learn how to do it right    │
│                                 │
│                                 │
│     [Get Started Button]        │
│                                 │
│   Already have account? Login   │
│                                 │
└─────────────────────────────────┘
```

#### **Component Specifications**

```typescript
// src/screens/onboarding/WelcomeScreen.tsx
const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { slideIn } = useSlideAnimation();

  useEffect(() => {
    slideIn();
  }, []);

  return (
    <WelcomeContainer>
      <WelcomeHeader>
        <AppLogo source={require('../assets/homekeeper-logo.png')} />
        <AppName>HomeKeeper</AppName>
        <Tagline>
          Transform home maintenance from overwhelming to empowering
        </Tagline>
      </WelcomeHeader>

      <BenefitsList>
        <BenefitItem>
          <CheckIcon name="checkmark-circle" size={24} color={Colors.success} />
          <BenefitText>Know what needs doing</BenefitText>
        </BenefitItem>
        <BenefitItem>
          <CheckIcon name="checkmark-circle" size={24} color={Colors.success} />
          <BenefitText>Get perfect timing</BenefitText>
        </BenefitItem>
        <BenefitItem>
          <CheckIcon name="checkmark-circle" size={24} color={Colors.success} />
          <BenefitText>Learn how to do it right</BenefitText>
        </BenefitItem>
      </BenefitsList>

      <WelcomeFooter>
        <PrimaryButton
          title="Get Started"
          onPress={() => navigation.navigate('AddressInput')}
          size="large"
        />
        <LoginLink onPress={() => navigation.navigate('Login')}>
          Already have an account? Login
        </LoginLink>
      </WelcomeFooter>
    </WelcomeContainer>
  );
};

const WelcomeContainer = styled.View`
  flex: 1;
  background-color: ${Colors.background};
  padding: ${Layout.screenPaddingVertical}px ${Layout.screenPaddingHorizontal}px;
  justify-content: space-between;
`;

const WelcomeHeader = styled.View`
  align-items: center;
  margin-top: ${Spacing.huge}px;
`;

const AppLogo = styled.Image`
  width: 80px;
  height: 80px;
  margin-bottom: ${Spacing.lg}px;
`;

const AppName = styled.Text`
  ${Typography.displayLarge}
  color: ${Colors.primary};
  margin-bottom: ${Spacing.md}px;
`;

const Tagline = styled.Text`
  ${Typography.bodyLarge}
  text-align: center;
  color: ${Colors.textSecondary};
  max-width: 280px;
`;
```

#### **Interaction Specifications**
- **Entry Animation**: Slide up from bottom with fade in
- **Get Started Button**: Scale animation on press, navigate to AddressInput
- **Login Link**: Subtle color change on press, navigate to Login
- **Accessibility**: VoiceOver support with proper labels

---

### **2. Address Input Screen**

**Purpose:** Capture user location for personalized recommendations  
**User Goal:** Quickly input address with confidence  
**Success Metric:** 95%+ complete without errors

#### **Screen Wireframe**
```
┌─────────────────────────────────┐
│    [Back]    Step 1 of 3        │
├─────────────────────────────────┤
│                                 │
│        🏠 Your Home             │
│                                 │
│  "Tell us your address to get   │
│   personalized maintenance      │
│   recommendations"              │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 123 Main Street         │   │
│   │ [Address Input]         │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ San Francisco, CA       │   │ 
│   │ [City, State]           │   │
│   └─────────────────────────┘   │
│                                 │
│                                 │
│         [Continue]              │
│                                 │
│   🔒 Your address is private    │
│      and secure                 │
│                                 │
└─────────────────────────────────┘
```

#### **Component Implementation**

```typescript
// src/screens/onboarding/AddressInputScreen.tsx
const AddressInputScreen: React.FC = () => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleContinue = async () => {
    if (!address.trim() || !city.trim()) {
      Alert.alert('Please enter your complete address');
      return;
    }

    setLoading(true);
    try {
      // Validate address and save to user profile
      await saveUserAddress({ address, city });
      navigation.navigate('EquipmentDiscovery');
    } catch (error) {
      Alert.alert('Please check your address and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AddressInputContainer>
      <ProgressHeader>
        <BackButton onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </BackButton>
        <ProgressText>Step 1 of 3</ProgressText>
      </ProgressHeader>

      <AddressInputContent>
        <AddressIcon>🏠</AddressIcon>
        <Title>Your Home</Title>
        <Description>
          Tell us your address to get personalized maintenance recommendations
        </Description>

        <AddressForm>
          <TextInput
            label="Street Address"
            placeholder="123 Main Street"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="words"
            autoComplete="street-address"
          />
          
          <TextInput
            label="City, State"
            placeholder="San Francisco, CA"
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            autoComplete="address-level2"
          />
        </AddressForm>

        <PrivacyNotice>
          <Icon name="lock-closed" size={16} color={Colors.textTertiary} />
          <PrivacyText>Your address is private and secure</PrivacyText>
        </PrivacyNotice>
      </AddressInputContent>

      <AddressInputFooter>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={!address.trim() || !city.trim()}
        />
      </AddressInputFooter>
    </AddressInputContainer>
  );
};
```

---

## 🏠 **Main App Screens**

### **3. Home Dashboard Screen**

**Purpose:** Central command center showing home health and today's priorities  
**User Goal:** Quick overview of home status and immediate actions  
**Success Metric:** 80%+ complete at least one daily task

#### **Screen Wireframe**
```
┌─────────────────────────────────┐
│   Good morning, Brian    [⚙️]    │
├─────────────────────────────────┤
│                                 │
│   🏠 Home Health Score          │
│        ╭─────────╮              │
│        │   87%   │              │
│        │ Excellent│              │
│        ╰─────────╯              │
│   +3% this month                │
│                                 │
│   📋 Today's Priorities         │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 🔧 Check HVAC Filter    │   │
│   │ High Priority • 5 min   │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 🧹 Clean Gutters        │   │
│   │ Medium Priority • 30min │   │
│   └─────────────────────────┘   │
│                                 │
│   📊 This Week                  │
│   3 tasks completed             │
│   2 tasks scheduled             │
│                                 │
└─────────────────────────────────┘
```

#### **Component Implementation**

```typescript
// src/screens/main/HomeScreen.tsx
const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { homeHealth, isLoading } = useHomeHealth();
  const { todayTasks } = useTodayTasks();
  const { weeklyStats } = useWeeklyStats();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <HomeContainer>
      <HomeHeader>
        <GreetingText>{greeting}, {user?.firstName}</GreetingText>
        <HeaderActions>
          <IconButton onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings" size={24} color={Colors.textSecondary} />
          </IconButton>
        </HeaderActions>
      </HomeHeader>

      <HomeContent>
        {/* Home Health Score */}
        <HealthScoreCard>
          <HealthScoreHeader>
            <HomeIcon>🏠</HomeIcon>
            <HealthScoreTitle>Home Health Score</HealthScoreTitle>
          </HealthScoreHeader>
          
          <HealthScoreDisplay>
            <CircularProgress
              value={homeHealth.score}
              size={120}
              strokeWidth={8}
              color={getHealthColor(homeHealth.score)}
              backgroundColor={Colors.gray200}
            />
            <HealthScoreOverlay>
              <HealthScoreValue>{homeHealth.score}%</HealthScoreValue>
              <HealthScoreLabel>
                {getHealthLabel(homeHealth.score)}
              </HealthScoreLabel>
            </HealthScoreOverlay>
          </HealthScoreDisplay>
          
          {homeHealth.improvement > 0 && (
            <ImprovementIndicator>
              <TrendIcon name="trending-up" size={16} color={Colors.success} />
              <ImprovementText>
                +{homeHealth.improvement}% this month
              </ImprovementText>
            </ImprovementIndicator>
          )}
        </HealthScoreCard>

        {/* Today's Priorities */}
        <TodaySection>
          <SectionHeader>
            <SectionIcon>📋</SectionIcon>
            <SectionTitle>Today's Priorities</SectionTitle>
          </SectionHeader>
          
          {todayTasks.length > 0 ? (
            <TasksList>
              {todayTasks.slice(0, 3).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  compact={true}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                  onSwipeRight={() => handleCompleteTask(task.id)}
                />
              ))}
            </TasksList>
          ) : (
            <EmptyState>
              <EmptyStateIcon>✨</EmptyStateIcon>
              <EmptyStateText>All caught up for today!</EmptyStateText>
            </EmptyState>
          )}
        </TodaySection>

        {/* Weekly Stats */}
        <WeeklyStatsCard>
          <SectionHeader>
            <SectionIcon>📊</SectionIcon>
            <SectionTitle>This Week</SectionTitle>
          </SectionHeader>
          
          <StatsGrid>
            <StatItem>
              <StatValue>{weeklyStats.completed}</StatValue>
              <StatLabel>tasks completed</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{weeklyStats.scheduled}</StatValue>
              <StatLabel>tasks scheduled</StatLabel>
            </StatItem>
          </StatsGrid>
        </WeeklyStatsCard>
      </HomeContent>
    </HomeContainer>
  );
};

// Helper functions
const getHealthColor = (score: number) => {
  if (score >= 80) return Colors.success;
  if (score >= 60) return Colors.warning;
  return Colors.error;
};

const getHealthLabel = (score: number) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Attention';
};
```

---

### **4. Task List Screen**

**Purpose:** Comprehensive view of all maintenance tasks with filtering and sorting  
**User Goal:** Find and manage tasks efficiently  
**Success Metric:** 70%+ use filters or search to find specific tasks

#### **Screen Wireframe**
```
┌─────────────────────────────────┐
│           Tasks          [+]    │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │ 🔍 Search tasks...      │    │
│  └─────────────────────────┘    │
│                                 │
│  [All] [Today] [Week] [Overdue] │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🔧 Replace HVAC Filter  │    │
│  │ High • Due Tomorrow     │    │
│  │ ████████░░ 80% ready    │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🧹 Clean Rain Gutters   │    │
│  │ Medium • Due Next Week  │    │
│  │ ███░░░░░░░ 30% ready    │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🏠 Inspect Roof         │    │
│  │ Low • Due Next Month    │    │
│  │ █░░░░░░░░░ 10% ready    │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

#### **Component Implementation**

```typescript
// src/screens/main/TaskListScreen.tsx
const TaskListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    tasks,
    loading,
    error,
    refreshTasks,
    completeTask,
    rescheduleTask,
  } = useTasks();

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter(task => isToday(new Date(task.dueDate)));
        break;
      case 'week':
        filtered = filtered.filter(task => 
          isThisWeek(new Date(task.dueDate), { weekStartsOn: 1 })
        );
        break;
      case 'overdue':
        filtered = filtered.filter(task => 
          isPast(new Date(task.dueDate)) && task.status !== 'completed'
        );
        break;
    }

    // Sort by priority and due date
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, searchQuery, selectedFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
      // Show success animation
      showSuccessToast('Task completed! 🎉');
    } catch (error) {
      showErrorToast('Failed to complete task');
    }
  };

  const handleRescheduleTask = (task: Task) => {
    navigation.navigate('TaskReschedule', { task });
  };

  return (
    <TaskListContainer>
      <TaskListHeader>
        <HeaderTitle>Tasks</HeaderTitle>
        <AddTaskButton onPress={() => navigation.navigate('AddTask')}>
          <Icon name="add" size={24} color={Colors.primary} />
        </AddTaskButton>
      </TaskListHeader>

      <TaskSearchSection>
        <SearchInput
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
        />
      </TaskSearchSection>

      <TaskFilters>
        <FilterChip
          title="All"
          selected={selectedFilter === 'all'}
          onPress={() => setSelectedFilter('all')}
        />
        <FilterChip
          title="Today"
          selected={selectedFilter === 'today'}
          onPress={() => setSelectedFilter('today')}
          count={tasks.filter(t => isToday(new Date(t.dueDate))).length}
        />
        <FilterChip
          title="Week"
          selected={selectedFilter === 'week'}
          onPress={() => setSelectedFilter('week')}
        />
        <FilterChip
          title="Overdue"
          selected={selectedFilter === 'overdue'}
          onPress={() => setSelectedFilter('overdue')}
          count={tasks.filter(t => 
            isPast(new Date(t.dueDate)) && t.status !== 'completed'
          ).length}
          variant="error"
        />
      </TaskFilters>

      <TaskListContent>
        {loading && !refreshing ? (
          <LoadingState />
        ) : filteredTasks.length > 0 ? (
          <FlatList
            data={filteredTasks}
            renderItem={({ item: task }) => (
              <EnhancedTaskCard
                task={task}
                onPress={() => handleTaskPress(task)}
                onSwipeRight={() => handleCompleteTask(task.id)}
                onSwipeLeft={() => handleRescheduleTask(task)}
                showProgress={true}
              />
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
            contentContainerStyle={{
              paddingBottom: Layout.tabBarHeight + Spacing.lg,
            }}
          />
        ) : (
          <EmptyTasksState
            filter={selectedFilter}
            searchQuery={searchQuery}
            onAddTask={() => navigation.navigate('AddTask')}
          />
        )}
      </TaskListContent>
    </TaskListContainer>
  );
};
```

---

### **5. Task Detail Screen**

**Purpose:** Comprehensive task information with educational content and completion tracking  
**User Goal:** Understand how to complete task safely and effectively  
**Success Metric:** 85%+ complete task after viewing detailed instructions

#### **Screen Wireframe**
```
┌─────────────────────────────────┐
│     [←] Task Details      [⋯]   │
├─────────────────────────────────┤
│                                 │
│   🔧 Replace HVAC Filter        │
│   High Priority • Due Tomorrow  │
│                                 │
│   ████████░░ 80% Ready          │
│   You have: Tools, New Filter   │
│   Still need: Nothing           │
│                                 │
│   📝 What You'll Learn          │
│   • How to locate your filter  │
│   • When to replace filters     │
│   • Signs of filter problems    │
│                                 │
│   🛠️ Instructions (5 steps)     │
│   ┌─────────────────────────┐   │
│   │ 1. Turn off HVAC system │   │
│   │    [Photo Guide]        │   │
│   └─────────────────────────┘   │
│                                 │
│   ⚠️ Safety Tips                │
│   • Always turn off power      │
│   • Wear gloves when handling  │
│                                 │
│      [Mark Complete]            │
│      [Reschedule]               │
│                                 │
└─────────────────────────────────┘
```

#### **Component Implementation**

```typescript
// src/screens/main/TaskDetailScreen.tsx
interface TaskDetailScreenProps {
  route: RouteProp<RootStackParamList, 'TaskDetail'>;
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ route }) => {
  const { taskId } = route.params;
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
    task,
    loading,
    error,
    completeTask,
    updateTaskProgress,
  } = useTaskDetail(taskId);

  const {
    instructions,
    safetyTips,
    learningObjectives,
    requiredTools,
  } = useTaskInstructions(task?.type);

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      const newCompletedSteps = [...completedSteps, stepIndex];
      setCompletedSteps(newCompletedSteps);
      
      // Update progress in backend
      const progress = (newCompletedSteps.length / instructions.length) * 100;
      updateTaskProgress(taskId, progress);
    }
  };

  const handleCompleteTask = async () => {
    try {
      await completeTask(taskId);
      
      // Show success celebration
      navigation.navigate('TaskCompletion', {
        taskId,
        completedSteps: completedSteps.length,
        totalSteps: instructions.length,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  const readinessScore = useMemo(() => {
    if (!task || !requiredTools) return 0;
    
    const availableTools = requiredTools.filter(tool => 
      task.availableResources?.includes(tool.id)
    ).length;
    
    return Math.round((availableTools / requiredTools.length) * 100);
  }, [task, requiredTools]);

  if (loading) return <LoadingState />;
  if (error || !task) return <ErrorState onRetry={() => navigation.goBack()} />;

  return (
    <TaskDetailContainer>
      <TaskDetailHeader>
        <BackButton onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </BackButton>
        <HeaderTitle>Task Details</HeaderTitle>
        <MenuButton onPress={() => setShowMenu(true)}>
          <Icon name="ellipsis-horizontal" size={24} color={Colors.textPrimary} />
        </MenuButton>
      </TaskDetailHeader>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TaskDetailContent>
          {/* Task Overview */}
          <TaskOverview>
            <TaskIcon>{getTaskIcon(task.type)}</TaskIcon>
            <TaskTitle>{task.title}</TaskTitle>
            <TaskMeta>
              <PriorityBadge priority={task.priority} />
              <DueDateText due={task.dueDate} />
            </TaskMeta>
          </TaskOverview>

          {/* Readiness Progress */}
          <ReadinessSection>
            <ProgressBar
              progress={readinessScore}
              color={readinessScore >= 80 ? Colors.success : Colors.warning}
              height={8}
            />
            <ReadinessText>
              {readinessScore}% Ready
            </ReadinessText>
            <ReadinessDetails>
              <ReadinessItem>
                <CheckIcon completed={true} />
                <ReadinessLabel>You have: Tools, New Filter</ReadinessLabel>
              </ReadinessItem>
              {readinessScore < 100 && (
                <ReadinessItem>
                  <CheckIcon completed={false} />
                  <ReadinessLabel>Still need: {getMissingItems(task, requiredTools)}</ReadinessLabel>
                </ReadinessItem>
              )}
            </ReadinessDetails>
          </ReadinessSection>

          {/* Learning Objectives */}
          <LearningSection>
            <SectionHeader>
              <SectionIcon>📝</SectionIcon>
              <SectionTitle>What You'll Learn</SectionTitle>
            </SectionHeader>
            <LearningList>
              {learningObjectives.map((objective, index) => (
                <LearningItem key={index}>
                  <BulletPoint>•</BulletPoint>
                  <LearningText>{objective}</LearningText>
                </LearningItem>
              ))}
            </LearningList>
          </LearningSection>

          {/* Instructions */}
          <InstructionsSection>
            <SectionHeader>
              <SectionIcon>🛠️</SectionIcon>
              <SectionTitle>Instructions ({instructions.length} steps)</SectionTitle>
            </SectionHeader>
            
            <InstructionsList>
              {instructions.map((instruction, index) => (
                <InstructionCard
                  key={index}
                  instruction={instruction}
                  stepNumber={index + 1}
                  completed={completedSteps.includes(index)}
                  onComplete={() => handleStepComplete(index)}
                />
              ))}
            </InstructionsList>
          </InstructionsSection>

          {/* Safety Tips */}
          <SafetySection>
            <SectionHeader>
              <SectionIcon>⚠️</SectionIcon>
              <SectionTitle>Safety Tips</SectionTitle>
            </SectionHeader>
            <SafetyTipsList>
              {safetyTips.map((tip, index) => (
                <SafetyTip key={index}>
                  <SafetyIcon>•</SafetyIcon>
                  <SafetyText>{tip}</SafetyText>
                </SafetyTip>
              ))}
            </SafetyTipsList>
          </SafetySection>
        </TaskDetailContent>
      </ScrollView>

      {/* Action Buttons */}
      <TaskDetailFooter>
        <PrimaryButton
          title="Mark Complete"
          onPress={handleCompleteTask}
          disabled={readinessScore < 80}
        />
        <SecondaryButton
          title="Reschedule"
          onPress={() => navigation.navigate('TaskReschedule', { task })}
        />
      </TaskDetailFooter>
    </TaskDetailContainer>
  );
};
```

---

## 📋 **Implementation Guidelines**

### **Screen Development Priority**

#### **Week 3 Day 1-2: Core Screens**
1. Welcome Screen (onboarding entry point)
2. Home Dashboard Screen (main user hub)
3. Task List Screen (primary functionality)

#### **Week 3 Day 3-4: Detail Screens**
1. Task Detail Screen (educational content)
2. Address Input Screen (onboarding)
3. Equipment List Screen (secondary functionality)

#### **Week 3 Day 5: Polish & Testing**
1. Screen transitions and animations  
2. Error states and loading states
3. Accessibility testing and optimization

### **Quality Assurance Checklist**

#### **Every Screen Must Include:**
- [ ] Loading states for async operations
- [ ] Error states with retry functionality
- [ ] Empty states with helpful guidance
- [ ] Accessibility labels and hints
- [ ] Keyboard handling for inputs
- [ ] Safe area handling for all devices
- [ ] Gesture support where appropriate
- [ ] Offline state handling

#### **Performance Requirements:**
- [ ] Screen renders in <500ms
- [ ] Smooth 60fps animations
- [ ] Optimized image loading
- [ ] Memory usage under 50MB per screen
- [ ] Bundle size impact minimized

---

**These screen specifications provide the complete blueprint for HomeKeeper's user interface. Each screen is designed to build user confidence, provide clear value, and maintain the revolutionary simplicity that sets HomeKeeper apart from competitors.** 📱 