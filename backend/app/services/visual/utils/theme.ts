<<<<<<< HEAD
import { ThemeConfig } from '../types/theme';

export function getThemeValue(theme: ThemeConfig, path: string, fallback?: string): string {
    const parts = path.split('.');
    let value: any = theme;
    
    for (const part of parts) {
        if (value === undefined) return fallback || '';
        value = value[part];
    }
    
    return value || fallback || '';
}

export function isDarkMode(theme: ThemeConfig): boolean {
    return theme.theme === 'dark';
}

export function getContrastColor(color: string): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function createThemeVariables(theme: ThemeConfig): Record<string, string> {
    const variables: Record<string, string> = {};
    
    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
        if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, color]) => {
                variables[`--color-${key}-${subKey}`] = color;
            });
        }
    });
    
    // Typography
    Object.entries(theme.typography.sizes).forEach(([key, value]) => {
        variables[`--font-size-${key}`] = value;
    });
    
    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
        if (typeof value === 'number' || typeof value === 'string') {
            variables[`--spacing-${key}`] = String(value);
        }
    });
    
    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
        variables[`--shadow-${key}`] = value;
    });
    
    return variables;
}

export function applyTheme(theme: ThemeConfig, target: HTMLElement = document.documentElement): void {
    const variables = createThemeVariables(theme);
    Object.entries(variables).forEach(([key, value]) => {
        target.style.setProperty(key, value);
    });
    
    // Apply theme mode
    target.setAttribute('data-theme', theme.theme);
}

export function getResponsiveValue(theme: ThemeConfig, key: string, breakpoint: string): string | number {
    const responsive = theme.spacing.responsive;
    if (!responsive || !responsive[breakpoint]) return null;
    
    return responsive[breakpoint][key] || null;
}
=======
import { ThemeConfig } from '../types/theme';

export function getThemeValue(theme: ThemeConfig, path: string, fallback?: string): string {
    const parts = path.split('.');
    let value: any = theme;
    
    for (const part of parts) {
        if (value === undefined) return fallback || '';
        value = value[part];
    }
    
    return value || fallback || '';
}

export function isDarkMode(theme: ThemeConfig): boolean {
    return theme.theme === 'dark';
}

export function getContrastColor(color: string): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function createThemeVariables(theme: ThemeConfig): Record<string, string> {
    const variables: Record<string, string> = {};
    
    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
        if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, color]) => {
                variables[`--color-${key}-${subKey}`] = color;
            });
        }
    });
    
    // Typography
    Object.entries(theme.typography.sizes).forEach(([key, value]) => {
        variables[`--font-size-${key}`] = value;
    });
    
    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
        if (typeof value === 'number' || typeof value === 'string') {
            variables[`--spacing-${key}`] = String(value);
        }
    });
    
    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
        variables[`--shadow-${key}`] = value;
    });
    
    return variables;
}

export function applyTheme(theme: ThemeConfig, target: HTMLElement = document.documentElement): void {
    const variables = createThemeVariables(theme);
    Object.entries(variables).forEach(([key, value]) => {
        target.style.setProperty(key, value);
    });
    
    // Apply theme mode
    target.setAttribute('data-theme', theme.theme);
}

export function getResponsiveValue(theme: ThemeConfig, key: string, breakpoint: string): string | number {
    const responsive = theme.spacing.responsive;
    if (!responsive || !responsive[breakpoint]) return null;
    
    return responsive[breakpoint][key] || null;
}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
