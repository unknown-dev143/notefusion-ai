interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

class AccessibilityService {
  private static instance: AccessibilityService;
  private settings: AccessibilitySettings = {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
    focusVisible: true,
    colorBlindness: 'none'
  };
  private listeners: ((settings: AccessibilitySettings) => void)[] = [];

  private constructor() {
    this.loadSettings();
    this.detectSystemPreferences();
    this.applySettings();
  }

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  private loadSettings() {
    try {
      const stored = localStorage.getItem('accessibilitySettings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error);
    }
  }

  private detectSystemPreferences() {
    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.settings.reducedMotion = true;
    }

    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.settings.highContrast = true;
    }

    // Detect screen reader
    const speechSynthesis = window.speechSynthesis;
    if (speechSynthesis) {
      this.settings.screenReader = true;
    }
  }

  private applySettings() {
    const root = document.documentElement;
    
    // Apply high contrast
    if (this.settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply large text
    if (this.settings.largeText) {
      root.classList.add('large-text');
      root.style.fontSize = '18px';
    } else {
      root.classList.remove('large-text');
      root.style.fontSize = '';
    }

    // Apply reduced motion
    if (this.settings.reducedMotion) {
      root.classList.add('reduced-motion');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.classList.remove('reduced-motion');
      root.style.removeProperty('--transition-duration');
    }

    // Apply focus visible
    if (this.settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Apply color blindness filters
    this.applyColorBlindnessFilter();

    // Announce to screen readers
    if (this.settings.screenReader) {
      this.announceToScreenReader('Accessibility settings updated');
    }
  }

  private applyColorBlindnessFilter() {
    const root = document.documentElement;
    
    // Remove existing filters
    root.style.removeProperty('--color-filter');
    
    switch (this.settings.colorBlindness) {
      case 'protanopia':
        root.style.setProperty('--color-filter', 'url(#protanopia-filter)');
        break;
      case 'deuteranopia':
        root.style.setProperty('--color-filter', 'url(#deuteranopia-filter)');
        break;
      case 'tritanopia':
        root.style.setProperty('--color-filter', 'url(#tritanopia-filter)');
        break;
      default:
        break;
    }
  }

  updateSetting<K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) {
    this.settings[key] = value;
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  updateSettings(newSettings: Partial<AccessibilitySettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  private saveSettings() {
    try {
      localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.settings));
  }

  onSettingsChange(callback: (settings: AccessibilitySettings) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  // Screen reader announcements
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Focus management
  trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }

  // Keyboard navigation enhancement
  enhanceKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Skip to main content with Alt + M
      if (e.altKey && e.key === 'm') {
        const mainContent = document.querySelector('main, [role="main"]');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
          this.announceToScreenReader('Jumped to main content');
        }
      }

      // Skip to navigation with Alt + N
      if (e.altKey && e.key === 'n') {
        const navigation = document.querySelector('nav, [role="navigation"]');
        if (navigation) {
          (navigation as HTMLElement).focus();
          this.announceToScreenReader('Jumped to navigation');
        }
      }

      // Toggle accessibility panel with Alt + A
      if (e.altKey && e.key === 'a') {
        this.toggleAccessibilityPanel();
      }
    });
  }

  private toggleAccessibilityPanel() {
    const existingPanel = document.getElementById('accessibility-panel');
    
    if (existingPanel) {
      document.body.removeChild(existingPanel);
      this.announceToScreenReader('Accessibility panel closed');
    } else {
      this.createAccessibilityPanel();
      this.announceToScreenReader('Accessibility panel opened');
    }
  }

  private createAccessibilityPanel() {
    const panel = document.createElement('div');
    panel.id = 'accessibility-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'accessibility-title');
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 400px;
    `;

    panel.innerHTML = `
      <h2 id="accessibility-title">Accessibility Settings</h2>
      <div class="accessibility-controls">
        <label>
          <input type="checkbox" ${this.settings.highContrast ? 'checked' : ''} 
                 data-setting="highContrast">
          High Contrast
        </label>
        <label>
          <input type="checkbox" ${this.settings.largeText ? 'checked' : ''} 
                 data-setting="largeText">
          Large Text
        </label>
        <label>
          <input type="checkbox" ${this.settings.reducedMotion ? 'checked' : ''} 
                 data-setting="reducedMotion">
          Reduced Motion
        </label>
        <label>
          <input type="checkbox" ${this.settings.focusVisible ? 'checked' : ''} 
                 data-setting="focusVisible">
          Focus Visible
        </label>
        <div>
          <label>Color Blindness:</label>
          <select data-setting="colorBlindness">
            <option value="none" ${this.settings.colorBlindness === 'none' ? 'selected' : ''}>None</option>
            <option value="protanopia" ${this.settings.colorBlindness === 'protanopia' ? 'selected' : ''}>Protanopia</option>
            <option value="deuteranopia" ${this.settings.colorBlindness === 'deuteranopia' ? 'selected' : ''}>Deuteranopia</option>
            <option value="tritanopia" ${this.settings.colorBlindness === 'tritanopia' ? 'selected' : ''}>Tritanopia</option>
          </select>
        </div>
        <button id="close-accessibility-panel">Close</button>
      </div>
    `;

    // Add event listeners
    panel.querySelectorAll('input[data-setting]').forEach(input => {
      input.addEventListener('change', (e) => {
        const setting = (e.target as HTMLElement).getAttribute('data-setting') as keyof AccessibilitySettings;
        const value = (e.target as HTMLInputElement).checked;
        this.updateSetting(setting, value as any);
      });
    });

    panel.querySelectorAll('select[data-setting]').forEach(select => {
      select.addEventListener('change', (e) => {
        const setting = (e.target as HTMLElement).getAttribute('data-setting') as keyof AccessibilitySettings;
        const value = (e.target as HTMLSelectElement).value;
        this.updateSetting(setting, value as any);
      });
    });

    panel.querySelector('#close-accessibility-panel')?.addEventListener('click', () => {
      this.toggleAccessibilityPanel();
    });

    document.body.appendChild(panel);
    this.trapFocus(panel);
  }

  // ARIA label helper
  generateAriaLabel(element: HTMLElement, fallback?: string): string {
    const existingLabel = element.getAttribute('aria-label');
    if (existingLabel) return existingLabel;

    const labelText = element.textContent?.trim();
    const title = element.getAttribute('title');
    const placeholder = (element as HTMLInputElement).placeholder;

    return labelText || title || placeholder || fallback || '';
  }

  // Color contrast checker
  checkColorContrast(foreground: string, background: string): { ratio: number; wcag: 'AAA' | 'AA' | 'fail' } {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fgRgb = hexToRgb(foreground);
    const bgRgb = hexToRgb(background);
    
    const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    
    const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
    
    let wcag: 'AAA' | 'AA' | 'fail';
    if (contrast >= 7) wcag = 'AAA';
    else if (contrast >= 4.5) wcag = 'AA';
    else wcag = 'fail';

    return { ratio: contrast, wcag };
  }

  // Initialize keyboard navigation
  init() {
    this.enhanceKeyboardNavigation();
  }
}

export default AccessibilityService.getInstance();
