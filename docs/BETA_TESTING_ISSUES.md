# HomeKeeper Beta Testing Issues Log

## Overview
This document tracks issues reported during beta testing. Each issue should include key details to help with prioritization and resolution.

---

## Issue Template
When adding a new issue, copy and fill out this template:

```markdown
### Issue #[NUMBER] - [BRIEF TITLE]
- **Reporter:** [Name/Username]
- **Date Reported:** [YYYY-MM-DD]
- **Device/Platform:** [iOS/Android version, device model]
- **App Version:** [Version number]
- **Severity:** [Critical/High/Medium/Low]
- **Status:** [New/In Progress/Fixed/Won't Fix/Need More Info]
- **Category:** [UI/UX/Functionality/Performance/Data/Crash/Other]

**Description:**
[Detailed description of the issue]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Videos:**
[If applicable, note any attached media]

**Additional Notes:**
[Any other relevant information]

**Resolution Notes:**
[To be filled when issue is resolved]

---
```

## Active Issues

### Issue #001 - Add Recurring option to Add Task flow
- **Reporter:** Rollin
- **Date Reported:** 2025-06-25
- **Device/Platform:** [To be specified]
- **App Version:** [To be specified]
- **Severity:** Medium
- **Status:** New
- **Category:** Functionality

**Description:**
User requested the ability to set tasks as recurring when creating them in the Add Task flow. Currently, users can only create one-time tasks.

**Steps to Reproduce:**
1. Open the Add Task screen
2. Fill out task details
3. Look for recurring/repeat options
4. No recurring option is available

**Expected Behavior:**
Users should be able to set a task as recurring (daily/weekly/monthly/yearly) during the task creation process.

**Actual Behavior:**
Only one-time tasks can be created. No recurring options are present in the Add Task flow.

**Screenshots/Videos:**
[If applicable]

**Additional Notes:**
This is a feature request rather than a bug. Would enhance user experience by allowing recurring maintenance tasks to be set up easily.

**Resolution Notes:**
[To be filled when resolved]

---

### Issue #002 - App doesn't adjust for larger font sizes (accessibility)
- **Reporter:** Rollin
- **Date Reported:** 2025-06-25
- **Date Resolved:** 2025-01-26
- **Device/Platform:** [To be specified]
- **App Version:** [To be specified]
- **Severity:** High
- **Status:** Fixed
- **Category:** UI/UX

**Description:**
The app does not properly adjust its layout when the user has set larger font sizes in their device settings. This causes text and UI elements to be cut off or not visible, preventing users from completing basic actions.

**Steps to Reproduce:**
1. Set device font size to a larger setting (Accessibility > Display & Text Size > Larger Text)
2. Open the HomeKeeper app
3. Navigate to the onboarding flow
4. Observe that CTAs like "Get Started" on Step 1 are not visible/accessible

**Expected Behavior:**
The app should dynamically adjust its layout to accommodate larger font sizes, ensuring all text and interactive elements remain visible and accessible.

**Actual Behavior:**
CTAs and other UI elements are cut off or hidden when larger font sizes are used, making the app unusable for users who need accessibility features.

**Screenshots/Videos:**
[If applicable - would be very helpful to show the cut-off elements]

**Additional Notes:**
This is an accessibility issue that could prevent users with visual impairments from using the app. Should be prioritized as it affects app usability for users who rely on larger text sizes.

**Resolution Notes:**
✅ **Fixed** - Implemented comprehensive responsive typography system:
- Added PixelRatio.getFontScale() support with 85%-200% scaling bounds
- Updated typography.ts with getResponsiveFontSize() utilities  
- Enhanced PrimaryButton with accessibility-aware dynamic sizing
- Fixed onboarding layout overlaps by removing space-between layouts
- Added ScrollView structure to prevent content cut-off
- Tested successfully with iOS large font settings
- All text now scales properly while maintaining usable layouts

---

### Issue #003 - Add Task workflow automatically associates all tasks with 'Roof' equipment
- **Reporter:** Brian
- **Date Reported:** 2025-01-25
- **Device/Platform:** [To be specified]
- **App Version:** [To be specified]
- **Severity:** High
- **Status:** In Progress
- **Category:** Functionality

**Description:**
When creating a new task through the Add Task workflow, the system automatically associates every task with the 'Roof' equipment item, regardless of user selection or the actual nature of the task.

**Steps to Reproduce:**
1. Navigate to Add Task screen
2. Fill out task information
3. Complete the task creation workflow
4. Observe that the task is automatically associated with 'Roof' equipment

**Expected Behavior:**
Users should be able to select the appropriate equipment item for their task, or leave it unassociated with any equipment if not applicable. The system should not default to any specific equipment.

**Actual Behavior:**
All tasks are automatically associated with 'Roof' equipment regardless of user input or task type.

**Screenshots/Videos:**
[If applicable]

**Additional Notes:**
This affects the accuracy of task organization and could lead to confusion when users try to view tasks by equipment. Could impact task filtering and equipment-specific maintenance tracking.

**Resolution Notes:**
[To be filled when resolved]

---

## Resolved Issues

### Issue #[NUMBER] - [RESOLVED ISSUE TITLE]
- **Reporter:** [Name]
- **Date Reported:** [YYYY-MM-DD]
- **Date Resolved:** [YYYY-MM-DD]
- **Device/Platform:** [Details]
- **Severity:** [Level]
- **Category:** [Type]

**Issue Summary:**
[Brief description of what was wrong]

**Resolution:**
[How it was fixed]

---

## Issue Statistics

### By Category
- **UI/UX:** 0
- **Functionality:** 2
- **Performance:** 0
- **Data:** 0
- **Crashes:** 0
- **Other:** 0

### By Severity
- **Critical:** 0
- **High:** 1
- **Medium:** 1
- **Low:** 0

### By Status
- **New:** 2
- **In Progress:** 1
- **Fixed:** 1
- **Won't Fix:** 0
- **Need More Info:** 0

## Notes
- Update statistics when adding/resolving issues
- Use consistent formatting for easy parsing
- Include device/platform info as different platforms may have different issues
- Screenshots and videos are invaluable - encourage testers to provide them
- Follow up with testers for "Need More Info" items

## Quick Reference

### Severity Levels
- **Critical:** App crashes, data loss, completely blocks usage
- **High:** Major functionality broken, significant UX problems
- **Medium:** Minor functionality issues, cosmetic problems that affect UX
- **Low:** Minor cosmetic issues, nice-to-have improvements

### Common Categories
- **UI/UX:** Visual issues, layout problems, usability concerns
- **Functionality:** Features not working as expected
- **Performance:** Slow loading, laggy interactions
- **Data:** Issues with data saving, loading, or synchronization
- **Crash:** App crashes or freezes
- **Other:** Issues that don't fit other categories 