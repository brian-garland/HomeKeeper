# HomeKeeper Cursor AI Development Prompts
## Supabase + MCP Optimized for Revolutionary Home Maintenance

---

**Prompt Library:** HomeKeeper Development with Supabase + MCP  
**Author:** Manus AI  
**Date:** June 8, 2025  
**Version:** 2.0 - Supabase + MCP Architecture  
**Target:** Cursor AI with Model Context Protocol

---

## Master Context Prompt for HomeKeeper Development

```
HOMEKEEPER DEVELOPMENT CONTEXT - SUPABASE + MCP ARCHITECTURE

You are developing HomeKeeper, a revolutionary home maintenance application that embodies Steve Jobs' design philosophy of radical simplicity and magical user experience. This app transforms overwhelming home maintenance into delightful, manageable experiences.

CORE MISSION:
Help homeowners answer three fundamental questions:
1. KNOW: What maintenance do I need?
2. WHEN: When do I need to do it?
3. HOW: How do I do it properly?

ARCHITECTURE OVERVIEW:
- Frontend: React Native + Expo with hooks and context
- Backend: Supabase (PostgreSQL + Real-time + Auth + Storage + Edge Functions)
- AI Integration: Cursor with Model Context Protocol for database-aware development
- Development Philosophy: AI-assisted creation with human vision and creativity

TECHNICAL STACK:
- Database: Supabase PostgreSQL with Row Level Security
- Real-time: Supabase Realtime for live updates
- Authentication: Supabase Auth with social login support
- File Storage: Supabase Storage with automatic optimization
- Edge Computing: Supabase Edge Functions for intelligent features
- Mobile: React Native + Expo with Supabase JavaScript SDK
- AI Development: Cursor AI for schema-aware coding

DESIGN PRINCIPLES:
1. Radical Simplicity: Every feature must serve Know/When/How
2. Proactive Intelligence: The app anticipates user needs
3. Delightful Education: Learning feels natural and rewarding
4. Transparent AI: Users understand why recommendations are made
5. Privacy First: User data is protected at the database level
6. Performance Excellence: 60fps, <2s launch, instant feedback

DIFFERENTIATION FROM COMPETITORS:
- HomeZada: Too complex → HomeKeeper is radically simple
- Dwellin: Buggy experience → HomeKeeper is polished and reliable
- Oply: Vendor-dependent → HomeKeeper empowers users
- All others: Feature bloat → HomeKeeper focuses on essential value

DEVELOPMENT STANDARDS:
- Code Quality: TypeScript strict mode, React Native best practices
- Security: Row Level Security policies for all data access
- Performance: Optimized queries, efficient real-time subscriptions
- User Experience: Every interaction feels immediate and delightful
- Accessibility: Full VoiceOver and Dynamic Type support
- Testing: Comprehensive coverage with AI-generated test suites

SUPABASE + MCP ADVANTAGES:
- Schema Awareness: Cursor understands database structure
- Type Safety: Automatic type generation for all operations
- Real-time Integration: Live updates without complex setup
- AI-Assisted Queries: Optimized database operations
- Simplified Architecture: Single service instead of multiple
- Faster Development: 24-28 weeks instead of 32 weeks

When implementing any feature, always consider:
- Does this serve the core mission of Know/When/How?
- Does this maintain radical simplicity?
- Will users feel more confident about home maintenance?
- Is this the simplest possible implementation?
- Would Steve Jobs approve of this user experience?
- Does this leverage Supabase + MCP capabilities optimally?

Current Development Phase: [Specify current phase and week]
Current Feature: [Specify current feature being developed]
```

## Foundation Phase Prompts (Weeks 1-6)

### Week 1-2: Supabase Project Setup and Schema Design

#### Supabase Project Initialization Prompt

```
SUPABASE PROJECT SETUP FOR HOMEKEEPER

You are setting up the Supabase project for HomeKeeper with optimal configuration for a solo developer building a revolutionary home maintenance app.

CONTEXT:
- Project: HomeKeeper - Revolutionary home maintenance application
- Architecture: Supabase + MCP with Cursor AI integration
- Goal: Create production-ready backend in minimal time
- Focus: Database schema, authentication, and real-time setup

REQUIREMENTS:
1. Create Supabase project with optimal settings for mobile app
2. Design database schema with AI-optimized structure
3. Implement Row Level Security policies for privacy protection
4. Set up authentication with social login support
5. Configure real-time subscriptions for community features
6. Establish file storage buckets for photos and documents

DATABASE SCHEMA PRIORITIES:
- User profiles extending Supabase auth
- Homes with comprehensive property data
- Equipment tracking with flexible specifications
- Task templates for automatic generation
- Tasks with intelligent scheduling
- Task completions with progress tracking
- Community features (neighborhoods, insights, posts)
- Analytics for personalization and optimization

SECURITY REQUIREMENTS:
- Row Level Security on all user data tables
- Users can only access their own homes and data
- Community content has appropriate visibility controls
- Service providers have verified access to relevant data
- Admin functions are properly restricted

PERFORMANCE OPTIMIZATION:
- Appropriate indexes for common query patterns
- JSONB columns for flexible data storage
- Array types for efficient list management
- PostGIS for geographic calculations
- Automatic timestamp management with triggers

Generate the complete Supabase setup including:
1. Project configuration settings
2. Database schema with all tables and relationships
3. Row Level Security policies
4. Indexes for optimal performance
5. Triggers for automatic data management
6. Storage bucket configuration
7. Real-time publication setup

Ensure all code follows Supabase best practices and is optimized for Cursor AI understanding.
```

#### Database Schema Design Prompt

