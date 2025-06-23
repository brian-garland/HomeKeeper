# HomeKeeper Codebase File Inventory

## 📱 **Core App Files**

### Root Configuration
- `app.json` - Expo configuration file defining app metadata, build settings, and platform-specific configurations
- `App.tsx` - Main React Native app component that sets up navigation and global providers
- `index.ts` - Entry point that registers the main App component with Expo
- `babel.config.js` - Babel configuration for JavaScript/TypeScript compilation and React Native transforms
- `jest.config.js` - Jest testing framework configuration with React Native presets and test environment setup
- `metro.config.js` - Metro bundler configuration for React Native asset bundling and module resolution
- `tsconfig.json` - TypeScript compiler configuration with React Native and Expo settings
- `package.json` - npm package configuration with dependencies, scripts, and project metadata
- `package-lock.json` - Locked dependency versions for consistent installations across environments
- `eas.json` - Expo Application Services configuration for building and deploying production apps

### Assets
- `assets/adaptive-icon.png` - Android adaptive icon that adjusts to different device themes and shapes
- `assets/favicon.png` - Web favicon displayed in browser tabs when running as PWA
- `assets/icon.png` - Main app icon used across iOS and Android platforms
- `assets/splash-icon.png` - Icon displayed on the splash screen during app loading

## 🧠 **Source Code (`src/`)**

### Main Screens (`src/screens/`)
- `AddEquipmentScreen.tsx` - Screen for adding new equipment to a home with form validation and photo capture
- `AddTaskScreen.tsx` - Task creation screen with intelligent defaults and equipment linking capabilities
- `DashboardScreen.tsx` - Main dashboard showing weather, task overview, and home health metrics
- `DebugScreen.tsx` - Development screen for testing features and viewing app state information
- `EditEquipmentScreen.tsx` - Screen for editing existing equipment details and maintenance history
- `EnhancedTasksScreen.tsx` - Advanced task management screen with filtering, sorting, and bulk operations
- `EquipmentDetailScreen.tsx` - Detailed view of individual equipment with maintenance history and scheduling
- `EquipmentScreen.tsx` - Equipment inventory screen showing all home equipment with status indicators
- `HomeScreen.tsx` - Home overview screen with quick actions and recent activity summary
- `MagicalOnboardingScreen.tsx` - 5-step onboarding flow that collects home information and generates initial tasks
- `ProfileScreen.tsx` - User profile and app settings screen with preferences and account management
- `PropertiesScreen.tsx` - Home properties management screen for editing home characteristics
- `SimpleOnboardingScreen.tsx` - Simplified onboarding alternative for quick app setup
- `TaskDetailScreen.tsx` - Detailed task view with completion tracking and equipment context
- `TasksScreen.tsx` - Main task list screen with filtering, completion tracking, and task management

### Navigation (`src/navigation/`)
- `AppNavigator.tsx` - Root navigation container managing authentication and main app navigation flow
- `EquipmentStackNavigator.tsx` - Stack navigator for equipment-related screens and detailed equipment flows
- `TabNavigator.tsx` - Bottom tab navigation component defining the main app sections
- `TaskStackNavigator.tsx` - Stack navigator for task-related screens and task management flows
- `types.ts` - TypeScript type definitions for navigation parameters and screen props

### Components (`src/components/`)
- `AuthenticationPrompt.tsx` - Optional authentication component for data sync and cloud backup
- `DevTools.tsx` - Development tools component for debugging and testing app functionality
- `DevToolsAccess.tsx` - Debug menu access component hidden in production builds
- `ErrorBoundary.tsx` - React error boundary component for graceful error handling and crash prevention
- `FeedbackModal.tsx` - User feedback collection modal for beta testing and user input

#### Buttons (`src/components/buttons/`)
- `Button.tsx` - Base button component with consistent styling and interaction patterns
- `PrimaryButton.tsx` - Primary action button with accent colors and prominence styling
- `SecondaryButton.tsx` - Secondary action button with subtle styling for less important actions

#### Icons (`src/components/icons/`)
- `Icon.tsx` - Unified icon component using Expo vector icons with consistent sizing and theming

