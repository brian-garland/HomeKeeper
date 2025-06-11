# HomeKeeper Core Screen Wireframes
**Week 2.5 UX Foundation - Development Guide**

## 📱 **Navigation Structure**

### **Primary Navigation (Bottom Tab Bar)**
```
┌─────────────────────────────────────────┐
│                                         │
│              MAIN CONTENT               │
│                                         │
├─────────────────────────────────────────┤
│ [Home] [Tasks] [Equipment] [Calendar]   │
└─────────────────────────────────────────┘
```

**Tab Structure:**
- **🏠 Home**: Dashboard overview, quick actions
- **✅ Tasks**: Task list, filters, management
- **🔧 Equipment**: Equipment registry, management
- **📅 Calendar**: Scheduling, upcoming tasks

---

## 🚪 **1. Onboarding Flow Screens**

### **Welcome Screen**
```
┌─────────────────────────────────────────┐
│              [Skip]                     │
│                                         │
│         🏠 HomeKeeper Logo              │
│                                         │
│      "Transform your home               │
│       maintenance into                  │
│       delightful moments"               │
│                                         │
│         [Get Started]                   │
│      [I already have an account]       │
└─────────────────────────────────────────┘
```

### **Address Input Screen**
```
┌─────────────────────────────────────────┐
│  [← Back]    Add Your Home    [Skip]    │
├─────────────────────────────────────────┤
│                                         │
│    🏠 "Tell us about your home"         │
│                                         │
│    ┌─────────────────────────────────┐   │
│    │ Street Address              [📍]│   │
│    └─────────────────────────────────┘   │
│                                         │
│    ┌─────────────┐ ┌─────────────────┐   │
│    │ City        │ │ State     [▼]   │   │
│    └─────────────┘ └─────────────────┘   │
│                                         │
│    Home Type: [House ▼]                │
│    Year Built: [____]                  │
│                                         │
│              [Continue]                 │
└─────────────────────────────────────────┘
```

### **Equipment Discovery Screen**
```
┌─────────────────────────────────────────┐
│  [← Back]  Equipment Tour   [Skip Tour] │
├─────────────────────────────────────────┤
│                                         │
│    📸 "Let's find your equipment"       │
│    "Take photos or add manually"       │
│                                         │
│    ┌─────────────────────────────────┐   │
│    │                                 │   │
│    │      CAMERA VIEWFINDER          │   │
│    │         [🔍 AI Scan]            │   │
│    │                                 │   │
│    └─────────────────────────────────┘   │
│                                         │
│         [📷 Take Photo]                 │
│         [➕ Add Manually]               │
│         [✅ I'm Done]                   │
└─────────────────────────────────────────┘
```

### **Preferences Screen**
```
┌─────────────────────────────────────────┐
│  [← Back]   Your Preferences   [Skip]   │
├─────────────────────────────────────────┤
│                                         │
│   ⚙️ "How do you want to maintain      │
│       your home?"                      │
│                                         │
│   Maintenance Style:                   │
│   ○ Proactive (prevent issues)         │
│   ● Balanced (mix of both)             │
│   ○ Reactive (fix when broken)         │
│                                         │
│   Time Availability:                   │
│   ○ Weekends only                      │
│   ● Few hours per week                 │  
│   ○ Whenever needed                    │
│                                         │
│   Skill Level:                         │
│   ○ Beginner ● Intermediate ○ Expert   │
│                                         │
│              [Continue]                 │
└─────────────────────────────────────────┘
```

---

## 🏠 **2. Home Dashboard Screen**

```
┌─────────────────────────────────────────┐
│  ☰    Welcome back, Brian!         [⚙️] │
├─────────────────────────────────────────┤
│                                         │
│  📊 Your Home Health: 85% 🟢           │
│  ┌─────────────────────────────────┐     │
│  │ ████████████████░░░░░░░░░░░░░    │     │
│  └─────────────────────────────────┘     │
│                                         │
│  🎯 Today's Focus                       │
│  ┌─────────────────────────────────┐     │
│  │ ✅ Clean HVAC filter             │     │
│  │ 📅 Schedule gutter cleaning      │     │
│  │ 🔧 Check smoke detector battery  │     │
│  └─────────────────────────────────┘     │
│                                         │
│  📈 Quick Stats                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────────┐     │
│  │  12 │ │  3  │ │  8  │ │   $450  │     │
│  │Tasks│ │Due  │ │Done │ │ Saved   │     │
│  └─────┘ └─────┘ └─────┘ └─────────┘     │
│                                         │
├─────────────────────────────────────────┤
│ [Home] [Tasks] [Equipment] [Calendar]   │
└─────────────────────────────────────────┘
```

---

## ✅ **3. Task List Screen**

```
┌─────────────────────────────────────────┐
│  📝 Tasks                    [🔍] [⚙️] │
├─────────────────────────────────────────┤
│                                         │
│  [All] [Due Soon] [Overdue] [Completed] │
│                                         │
│  🔥 Due Today (2)                       │
│  ┌─────────────────────────────────┐     │
│  │ 🟠 Clean HVAC filter      [>]   │     │
│  │    📅 Today • 🕐 30 min         │     │
│  └─────────────────────────────────┘     │
│  ┌─────────────────────────────────┐     │
│  │ 🔴 Check smoke detector   [>]   │     │
│  │    📅 Overdue 2 days • 🕐 15min │     │
│  └─────────────────────────────────┘     │
│                                         │
│  📅 This Week (5)                       │
│  ┌─────────────────────────────────┐     │
│  │ 🟡 Inspect roof gutters   [>]   │     │
│  │    📅 Wed • 🕐 45 min           │     │
│  └─────────────────────────────────┘     │
│  ┌─────────────────────────────────┐     │
│  │ 🟢 Test garage door       [>]   │     │
│  │    📅 Fri • 🕐 20 min           │     │
│  └─────────────────────────────────┘     │
│                                         │
│                              [+ Add]    │
├─────────────────────────────────────────┤
│ [Home] [Tasks] [Equipment] [Calendar]   │
└─────────────────────────────────────────┘
```

