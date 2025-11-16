<<<<<<< HEAD
export type ThemeMode = 'light' | 'dark';

export interface ColorSet {
    main: string;
    hover: string;
    focus: string;
    light: string;
    contrast?: string;
}

export interface TextColors {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
}

export interface BackgroundColors {
    main: string;
    surface: string;
    elevated: string;
    inset: string;
}

export interface BorderColors {
    light: string;
    medium: string;
    dark: string;
}

export interface StatusColor {
    main: string;
    hover: string;
    light: string;
}

export interface ThemeColors {
    primary: ColorSet;
    secondary: ColorSet;
    accent: ColorSet;
    background: BackgroundColors;
    text: TextColors;
    border: BorderColors;
    status: {
        error: StatusColor;
        warning: StatusColor;
        success: StatusColor;
    };
    dark: {
        background: BackgroundColors;
        text: TextColors;
        primary: ColorSet;
        secondary: ColorSet;
    };
}

export interface Typography {
    fonts: {
        main: string;
        headings: string;
        code: string;
    };
    weights: {
        light: number;
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    sizes: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
    };
    lineHeights: {
        tight: number;
        normal: number;
        relaxed: number;
        loose: number;
    };
}

export interface Logo {
    path: string;
    dark_path: string;
    fallback_text: string;
}

export interface Watermark {
    enabled: boolean;
    text: string;
    opacity: number;
}

export interface ResponsiveSpacing {
    paragraph: number;
    heading: number;
}

export interface Spacing {
    base: number;
    paragraph: number;
    heading: number;
    responsive: {
        mobile: ResponsiveSpacing;
        tablet: ResponsiveSpacing;
        desktop: ResponsiveSpacing;
    };
}

export interface Animation {
    durations: {
        instant: string;
        fast: string;
        normal: string;
        slow: string;
        slower: string;
    };
    easings: {
        easeInOut: string;
        easeOut: string;
        easeIn: string;
        sharp: string;
    };
    transitions: {
        default: string;
        fade: string;
        transform: string;
    };
}

export interface Shadows {
    none: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
}

export interface Layout {
    maxWidth: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
    };
    containerPadding: {
        mobile: string;
        tablet: string;
        desktop: string;
    };
    gridGap: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    zIndex: {
        below: number;
        base: number;
        above: number;
        dropdown: number;
        sticky: number;
        fixed: number;
        modal: number;
        popover: number;
        tooltip: number;
    };
}

export interface Borders {
    width: {
        none: string;
        thin: string;
        medium: string;
        thick: string;
    };
    radius: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        full: string;
    };
}

export interface Effects {
    opacity: {
        '0': string;
        '25': string;
        '50': string;
        '75': string;
        '100': string;
    };
    blur: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
}

export interface Accessibility {
    focusRing: {
        width: string;
        color: string;
        offset: string;
    };
    reducedMotion: {
        enabled: boolean;
        duration: string;
    };
}

export interface ThemeConfig {
    theme: ThemeMode;
    colors: ThemeColors;
    typography: Typography;
    logo: Logo;
    watermark: Watermark;
    spacing: Spacing;
    breakpoints: {
        mobile: string;
        tablet: string;
        desktop: string;
        large: string;
        xlarge: string;
    };
    animation: Animation;
    shadows: Shadows;
    layout: Layout;
    borders: Borders;
    effects: Effects;
    accessibility: Accessibility;
}
=======
export type ThemeMode = 'light' | 'dark';

export interface ColorSet {
    main: string;
    hover: string;
    focus: string;
    light: string;
    contrast?: string;
}

export interface TextColors {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
}

export interface BackgroundColors {
    main: string;
    surface: string;
    elevated: string;
    inset: string;
}

export interface BorderColors {
    light: string;
    medium: string;
    dark: string;
}

export interface StatusColor {
    main: string;
    hover: string;
    light: string;
}

export interface ThemeColors {
    primary: ColorSet;
    secondary: ColorSet;
    accent: ColorSet;
    background: BackgroundColors;
    text: TextColors;
    border: BorderColors;
    status: {
        error: StatusColor;
        warning: StatusColor;
        success: StatusColor;
    };
    dark: {
        background: BackgroundColors;
        text: TextColors;
        primary: ColorSet;
        secondary: ColorSet;
    };
}

export interface Typography {
    fonts: {
        main: string;
        headings: string;
        code: string;
    };
    weights: {
        light: number;
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    sizes: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
    };
    lineHeights: {
        tight: number;
        normal: number;
        relaxed: number;
        loose: number;
    };
}

export interface Logo {
    path: string;
    dark_path: string;
    fallback_text: string;
}

export interface Watermark {
    enabled: boolean;
    text: string;
    opacity: number;
}

export interface ResponsiveSpacing {
    paragraph: number;
    heading: number;
}

export interface Spacing {
    base: number;
    paragraph: number;
    heading: number;
    responsive: {
        mobile: ResponsiveSpacing;
        tablet: ResponsiveSpacing;
        desktop: ResponsiveSpacing;
    };
}

export interface Animation {
    durations: {
        instant: string;
        fast: string;
        normal: string;
        slow: string;
        slower: string;
    };
    easings: {
        easeInOut: string;
        easeOut: string;
        easeIn: string;
        sharp: string;
    };
    transitions: {
        default: string;
        fade: string;
        transform: string;
    };
}

export interface Shadows {
    none: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
}

export interface Layout {
    maxWidth: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
    };
    containerPadding: {
        mobile: string;
        tablet: string;
        desktop: string;
    };
    gridGap: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    zIndex: {
        below: number;
        base: number;
        above: number;
        dropdown: number;
        sticky: number;
        fixed: number;
        modal: number;
        popover: number;
        tooltip: number;
    };
}

export interface Borders {
    width: {
        none: string;
        thin: string;
        medium: string;
        thick: string;
    };
    radius: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        full: string;
    };
}

export interface Effects {
    opacity: {
        '0': string;
        '25': string;
        '50': string;
        '75': string;
        '100': string;
    };
    blur: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
}

export interface Accessibility {
    focusRing: {
        width: string;
        color: string;
        offset: string;
    };
    reducedMotion: {
        enabled: boolean;
        duration: string;
    };
}

export interface ThemeConfig {
    theme: ThemeMode;
    colors: ThemeColors;
    typography: Typography;
    logo: Logo;
    watermark: Watermark;
    spacing: Spacing;
    breakpoints: {
        mobile: string;
        tablet: string;
        desktop: string;
        large: string;
        xlarge: string;
    };
    animation: Animation;
    shadows: Shadows;
    layout: Layout;
    borders: Borders;
    effects: Effects;
    accessibility: Accessibility;
}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