#### Inputs (`src/components/inputs/`)
- `TextInput.tsx` - Styled text input component with validation states and consistent theming

### Data Management (`src/contexts/`)
- `DataContext.tsx` - Central state management context providing CRUD operations for all app data using AsyncStorage

### Custom Hooks (`src/hooks/`)
- `useEquipment.ts` - React hook for equipment management operations and equipment-specific business logic
- `useIntelligentTasks.ts` - Hook for AI-powered task generation based on home characteristics and weather
- `useSupabase.ts` - Supabase integration hook for database operations and real-time subscriptions (legacy)

### Business Logic (`src/lib/`)

#### Data Models (`src/lib/models/`)
- `equipment.ts` - Equipment data model with CRUD operations and equipment lifecycle management
- `homes.ts` - Home data model managing home characteristics and property information
- `tasks.ts` - Task data model with CRUD operations, completion tracking, and recurrence logic
- `taskTemplates.ts` - Task template model for intelligent task generation and maintenance scheduling

#### Services (`src/lib/services/`)
- `dataManager.ts` - Central data management service coordinating between models and providing unified data operations
- `feedback.ts` - Feedback collection service for user input and beta testing feedback management
- `feedbackSubmission.ts` - Service for submitting user feedback to external systems
- `geocodingService.ts` - Location service for converting addresses to coordinates using OpenStreetMap
- `localTemplateService.ts` - Service managing local task templates and intelligent task recommendations
- `logger.ts` - Centralized logging service for debugging and error tracking
- `performance.ts` - Performance monitoring service tracking app metrics and user experience
- `recurringTaskService.ts` - Service managing automatic recurring task creation and scheduling
- `taskGenerationService.ts` - AI-powered service generating personalized maintenance tasks based on home data
- `weatherService.ts` - Weather API integration service providing current conditions and forecasts

#### Data (`src/lib/data/`)
- `localTaskTemplates.ts` - Local task template definitions with maintenance frequencies and home-specific filtering

#### Utilities (`src/lib/`)
- `supabase.ts` - Supabase client configuration and connection setup (legacy)
- `validation.ts` - Form validation utilities and data validation helpers

#### Utils (`src/lib/utils/`)
- `loadTesting.ts` - Load testing utilities for performance validation and stress testing
- `updateTasksWithMoneySaved.ts` - Utility for calculating and updating money saved through preventive maintenance

### Styling (`src/theme/`)
- `colors.ts` - App color palette and theme definitions with light/dark mode support
- `spacing.ts` - Consistent spacing scale and layout dimensions used throughout the app
- `typography.ts` - Typography system with font families, sizes, and text style definitions

### Types (`src/types/`)
- `database.types.ts` - TypeScript type definitions generated from Supabase database schema
- `index.ts` - Central export file for all TypeScript types used throughout the app
- `preferences.ts` - Type definitions for user preferences and app settings

## 🧪 **Testing (`src/__tests__/`)**

### Component Tests (`src/__tests__/components/`)
- `Button.test.tsx` - Comprehensive tests for button components including interactions and accessibility
- `TaskCard.test.tsx` - Tests for task display components covering all task states and user interactions

#### Snapshots (`src/__tests__/components/__snapshots__/`)
- `Button.test.tsx.snap` - Jest snapshot tests ensuring visual consistency of button components
- `TaskCard.test.tsx.snap` - Jest snapshot tests for task card component visual regression protection

### Context Tests (`src/__tests__/contexts/`)
- `DataContext.test.tsx` - Comprehensive tests for the central data management context with 60/60 tests passing

### Core Tests (`src/__tests__/core/`)
- `localData.test.ts` - Tests for local data operations and AsyncStorage integration

### Integration Tests (`src/__tests__/integration/`)
- `AddTaskScreen.errorScenarios.test.tsx` - Integration tests for error handling and edge cases in task creation
- `AddTaskScreen.persistence.test.tsx` - Tests for data persistence during task creation and form submission
- `AddTaskScreen.validation.test.tsx` - Comprehensive form validation tests for the task creation screen
- `TaskListDisplay.integration.test.tsx` - Integration tests for task list display and UI updates

