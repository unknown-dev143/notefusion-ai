import React, { createContext, useContext, useEffect, useState } from 'react';

export type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'boolean' | 'percentage' | 'user';
  value?: any;
  enabledForUsers?: string[];
  percentage?: number;
};

type FeatureFlags = Record<string, FeatureFlag>;

type FeatureFlagContextType = {
  flags: FeatureFlags;
  isEnabled: (flagId: string, userId?: string) => boolean;
  getValue: <T>(flagId: string, defaultValue: T) => T;
  refreshFlags: () => Promise<void>;
};

const defaultFlags: FeatureFlags = {
  // Example feature flags - these would come from your backend in a real app
  'ai-summarization': {
    id: 'ai-summarization',
    name: 'AI Summarization',
    description: 'Enable AI-powered note summarization',
    enabled: true,
    type: 'boolean',
  },
  'collaborative-editing': {
    id: 'collaborative-editing',
    name: 'Collaborative Editing',
    description: 'Enable real-time collaborative note editing',
    enabled: false,
    type: 'boolean',
  },
  'dark-mode': {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Enable dark theme',
    enabled: true,
    type: 'boolean',
  },
  'feature-flags-page': {
    id: 'feature-flags-page',
    name: 'Feature Flags Page',
    description: 'Enable the feature flags management page',
    enabled: true,
    type: 'boolean',
  },
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, this would fetch from your backend
  const fetchFlags = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/feature-flags');
      // const data = await response.json();
      // setFlags(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const isEnabled = (flagId: string, userId?: string): boolean => {
    const flag = flags[flagId];
    if (!flag) return false;
    
    if (!flag.enabled) return false;

    // Check user-specific flags
    if (flag.type === 'user' && userId && flag.enabledForUsers) {
      return flag.enabledForUsers.includes(userId);
    }

    // Check percentage-based rollout
    if (flag.type === 'percentage' && flag.percentage !== undefined) {
      // Simple hash function for consistent user assignment
      const hash = userId ? 
        Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100 :
        Math.floor(Math.random() * 100);
      
      return hash < (flag.percentage || 0);
    }

    return flag.enabled;
  };

  const getValue = <T,>(flagId: string, defaultValue: T): T => {
    const flag = flags[flagId];
    return flag?.value !== undefined ? flag.value : defaultValue;
  };

  const refreshFlags = async () => {
    await fetchFlags();
  };

  if (isLoading) {
    return <div>Loading feature flags...</div>;
  }

  return (
    <FeatureFlagContext.Provider value={{ flags, isEnabled, getValue, refreshFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

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