```
HOMEKEEPER DATABASE SCHEMA WITH AI OPTIMIZATION

You are designing the complete database schema for HomeKeeper using Supabase PostgreSQL with AI-assisted optimization.

SCHEMA REQUIREMENTS:
The schema must support HomeKeeper's core functionality while maintaining optimal performance and security. Design tables that enable intelligent task generation, real-time community features, and comprehensive analytics.

CORE ENTITIES:
1. User Profiles (extending auth.users)
2. Homes (property characteristics and location data)
3. Equipment (home systems and appliances)
4. Task Templates (for automatic task generation)
5. Tasks (individual maintenance activities)
6. Task Completions (tracking and analytics)
7. Neighborhoods (community groupings)
8. Neighborhood Insights (aggregated community data)
9. Service Providers (expert network)
10. Service Requests (professional help connections)
11. Community Posts (knowledge sharing)
12. User Analytics (behavior tracking)
13. System Metrics (performance monitoring)
14. Maintenance Outcomes (value tracking)

DESIGN PRINCIPLES:
- Normalize for data integrity, denormalize for performance where appropriate
- Use JSONB for flexible data that doesn't need relational queries
- Implement comprehensive check constraints for data validation
- Design for real-time subscriptions and efficient queries
- Include geographic capabilities for neighborhood features
- Support both structured and flexible data storage

PERFORMANCE CONSIDERATIONS:
- Index all foreign keys and frequently queried columns
- Use partial indexes for filtered queries
- Implement GIN indexes for JSONB and array columns
- Consider composite indexes for complex query patterns
- Use appropriate data types for optimal storage and performance

SECURITY REQUIREMENTS:
- Row Level Security policies for all user data
- Appropriate access controls for community features
- Data isolation between users and homes
- Secure handling of sensitive information
- Audit trails for important operations

Generate complete SQL schema including:
1. All table definitions with appropriate data types
2. Foreign key relationships and constraints
3. Check constraints for data validation
4. Comprehensive indexing strategy
5. Row Level Security policies
6. Triggers for automatic data management
7. Functions for business logic
8. Views for common query patterns

Ensure the schema is optimized for Cursor AI understanding and Supabase best practices.
```

### Week 3-4: React Native + Expo Foundation with Supabase Integration

#### React Native App Architecture Prompt

```
HOMEKEEPER REACT NATIVE APP ARCHITECTURE WITH SUPABASE

You are implementing the React Native application architecture for HomeKeeper using Expo with Supabase integration.

ARCHITECTURE REQUIREMENTS:
- Modern React patterns with hooks and context providers
- Supabase JavaScript SDK for database and real-time operations
- TypeScript for type safety and better development experience
- Clean component structure with custom hooks for business logic
- Comprehensive error handling and loading states
- Offline-first approach with real-time synchronization
- Performance optimized for smooth 60fps experience on both platforms

APP STRUCTURE:
```
HomeKeeperApp/
├── App.tsx (main app entry point)
├── app.json (Expo configuration)
├── src/
│   ├── components/
│   │   ├── ui/ (reusable UI components)
│   │   └── forms/ (form components)
│   ├── screens/
│   │   ├── Onboarding/
│   │   ├── Home/
│   │   ├── Tasks/
│   │   ├── Equipment/
│   │   ├── Community/
│   │   └── Profile/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── services/
│   │   ├── supabase.ts (main client)
│   │   ├── database.ts (CRUD operations)
│   │   └── realtime.ts (subscriptions)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDatabase.ts
│   │   └── useRealtime.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── types/
│   │   └── database.types.ts
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
│   ├── hooks/ (Custom React hooks)
│   └── Utilities/ (helper functions)
└── Resources/
    ├── Assets.xcassets
    ├── Localizable.strings
    └── Info.plist
```

SUPABASE INTEGRATION REQUIREMENTS:
- Type-safe database operations with automatic model generation
- Real-time subscriptions for live data updates
- Efficient query patterns with proper error handling
- Offline data caching with automatic synchronization
- File upload and management for photos
- Authentication state management

PERFORMANCE REQUIREMENTS:
- Lazy loading for large data sets
- Efficient image loading and caching
- Optimistic updates for immediate user feedback
- Background data synchronization
- Memory management for real-time subscriptions

USER EXPERIENCE REQUIREMENTS:
- Smooth animations and transitions
- Immediate feedback for all user actions
- Graceful error handling with recovery options
- Accessibility support for all users
- Dark mode and Dynamic Type support

Generate the complete React Native app foundation including:
1. Main app structure with dependency injection
2. Supabase manager classes with type safety
3. Authentication flow with social login
4. Real-time subscription management
5. Core data models with Codable conformance
6. Navigation structure with deep linking support
7. Error handling and loading state management
8. Performance optimization utilities

Ensure all code follows React Native best practices and integrates seamlessly with Supabase.
```

#### Task Management System Prompt

```
HOMEKEEPER TASK MANAGEMENT WITH REAL-TIME UPDATES

You are implementing the core task management system for HomeKeeper using React Native and Supabase real-time capabilities.

SYSTEM REQUIREMENTS:
The task management system is the heart of HomeKeeper's value proposition. It must automatically generate intelligent maintenance schedules, provide real-time updates across devices, and make task completion feel rewarding and educational.

CORE COMPONENTS:
1. Task Generation Engine (Supabase Edge Function)
2. Task List Views (React Native with real-time updates)
3. Task Detail Views (comprehensive guidance)
4. Task Completion Flow (celebration and tracking)
5. Scheduling Intelligence (behavioral learning)
6. Progress Tracking (visual feedback)

TASK GENERATION LOGIC:
- Analyze home characteristics and equipment
- Apply industry best practices and manufacturer recommendations
- Consider local climate and seasonal factors
- Learn from user behavior and preferences
- Distribute tasks to avoid overwhelming periods
- Provide clear explanations for timing decisions

REAL-TIME FEATURES:
- Live task updates across all user devices
- Immediate reflection of completion status
- Real-time schedule adjustments
- Community insights integration
- Expert availability notifications

USER INTERFACE REQUIREMENTS:
- Beautiful, scannable task cards with clear hierarchy
- Swipe gestures for quick actions (complete, reschedule, help)
- Smooth animations for state changes
- Visual progress indicators and celebrations
- Educational content integration
- Photo capture for completion documentation

TECHNICAL IMPLEMENTATION:
- Supabase real-time subscriptions for live updates
- Optimistic updates for immediate user feedback
- Efficient query patterns for task loading
- Background task generation and scheduling
- Comprehensive error handling and retry logic
- Offline functionality with sync when connected

BEHAVIORAL LEARNING:
- Track user completion patterns and preferences
- Adjust scheduling based on behavior analysis
- Provide personalized recommendations
- Learn from task completion feedback
- Optimize notification timing

Generate the complete task management system including:
1. Task data models with relationships
2. Task generation Edge Function with intelligent algorithms
3. React Native components with real-time updates
4. Task completion flow with celebrations
5. Scheduling optimization logic
6. Progress tracking and analytics
7. Educational content integration
8. Photo capture and management

Ensure the implementation demonstrates HomeKeeper's commitment to making maintenance feel simple and rewarding.
```