---

## 📋 **4. Task Detail Screen**

```
┌─────────────────────────────────────────┐
│  [← Back]                    [⋯] [★]   │
├─────────────────────────────────────────┤
│                                         │
│  🟠 Clean HVAC Filter                   │
│  📅 Due Today • 🕐 30 minutes           │
│  🏠 Upstairs Unit • 🔧 Maintenance      │
│                                         │
│  ┌─────────────────────────────────┐     │
│  │  📖 How to do this:            │     │
│  │  1. Turn off HVAC system       │     │
│  │  2. Locate filter compartment  │     │
│  │  3. Remove old filter          │     │
│  │  4. Insert new filter...       │     │
│  │     [View Full Guide]           │     │
│  └─────────────────────────────────┘     │
│                                         │
│  📦 What you'll need:                   │
│  • Replacement filter (16x25x1)        │
│  • Flashlight (optional)               │
│                                         │
│  💡 Pro Tip: Set monthly reminder      │
│      for filter replacement            │
│                                         │
│         [📷 Start Task]                 │
│         [✅ Mark Complete]              │
│         [📅 Reschedule]                 │
├─────────────────────────────────────────┤
│ [Home] [Tasks] [Equipment] [Calendar]   │
└─────────────────────────────────────────┘
```

---

## 🔧 **5. Equipment List Screen**

```
┌─────────────────────────────────────────┐
│  🔧 Equipment                [🔍] [⚙️] │
├─────────────────────────────────────────┤
│                                         │
│  [All] [HVAC] [Plumbing] [Electrical]   │
│                                         │
│  ❄️ HVAC Systems (3)                    │
│  ┌─────────────────────────────────┐     │
│  │ 🟢 Main AC Unit          [>]    │     │
│  │    Installed 2019 • Next: 30d   │     │
│  └─────────────────────────────────┘     │
│  ┌─────────────────────────────────┐     │
│  │ 🟡 Upstairs Heater       [>]    │     │
│  │    Installed 2015 • Next: 7d    │     │
│  └─────────────────────────────────┘     │
│                                         │
│  🚿 Plumbing (4)                        │
│  ┌─────────────────────────────────┐     │
│  │ 🟢 Water Heater          [>]    │     │
│  │    40 gal gas • Next: 90d       │     │
│  └─────────────────────────────────┘     │
│  ┌─────────────────────────────────┐     │
│  │ 🟡 Main Water Line       [>]    │     │
│  │    Installed 2010 • Next: 14d   │     │
│  └─────────────────────────────────┘     │
│                                         │
│                              [+ Add]    │
├─────────────────────────────────────────┤
│ [Home] [Tasks] [Equipment] [Calendar]   │
└─────────────────────────────────────────┘
```

---

## 📅 **6. Calendar Screen**

```
┌─────────────────────────────────────────┐
│  📅 Calendar              [Today] [⚙️] │
├─────────────────────────────────────────┤
│                                         │
│  [< June 2025 >]                        │
│                                         │
│  S  M  T  W  T  F  S                    │
│  1  2  3  4  5  6  7                    │
│  8  9 10 ⭕ 12 13 14                    │
│ 15 16 17 18 19 20 21                    │
│ 22 23 24 25 26 27 28                    │
│ 29 30                                   │
│                                         │
│  📋 June 11 (Today)                     │
│  ┌─────────────────────────────────┐     │
│  │ 🟠 Clean HVAC filter      9:00am│     │
│  │ 🟡 Check smoke detector   2:00pm│     │
│  └─────────────────────────────────┘     │
│                                         │
│  📋 Upcoming This Week                  │
│  ┌─────────────────────────────────┐     │
│  │ Wed 13: Inspect gutters         │     │
│  │ Fri 15: Test garage door        │     │
│  │ Sun 17: Trim bushes             │     │
│  └─────────────────────────────────┘     │
│                                         │
├─────────────────────────────────────────┤
│ [Home] [Tasks] [Equipment] [Calendar]   │
└─────────────────────────────────────────┘
```

---

## 🎯 **Key Interaction Patterns**

### **Swipe Gestures:**
- **Swipe Right on Task**: Mark as complete
- **Swipe Left on Task**: Reschedule/snooze
- **Pull Down**: Refresh data
- **Long Press**: Context menu

### **Navigation Flow:**
```
Welcome → Auth → Address → Equipment → Preferences → Dashboard
    ↓
Dashboard ↔ Tasks ↔ Equipment ↔ Calendar
    ↓
Task Detail → Start Task → Complete Task → Dashboard
```

### **Form Patterns:**
- **Progressive disclosure**: Show fields as needed
- **Smart defaults**: Pre-fill based on context
- **Inline validation**: Real-time feedback
- **Save states**: Auto-save drafts

This wireframe foundation will guide our **React Native component creation** in Week 3! 