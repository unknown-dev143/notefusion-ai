# Browser Compatibility Guide

This document outlines the browser compatibility approach for NoteFusion AI, including supported browsers, known issues, and workarounds.

## Supported Browsers

- **Chrome** (latest 2 versions)
- **Firefox** (latest 2 versions)
- **Safari** (latest 2 versions)
- **Edge** (latest 2 versions)
- **Mobile Safari** (iOS 13+)
- **Chrome for Android** (latest 2 versions)

## Known Issues and Workarounds

### 1. Theme Color Meta Tag

#### Issue

`theme-color` meta tag is not supported in Firefox and Opera.

#### Workaround

We use a JavaScript-based fallback that applies the theme color as a CSS variable.

```javascript
// Fallback for browsers that don't support theme-color
if (window.CSS && CSS.supports('color', 'var(--test)')) {
  document.documentElement.style.setProperty('--theme-color', '#1a73e8');
  document.body.classList.add('theme-color-fallback');
}
```

### 2. Text Size Adjustment

#### Text Size Adjustment Issue

`text-size-adjust` property is not supported in Firefox and Safari.

#### Text Size Adjustment Workaround

Use the following combination of properties for better cross-browser support:

```css
.text-element {
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
```

### 3. CSS Custom Properties

#### CSS Custom Properties Issue

Some older browsers don't support CSS custom properties (variables).

#### CSS Custom Properties Workaround

Always provide fallback values:

```css
.element {
  color: #1a73e8; /* Fallback */
  color: var(--primary-color, #1a73e8);
}
```

## Feature Detection

We use the following feature detection pattern to handle browser differences:

```javascript
// Check if a feature is supported
function isFeatureSupported(feature) {
  return CSS.supports(feature, 'initial-value');
}

// Usage
if (isFeatureSupported('display: grid')) {
  // Use CSS Grid
} else {
  // Fallback to flexbox or other layout
}
```

## Testing

### Manual Testing

1. Test in all major browsers
2. Test on different screen sizes
3. Test with different zoom levels

### Automated Testing

We use the following tools for automated testing:

- **Jest** for unit tests
- **Cypress** for end-to-end tests
- **BrowserStack** for cross-browser testing

## Performance Considerations

1. **Vendor Prefixes:** We use Autoprefixer to handle vendor prefixes automatically.
2. **Polyfills:** Only load necessary polyfills based on feature detection.
3. **Progressive Enhancement:** Core functionality should work in all browsers, with enhanced features in modern browsers.

## Browser-Specific Fixes

### Firefox

```css
@-moz-document url-prefix() {
  /* Firefox-specific styles */
  .firefox-fix {
    /* Fixes for Firefox */
  }
}
```

### Safari

```css
/* Safari 10.1+ */
@media not all and (min-resolution: 0.001dpcm) {
  @supports (-webkit-appearance: none) and (stroke-color: transparent) {
    .safari-fix {
      /* Fixes for Safari */
    }
  }
}
```

### Edge/IE

```css
@supports (-ms-ime-align: auto) {
  .edge-fix {
    /* Fixes for Edge/IE */
  }
}
```

## Resources

- [Can I Use](https://caniuse.com/) - For checking browser support
- [MDN Web Docs](https://developer.mozilla.org/) - For web standards documentation
- [BrowserStack](https://www.browserstack.com/) - For cross-browser testing
