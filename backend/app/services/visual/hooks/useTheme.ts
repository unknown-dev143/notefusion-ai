import { useCallback, useMemo } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { getThemeValue, getResponsiveValue } from '../utils/theme';

export const useThemeValue = (path: string, fallback?: string) => {
    const { theme } = useTheme();
    return useMemo(() => getThemeValue(theme, path, fallback), [theme, path, fallback]);
};

export const useResponsiveValue = (key: string) => {
    const { theme } = useTheme();
    const breakpoint = useBreakpoint();
    return useMemo(
        () => getResponsiveValue(theme, key, breakpoint),
        [theme, key, breakpoint]
    );
};

export const useBreakpoint = () => {
    const { theme } = useTheme();
    const breakpoints = theme.breakpoints;

    return useMemo(() => {
        if (typeof window === 'undefined') return 'desktop';

        const mediaQueries = {
            mobile: `(max-width: ${breakpoints.mobile})`,
            tablet: `(min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.tablet})`,
            desktop: `(min-width: ${breakpoints.tablet})`
        };

        for (const [breakpoint, query] of Object.entries(mediaQueries)) {
            if (window.matchMedia(query).matches) {
                return breakpoint;
            }
        }

        return 'desktop';
    }, [breakpoints]);
};

export const useColorScheme = () => {
    const { theme, toggleTheme } = useTheme();

    const isDark = useMemo(() => theme.theme === 'dark', [theme.theme]);

    const toggle = useCallback(() => {
        toggleTheme();
    }, [toggleTheme]);

    return {
        isDark,
        toggle,
        colorScheme: theme.theme
    };
};
