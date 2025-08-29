export interface Config {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  onOfflineReady?: () => void;
  onNewServiceWorker?: (registration: ServiceWorkerRegistration, newWorker: ServiceWorker) => void;
}

export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;

      if (import.meta.env.DEV) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('Service worker is ready for development.');
        });
      } else {
        // Always register the service worker in production
        registerValidSW(swUrl, config);
        
        // Check for updates every hour
        setInterval(() => {
          registerValidSW(swUrl, config);
        }, 60 * 60 * 1000);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        // Notify about new service worker
        if (config?.onNewServiceWorker) {
          config.onNewServiceWorker(registration, installingWorker);
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log('New content is available and will be used when all tabs are closed.');
              if (config?.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Content is now cached for offline use
              console.log('Content is cached for offline use.');
              if (config?.onSuccess) {
                config.onSuccess(registration);
              }
              
              // Notify that the app is ready for offline use
              if (config?.onOfflineReady) {
                config.onOfflineReady();
              }
            }
          } else if (installingWorker.state === 'redundant') {
            console.error('The installing service worker became redundant.');
            if (config?.onError) {
              config.onError(new Error('Service worker installation failed'));
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
      if (config && config.onError) {
        config.onError(error);
      }
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}

export async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return registration;
  }
  return null;
}

export async function getServiceWorkerRegistration() {
  if ('serviceWorker' in navigator) {
    return await navigator.serviceWorker.ready;
  }
  return null;
}
