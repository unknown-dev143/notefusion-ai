import { useFeatureFlags } from './FeatureFlagProvider';

export const useFeatureFlag = (flagId: string, userId?: string): boolean => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagId, userId);
};

export const useFeatureValue = <T,>(
  flagId: string, 
  defaultValue: T,
  userId?: string
): T => {
  const { isEnabled, getValue } = useFeatureFlags();
  return isEnabled(flagId, userId) ? getValue(flagId, defaultValue) : defaultValue;
};