### Week 5-6: Onboarding and Educational Content

#### Magical Onboarding Flow Prompt

```
HOMEKEEPER MAGICAL ONBOARDING EXPERIENCE

You are creating the onboarding flow that demonstrates HomeKeeper's revolutionary approach to home maintenance from the very first interaction.

ONBOARDING PHILOSOPHY:
The onboarding must feel like getting advice from a knowledgeable friend, not filling out a government form. Users should experience HomeKeeper's value within 5 minutes and feel excited about taking better care of their homes.

ONBOARDING FLOW:
1. Welcome Screen: Beautiful introduction to HomeKeeper's mission
2. Address Input: Intelligent property data lookup
3. Home Characteristics: Minimal input with smart defaults
4. Photo Tour: Guided equipment identification
5. Personalization: Simple preferences without overwhelm
6. Calendar Reveal: The "wow moment" - personalized schedule ready

TECHNICAL REQUIREMENTS:
- React Native with smooth page transitions
- MapKit integration for address autocomplete
- Core ML for equipment photo recognition
- Supabase integration for data storage
- Real-time task generation during onboarding
- Comprehensive error handling and validation

USER EXPERIENCE GOALS:
- 90%+ completion rate
- <5 minutes to personalized calendar
- Immediate value demonstration
- Educational without overwhelming
- Builds confidence and excitement
- Sets expectations for ongoing experience

WELCOME SCREEN:
- Beautiful, minimal design with trust-building imagery
- Clear value proposition: "Know what to do, when to do it, how to do it right"
- Social proof and credibility indicators
- Smooth transition to address input

ADDRESS INPUT:
- Intelligent autocomplete with property data lookup
- Automatic detection of home age, size, and characteristics
- Visual confirmation of property details
- Privacy explanation and data usage transparency

HOME CHARACTERISTICS:
- Smart defaults based on property data
- Visual selection interfaces for key systems
- Optional advanced configuration for power users
- Clear explanations of how data improves recommendations

PHOTO TOUR:
- Guided camera interface with overlay guides
- Equipment identification with confidence indicators
- Educational content about why each system matters
- Optional photo capture with manual fallbacks

PERSONALIZATION:
- Simple preference selection without decision paralysis
- Notification timing and communication style
- Maintenance philosophy (proactive vs. reactive)
- Family situation and available time

CALENDAR REVEAL:
- Animated presentation of personalized maintenance schedule
- Clear explanations of task timing and importance
- Immediate access to first recommended task
- Celebration of successful setup completion

Generate the complete onboarding experience including:
1. React Native components with beautiful animations
2. Address lookup and property data integration
3. Photo capture and equipment identification
4. Preference collection and validation
5. Real-time task generation and presentation
6. Error handling and recovery flows
7. Analytics tracking for optimization
8. Accessibility support throughout

Ensure the onboarding creates the magical first impression that defines HomeKeeper's revolutionary approach.
```

## Intelligence Phase Prompts (Weeks 7-12)

### Week 7-8: Behavioral Learning and Smart Scheduling

#### Intelligent Scheduling Engine Prompt

```
HOMEKEEPER INTELLIGENT SCHEDULING WITH BEHAVIORAL LEARNING

You are implementing the intelligent scheduling engine that makes HomeKeeper feel magical and proactive using Supabase Edge Functions.

SCHEDULING INTELLIGENCE REQUIREMENTS:
The scheduling engine must learn from user behavior, adapt to preferences, and optimize task timing for maximum completion rates while respecting user lifestyle and constraints.

EDGE FUNCTION ARCHITECTURE:
```typescript
// supabase/functions/intelligent-scheduler/index.ts
// Runs daily to optimize task schedules based on:
// - User behavior patterns
// - Weather forecasts
// - Seasonal factors
// - Home characteristics
// - Community insights
```

BEHAVIORAL LEARNING COMPONENTS:
1. Completion Pattern Analysis
   - Preferred days and times for different task types
   - Seasonal behavior variations
   - Task difficulty preferences
   - Completion rate optimization

2. Preference Inference
   - Implicit preference detection from actions
   - Adaptation to changing circumstances
   - Respect for explicit user overrides
   - Confidence scoring for recommendations

3. Lifestyle Integration
   - Work schedule consideration
   - Family situation adaptation
   - Available time optimization
   - Energy level matching

SCHEDULING ALGORITHMS:
1. Weather Integration
   - Outdoor task optimization based on forecasts
   - Indoor task scheduling during bad weather
   - Seasonal preparation timing
   - Climate zone considerations

2. Capacity Management
   - Avoid overwhelming users with too many tasks
   - Distribute workload across available time
   - Balance urgent vs. routine maintenance
   - Consider task complexity and duration

3. Dependency Handling
   - Sequence tasks that depend on each other
   - Coordinate with professional service scheduling
   - Respect equipment availability and access
   - Handle seasonal equipment storage

REAL-TIME ADAPTATION:
- Immediate rescheduling based on weather changes
- Dynamic adjustment for user behavior changes
- Community insight integration for local factors
- Emergency task insertion for urgent issues

TRANSPARENCY AND CONTROL:
- Clear explanations for all scheduling decisions
- Easy user override capabilities
- Confidence indicators for recommendations
- Learning from user corrections

Generate the complete intelligent scheduling system including:
1. Edge Function for behavioral analysis and optimization
2. Weather API integration for outdoor task timing
3. User behavior pattern recognition algorithms
4. Task dependency and sequencing logic
5. Real-time schedule adjustment capabilities
6. Explanation generation for scheduling decisions
7. User override and feedback integration
8. Performance monitoring and optimization

Ensure the scheduling feels intelligent and helpful while maintaining user control and understanding.
```

