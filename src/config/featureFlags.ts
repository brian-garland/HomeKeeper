// Feature flags for A/B testing and gradual rollout
export const FeatureFlags = {
  // Enable the new progressive onboarding flow
  // Set to false to use the existing MagicalOnboardingScreen
  useProgressiveOnboarding: true,
  
  // Future flags can be added here
} as const;

export type FeatureFlagKey = keyof typeof FeatureFlags;

// Helper function to check feature flags
export const isFeatureEnabled = (flag: FeatureFlagKey): boolean => {
  return FeatureFlags[flag];
};