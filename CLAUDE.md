# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on platforms
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# Testing
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

## High-Level Architecture

HomeKeeper is a **React Native/Expo app** for home maintenance management with an **offline-first, local-data architecture**. The app works entirely without backend services by default, using AsyncStorage for persistence.

### Core Architecture Pattern
- **Local-First Design**: All functionality works offline using AsyncStorage
- **DataContext**: Centralized state management with automatic persistence
- **Task Generation Engine**: Intelligent task creation based on templates and equipment
- **Equipment-Centered**: Tasks organized around actual home equipment
- **Unified Data Manager**: Abstracts local vs remote data operations

### Key Components

#### Data Layer (`src/contexts/DataContext.tsx`)
- Central state management for homes, tasks, and equipment
- Automatic AsyncStorage persistence with operation queuing
- Handles recurring task creation and equipment service tracking
- Money saved calculations and performance monitoring

#### Navigation (`src/navigation/`)
- **AppNavigator**: Routes between onboarding and main app
- **TabNavigator**: Bottom tab navigation for main screens
- **Stack Navigators**: Screen-specific navigation stacks

#### Core Services (`src/lib/services/`)
- **taskGenerationService**: Intelligent task creation with seasonal/equipment-based logic
- **recurringTaskService**: Automatic recurring task generation
- **dataManager**: Unified interface for local vs remote data operations
- **weatherService**: Weather-aware task optimization
- **localTemplateService**: Offline task template management

#### Key Screens (`src/screens/`)
- **MagicalOnboardingScreen**: 5-step user setup flow
- **TasksScreen**: Main task management interface
- **AddTaskScreen**: Task creation with form validation
- **DashboardScreen**: Overview and progress tracking
- **EquipmentScreen**: Equipment management

### Data Models
- **Task**: Core entity with recurrence, equipment linking, money tracking
- **Equipment**: Physical home items with maintenance schedules
- **Home**: Property details with location for weather integration
- **TaskTemplate**: Reusable maintenance patterns

### Testing Infrastructure
- **Jest** with React Native preset
- **Comprehensive integration tests** (55/55 passing)
- **Component testing** with Testing Library
- **95%+ test coverage** on critical paths
- **Error scenario testing** and edge case handling

## Development Guidelines

### Adding New Features
1. Check if feature needs local templates (`src/lib/data/localTaskTemplates.ts`)
2. Update TypeScript types in `src/types/`
3. Add service logic in `src/lib/services/`
4. Create UI components in `src/components/`
5. Write comprehensive tests in `src/__tests__/`

### Working with Tasks
- All task operations go through DataContext
- Equipment-linked tasks automatically update service dates
- Recurring tasks are created when parent task is completed
- Weather-dependent tasks can be optimized for outdoor conditions

### Data Management
- Use `useDataContext()` hook for state access
- AsyncStorage keys are prefixed with `homekeeper_`
- Storage operations are queued to prevent race conditions
- Local data takes precedence over remote (offline-first)

### Testing Strategy
- Run `npm run test:coverage` before committing
- Integration tests cover complete user flows
- Error scenarios must be tested for critical paths
- Mock AsyncStorage and navigation for tests

## Important Technical Details

### Task Generation Logic
- Seasonal tasks based on current month and home type
- Equipment tasks linked to maintenance schedules
- Intelligent due date spacing (minimum 2 weeks out)
- Weather optimization for outdoor tasks
- Duplicate prevention across categories

### Recurring Task System
- Automatically creates next instance when task completed
- Supports monthly, quarterly, biannual, annual frequencies
- Equipment service dates updated on completion
- Preserves all original task properties

### Error Handling
- ErrorBoundary components wrap critical sections
- Graceful fallbacks for AsyncStorage failures
- Comprehensive error logging with logger service
- User-friendly error messages throughout UI

### Performance Considerations
- Operations queued to prevent AsyncStorage race conditions
- Task generation limited to prevent UI overwhelm
- Efficient data loading and state updates
- Memory-conscious large dataset handling

## Common Development Tasks

### Running Tests
```bash
npm test                    # All tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Debugging Data Issues
- Check AsyncStorage in React Native Debugger
- Use `DebugScreen` for data inspection
- Logger service provides detailed operation logs
- DataContext state is logged on operations

### Adding Task Templates
- Update `src/lib/data/localTaskTemplates.ts`
- Follow existing pattern for categorization
- Include seasonal timing and equipment associations
- Test with task generation service

### Equipment Integration
- Equipment types drive task template selection
- Service dates automatically calculated from frequency
- Tasks can be equipment-specific or general
- Equipment updates trigger related task updates