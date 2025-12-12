import { useState, useEffect } from 'react';
import pwaManager from '../utils/pwaUtils';

interface PWAState {
  isPWAInstalled: boolean;
  isOffline: boolean;
  canInstall: boolean;
  canNotify: boolean;
  updateAvailable: boolean;
  installPWA: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

export function usePWA(): PWAState {
  const [isPWAInstalled, setIsPWAInstalled] = useState<boolean>(pwaManager.isPWAInstalled());
  const [isOffline, setIsOffline] = useState<boolean>(pwaManager.isOffline());
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [canNotify, setCanNotify] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check if PWA is installed
    const checkPWAStatus = () => {
      setIsPWAInstalled(pwaManager.isPWAInstalled());
    };

    // Check online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Initial checks
    checkPWAStatus();
    setIsOffline(!navigator.onLine);
    
    // Check notification permission
    if ('Notification' in window) {
      setCanNotify(Notification.permission === 'granted');
    }

    // Set up event listeners
    window.addEventListener('appinstalled', checkPWAStatus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check for updates periodically
    const updateInterval = setInterval(() => {
      pwaManager.checkForUpdates();
    }, 60 * 60 * 1000); // Check for updates every hour

    // Clean up
    return () => {
      window.removeEventListener('appinstalled', checkPWAStatus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(updateInterval);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    const installed = await pwaManager.showInstallPrompt();
    if (installed) {
      setIsPWAInstalled(true);
    }
    return installed;
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    const permission = await pwaManager.requestNotificationPermission();
    setCanNotify(permission === 'granted');
    return permission;
  };

  const showNotification = (title: string, options?: NotificationOptions): void => {
    pwaManager.showNotification(title, options);
  };

  return {
    isPWAInstalled,
    isOffline,
    canInstall,
    canNotify,
    updateAvailable,
    installPWA,
    requestNotificationPermission,
    showNotification,
  };
}

// Usage example in a component:
/*
function MyComponent() {
  const { 
    isPWAInstalled, 
    isOffline, 
    canInstall, 
    installPWA,
    showNotification
  } = usePWA();

  return (
    <div>
      {!isPWAInstalled && canInstall && (
        <button onClick={installPWA}>
          Install App
        </button>
      )}
      {isOffline && <div>You are currently offline</div>}
    </div>
  );
}
*/
