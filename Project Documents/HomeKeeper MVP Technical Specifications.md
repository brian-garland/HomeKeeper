# HomeKeeper MVP Technical Specifications
**Foundation Phase Requirements & Future Decision Points**

---

**Last Updated:** June 9, 2025  
**Scope:** MVP Foundation Phase (Weeks 1-6)  
**Status:** Ready for Development

---

## 📋 **MVP Requirements (Weeks 1-6)**

### **Week 2: Core Data Models - SPECIFICATIONS**

#### **Task Templates System**
**Required for MVP:** Basic task template structure

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'interior' | 'appliances';
  frequency_months: number; // 1, 3, 6, 12, 24
  season_preference?: 'spring' | 'summer' | 'fall' | 'winter';
  estimated_minutes: number;
  difficulty_level: 'easy' | 'moderate' | 'advanced';
  tools_required: string[];
  safety_notes: string[];
  instructions_markdown: string;
  is_weather_dependent: boolean;
  equipment_types: string[]; // which equipment this applies to
}
```

**MVP Task Templates (minimum 20 essential tasks):**
1. **HVAC:** Change air filter (3mo), Clean vents (6mo), Service HVAC (12mo)
2. **Plumbing:** Check for leaks (3mo), Test water pressure (6mo), Service water heater (12mo)
3. **Electrical:** Test GFCI outlets (3mo), Check smoke detectors (6mo), Inspect electrical panel (12mo)
4. **Exterior:** Clean gutters (6mo), Inspect roof (12mo), Seal driveway (24mo)
5. **Interior:** Deep clean (3mo), Check windows/doors (6mo), Touch up paint (12mo)
6. **Appliances:** Clean refrigerator coils (6mo), Service dishwasher (12mo), Clean dryer vent (6mo)

#### **Equipment Types System**
**Required for MVP:** Standard equipment categories

```typescript
interface EquipmentType {
  id: string;
  name: string;
  category: string;
  typical_lifespan_years: number;
  maintenance_tasks: string[]; // task_template_ids
  identification_keywords: string[]; // for photo recognition
}
```

**MVP Equipment Types:**
- HVAC: Central Air, Heat Pump, Furnace, Window AC
- Plumbing: Water Heater, Garbage Disposal, Sump Pump
- Appliances: Refrigerator, Dishwasher, Washer, Dryer
- Exterior: Roof, Gutters, Driveway, Deck

#### **Task Generation Logic (MVP)**
**Algorithm for MVP:**
```typescript
// Simple rule-based generation for MVP
function generateTasks(home: Home, equipment: Equipment[]): Task[] {
  const tasks: Task[] = [];
  
  for (const item of equipment) {
    const templates = getTemplatesForEquipment(item.type);
    
    for (const template of templates) {
      const lastCompleted = getLastCompletion(home.id, template.id);
      const dueDate = calculateDueDate(lastCompleted, template.frequency_months);
      
      if (isTaskDue(dueDate)) {
        tasks.push(createTask(template, item, dueDate));
      }
    }
  }
  
  return sortByPriority(tasks);
}
```

### **Week 3: React Native Foundation - API CHOICES**

#### **Required Third-Party Services for MVP**

**Navigation:**
- **React Navigation v6** (standard for React Native)
- Stack, Tab, and Drawer navigators

**State Management:**
- **Zustand** (simpler than Redux, perfect for MVP)
- Real-time Supabase integration

**UI Components:**
- **React Native Elements** or **NativeBase** (component library)
- Custom components using design system colors

**Image Handling:**
- **expo-image-picker** for camera/photo selection
- **Supabase Storage** for image uploads

### **Week 4: Onboarding Flow - API SPECIFICATIONS**

#### **Address Lookup Service**
**MVP Choice: Google Places API (Autocomplete)**
```typescript
interface AddressLookup {
  query: string;
  results: {
    place_id: string;
    formatted_address: string;
    address_components: AddressComponent[];
    geometry: {
      lat: number;
      lng: number;
    };
  }[];
}
```

**Implementation:**
- Use Google Places Autocomplete for address input
- Store coordinates for weather integration
- Free tier: 1000 requests/month (sufficient for MVP)

#### **Equipment Identification (MVP Approach)**
**Phase 1 (MVP): Manual Selection with Photo Upload**
```typescript
interface EquipmentOnboarding {
  step: 'photo' | 'identify' | 'confirm';
  photo_url?: string;
  suggested_equipment: EquipmentType[];
  user_selection: string; // equipment_type_id
}
```

**MVP Flow:**
1. User takes photo of equipment
2. App shows list of common equipment types for that room
3. User manually selects correct type
4. Photo stored for future AI training data

#### **Preference Collection (MVP)**
**Essential Preferences:**
```typescript
interface UserPreferences {
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  available_time_slots: TimeSlot[];
  notification_preferences: {
    reminders: boolean;
    weather_alerts: boolean;
    achievements: boolean;
  };
  home_priorities: string[]; // 'safety', 'efficiency', 'longevity', 'appearance'
}
```

### **Week 5: Task Management - CORE LOGIC**

#### **Task Scheduling Algorithm (MVP)**
```typescript
function calculateTaskPriority(task: Task, home: Home): number {
  let priority = 0;
  
  // Base priority by category
  if (task.category === 'safety') priority += 100;
  if (task.category === 'hvac') priority += 80;
  if (task.category === 'plumbing') priority += 70;
  
  // Overdue penalty
  const daysOverdue = getDaysOverdue(task.due_date);
  priority += Math.min(daysOverdue * 2, 50);
  
  // Weather factor
  if (task.is_weather_dependent && isGoodWeather()) {
    priority += 20;
  }
  
  // User skill level match
  if (task.difficulty <= home.user_skill_level) {
    priority += 10;
  }
  
  return priority;
}
```

#### **Task Completion Flow (MVP)**
```typescript
interface TaskCompletion {
  task_id: string;
  completed_at: timestamp;
  completion_photo_url?: string;
  user_notes?: string;
  difficulty_rating: 1 | 2 | 3 | 4 | 5;
  time_taken_minutes?: number;
  next_due_date: timestamp; // auto-calculated
}
```

### **Week 6: Testing Strategy - MVP REQUIREMENTS**

#### **Testing Framework Setup**
```typescript
// Testing Stack for MVP
{
  "unit": "Jest + React Native Testing Library",
  "integration": "Detox (E2E testing)",
  "performance": "Flipper + Metro bundler analysis",
  "accessibility": "Built-in React Native accessibility testing"
}
```

**MVP Test Coverage Requirements:**
- **Unit Tests:** 80% coverage for core functions
- **Integration Tests:** Critical user flows (onboarding, task completion)
- **E2E Tests:** Happy path for MVP features
- **Performance:** App launch < 3s, 60fps for animations

---

## ❓ **Outstanding Questions for Future Phases**

### **Phase 2: Intelligence Features (Weeks 7-12)**

#### **Week 7: Behavioral Learning**
**🔍 Decisions Needed:**
- Which user behaviors to track? (task completion patterns, scheduling preferences, difficulty ratings)
- How to implement privacy-preserving analytics? (local processing vs. aggregated data)
- What machine learning approach? (simple rule-based vs. ML models)
- How to explain AI decisions to users? (transparency requirements)

#### **Week 8: Weather Integration**
**🔍 Decisions Needed:**
- Weather API service choice? (OpenWeatherMap, WeatherAPI, AccuWeather)
- Weather condition thresholds? (what temperature/conditions cancel outdoor tasks)
- How far ahead to forecast? (3-day, 7-day, seasonal predictions)
- Emergency weather scenarios? (severe storm preparations, extreme heat/cold)

#### **Week 9: Predictive Maintenance**
**🔍 Decisions Needed:**
- Equipment failure prediction approach? (age-based, usage patterns, community data)
- Cost-benefit analysis data sources? (repair costs, replacement costs, energy savings)
- Confidence scoring system? (how to communicate prediction reliability)
- Integration with equipment warranties/service records?

#### **Week 10: Advanced Personalization**
**🔍 Decisions Needed:**
- Communication style adaptation criteria? (formal vs. casual, technical vs. simple)
- Learning style recognition methods? (visual vs. text vs. video preferences)
- Home care philosophy categories? (DIY vs. professional, preventive vs. reactive)
- User control granularity? (what can users adjust, what's automatic)

#### **Week 11: Community Intelligence**
**🔍 Decisions Needed:**
- Neighborhood grouping algorithm? (ZIP code, radius, climate zone, home age)
- Privacy-preserving aggregation method? (differential privacy, k-anonymity)
- Community insight types? (seasonal patterns, common issues, local expertise)
- Opt-in vs. opt-out community features? (privacy default preferences)

### **Phase 3: Community Features (Weeks 13-18)**

#### **Social Features Design**
**🔍 Decisions Needed:**
- Community interaction scope? (tips sharing, expert recommendations, group challenges)
- Local expert verification system? (credentials, ratings, professional vs. amateur)
- Content moderation approach? (automated, community, professional moderators)
- Gamification elements? (points, badges, leaderboards, challenges)

#### **Advanced Analytics**
**🔍 Decisions Needed:**
- Business analytics requirements? (user engagement, feature usage, retention)
- Performance monitoring scope? (app performance, business metrics, user satisfaction)
- A/B testing framework? (feature flags, experiment design, statistical analysis)
- Data retention policies? (user data, analytics data, legal compliance)

---

## 📚 **Research Tasks Before Each Phase**

### **Before Phase 2 (Week 6):**
- [ ] Research weather API options and pricing
- [ ] Investigate machine learning approaches for behavior analysis
- [ ] Study privacy-preserving analytics techniques
- [ ] Research equipment failure prediction methods

### **Before Phase 3 (Week 12):**
- [ ] Research community platform approaches
- [ ] Investigate content moderation solutions
- [ ] Study gamification frameworks for productivity apps
- [ ] Research local service provider integration APIs

### **Before Phase 4 (Week 18):**
- [ ] Research business analytics platforms
- [ ] Investigate advanced AI/ML services
- [ ] Study enterprise feature requirements
- [ ] Research scaling and infrastructure needs

---

This document ensures we have everything needed for a successful MVP while documenting the decisions that need to be made for future phases. The MVP will be fully functional with manual processes that can be intelligently automated in later phases. 