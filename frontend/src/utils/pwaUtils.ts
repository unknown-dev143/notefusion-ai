// Service Worker registration and PWA utilities
class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isUpdateAvailable = false;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private setupListeners(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('[PWA] Install prompt available');
    });

    // Check for updates when the controller changes
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      console.log('[PWA] Controller changed, reloading...');
      window.location.reload();
    });
  }

  public async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported in this browser');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw-enhanced.js');
      console.log('[PWA] Service Worker registered');
      this.checkForUpdates();
      return this.registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      throw error;
    }
  }

  public async unregisterServiceWorker(): Promise<boolean> {
    if (!this.registration) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;
      return registration.unregister();
    }
    return this.registration.unregister();
  }

  public async checkForUpdates(): Promise<void> {
    if (!this.registration) {
      console.warn('[PWA] No active service worker registration');
      return;
    }

    try {
      await this.registration.update();
      console.log('[PWA] Checked for updates');
    } catch (error) {
      console.error('[PWA] Failed to check for updates:', error);
    }
  }

  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] Failed to show install prompt:', error);
      return false;
    }
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      console.warn('[PWA] Notifications are blocked');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('[PWA] Failed to request notification permission:', error);
      return 'denied';
    }
  }

  public showNotification(title: string, options?: NotificationOptions): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('[PWA] Cannot show notification - permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options,
      });

      notification.onclick = (event) => {
        event.preventDefault();
        if (options?.data?.url) {
          window.focus();
          window.open(options.data.url, '_blank');
        }
      };
    } catch (error) {
      console.error('[PWA] Failed to show notification:', error);
    }
  }

  public isUpdateAvailable(): boolean {
    return this.isUpdateAvailable;
  }

  public isPWAInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  }

  public isOffline(): boolean {
    return !navigator.onLine;
  }
}

export default PWAManager.getInstance();

// TypeScript interface for beforeinstallprompt event
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