### Week 9-10: Predictive Maintenance and Weather Integration

#### Predictive Maintenance Engine Prompt

```
HOMEKEEPER PREDICTIVE MAINTENANCE WITH AI INSIGHTS

You are implementing the predictive maintenance system that identifies potential issues before they become expensive problems.

PREDICTIVE CAPABILITIES:
The system must analyze maintenance history, equipment age, usage patterns, and environmental factors to predict when systems might fail or require attention.

PREDICTION ALGORITHMS:
1. Equipment Lifecycle Analysis
   - Age-based failure probability curves
   - Usage intensity impact on lifespan
   - Maintenance history correlation with longevity
   - Manufacturer reliability data integration

2. Pattern Recognition
   - Seasonal failure patterns
   - Climate impact on equipment degradation
   - Usage pattern correlation with issues
   - Community data for local insights

3. Early Warning Systems
   - Gradual performance degradation detection
   - Unusual pattern identification
   - Preventive intervention recommendations
   - Cost-benefit analysis for proactive action

EDGE FUNCTION IMPLEMENTATION:
```typescript
// supabase/functions/predictive-maintenance/index.ts
// Analyzes equipment data and generates predictions
// Integrates with community insights for local patterns
// Provides actionable recommendations with confidence scores
```

DATA SOURCES:
- Individual equipment maintenance history
- Community aggregated failure patterns
- Weather and climate data
- Manufacturer specifications and recalls
- Professional service provider insights

PREDICTION OUTPUTS:
1. Risk Assessments
   - Probability of failure within timeframes
   - Confidence levels for predictions
   - Cost estimates for preventive vs. reactive maintenance
   - Urgency levels for recommended actions

2. Actionable Recommendations
   - Specific preventive maintenance tasks
   - Professional inspection recommendations
   - Equipment replacement timing guidance
   - Cost optimization strategies

USER INTERFACE INTEGRATION:
- Visual risk indicators in equipment views
- Predictive insights in task recommendations
- Cost savings tracking and reporting
- Educational content about prevention benefits

TRANSPARENCY AND TRUST:
- Clear explanations of prediction methodology
- Confidence indicators for all predictions
- Historical accuracy tracking and reporting
- User feedback integration for improvement

Generate the complete predictive maintenance system including:
1. Equipment lifecycle analysis algorithms
2. Pattern recognition and anomaly detection
3. Risk assessment and scoring systems
4. Recommendation generation with explanations
5. Cost-benefit analysis calculations
6. User interface integration for insights
7. Community data aggregation and privacy protection
8. Accuracy tracking and system improvement

Ensure predictions are actionable, trustworthy, and help users save money through proactive maintenance.
```

### Week 11-12: Advanced Personalization and Community Intelligence

#### Personalization Engine Prompt

```
HOMEKEEPER ADVANCED PERSONALIZATION WITH PRIVACY PROTECTION

You are implementing the personalization system that adapts HomeKeeper to individual user preferences and behavior patterns while maintaining strict privacy protection.

PERSONALIZATION DIMENSIONS:
1. Communication Style
   - Tone and language preferences
   - Notification timing and frequency
   - Educational content depth and format
   - Celebration and motivation style

2. Task Preferences
   - Difficulty level comfort zones
   - Time availability patterns
   - Seasonal activity preferences
   - DIY vs. professional service inclinations

3. Learning Style
   - Visual vs. text-based content preferences
   - Step-by-step vs. overview guidance
   - Video vs. written instructions
   - Interactive vs. passive learning

4. Home Care Philosophy
   - Proactive vs. reactive maintenance approach
   - Budget consciousness and cost optimization
   - Environmental and sustainability priorities
   - Quality vs. convenience trade-offs

PERSONALIZATION ALGORITHMS:
1. Implicit Preference Learning
   - Behavior pattern analysis
   - Completion rate correlation with task characteristics
   - Time-of-day and day-of-week preferences
   - Content engagement measurement

2. Explicit Preference Collection
   - Onboarding preference capture
   - Ongoing preference refinement
   - Feedback-based adjustment
   - User-initiated customization

3. Adaptive Interface
   - Dynamic content presentation
   - Personalized task prioritization
   - Customized notification strategies
   - Tailored educational content delivery

PRIVACY PROTECTION:
- On-device processing for sensitive analysis
- Aggregated insights without individual identification
- User control over data sharing and usage
- Transparent explanation of personalization methods

EDGE FUNCTION IMPLEMENTATION:
```typescript
// supabase/functions/personalization-engine/index.ts
// Analyzes user behavior patterns
// Generates personalized recommendations
// Maintains privacy through aggregation and anonymization
```

REAL-TIME ADAPTATION:
- Immediate adjustment to user feedback
- Seasonal behavior pattern recognition
- Life situation change adaptation
- Continuous improvement through usage

Generate the complete personalization system including:
1. Behavior pattern analysis algorithms
2. Preference inference and validation systems
3. Adaptive interface customization
4. Privacy-preserving analytics
5. Real-time personalization adjustment
6. User control and transparency features
7. A/B testing framework for optimization
8. Performance measurement and improvement

Ensure personalization enhances user experience while maintaining privacy and user control.
```

## Community Phase Prompts (Weeks 13-18)

