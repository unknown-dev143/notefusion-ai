# Frontend Style Guide

This document outlines the styling conventions and best practices for the NoteFusion AI frontend.

## Table of Contents

1. [CSS Methodology](#css-methodology)
2. [File Structure](#file-structure)
3. [Naming Conventions](#naming-conventions)
4. [Component Styling](#component-styling)
5. [Theming](#theming)
6. [Responsive Design](#responsive-design)
7. [Performance](#performance)
8. [Accessibility](#accessibility)
9. [Code Formatting](#code-formatting)

## CSS Methodology

We use **CSS Modules** with the following principles:

- **Component-scoped styles** by default

- **BEM-like** naming convention for clarity

- **No global styles** except for CSS resets and base typography

- **CSS Custom Properties** for theming and reusable values

## File Structure

```plaintext
src/
  components/
    ComponentName/
      ComponentName.tsx
      ComponentName.module.css
      index.ts
  styles/
    base/
      _reset.css
      _typography.css
      _variables.css
    utils/
      _mixins.css
      _animations.css

```

## Naming Conventions

### Component Files

- Use PascalCase for component files: `ComponentName.tsx`

- Use kebab-case for CSS module files: `component-name.module.css`

### CSS Classes

- Use camelCase for class names in CSS modules

- Prefix utility classes with `u-` (e.g., `.u-flex`)

- Prefix state classes with `is-` or `has-` (e.g., `.isActive`, `.hasError`)

```css
/* Good */
.container {
  /* styles */
}

.activeItem {
  /* styles */
}

/* Avoid */
.container-style {
  /* styles */
}

```

## Component Styling

### Base Styles

- Use CSS Custom Properties for colors, spacing, and typography

- Define component-specific variables at the top of the module

```css
:root {
  --button-padding: 8px 16px;
  --button-radius: 4px;
}

.button {
  padding: var(--button-padding);
  border-radius: var(--button-radius);
}

```

### Composition

- Compose styles for better reusability

- Keep styles close to their components

```css
.commonButton {
  composes: button from '../../styles/buttons.css';
  /* additional styles */
}

```

## Theming

### Theme Variables

Define theme variables in `_variables.css`:

```css
:root {
  /* Colors */
  --color-primary: #1a73e8;
  --color-secondary: #34a853;
  --color-error: #ea4335;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, sans-serif;
  --font-size-base: 16px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

```

### Dark Mode

Use media query for dark mode:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #121212;
    --color-text: #ffffff;
  }
}

```

## Responsive Design

### Breakpoints

Define breakpoints as CSS Custom Properties:

```css
:root {
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
}

```

### Media Queries

Use mobile-first approach:

```css
.container {
  padding: var(--spacing-md);
  
  @media (min-width: 768px) {
    padding: var(--spacing-lg);
  }
}

```

## Performance

### Critical CSS

- Inline critical CSS in the `<head>`

- Load non-critical CSS asynchronously

### CSS Optimization

- Minimize use of expensive CSS properties (e.g., `box-shadow`, `filter`)

- Use `will-change` sparingly

- Avoid `@import` in CSS files

## Accessibility

### Focus States

Always provide visible focus states:

```css
.button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

```

### Reduced Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

```

## Code Formatting

### CSS

- 2 spaces for indentation

- Always include semicolons

- Group related properties together

- Order properties consistently:
  1. Layout (display, position, etc.)
  2. Box model (width, height, padding, margin)
  3. Typography
  4. Visual (colors, backgrounds, borders)
  5. Other

### Example

```css
.button {
  /* Layout */
  display: inline-flex;
  position: relative;
  
  /* Box Model */
  padding: var(--spacing-sm) var(--spacing-md);
  margin: 0;
  
  /* Typography */
  font-family: var(--font-primary);
  font-size: 1rem;
  line-height: 1.5;
  
  /* Visual */
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  
  /* Other */
  cursor: pointer;
  transition: background-color 0.2s;
}

```

## Linting

We use the following stylelint configuration:

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-prettier"
  ],
  "rules": {
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]+$",
    "declaration-block-no-redundant-longhand-properties": true,
    "shorthand-property-no-redundant-values": true
  }
}

```

## Best Practices

1. **Avoid** `!important`
2. **Use** semantic HTML elements
3. **Keep** selectors short and specific
4. **Document** complex CSS with comments
5. **Test** in multiple browsers
6. **Optimize** for performance
7. **Follow** WCAG guidelines for accessibility

## Resources

- [CSS Tricks](https://css-tricks.com/)

- [MDN Web Docs](https://developer.mozilla.org/)

- [A11Y Project](https://www.a11yproject.com/)

- [CSS Guidelines](https://cssguidelin.es/)
