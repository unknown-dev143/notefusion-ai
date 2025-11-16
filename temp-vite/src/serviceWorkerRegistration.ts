/**
 * Service Worker Registration
 * 
 * This file is used to register and manage the service worker for the PWA
 */

// Type definitions for service worker events
declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
    'appinstalled': Event;
  }

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }

  // Extend ImportMetaEnv to include our custom env variables
  interface ImportMetaEnv {
    readonly PROD: boolean;
    readonly BASE_URL: string;
  }
}

// Constants
const APP_NAME = 'NoteFusion AI';

// Check if running on localhost
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})){3}$/.test(window.location.hostname)
);

// Types
type ServiceWorkerConfig = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onReady?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  onOfflineReady?: () => void;
  onNeedRefresh?: () => void;
};

/**
 * Register the service worker with enhanced functionality
 * @param config - Configuration object with callbacks
 */
export function register(config?: ServiceWorkerConfig) {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);
    
    // Don't register service worker if it's not on the same origin
    if (publicUrl.origin !== window.location.origin) {
      console.warn(
        'Service worker not registered: App is not served from the same origin as the service worker.'
      );
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;
      
      // Handle service worker error
      const handleError = (error: Error) => {
        console.error('Service worker registration failed:', error);
        if (config?.onError) {
          config.onError(error);
        }
      };

      // Register service worker
      if (isLocalhost) {
        // On localhost, check if service worker exists and validate it
        checkValidServiceWorker(swUrl, config);
        
        // Additional logging for local development
        navigator.serviceWorker.ready
          .then(registration => {
            console.log(
              `${APP_NAME} is being served cache-first by a service worker.`
            );
            config?.onReady?.(registration);
          })
          .catch(handleError);
      } else {
        // Production environment - register service worker
        registerValidSW(swUrl, config);
      }

      // Listen for controller changes (updates)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    });

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        // Handle skip waiting logic if needed
        navigator.serviceWorker.ready.then(registration => {
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        });
      }
    });
  }
}

/**
 * Register and validate the service worker with enhanced error handling
 */
async function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
  try {
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
      updateViaCache: 'none',
    });

    // Handle updates
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.onstatechange = () => {
        switch (installingWorker.state) {
          case 'installed':
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New content is available; please refresh.');
              if (config?.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // App is ready for offline use
              console.log('Content is now available offline!');
              config?.onSuccess?.(registration);
            }
            break;
          
          case 'redundant':
            console.error('The installing service worker became redundant.');
            config?.onError?.(new Error('Service worker installation failed'));
            break;
        }
      };
    };

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            if (config?.onUpdate) {
              config.onUpdate(registration);
            }
          }
        });
      }
    });

    // Check for updates periodically
    const updateInterval = setInterval(async () => {
      try {
        // Check if registration is still valid and has update method
        if (registration && typeof registration.update === 'function') {
          await registration.update();
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
        clearInterval(updateInterval);
        
        // Notify about the error
        if (config && config.onError) {
          const errorMessage = error instanceof Error 
            ? error 
            : new Error('Error checking for updates');
          config.onError(errorMessage);
        }
      }
    }, 60 * 60 * 1000); // Check every hour

    // Handle controller change (when a new service worker takes over)
    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    
    // Only add the event listener if we have a valid service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    return registration;
  } catch (error) {
    const errorMessage = error instanceof Error ? error : new Error('Service worker registration failed');
    console.error('Service worker registration failed:', errorMessage);
    if (config?.onError) {
      config.onError(errorMessage);
    }
    throw errorMessage;
  }
}

/**
 * Check if the service worker is valid and handle different scenarios
 */
async function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
  try {
    // Try to fetch the service worker file
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
      cache: 'no-store',
    });

    // Ensure service worker exists and is a valid JS file
    const contentType = response.headers.get('content-type') || '';
    
    if (response.status === 404 || !contentType.includes('javascript')) {
      // No valid service worker found - unregister and reload
      console.log('No valid service worker found at', swUrl);
      
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.unregister();
        console.log('Unregistered invalid service worker');
      } catch (error) {
        console.error('Error unregistering service worker:', error);
      }
      
      // Reload the page to get the latest version
      window.location.reload();
      return;
    }
    
    // Service worker looks good - proceed with registration
    console.log('Service worker is valid, proceeding with registration');
    await registerValidSW(swUrl, config);
    
  } catch (error) {
    // Handle offline scenario
    if (!navigator.onLine) {
      console.log('App is offline. Using cached version.');
      config?.onOfflineReady?.();
      return;
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error : new Error('Error checking service worker');
    console.error('Error checking service worker:', errorMessage);
    if (config?.onError) {
      config.onError(errorMessage);
    }
  }
}

// Export the service worker registration function as default
export default register;

/**
 * Unregister the service worker and clean up caches
 */
export async function unregister() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Unregister the service worker
    const unregistered = await registration.unregister();
    
    if (unregistered) {
      console.log('Service worker unregistered');
      
      // Clean up caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Cleared service worker caches');
      }
    }
    
    return unregistered;
  } catch (error) {
    console.error('Error during service worker unregistration:', error);
    throw error;
  }
}

// Export a function to check for updates
export async function checkForUpdates(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
    console.warn('Service workers are not supported in this browser');
    return false;
  }
  
  try {
    // Ensure service worker is supported and available
    if (!navigator.serviceWorker) {
      console.warn('Service worker not supported in this browser');
      return false;
    }
    
    // Get the service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // If we have a valid registration, check for updates
    if (registration && typeof registration.update === 'function') {
      await registration.update();
      return true;
    }
    
    console.warn('Service worker registration not available');
    return false;
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
}

// Handle offline state changes
const handleOfflineState = () => {
  const handleOnline = () => {
    // Try to update the service worker when coming back online
    checkForUpdates().catch(console.error);
    window.removeEventListener('online', handleOnline);
  };
  
  window.addEventListener('online', handleOnline);
};

// Initialize offline state handling when in browser environment
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    handleOfflineState();
  } catch (error) {
    console.error('Error initializing offline state handling:', error);
  }
}