### Week 13-14: Neighborhood Insights and Geographic Features

#### Community Intelligence System Prompt

```
HOMEKEEPER COMMUNITY INTELLIGENCE WITH PRIVACY PROTECTION

You are implementing the community intelligence system that provides valuable neighborhood insights while maintaining strict user privacy protection.

COMMUNITY FEATURES OVERVIEW:
The system must aggregate maintenance patterns and insights across neighborhoods to provide valuable local information without compromising individual privacy.

GEOGRAPHIC INTELLIGENCE:
1. Neighborhood Grouping
   - Automatic geographic clustering based on location
   - Climate zone and weather pattern consideration
   - Local building code and regulation awareness
   - Community demographic and housing characteristics

2. Seasonal Pattern Analysis
   - Local weather impact on maintenance needs
   - Seasonal task timing optimization for region
   - Community preparation for weather events
   - Regional equipment and system considerations

3. Local Expertise Integration
   - Service provider quality and availability
   - Local building material and supply recommendations
   - Regional maintenance best practices
   - Community knowledge sharing and validation

PRIVACY PROTECTION ARCHITECTURE:
- Individual data anonymization and aggregation
- Minimum threshold requirements for insight generation
- User consent for community data contribution
- Granular privacy controls and opt-out capabilities

SUPABASE IMPLEMENTATION:
```sql
-- Neighborhood insights with privacy protection
CREATE TABLE neighborhood_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood_id UUID REFERENCES neighborhoods(id),
  insight_type TEXT NOT NULL,
  aggregated_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  minimum_data_points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for community insights
CREATE POLICY "Community insights are publicly readable" 
  ON neighborhood_insights FOR SELECT 
  USING (confidence_score >= 0.7 AND minimum_data_points >= 10);
```

INSIGHT GENERATION ALGORITHMS:
1. Maintenance Pattern Analysis
   - Common task timing across neighborhood
   - Seasonal maintenance preparation patterns
   - Equipment failure and replacement trends
   - Cost optimization opportunities

2. Weather Impact Correlation
   - Local weather pattern impact on maintenance
   - Storm preparation and recovery insights
   - Seasonal equipment usage patterns
   - Climate-specific maintenance recommendations

3. Service Provider Analytics
   - Local service quality and reliability data
   - Pricing transparency and comparison
   - Availability and response time patterns
   - Community satisfaction and recommendation data

REAL-TIME COMMUNITY FEATURES:
- Live neighborhood activity and insights
- Seasonal preparation alerts and recommendations
- Community challenges and achievement sharing
- Local expert availability and consultation

Generate the complete community intelligence system including:
1. Geographic clustering and neighborhood definition
2. Privacy-preserving data aggregation algorithms
3. Insight generation with confidence scoring
4. Real-time community feature implementation
5. Service provider integration and verification
6. User privacy controls and transparency
7. Community engagement and gamification
8. Local expertise validation and quality control

Ensure community features enhance individual success while maintaining privacy and preventing social pressure.
```

### Week 15-16: Expert Network and Service Provider Integration

#### Expert Network Platform Prompt

```
HOMEKEEPER EXPERT NETWORK WITH QUALITY ASSURANCE

You are implementing the expert network platform that connects users with qualified service providers while maintaining HomeKeeper's focus on user empowerment.

EXPERT NETWORK PHILOSOPHY:
The expert network should enhance user confidence and capability rather than creating dependency. Users should feel empowered to handle appropriate tasks themselves while having access to professional help when needed.

SERVICE PROVIDER PLATFORM:
1. Provider Onboarding and Verification
   - Professional license and insurance verification
   - Background check and reference validation
   - Skill assessment and specialization confirmation
   - Community reputation and review integration

2. Quality Assurance System
   - Ongoing performance monitoring
   - User feedback and rating aggregation
   - Professional development and training tracking
   - Compliance with HomeKeeper quality standards

3. Matching and Recommendation Engine
   - Task complexity and provider skill matching
   - Geographic availability and response time
   - User preference and history consideration
   - Cost transparency and budget alignment

SUPABASE IMPLEMENTATION:
```sql
-- Service provider platform with verification
CREATE TABLE service_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  service_categories TEXT[] NOT NULL,
  service_areas TEXT[] NOT NULL,
  license_numbers TEXT[],
  insurance_verified BOOLEAN DEFAULT FALSE,
  background_check_verified BOOLEAN DEFAULT FALSE,
  average_rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0,
  response_time_hours INTEGER,
  pricing_tier TEXT CHECK (pricing_tier IN ('budget', 'standard', 'premium')),
  is_active BOOLEAN DEFAULT TRUE,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Service requests with privacy protection
CREATE TABLE service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  home_id UUID REFERENCES homes(id),
  task_id UUID REFERENCES tasks(id),
  service_category TEXT NOT NULL,
  description TEXT,
  urgency_level INTEGER DEFAULT 1,
  budget_range NUMRANGE,
  status TEXT DEFAULT 'open',
  matched_provider_id UUID REFERENCES service_providers(id)
);
```

PROVIDER VERIFICATION PROCESS:
1. Initial Application Review
   - License and certification validation
   - Insurance coverage verification
   - Professional reference checking
   - Background check completion

2. Skill Assessment
   - Technical competency evaluation
   - Customer service training completion
   - HomeKeeper philosophy alignment
   - Quality standard commitment

3. Ongoing Monitoring
   - Performance metric tracking
   - User feedback analysis
   - Continuous education requirements
   - Quality assurance audits

USER PROTECTION FEATURES:
- Transparent pricing and cost estimates
- Quality guarantee and dispute resolution
- Insurance coverage verification
- Professional licensing validation
- Community review and rating system

INTEGRATION WITH HOMEKEEPER CORE:
- Task-specific provider recommendations
- Educational content collaboration
- Preventive maintenance scheduling
- Emergency service coordination

Generate the complete expert network platform including:
1. Service provider onboarding and verification system
2. Quality assurance and monitoring framework
3. Matching algorithm with user preference consideration
4. Service request management and communication
5. Rating and review system with fraud prevention
6. Pricing transparency and cost estimation
7. Integration with HomeKeeper task management
8. User protection and dispute resolution

Ensure the expert network enhances user empowerment while providing access to quality professional help when needed.
```

