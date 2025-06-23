# HomeKeeper App Screenshots Guide

This guide covers all requirements for creating professional app store screenshots for both iOS App Store and Google Play Store.

## 📱 Required Screenshots (5 Core Screens)

### 1. **Onboarding Flow** 
- **Screen**: Welcome/Setup screen showing the magical onboarding
- **Purpose**: First impression, shows ease of use
- **Key elements**: Clean UI, welcome message, setup flow

### 2. **Dashboard Overview**
- **Screen**: Main dashboard with weather integration
- **Purpose**: Shows core functionality and data integration
- **Key elements**: Weather display (95°F scattered clouds), home info, task summary

### 3. **Task Management Screen**
- **Screen**: Tasks list showing intelligent task generation
- **Purpose**: Demonstrates core task management features
- **Key elements**: Task list, status indicators, smart scheduling

### 4. **Equipment Tracking**
- **Screen**: Equipment list with your 9 saved items
- **Purpose**: Shows comprehensive home equipment management
- **Key elements**: Equipment cards, organization, details

### 5. **Task Creation Process**
- **Screen**: Add task flow or task details
- **Purpose**: Shows user workflow and ease of use
- **Key elements**: Clean form, intelligent suggestions

## 📐 Exact Dimensions Required

### iOS App Store Requirements
| Device | Size (pixels) | Aspect Ratio |
|--------|---------------|--------------|
| **iPhone 6.7"** (iPhone 14 Pro Max) | 1290 x 2796 | 9:19.5 |
| **iPhone 6.1"** (iPhone 14 Pro) | 1179 x 2556 | 9:19.5 |
| **iPad Pro 12.9"** (Optional) | 2048 x 2732 | 3:4 |

### Android Play Store Requirements
| Type | Size (pixels) | Notes |
|------|---------------|-------|
| **Phone** | 1080 x 1920 | 16:9 minimum |
| **Phone** | 1440 x 2560 | 16:9 preferred |
| **Tablet** (Optional) | 1200 x 1920 | 16:10 |

## 🎯 Screenshot Capture Process

### Method 1: iOS Simulator (Recommended)
1. **Open iOS Simulator**:
   ```bash
   # In your terminal (with Expo running):
   # Press 'i' to open iOS simulator
   ```
2. **Select correct device**: iPhone 14 Pro Max for largest size
3. **Capture screenshots**: Device → Screenshots → Save to Photos
4. **Transfer files**: Drag from simulator to `docs/screenshots/ios/`

### Method 2: Physical iPhone
1. **Connect to Expo**: Scan QR code with Expo Go
2. **Take screenshots**: Volume Up + Power button
3. **Transfer**: AirDrop or Photos app to computer

### Method 3: Web Version (Android dimensions)
1. **Open web version**: Press 'w' in Expo or go to localhost:8081
2. **Resize browser**: Set to mobile dimensions (390px width)
3. **Use dev tools**: Chrome DevTools → Device Mode → Custom dimensions
4. **Capture**: Built-in screenshot tool or browser extensions

## 📝 Screenshot Naming Convention

```
ios/
├── 01-onboarding-iphone-6.7.png
├── 02-dashboard-iphone-6.7.png
├── 03-tasks-iphone-6.7.png
├── 04-equipment-iphone-6.7.png
└── 05-add-task-iphone-6.7.png

android/
├── 01-onboarding-android-phone.png
├── 02-dashboard-android-phone.png
├── 03-tasks-android-phone.png
├── 04-equipment-android-phone.png
└── 05-add-task-android-phone.png
```

## ✅ Quality Checklist

### Before Taking Screenshots:
- [ ] App is fully loaded with real data (not loading states)
- [ ] Weather data is showing (95°F scattered clouds)
- [ ] All 9 equipment items are loaded
- [ ] Tasks list shows your 6 saved tasks
- [ ] No error states or debug information visible
- [ ] Clean, professional appearance

### Technical Requirements:
- [ ] Correct dimensions for target platform
- [ ] High resolution (retina/2x for iOS)
- [ ] PNG format
- [ ] No device frame borders (just the app content)
- [ ] Portrait orientation
- [ ] No personal information visible

## 🎨 Pro Tips for Great Screenshots

### Timing:
- Wait for all data to load completely
- Capture when UI is in ideal state (not mid-animation)
- Show weather integration working (your current 95°F display is perfect!)

### Content:
- Show real, useful data (your existing data looks great)
- Highlight key features (weather, tasks, equipment)
- Avoid empty states or error messages

### Consistency:
- Same time of day/UI state across screenshots
- Consistent navigation patterns
- Professional, clean appearance

## 🚀 Next Steps After Capture

1. **Review screenshots** for quality and requirements
2. **Organize by platform** in respective folders
3. **Verify dimensions** match store requirements
4. **Update store content document** with screenshot file paths
5. **Prepare for store upload** when developer accounts are ready

---

## Quick Start Commands

```bash
# Navigate to screenshots folder
cd docs/screenshots

# Check current structure
ls -la ios/ android/

# Verify file sizes (after capture)
file ios/*.png
file android/*.png
```

*Last updated: 2025-06-23* 