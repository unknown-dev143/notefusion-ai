/**
 * Browser compatibility utilities
 * Handles browser-specific workarounds and feature detection
 */

/**
 * Apply browser compatibility fixes
 * Should be called during app initialization
 */
export function applyBrowserCompatibilityFixes() {
  // Add theme-color meta tag with browser-specific workarounds
  addThemeColorSupport();
  
  // Add any other browser compatibility fixes here
  addTextSizeAdjustFix();
}

/**
 * Add theme-color meta tag with browser-specific workarounds
 */
function addThemeColorSupport() {
  // Check if theme-color is supported
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  
  if (!themeColorMeta) {
    // Create theme-color meta tag if it doesn't exist
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#1890ff'; // Default theme color
    document.head.appendChild(meta);
  }
  
  // For browsers that don't support theme-color, we can add a workaround
  // by setting a background color on the html/body elements
  if (!supportsThemeColor()) {
    document.documentElement.style.setProperty('--fallback-theme-color', '#1890ff');
    document.body.classList.add('theme-color-fallback');
  }
}

/**
 * Check if the browser supports the theme-color meta tag
 */
function supportsThemeColor(): boolean {
  // @ts-ignore - Chrome and Edge support this
  return 'theme' in document.documentElement.style || 
         // @ts-ignore - Safari supports this
         'theme-color' in document.documentElement.style;
}

/**
 * Add text-size-adjust fix for mobile browsers
 */
function addTextSizeAdjustFix() {
  // Add a class to the html element that can be used for mobile-specific styles
  if (isMobileBrowser()) {
    document.documentElement.classList.add('mobile-browser');
  }
}

/**
 * Check if the current browser is a mobile browser
 */
function isMobileBrowser(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if the current browser is Firefox
 */
function isFirefox(): boolean {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

/**
 * Check if the current browser is Safari
 */
function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export default {
  applyBrowserCompatibilityFixes,
  supportsThemeColor,
  isMobileBrowser,
  isFirefox,
  isSafari
};
