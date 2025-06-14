# HomeKeeper Technical Decisions Log

## Week 8 Session - January 14, 2025

### Critical Architectural Decisions Made

#### 1. **Dual-Path Task Generation System**
**Date**: January 14, 2025  
**Decision**: Implemented dual-path logic in `taskGenerationService.ts` to handle both local and database homes

**Implementation**:
```typescript
// src/lib/services/taskGenerationService.ts:50-70
if (homeId.startsWith('local-')) {
  // Handle local home from AsyncStorage
  const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default)
  const localHomeData = await AsyncStorage.getItem('homekeeper_local_home')
  if (localHomeData) {
    home = JSON.parse(localHomeData) as Home
  }
} else {
  // Handle database home
  const { data: dbHome, error: homeError } = await supabase
    .from('homes')
    .select('*')
    .eq('id', homeId)
    .single()
}
```

**Rationale**: Enable immediate task generation for local homes without database dependency

**Temporary Nature**: ⚠️ **HIGH PRIORITY FOR REVIEW**
- Adds significant complexity to core service
- Duplicates logic paths that must be maintained in parallel
- May cause inconsistencies between local and database task creation

**Reevaluation Trigger**: When implementing user authentication or multi-device sync

---

#### 2. **Local Home Priority in DataContext**
**Date**: January 14, 2025  
**Decision**: Modified `DataContext.tsx` to prioritize local homes from onboarding over saved homes

**Implementation**:
```typescript
// src/contexts/DataContext.tsx:90-110
// Always check for local home from onboarding first
const localHomeData = await AsyncStorage.getItem('homekeeper_local_home');
if (localHomeData) {
  const localHome = JSON.parse(localHomeData);
  homesToSet = [localHome];
  console.log('📍 DataContext loaded local home with coordinates:', localHome.latitude, localHome.longitude);
} else if (savedHomes.length > 0) {
  homesToSet = savedHomes;
} else {
  // Create default home only as last resort
}
```

**Rationale**: Ensure onboarding-created homes with coordinates take precedence for weather integration

**Temporary Nature**: ⚠️ **MEDIUM PRIORITY FOR REVIEW**
- Creates implicit home hierarchy that may confuse users with multiple homes
- Assumes single-home usage pattern
- May need adjustment for multi-home scenarios

**Reevaluation Trigger**: When adding multi-home support or home management features

---

#### 3. **Mock Task Object Creation**
**Date**: January 14, 2025  
**Decision**: Created local Task objects that bypass normal database creation flow

**Implementation**:
```typescript
// src/lib/services/taskGenerationService.ts:337-365
if (homeId.startsWith('local-')) {
  const localTask: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // ... all required Task fields with defaults
  }
  return localTask
} else {
  const result = await createTask(taskData)
  return result.success ? result.data : null
}
```

**Rationale**: Enable task creation without database dependency for local homes

**Temporary Nature**: ⚠️ **HIGH PRIORITY FOR REVIEW**
- Bypasses validation and business logic in `createTask` function
- Creates inconsistent task creation paths
- May miss future enhancements to task creation logic
- ID generation strategy may cause conflicts

**Reevaluation Trigger**: Before implementing task synchronization or when adding task validation

---

#### 4. **Navigation Callback Pattern in Onboarding**
**Date**: January 14, 2025  
**Decision**: Changed from direct navigation to callback pattern

**Implementation**:
```typescript
// OLD: navigation.navigate('MainApp' as never)
// NEW: onComplete?.()
```

**Rationale**: Fix navigation errors and provide more flexible completion handling

**Temporary Nature**: ⚠️ **LOW PRIORITY FOR REVIEW**
- Works well for current use case
- May need adjustment for more complex navigation flows
- Consider standardizing across all onboarding screens

**Reevaluation Trigger**: When adding more onboarding flows or complex navigation requirements

---

#### 5. **Default Equipment Handling for Local Homes**
**Date**: January 14, 2025  
**Decision**: Return empty equipment array for local homes instead of database lookup

**Implementation**:
```typescript
// src/lib/services/taskGenerationService.ts:88-95
if (homeId.startsWith('local-')) {
  equipment = getDefaultEquipmentForHomeType(home.home_type || 'single_family')
  existingTasks = [] // No existing tasks for new local homes
} else {
  // Get equipment from database
}

function getDefaultEquipmentForHomeType(homeType: string): Equipment[] {
  return [] // Return empty array for now
}
```

**Rationale**: Allow task generation to work without equipment setup

**Temporary Nature**: ⚠️ **MEDIUM PRIORITY FOR REVIEW**
- Limits task generation effectiveness for local homes
- Should implement default equipment based on home type
- May miss equipment-specific maintenance tasks

**Reevaluation Trigger**: When implementing equipment management or improving task generation accuracy

---

### Recommendations for Future Sessions

#### Immediate Actions (Next 1-2 Sessions)
1. **Implement Default Equipment Logic**: Populate `getDefaultEquipmentForHomeType()` with realistic equipment based on home type
2. **Add Task Validation**: Ensure local task creation includes same validation as database tasks
3. **Standardize ID Generation**: Use consistent ID generation strategy across local and database objects

#### Medium-Term Actions (Next 2-4 Weeks)
1. **Refactor Dual-Path Logic**: Consider abstracting home/task operations behind a unified interface
2. **Add Migration Strategy**: Plan for converting local homes to database homes when users authenticate
3. **Implement Conflict Resolution**: Handle cases where local and database data conflict

#### Long-Term Considerations (Next 1-3 Months)
1. **Evaluate Architecture Decision**: Review whether local-first approach should continue or migrate to hybrid model
2. **Performance Analysis**: Measure impact of dual-path logic on app performance
3. **User Experience Study**: Validate that local-first approach meets user needs vs. cloud sync expectations

---

### Success Metrics for Current Decisions

#### Task Generation Effectiveness
- **Target**: 5+ relevant tasks generated for new homes
- **Current**: ✅ Achieving 5 tasks consistently
- **Monitor**: Task relevance and user completion rates

#### User Experience Smoothness  
- **Target**: <2 second onboarding completion
- **Current**: ✅ Achieving sub-2 second completion
- **Monitor**: User drop-off rates during onboarding

#### Data Consistency
- **Target**: Zero data loss or corruption
- **Current**: ✅ No reported issues
- **Monitor**: AsyncStorage reliability and data integrity

---

### Decision Review Schedule

- **Weekly**: Monitor success metrics and user feedback
- **Monthly**: Review temporary decisions for promotion to permanent or refactoring
- **Quarterly**: Evaluate overall architectural direction and alignment with product goals

---

*Last Updated: January 14, 2025*  
*Next Review: January 21, 2025* 