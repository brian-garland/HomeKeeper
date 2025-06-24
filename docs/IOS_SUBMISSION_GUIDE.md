# iOS App Store Submission Guide - HomeKeeper Pro

## App Store Connect Configuration

### App Details
- **App Name**: HomeKeeper Pro (original "HomeKeeper" was taken)
- **Bundle ID**: com.bagn9c.homekeeper
- **SKU**: homekeeper-ios
- **Apple Team ID**: 4C9M83RDK4
- **App Store Connect App ID**: 6747691620

### Screenshots & Assets
- **Required Dimensions**: 1290 x 2796 (iPhone 14 Pro Max)
- **Captured Method**: iPhone with Expo Go (power + volume buttons)
- **Original Size**: 1170 x 2532 → Resized with `sips` command
- **Location**: `/docs/screenshots/ios/`
- **Files**: 5 core screenshots (onboarding, dashboard, tasks, equipment, add-task)

### App Store Metadata
- **Promotional Text**: "Smart home maintenance made simple. Track tasks, manage equipment, and save money with intelligent scheduling and weather-based recommendations."
- **Keywords**: "home maintenance,house care,property management,HVAC,tasks,equipment,weather,preventive,repair"
- **Category**: Productivity
- **Content Rating**: 4+ (No objectionable content)

### App Review Information
- **Sign-in Required**: NO (app uses local storage only)
- **Demo Account**: Not needed
- **Review Notes**: Reference uploaded review guide document
- **Contact**: bgarland723@gmail.com

### Privacy & Legal Information
- **Privacy Policy URL**: https://homekeeper-privacy.surge.sh
- **Copyright**: © 2025 Brian Garland. All rights reserved.
- **Primary Category**: Productivity
- **Pricing**: Free
- **Age Rating**: 4+ (No objectionable content)

## Build Configuration

### EAS Configuration (`eas.json`)
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "bgarland723@gmail.com",
      "ascAppId": "6747691620",
      "appleTeamId": "4C9M83RDK4"
    }
  }
}
```

### Environment Variables
- **Required**: `EXPO_PUBLIC_OPENWEATHER_API_KEY`
- **Value**: [CONFIGURED IN EAS - DO NOT STORE IN DOCS]
- **Configuration**: `eas env:create --environment production --name EXPO_PUBLIC_OPENWEATHER_API_KEY --value [your-api-key] --visibility plaintext`

### Build Process
1. **Build Command**: `eas build --platform ios --profile production`
2. **Build Duration**: ~6 minutes
3. **Build ID**: e4f3aa1a-d003-4f99-ad69-a7cdeb76234c
4. **Submit Command**: `eas submit --platform ios --latest`

## Lessons Learned

### Screenshot Optimization
- Web version in Chrome DevTools had layout issues (text positioning, whitespace)
- Physical device screenshots are higher quality and more accurate
- Use `sips` for batch resizing: `sips -z 2796 1290 *.png`
- iOS screenshots work fine for Android with status bar intact

### App Store Connect Tips
- Save form data frequently to avoid losing progress
- App name conflicts require creative alternatives
- Description text must avoid smart quotes, em dashes, and certain emojis
- Use plain ASCII characters for safest compatibility

### EAS Submit Configuration
- Apple Team ID required (found in Apple Developer → Membership)
- App Store Connect App ID available in URL or app details
- EAS automatically creates API keys for future submissions
- Build processing takes 5-15 minutes after upload

### Review Documentation
- Create comprehensive review guide as HTML document
- Convert to PDF for App Store Connect upload
- Include testing instructions, key features, and contact info
- Emphasize no login required for local storage apps

## Future Submissions

### For Updates
1. Increment version in `app.json`
2. Run `eas build --platform ios --profile production`
3. Run `eas submit --platform ios --latest`
4. Update version info in App Store Connect

### For New Apps
1. Register Bundle ID in Apple Developer Portal
2. Create app in App Store Connect
3. Configure metadata and screenshots
4. Update `eas.json` with new App IDs
5. Follow build and submit process

## Common Issues & Solutions

### Build Failures
- Check environment variables are set correctly
- Verify Apple Developer account is active
- Ensure Bundle ID is registered

### Submission Failures
- Verify Apple Team ID format (10 uppercase alphanumeric)
- Check App Store Connect App ID is numeric only
- Confirm Apple ID matches developer account

### Processing Delays
- Apple processing can take 5-15 minutes
- Email notification sent when complete
- Build appears in App Store Connect automatically

## Contact Information
- **Developer**: Brian Garland
- **Email**: bgarland723@gmail.com
- **Apple Team ID**: 4C9M83RDK4

## Current Status (Updated June 23, 2025)
- ✅ Screenshots: Complete and ready for both platforms
- ✅ App Store Connect: Partially configured with metadata
- ✅ iOS Build: Completed successfully (Build ID: e4f3aa1a-d003-4f99-ad69-a7cdeb76234c)
- ✅ EAS Submit: Build uploaded to App Store Connect
- ✅ Review Documentation: Created and uploaded (HomeKeeper-Pro-Review-Guide.html)
- ✅ Privacy Policy: Live at https://homekeeper-privacy.surge.sh
- 🟡 **Remaining Tasks for Next Session**:
  - Age Rating content descriptions
  - iPad screenshots (13-inch display) - can resize existing iPhone screenshots
  - App Privacy section completion
  - Content Rights Information
  - Final review submission

## Next Session Checklist
1. Complete Age Rating section in App Store Connect
2. Create/upload iPad screenshots (resize iPhone screenshots to iPad dimensions)
3. Fill out App Privacy practices section (emphasize local storage)
4. Complete Content Rights Information
5. Set pricing to "Free"
6. Submit for App Store review

---
*Last Updated: December 23, 2025* 