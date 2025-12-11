import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';

type ThemeMode = 'light' | 'dark' | 'auto' | 'blue' | 'purple' | 'green';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  availableThemes: ThemeMode[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'light';
  });

  const availableThemes: ThemeMode[] = ['light', 'dark', 'auto', 'blue', 'purple', 'green'];

  const toggleTheme = () => {
    const currentIndex = availableThemes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    const newMode = availableThemes[nextIndex];
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const isDark = themeMode === 'dark' || (themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    document.body.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const getAntdTheme = () => {
    switch (themeMode) {
      case 'dark':
        return {
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#1890ff',
          },
        };
      case 'blue':
        return {
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            colorBgBase: '#f0f8ff',
          },
        };
      case 'purple':
        return {
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#722ed1',
            colorBgBase: '#f9f0ff',
          },
        };
      case 'green':
        return {
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#52c41a',
            colorBgBase: '#f6ffed',
          },
        };
      case 'auto':
        return {
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
          },
        };
      default:
        return {
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
          },
        };
    }
  };

  const antdTheme = getAntdTheme();

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, setThemeMode, isDark, availableThemes }}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
