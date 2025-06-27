# Secure Deployment Setup Guide

## Overview
This guide covers secure configuration for HomeKeeper deployment, including proper handling of sensitive credentials like Apple ID for app store submissions.

## Apple ID Configuration

### ❌ **What NOT to do:**
Never commit Apple ID or other personal credentials directly in `eas.json`:
```json
// DON'T DO THIS - Security Risk!
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-email@gmail.com"  // ❌ PII in version control
      }
    }
  }
}
```

### ✅ **Secure Configuration Options:**

#### Option 1: Environment Variables
Set the Apple ID via environment variable:

```bash
# Local development
export EAS_APPLE_APPLE_ID="your-apple-id@example.com"

# Or add to .env file (ensure .env is in .gitignore)
echo "EAS_APPLE_APPLE_ID=your-apple-id@example.com" >> .env
```

#### Option 2: Global EAS Configuration (Recommended)
Create a global configuration file at `~/.eas.json`:

```json
{
  "cli": {
    "appVersionSource": "remote"
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com"
      }
    }
  }
}
```

## CI/CD Pipeline Setup

### GitHub Actions Configuration

Add these secrets to your GitHub repository:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add these repository secrets:

```
EAS_APPLE_APPLE_ID=your-apple-id@example.com
EXPO_TOKEN=your-expo-token
```

### Example GitHub Actions workflow:

```yaml
name: EAS Submit
on:
  push:
    tags:
      - 'v*'

jobs:
  submit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Submit to App Store
        env:
          EAS_APPLE_APPLE_ID: ${{ secrets.EAS_APPLE_APPLE_ID }}
        run: |
          eas submit --platform ios --latest --non-interactive
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `EAS_APPLE_APPLE_ID` | Apple ID email for App Store submissions | Yes (for iOS) |
| `EXPO_TOKEN` | Expo authentication token for CI | Yes (for CI) |
| `EAS_PROJECT_ID` | Project ID (auto-detected) | No |

## Security Best Practices

### ✅ **Do:**
- Use environment variables or global config for credentials
- Keep `.env` files in `.gitignore`
- Use CI/CD secrets for automated deployments
- Regularly rotate authentication tokens
- Use least-privilege access principles

### ❌ **Don't:**
- Commit credentials to version control
- Share `.env` files containing real credentials
- Use production credentials in development
- Store secrets in comments or documentation

## Verification

After setup, verify your configuration:

```bash
# Check that Apple ID is not in eas.json
grep -r "appleId" eas.json
# Should return no results

# Test EAS submit (dry run)
eas submit --platform ios --latest --non-interactive --dry-run
```

## Troubleshooting

### Common Issues:

1. **"Apple ID not found" error:**
   - Ensure `EAS_APPLE_APPLE_ID` environment variable is set
   - Or configure `~/.eas.json` with your Apple ID

2. **Authentication failures in CI:**
   - Verify `EXPO_TOKEN` secret is set correctly
   - Check token hasn't expired

3. **Permission denied errors:**
   - Ensure Apple ID has proper App Store Connect access
   - Verify Team ID matches your developer account

---

*Last Updated: January 2025*
*Security Review: Required after any credential changes* 