### Week 17-18: Knowledge Sharing and Community Engagement

#### Community Knowledge Platform Prompt

```
HOMEKEEPER COMMUNITY KNOWLEDGE SHARING WITH QUALITY CONTROL

You are implementing the community knowledge sharing platform that enables users to share experiences and insights while maintaining quality and safety standards.

KNOWLEDGE SHARING PHILOSOPHY:
The platform should celebrate user achievements and share practical wisdom while preventing misinformation and maintaining safety standards. Users should feel encouraged to share and learn from each other's experiences.

CONTENT MANAGEMENT SYSTEM:
1. User-Generated Content Platform
   - Success story sharing and celebration
   - Tip and trick documentation
   - Problem-solving experience sharing
   - Seasonal preparation insights

2. Quality Control Framework
   - Expert review and validation
   - Community moderation and reporting
   - Safety warning integration
   - Accuracy verification and fact-checking

3. Content Discovery and Recommendation
   - Personalized content recommendation
   - Seasonal and timely content promotion
   - Local relevance and geographic filtering
   - Skill level and experience matching

SUPABASE IMPLEMENTATION:
```sql
-- Community posts with moderation
CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id),
  neighborhood_id UUID REFERENCES neighborhoods(id),
  post_type TEXT CHECK (post_type IN ('tip', 'success_story', 'question', 'warning')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  photos TEXT[],
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  expert_verified BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'pending',
  safety_warnings TEXT[]
);

-- Content moderation and quality control
CREATE TABLE content_moderation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id),
  moderator_id UUID REFERENCES auth.users(id),
  moderation_action TEXT,
  reason TEXT,
  safety_concerns TEXT[],
  expert_review_required BOOLEAN DEFAULT FALSE
);
```

CONTENT CATEGORIES:
1. Success Stories
   - Maintenance achievement celebrations
   - Cost savings and problem prevention
   - Learning journey documentation
   - Before/after transformation sharing

2. Tips and Tricks
   - Practical maintenance shortcuts
   - Tool and product recommendations
   - Seasonal preparation strategies
   - Cost optimization techniques

3. Problem Solving
   - Troubleshooting experiences
   - Professional service recommendations
   - Mistake learning and prevention
   - Emergency response stories

4. Safety Warnings
   - Hazard identification and prevention
   - Professional help recommendations
   - Code compliance and regulation awareness
   - Insurance and liability considerations

QUALITY ASSURANCE FEATURES:
- Expert review for technical content
- Community voting and validation
- Safety warning integration
- Misinformation detection and correction
- Source verification and fact-checking

ENGAGEMENT AND GAMIFICATION:
- Achievement recognition and badges
- Contribution scoring and reputation
- Seasonal challenges and goals
- Local community events and coordination

Generate the complete community knowledge platform including:
1. Content creation and submission system
2. Moderation workflow with expert review
3. Quality control and safety validation
4. Content discovery and recommendation engine
5. Community engagement and gamification
6. Safety warning and professional guidance integration
7. Local relevance and geographic filtering
8. User reputation and contribution tracking

Ensure the knowledge sharing platform builds community while maintaining safety and quality standards.
```

## Optimization Phase Prompts (Weeks 19-24)

### Week 19-20: Performance Optimization and Monitoring

#### Performance Monitoring System Prompt

```
HOMEKEEPER PERFORMANCE OPTIMIZATION WITH SUPABASE ANALYTICS

You are implementing comprehensive performance monitoring and optimization systems to ensure HomeKeeper maintains excellent performance characteristics at scale.

PERFORMANCE MONITORING ARCHITECTURE:
The system must track all aspects of application performance including database queries, real-time subscriptions, mobile app responsiveness, and user experience metrics.

SUPABASE PERFORMANCE TRACKING:
```typescript
// Performance monitoring with automatic optimization
export class PerformanceMonitor {
  private supabase: SupabaseClient;
  
  async trackQueryPerformance(
    queryName: string,
    duration: number,
    resultCount: number,
    userId?: string
  ) {
    await this.supabase
      .from('system_metrics')
      .insert({
        metric_type: 'query_performance',
        metric_value: duration,
        dimensions: {
          query_name: queryName,
          result_count: resultCount,
          user_id: userId,
          timestamp: new Date().toISOString()
        }
      });
  }
  
  async generateOptimizationRecommendations() {
    // AI-assisted performance analysis and recommendations
  }
}
```

MONITORING CATEGORIES:
1. Database Performance
   - Query execution times and optimization
   - Index usage and effectiveness analysis
   - Real-time subscription performance
   - Connection pool and resource utilization

2. Mobile Application Performance
   - App launch time and responsiveness
   - Memory usage and leak detection
   - Battery life impact assessment
   - Network efficiency and offline capability

3. User Experience Metrics
   - Task completion rates and user satisfaction
   - Onboarding success and conversion rates
   - Feature usage patterns and engagement
   - Error rates and recovery success

4. Real-Time Feature Performance
   - Subscription latency and reliability
   - Update delivery success rates
   - Connection stability and reconnection
   - Bandwidth usage and optimization

OPTIMIZATION STRATEGIES:
1. Automatic Query Optimization
   - Slow query detection and alerting
   - Index recommendation generation
   - Query pattern analysis and optimization
   - Caching strategy implementation

2. Real-Time Performance Tuning
   - Subscription optimization and filtering
   - Update batching and throttling
   - Connection management and pooling
   - Bandwidth usage minimization

3. Mobile App Optimization
   - Image loading and caching optimization
   - Data prefetching and background sync
   - Memory management and cleanup
   - Battery usage optimization

ALERTING AND RESPONSE:
- Real-time performance degradation alerts
- Automatic scaling and resource adjustment
- User impact assessment and prioritization
- Performance regression detection and rollback

Generate the complete performance monitoring system including:
1. Comprehensive metrics collection and analysis
2. Real-time alerting and notification system
3. Automatic optimization recommendation generation
4. Performance regression detection and prevention
5. User experience impact measurement
6. Scalability planning and resource optimization
7. Mobile app performance profiling
8. Database query optimization automation

Ensure the monitoring system maintains HomeKeeper's commitment to excellent performance while enabling proactive optimization.
```

