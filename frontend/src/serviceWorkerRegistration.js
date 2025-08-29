// Config for service worker
const SW_CONFIG = {
  // Check for updates every 1 hour (in milliseconds)
  CHECK_UPDATE_INTERVAL: 60 * 60 * 1000,
  // Cache name for static assets
  CACHE_NAME: 'notefusion-ai-cache-v1',
  // Version of the service worker
  VERSION: '1.0.0'
};

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    
    // Our service worker won't work if PUBLIC_URL is on a different origin
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service worker.\n' +
            'To learn more, visit https://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

async function registerValidSW(swUrl, config) {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker == null) {
        return;
      }
      
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content is available and will be used when all tabs for this page are closed.
            console.log('New content is available; please refresh.');
            
            // Execute callback
            if (config && config.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            // Content is cached for offline use.
            console.log('Content is cached for offline use.');
            
            // Execute callback
            if (config && config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      };
    };
    
    // Set up periodic update checks
    setInterval(() => {
      registration.update().catch(err => {
        console.log('ServiceWorker update check failed:', err);
      });
    }, SW_CONFIG.CHECK_UPDATE_INTERVAL);
    
  } catch (error) {
    console.error('Error during service worker registration:', error);
    
    // Execute error callback if provided
    if (config && config.onError) {
      config.onError(error);
    }
  }
}

async function checkValidServiceWorker(swUrl, config) {
  try {
    // Check if the service worker can be found. If it can't reload the page.
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    });
    
    // Ensure service worker exists, and that we really are getting a JS file.
    const contentType = response.headers.get('content-type');
    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf('javascript') === -1)
    ) {
      // No service worker found. Probably a different app. Reload the page.
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      window.location.reload();
    } else {
      // Service worker found. Proceed as normal.
      await registerValidSW(swUrl, config);
    }
  } catch (error) {
    console.log('No internet connection found. App is running in offline mode.');
  }
}

// Check if running on localhost
export const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.0/8 are considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
