import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'pink';
export type FontFamily = 'inter' | 'roboto' | 'open-sans' | 'system-ui';
export type LayoutDensity = 'compact' | 'normal' | 'comfortable';

export interface ThemeSettings {
  theme: Theme;
  accentColor: AccentColor;
  fontFamily: FontFamily;
  layoutDensity: LayoutDensity;
  borderRadius: number;
  enableAnimations: boolean;
}

interface ThemeContextType extends ThemeSettings {
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'note-fusion-theme-settings';

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  theme: 'system',
  accentColor: 'blue',
  fontFamily: 'inter',
  layoutDensity: 'normal',
  borderRadius: 8,
  enableAnimations: true,
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);
  const { theme, accentColor, fontFamily, layoutDensity, borderRadius, enableAnimations } = settings;

  // Initialize theme from localStorage or default settings
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load theme settings', error);
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
    setIsMounted(true);
  }, []);

  // Update document class and CSS variables when settings change
  useEffect(() => {
    if (!isMounted) return;

    const root = window.document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Update theme
    const effectiveTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
    setResolvedTheme(effectiveTheme);
    
    // Apply theme class
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    // Apply accent color
    const accentColors = {
      blue: { light: '#1677ff', dark: '#4096ff' },
      green: { light: '#00a854', dark: '#52c41a' },
      purple: { light: '#722ed1', dark: '#9254de' },
      red: { light: '#f5222d', dark: '#ff4d4f' },
      orange: { light: '#fa8c16', dark: '#faad14' },
      pink: { light: '#eb2f96', dark: '#f759ab' },
    };
    
    const currentAccent = accentColors[accentColor] || accentColors.blue;
    
    // Apply CSS variables
    root.style.setProperty('--accent-color', currentAccent.light);
    root.style.setProperty('--accent-color-dark', currentAccent.dark);
    
    // Apply font family
    const fontFamilies = {
      'inter': '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      'roboto': '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
      'open-sans': '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      'system-ui': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    };
    
    root.style.setProperty('--font-family', fontFamilies[fontFamily] || fontFamilies.inter);
    
    // Apply layout density
    const densities = {
      'compact': { spacing: 8, fontSize: 13 },
      'normal': { spacing: 12, fontSize: 14 },
      'comfortable': { spacing: 16, fontSize: 15 },
    };
    
    const density = densities[layoutDensity] || densities.normal;
    root.style.setProperty('--spacing-unit', `${density.spacing}px`);
    root.style.setProperty('--font-size-base', `${density.fontSize}px`);
    
    // Apply border radius
    root.style.setProperty('--border-radius-base', `${borderRadius}px`);
    
    // Apply animations
    if (!enableAnimations) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    // Save settings to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
    
    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        effectiveTheme === 'dark' ? '#1e1e1e' : '#ffffff'
      );
    }
  }, [theme, isMounted]);

  // Handle system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const systemDark = mediaQuery.matches;
      setResolvedTheme(systemDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', systemDark);
      document.documentElement.classList.toggle('light', !systemDark);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => {
      const newTheme = prev.theme === 'dark' ? 'light' : 'dark';
      return { ...prev, theme: newTheme };
    });
  }, []);
  
  const resetToDefault = useCallback(() => {
    setSettings(DEFAULT_THEME_SETTINGS);
  }, []);

  // Prevent theme flicker on initial render
  if (!isMounted) {
    return null;
  }

  const contextValue = {
    ...settings,
    resolvedTheme,
    setTheme,
    updateSettings,
    toggleTheme,
    isDarkMode: resolvedTheme === 'dark',
    resetToDefault,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Add this to your global CSS or CSS-in-JS solution
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    'data-theme'?: string;
  }
}
