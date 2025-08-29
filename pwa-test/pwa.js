// PWA Helper Class for NoteFusion AI
class PWAHelper {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = document.getElementById('install-button');
    this.installBanner = document.getElementById('install-banner');
    this.updateAvailable = false;
    
    this.init();
  }
  
  async init() {
    await this.registerServiceWorker();
    this.setupEventListeners();
    this.checkInstallStatus();
    this.checkDisplayMode();
  }
  
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported by this browser');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            this.showUpdateAvailable();
          }
        });
      });
      
      // Check if the page is being controlled by a service worker
      if (navigator.serviceWorker.controller) {
        console.log('This page is currently controlled by a service worker');
      } else {
        console.log('This page is not currently controlled by a service worker');
      }
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  
  setupEventListeners() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      // Show the install button
      this.showInstallBanner();
    });
    
    // Install button click handler
    if (this.installButton) {
      this.installButton.addEventListener('click', () => this.installApp());
    }
    
    // Update button click handler
    const updateButton = document.getElementById('update-button');
    if (updateButton) {
      updateButton.addEventListener('click', () => window.location.reload());
    }
    
    // Close banner button
    const closeBanner = document.getElementById('close-banner');
    if (closeBanner) {
      closeBanner.addEventListener('click', () => {
        this.hideInstallBanner();
      });
    }
  }
  
  showInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = 'block';
    }
  }
  
  showInstallBanner() {
    if (this.installBanner) {
      this.installBanner.style.display = 'flex';
    }
  }
  
  hideInstallBanner() {
    if (this.installBanner) {
      this.installBanner.style.display = 'none';
    }
  }
  
  showUpdateAvailable() {
    this.updateAvailable = true;
    const updateBanner = document.getElementById('update-available');
    if (updateBanner) {
      updateBanner.style.display = 'block';
    }
  }
  
  async installApp() {
    if (!this.deferredPrompt) {
      return;
    }
    
    // Show the install prompt
    this.deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    this.deferredPrompt = null;
    
    // Hide the install button
    if (this.installButton) {
      this.installButton.style.display = 'none';
    }
    
    this.hideInstallBanner();
  }
  
  checkInstallStatus() {
    // Check if the app is running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      console.log('App is running in standalone mode');
      // Hide install button if visible
      if (this.installButton) {
        this.installButton.style.display = 'none';
      }
      this.hideInstallBanner();
    }
    
    // Check if the app is installed
    window.addEventListener('appinstalled', (evt) => {
      console.log('App was installed');
      // Hide the install button
      if (this.installButton) {
        this.installButton.style.display = 'none';
      }
      this.hideInstallBanner();
    });
  }
  
  checkDisplayMode() {
    // Set initial display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.documentElement.setAttribute('data-display-mode', 'standalone');
    } else {
      document.documentElement.setAttribute('data-display-mode', 'browser');
    }

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      if (e.matches) {
        console.log('Display mode changed to standalone');
        document.documentElement.setAttribute('data-display-mode', 'standalone');
      } else {
        console.log('Display mode changed to browser');
        document.documentElement.setAttribute('data-display-mode', 'browser');
      }
    });
  }
}

// Initialize PWA Helper when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaHelper = new PWAHelper();
  });
} else {
  window.pwaHelper = new PWAHelper();
}

// Handle network status changes
window.addEventListener('online', () => {
  console.log('App is online');
  const offlineBanner = document.getElementById('offline-banner');
  if (offlineBanner) {
    offlineBanner.style.display = 'none';
  }
  
  // Show online status
  const onlineBanner = document.getElementById('online-banner');
  if (onlineBanner) {
    onlineBanner.style.display = 'block';
    setTimeout(() => {
      onlineBanner.style.display = 'none';
    }, 3000);
  }
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  const offlineBanner = document.getElementById('offline-banner');
  if (offlineBanner) {
    offlineBanner.style.display = 'block';
  }
});

// Check initial network status
if (!navigator.onLine) {
  window.dispatchEvent(new Event('offline'));
}