### Week 21-22: Quality Assurance and Testing Framework

#### Comprehensive Testing Strategy Prompt

```
HOMEKEEPER COMPREHENSIVE TESTING WITH AI ASSISTANCE

You are implementing a comprehensive testing framework that ensures HomeKeeper maintains the highest quality standards while leveraging AI assistance for test generation and optimization.

TESTING PHILOSOPHY:
Testing must validate both technical functionality and user experience quality, ensuring that HomeKeeper delivers on its promise of making home maintenance simple and delightful.

AI-ASSISTED TEST GENERATION:
```typescript
// Cursor AI-generated test suites with comprehensive coverage
describe('HomeKeeper Task Management', () => {
  // AI generates tests based on schema understanding
  // Covers happy paths, edge cases, and error conditions
  // Validates business logic and user experience
  // Ensures real-time functionality works correctly
});
```

TESTING CATEGORIES:
1. Unit Testing
   - Business logic validation with 90%+ coverage
   - Data model and relationship testing
   - Algorithm correctness and edge case handling
   - Utility function and helper method validation

2. Integration Testing
   - Supabase database operation validation
   - Real-time subscription functionality
   - Authentication and authorization flows
   - File upload and storage operations

3. End-to-End Testing
   - Complete user journey validation
   - Cross-device synchronization testing
   - Offline functionality and sync validation
   - Performance under various conditions

4. User Experience Testing
   - Onboarding flow completion and satisfaction
   - Task completion user experience validation
   - Accessibility and usability testing
   - Visual design and animation quality

SUPABASE-SPECIFIC TESTING:
1. Database Testing
   - Row Level Security policy validation
   - Query performance and optimization
   - Data integrity and constraint testing
   - Migration and schema change validation

2. Real-Time Testing
   - Subscription reliability and performance
   - Update delivery and synchronization
   - Connection handling and recovery
   - Multi-user collaboration scenarios

3. Edge Function Testing
   - Intelligent scheduling algorithm validation
   - Predictive maintenance accuracy testing
   - Community insight generation verification
   - Performance and scalability testing

MOBILE APP TESTING:
1. React Native Testing
   - User interface component validation
   - Navigation and state management
   - Animation and transition quality
   - Accessibility and Dynamic Type support

2. Device Testing
   - Cross-device compatibility validation
   - Performance on various hardware
   - Battery life impact assessment
   - Network condition handling

3. Cross-Platform Integration Testing
   - Camera and photo capture functionality
   - Location services and privacy handling
   - Notification delivery and management
   - Background processing and sync

AUTOMATED TESTING PIPELINE:
- Continuous integration with automated test execution
- Performance regression detection
- Visual regression testing for UI changes
- Accessibility compliance validation

Generate the comprehensive testing framework including:
1. AI-assisted test generation for all components
2. Supabase-specific testing utilities and helpers
3. Real-time functionality testing framework
4. Mobile app testing with device simulation
5. User experience and accessibility testing
6. Performance and scalability testing
7. Automated testing pipeline and CI/CD integration
8. Quality metrics tracking and reporting

Ensure the testing framework validates both technical excellence and user experience quality.
```

### Week 23-24: Launch Preparation and App Store Optimization

#### App Store Launch Strategy Prompt

```
HOMEKEEPER APP STORE LAUNCH WITH OPTIMIZATION

You are preparing HomeKeeper for App Store launch with comprehensive optimization for discovery, conversion, and user acquisition.

LAUNCH PREPARATION CHECKLIST:
The launch must demonstrate HomeKeeper's revolutionary approach while ensuring technical excellence and user experience quality that exceeds App Store standards.

APP STORE OPTIMIZATION:
1. App Store Listing Optimization
   - Compelling app title and subtitle
   - Keyword optimization for discovery
   - Beautiful screenshot design and messaging
   - App preview video showcasing key features

2. App Store Connect Configuration
   - Complete app metadata and descriptions
   - Privacy policy and data usage transparency
   - In-app purchase configuration (if applicable)
   - TestFlight beta testing setup

3. Review Preparation
   - App Store Review Guidelines compliance
   - Privacy and security validation
   - Content and functionality review
   - Technical performance verification

MARKETING ASSET CREATION:
1. Visual Assets
   - App icon design and optimization
   - Screenshot design with feature highlights
   - App preview video production
   - Marketing website and landing page

2. Content Creation
   - App description and feature highlights
   - Press kit and media resources
   - User testimonials and success stories
   - Educational content and blog posts

3. Launch Campaign
   - Beta tester recruitment and management
   - Influencer and press outreach
   - Social media campaign planning
   - Community building and engagement

TECHNICAL LAUNCH PREPARATION:
1. Production Environment Setup
   - Supabase production configuration
   - Performance monitoring and alerting
   - Error tracking and crash reporting
   - Analytics and user behavior tracking

2. Scaling Preparation
   - Database performance optimization
   - Real-time subscription scaling
   - Edge function performance tuning
   - CDN and content delivery optimization

3. Support Infrastructure
   - Customer support system setup
   - FAQ and help documentation
   - User feedback collection and analysis
   - Issue tracking and resolution workflow

LAUNCH METRICS AND MONITORING:
- App Store ranking and visibility tracking
- Download and conversion rate monitoring
- User retention and engagement analysis
- Performance and stability monitoring
- User feedback and review analysis

POST-LAUNCH OPTIMIZATION:
- A/B testing for app store assets
- User feedback integration and iteration
- Performance optimization based on usage
- Feature usage analysis and optimization

Generate the complete launch preparation package including:
1. App Store listing optimization with compelling copy
2. Visual asset creation and screenshot design
3. App preview video script and production guide
4. Technical launch checklist and validation
5. Marketing campaign planning and execution
6. Beta testing program management
7. Launch metrics tracking and analysis
8. Post-launch optimization and iteration plan

Ensure the launch demonstrates HomeKeeper's revolutionary potential while meeting the highest standards for technical excellence and user experience.
```

