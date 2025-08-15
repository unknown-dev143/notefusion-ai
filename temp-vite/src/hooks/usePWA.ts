import { useState, useEffect } from 'react';
import { register, unregister, ServiceWorkerConfig } from '../serviceWorkerRegistration';

interface UsePWAOptions extends Omit<ServiceWorkerConfig, 'onReady'> {
  /**
   * Whether to enable the service worker in development mode
   * @default false
   */
  enableInDevelopment?: boolean;
  
  /**
   * Whether to automatically register the service worker
   * @default true
   */
  autoRegister?: boolean;
}

interface UsePWAReturn {
  /**
   * Whether the app is installed
   */
  isInstalled: boolean;
  
  /**
   * Whether an update is available
   */
  updateAvailable: boolean;
  
  /**
   * Whether the app is running in standalone mode
   */
  isStandalone: boolean;
  
  /**
   * Whether the app is running on iOS
   */
  isIos: boolean;
  
  /**
   * Function to manually register the service worker
   */
  registerServiceWorker: (config?: ServiceWorkerConfig) => Promise<ServiceWorkerRegistration | undefined>;
  
  /**
   * Function to unregister the service worker
   */
  unregisterServiceWorker: () => Promise<boolean>;
  
  /**
   * Function to check for updates
   */
  checkForUpdates: () => Promise<void>;
  
  /**
   * Function to reload the app to apply updates
   */
  reloadToUpdate: () => void;
}

/**
 * Custom hook to handle PWA installation and service worker registration
 * @param options - Configuration options
 * @returns PWA state and utility functions
 */
export function usePWA(options: UsePWAOptions = {}): UsePWAReturn {
  const {
    enableInDevelopment = false,
    autoRegister = true,
    onSuccess,
    onUpdate,
    onError,
  } = options;
  
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  // Check if running as a PWA and on iOS
  useEffect(() => {
    // Check if running in standalone mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    // @ts-ignore - standalone is not in the Navigator type yet
    const isStandaloneIos = 'standalone' in window.navigator && (window.navigator as any).standalone;
    
    setIsStandalone(isInStandaloneMode || isStandaloneIos);
    
    // Check if on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);
  }, []);

  // Register service worker
  useEffect(() => {
    if (!autoRegister) return;
    
    const shouldRegister = process.env.NODE_ENV === 'production' || enableInDevelopment;
    
    if (shouldRegister && 'serviceWorker' in navigator) {
      const config: ServiceWorkerConfig = {
        onSuccess: (reg) => {
          setRegistration(reg);
          setIsInstalled(true);
          onSuccess?.(reg);
        },
        onUpdate: (reg) => {
          setRegistration(reg);
          setUpdateAvailable(true);
          onUpdate?.(reg);
        },
        onError: (error) => {
          console.error('Service worker registration error:', error);
          onError?.(error);
        },
        onReady: (reg) => {
          setRegistration(reg);
        },
      };
      
      register(config);
      
      // Cleanup on unmount
      return () => {
        // Don't unregister in production to avoid breaking the service worker
        if (process.env.NODE_ENV !== 'production') {
          unregister().catch(console.error);
        }
      };
    }
  }, [autoRegister, enableInDevelopment, onError, onSuccess, onUpdate]);
  
  /**
   * Manually register the service worker
   */
  const registerServiceWorker = async (config?: ServiceWorkerConfig) => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser');
      return undefined;
    }
    
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      setRegistration(reg);
      setIsInstalled(true);
      config?.onSuccess?.(reg);
      return reg;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      config?.onError?.(error as Error);
      throw error;
    }
  };
  
  /**
   * Unregister the service worker
   */
  const unregisterServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser');
      return false;
    }
    
    try {
      const result = await unregister();
      setRegistration(null);
      setIsInstalled(false);
      setUpdateAvailable(false);
      return result;
    } catch (error) {
      console.error('Failed to unregister service worker:', error);
      throw error;
    }
  };
  
  /**
   * Check for updates
   */
  const checkForUpdates = async () => {
    if (!registration) {
      console.warn('No service worker registration found');
      return;
    }
    
    try {
      await registration.update();
    } catch (error) {
      console.error('Error checking for updates:', error);
      throw error;
    }
  };
  
  /**
   * Reload the page to apply updates
   */
  const reloadToUpdate = () => {
    if (updateAvailable && registration?.waiting) {
      // Notify the service worker to skip waiting and activate the new worker
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page when the new service worker takes control
      const reloadPage = () => window.location.reload();
      navigator.serviceWorker.addEventListener('controllerchange', reloadPage, { once: true });
      
      // Fallback in case the controllerchange event doesn't fire
      setTimeout(reloadPage, 1000);
    } else {
      window.location.reload();
    }
  };
  
  return {
    isInstalled,
    updateAvailable,
    isStandalone,
    isIos,
    registerServiceWorker,
    unregisterServiceWorker,
    checkForUpdates,
    reloadToUpdate,
  };
}

export default usePWA;
