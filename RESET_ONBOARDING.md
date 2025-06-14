# Reset Onboarding for Testing

## 🔄 **How to Reset Onboarding Data**

### **Method 1: Clear App Data (Recommended)**
1. **iOS Simulator**: Device → Erase All Content and Settings
2. **Android Emulator**: Settings → Apps → Expo Go → Storage → Clear Data
3. **Physical Device**: Delete and reinstall Expo Go app

### **Method 2: Clear AsyncStorage (Developer)**
Add this temporary code to any screen and run it once:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this function and call it once
const resetOnboarding = async () => {
  try {
    await AsyncStorage.multiRemove([
      'homekeeper_onboarding_completed',
      'homekeeper_home_data', 
      'homekeeper_equipment',
      'homekeeper_tasks',
      'homekeeper_user_preferences'
    ]);
    console.log('✅ Onboarding data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};
```

### **Method 3: Metro Cache Clear**
```bash
npx expo start --clear
```

## 🧪 **What to Test After Reset**

### **✅ Fixes to Verify:**

1. **Address Input Text Alignment** ✅ **FIXED**
   - Text should be centered vertically in input field
   - No letters cut off at bottom (like 'y')

2. **Keyboard Covering Input Fields** ✅ **FIXED**  
   - Step 3 (Home Characteristics) inputs should scroll when keyboard appears
   - Year and square footage inputs should remain visible

3. **Equipment Badge Display** ✅ **FIXED**
   - Task cards should have consistent equipment badges
   - No weird "HVAC System" boxes

4. **Duplicate Tasks Prevention** ✅ **FIXED**
   - Should not see multiple similar tasks (e.g., two gutter cleaning tasks)
   - Each task should be unique

5. **Realistic Due Dates** ✅ **FIXED**
   - Tasks should have minimum 1-week lead time
   - No tasks due tomorrow or next day
   - Tasks spaced out reasonably (3-7 days apart)

## 📋 **Testing Checklist**

- [ ] Complete onboarding flow start to finish
- [ ] Verify address input text alignment
- [ ] Test keyboard behavior in Step 3
- [ ] Check task generation for duplicates
- [ ] Verify task due dates are reasonable
- [ ] Confirm equipment badge consistency
- [ ] Test navigation between Equipment → Tasks
- [ ] Verify all 9 equipment items generated
- [ ] Check that tasks are properly linked to equipment

## 🎯 **Expected Results**

After completing onboarding, you should see:
- **9 equipment items** (HVAC, Water Heater, Smoke Detectors, etc.)
- **7-9 unique tasks** with realistic due dates (1+ weeks out)
- **Clean task cards** with consistent equipment badges
- **Smooth keyboard handling** throughout the flow
- **Proper text alignment** in all input fields 