## Advanced Development Prompts

### Real-Time Feature Implementation

#### Real-Time Subscription Management Prompt

```
HOMEKEEPER REAL-TIME FEATURES WITH SUPABASE

You are implementing sophisticated real-time features that make HomeKeeper feel alive and responsive while maintaining optimal performance and battery life.

REAL-TIME ARCHITECTURE:
The system must provide immediate updates for task changes, community interactions, and expert communications while being selective about subscriptions to maintain performance.

SUBSCRIPTION MANAGEMENT:
```typescript
// Intelligent subscription management for optimal performance
class RealtimeSubscriptionManager: ObservableObject {
    private var activeSubscriptions: [String: RealtimeChannel] = [:]
    private let supabase: SupabaseClient
    
    func subscribeToUserTasks(homeId: UUID) {
        // Selective subscription based on user context
        // Automatic cleanup and resource management
        // Battery life optimization
    }
    
    func subscribeToNeighborhoodInsights(neighborhoodId: UUID) {
        // Community updates with privacy protection
        // Throttled updates to prevent overwhelming
        // Intelligent filtering based on relevance
    }
}
```

REAL-TIME FEATURES:
1. Task Synchronization
   - Live task updates across all user devices
   - Immediate completion status reflection
   - Real-time schedule adjustments
   - Collaborative family task management

2. Community Features
   - Live neighborhood insights and updates
   - Real-time expert availability notifications
   - Community post updates and interactions
   - Seasonal alert and preparation notifications

3. Expert Communications
   - Live chat with service providers
   - Real-time availability and scheduling
   - Instant quote and estimate delivery
   - Emergency service coordination

PERFORMANCE OPTIMIZATION:
- Selective subscription based on user context
- Automatic subscription cleanup and management
- Battery life optimization with intelligent throttling
- Network efficiency with update batching

Generate the complete real-time feature implementation including:
1. Subscription management with automatic cleanup
2. Performance optimization and battery life protection
3. Real-time task synchronization across devices
4. Community feature updates with privacy protection
5. Expert communication and availability systems
6. Error handling and connection recovery
7. Offline queue management and sync
8. Analytics and performance monitoring

Ensure real-time features enhance user experience while maintaining optimal performance characteristics.
```

### Security and Privacy Implementation

#### Privacy-First Architecture Prompt

```
HOMEKEEPER PRIVACY-FIRST SECURITY WITH SUPABASE RLS

You are implementing comprehensive privacy and security measures that protect user data while enabling community features and intelligent recommendations.

PRIVACY ARCHITECTURE:
The system must protect individual user data while enabling valuable community insights and intelligent features through privacy-preserving techniques.

ROW LEVEL SECURITY IMPLEMENTATION:
```sql
-- Comprehensive RLS policies for user data protection
CREATE POLICY "Users can only access their own homes" 
  ON homes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access tasks for their homes" 
  ON tasks FOR ALL USING (
    home_id IN (SELECT id FROM homes WHERE user_id = auth.uid())
  );

CREATE POLICY "Community insights are publicly readable with privacy protection" 
  ON neighborhood_insights FOR SELECT 
  USING (confidence_score >= 0.7 AND minimum_data_points >= 10);
```

PRIVACY PROTECTION FEATURES:
1. Data Minimization
   - Collect only necessary data for functionality
   - Automatic data retention and deletion policies
   - User control over data sharing and usage
   - Granular privacy settings and preferences

2. Anonymization and Aggregation
   - Individual data anonymization for community insights
   - Minimum threshold requirements for aggregation
   - Differential privacy techniques for sensitive data
   - User consent for community data contribution

3. Encryption and Security
   - End-to-end encryption for sensitive communications
   - Secure file storage with access controls
   - API security with rate limiting and validation
   - Audit logging for security monitoring

COMMUNITY PRIVACY FEATURES:
- Neighborhood insights without individual identification
- Aggregated data with minimum participant requirements
- User control over community data contribution
- Transparent explanation of data usage

COMPLIANCE AND TRANSPARENCY:
- GDPR and CCPA compliance implementation
- Clear privacy policy and data usage explanation
- User data export and deletion capabilities
- Regular security audits and vulnerability assessment

Generate the comprehensive privacy and security implementation including:
1. Row Level Security policies for all user data
2. Privacy-preserving community insight generation
3. Data anonymization and aggregation techniques
4. User privacy controls and transparency features
5. Encryption and secure communication implementation
6. Compliance with privacy regulations
7. Security monitoring and audit logging
8. User data export and deletion capabilities

Ensure privacy protection enables community features while maintaining individual user control and transparency.
```

## Conclusion: AI-Assisted Development Excellence

These Cursor AI prompts represent a comprehensive framework for building HomeKeeper with Supabase + MCP integration. Each prompt is designed to leverage Cursor's AI capabilities while maintaining the high standards of user experience and technical excellence that define revolutionary products.

The prompts emphasize the unique advantages of the Supabase + MCP architecture: simplified development complexity, AI-assisted code generation, real-time capabilities, and comprehensive security. By following these prompts, developers can build HomeKeeper faster and better than traditional development approaches while maintaining the focus on user experience that makes great products.

The result will be a home maintenance application that not only solves real problems for users but also demonstrates the future of AI-assisted development: human creativity and vision enhanced by artificial intelligence to create products that feel magical and effortless to use.

