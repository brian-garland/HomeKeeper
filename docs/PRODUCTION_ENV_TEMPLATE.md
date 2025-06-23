# Production Environment Variables Template

This document explains how to configure environment variables for production builds using EAS.

## Environment Variables Setup

### For EAS Builds
EAS can read environment variables from several sources:
1. `.env` file in your project root (for development)
2. `.env.production` file (for production builds)
3. EAS Secrets (recommended for sensitive production data)

### Required Variables for Production

```bash
# Supabase Configuration (Production)
SUPABASE_URL=your-production-supabase-url
SUPABASE_ANON_KEY=your-production-supabase-anon-key
EXPO_PUBLIC_SUPABASE_URL=your-production-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key

# Weather API (Production)
EXPO_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key

# App Environment
EXPO_PUBLIC_ENV=production

# Build Information (Optional)
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_BUILD_NUMBER=1
```

## Setup Instructions

### Option 1: Using .env.production File (Recommended for Development)
1. Copy your `.env` file to `.env.production`
2. Update URLs to production Supabase instance (if different)
3. Ensure all keys are production-ready
4. Add `.env.production` to your `.gitignore` if not already there

### Option 2: Using EAS Secrets (Recommended for Sensitive Data)
1. Set secrets using EAS CLI:
   ```bash
   eas secret:create --scope project --name SUPABASE_URL --value "your-production-url"
   eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your-production-key"
   eas secret:create --scope project --name EXPO_PUBLIC_OPENWEATHER_API_KEY --value "your-api-key"
   ```

2. List your secrets:
   ```bash
   eas secret:list
   ```

## Environment Validation

Before building, ensure:
- [ ] All required environment variables are set
- [ ] Supabase URLs point to correct instance
- [ ] API keys are valid and have appropriate permissions
- [ ] No development-only values are included

## Build Commands

After environment setup, you can build with:

```bash
# Build for iOS production
eas build --platform ios --profile production

# Build for Android production  
eas build --platform android --profile production

# Build for both platforms
eas build --platform all --profile production
```

## Troubleshooting

### Common Issues:
1. **Missing environment variables**: EAS will show which variables are missing
2. **Invalid API keys**: Check Supabase and OpenWeather dashboards
3. **Wrong Supabase URL**: Ensure production URL is used for production builds

### Verification:
- Check EAS build logs for environment variable loading
- Test builds on physical devices before store submission
- Verify API connectivity in production builds

---

*Last updated: 2025-06-23* 