### Service Tests (`src/__tests__/services/`)
- `taskGeneration.test.ts` - Tests for the intelligent task generation service and algorithms

### Test Utilities (`src/__tests__/`)
- `README.md` - Comprehensive testing documentation with setup instructions and best practices
- `setup.ts` - Jest test environment setup with mocks and global test configuration

#### Mock Tests (`src/__tests__/mocks/`)
- `asyncStorage.test.ts` - Tests for AsyncStorage mocking utilities used in test suites

#### Test Utils (`src/__tests__/utils/`)
- `testUtils.ts` - Shared testing utilities and helper functions for component and integration tests

## 🗄️ **Database (`database/`)**
- `add-maintenance-table.sql` - SQL script for adding maintenance tracking tables to the database schema
- `realtime-config.sql` - Supabase real-time subscription configuration for live data updates
- `rls-policies.sql` - Row Level Security policies ensuring proper data access control and user isolation
- `schema.sql` - Complete database schema definition with all tables, relationships, and constraints
- `storage-policies.sql` - Supabase storage bucket policies for file uploads and access control

## 📚 **Documentation (`docs/`)**
- `ARCHITECTURE_DECISION.md` - Record of major architectural decisions and technical choices made during development
- `TESTING_CHECKLIST.md` - Comprehensive checklist for manual and automated testing procedures
- `TESTING_SESSION.md` - Documentation of testing sessions and results for quality assurance

## 🎨 **UX Design (`UX Design/`)**
- `00-UX-Documentation-Summary.md` - Overview and index of all UX design documentation and resources
- `01-Design-Philosophy-and-Vision.md` - Core design principles and user experience philosophy for HomeKeeper
- `02-Complete-Design-System.md` - Comprehensive design system with colors, typography, and component specifications
- `03-Screen-Specifications.md` - Detailed specifications for each screen including layout and functionality
- `04-User-Flows-and-Navigation.md` - User journey mapping and navigation flow documentation
- `05-Platform-Guidelines.md` - iOS and Android platform-specific design guidelines and best practices
- `06-Accessibility-and-Inclusivity.md` - Accessibility standards and inclusive design practices documentation
- `07-Success-Metrics-and-Testing.md` - UX metrics definition and user testing methodologies
- `08-Implementation-Guide.md` - Developer guide for implementing UX designs and maintaining consistency
- `09-Web-Design-Guide.md` - Web-specific design guidelines for PWA and responsive design considerations

### User Flows (`UX Design/User Flows/`)
- `Core-User-Flows.md` - Documentation of primary user journeys through the app

### Wireframes (`UX Design/Wireframes/`)
- `Core-Screens-Wireframes.md` - Wireframe specifications for key app screens and layouts

## 📋 **Project Management**

### Project Documents (`Project Documents/`)
- `Daily Progress Log - Week 8.md` - Development progress tracking and milestone documentation for Week 8
- `HomeKeeper Cursor AI Development Prompts.md` - AI development prompts and conversation templates for efficient development
- `HomeKeeper MVP Technical Specifications.md` - MVP feature specifications and technical requirements documentation
- `HomeKeeper_ Complete Development Package.md` - Comprehensive development guide with setup and implementation instructions
- `HomeKeeper_ Product Requirements Document & Implementation Guide.md` - Complete PRD with feature specifications and implementation roadmap
- `Technical Decisions Log.md` - Record of technical decisions made throughout development with rationale
- `Week-2.5-Progress.md` - Mid-development progress update with completed features and next steps

### Testing Strategy
- `TESTING_STRATEGY.md` - Comprehensive testing strategy document covering manual and automated testing approaches

### Scripts (`scripts/`)
- `test-components.sh` - Automated test runner script for component testing with multiple execution modes

### Task Management (`.taskmaster/`)
- `.taskmaster/tasks/tasks.json` - Comprehensive task management system with 34 tasks across deployment, testing, and feature development

## 🔧 **Development Tools**
- `coverage/` - Test coverage reports and analysis generated by Jest testing framework
- `README.md` - Project overview, setup instructions, and development guidelines for new contributors 