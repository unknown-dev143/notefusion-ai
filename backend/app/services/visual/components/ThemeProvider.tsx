<<<<<<< HEAD
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig, ThemeMode } from '../types/theme';
import { applyTheme } from '../utils/theme';

interface ThemeContextType {
    theme: ThemeConfig;
    setTheme: (theme: ThemeConfig) => void;
    toggleTheme: () => void;
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
    children: React.ReactNode;
    initialTheme: ThemeConfig;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
    const [theme, setThemeState] = useState<ThemeConfig>(initialTheme);

    const setTheme = (newTheme: ThemeConfig) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
    };

    const toggleTheme = () => {
        const newMode: ThemeMode = theme.theme === 'light' ? 'dark' : 'light';
        const newTheme = {
            ...theme,
            theme: newMode,
        };
        setTheme(newTheme);
    };

    useEffect(() => {
        // Apply initial theme
        applyTheme(theme);

        // Listen for system color scheme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const newMode: ThemeMode = e.matches ? 'dark' : 'light';
            if (theme.theme !== newMode) {
                setTheme({
                    ...theme,
                    theme: newMode,
                });
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
=======
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig, ThemeMode } from '../types/theme';
import { applyTheme } from '../utils/theme';

interface ThemeContextType {
    theme: ThemeConfig;
    setTheme: (theme: ThemeConfig) => void;
    toggleTheme: () => void;
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
    children: React.ReactNode;
    initialTheme: ThemeConfig;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
    const [theme, setThemeState] = useState<ThemeConfig>(initialTheme);

    const setTheme = (newTheme: ThemeConfig) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
    };

    const toggleTheme = () => {
        const newMode: ThemeMode = theme.theme === 'light' ? 'dark' : 'light';
        const newTheme = {
            ...theme,
            theme: newMode,
        };
        setTheme(newTheme);
    };

    useEffect(() => {
        // Apply initial theme
        applyTheme(theme);

        // Listen for system color scheme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const newMode: ThemeMode = e.matches ? 'dark' : 'light';
            if (theme.theme !== newMode) {
                setTheme({
                    ...theme,
                    theme: newMode,
                });
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
