const CACHE_NAME = 'notefusion-v2';
const STATIC_CACHE_NAME = 'notefusion-static-v2';
const DYNAMIC_CACHE_NAME = 'notefusion-dynamic-v2';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js'
];

// API endpoints to cache
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const IMAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Cache strategies
const cacheStrategies = {
  // Cache first for static assets
  static: (request) => {
    return caches.match(request).then(response => {
      if (response) {
        return response;
      }
      return fetch(request).then(response => {
        return caches.open(STATIC_CACHE_NAME).then(cache => {
          cache.put(request, response.clone());
          return response;
        });
      });
    });
  },

  // Network first for API calls
  api: (request) => {
    return fetch(request).then(response => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(request);
    });
  },

  // Cache first for images
  image: (request) => {
    return caches.match(request).then(response => {
      if (response) {
        // Check if cached image is still valid
        const cachedTime = response.headers.get('cached-time');
        if (cachedTime && (Date.now() - parseInt(cachedTime)) < IMAGE_CACHE_TTL) {
          return response;
        }
      }
      
      return fetch(request).then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          responseClone.headers.set('cached-time', Date.now().toString());
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request);
      });
    });
  }
};

// Determine cache strategy based on request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Static assets
  if (request.method === 'GET' && 
      (url.pathname.startsWith('/assets/') || 
       url.pathname === '/' || 
       url.pathname.endsWith('.html') ||
       url.pathname.endsWith('.css') ||
       url.pathname.endsWith('.js'))) {
    return cacheStrategies.static;
  }
  
  // API calls
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/')) {
    return cacheStrategies.api;
  }
  
  // Images
  if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return cacheStrategies.image;
  }
  
  // Default: network first
  return cacheStrategies.api;
}

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Fetch event - handle requests with appropriate cache strategy
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests in development
  if (self.location.hostname === 'localhost' && !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(getCacheStrategy(event.request)(event.request));
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old versions
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Cache cleanup completed');
      return self.clients.claim();
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline actions when back online
  return self.registration.showNotification('NoteFusion AI', {
    body: 'Your offline changes have been synced',
    icon: '/vite.svg',
    badge: '/favicon.ico'
  });
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from NoteFusion AI',
    icon: '/vite.svg',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/vite.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NoteFusion AI', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicSync', event => {
    if (event.tag === 'update-cache') {
      event.waitUntil(updateCache());
    }
  });
}

function updateCache() {
  // Update cached content periodically
  return caches.open(STATIC_CACHE_NAME).then(cache => {
    return cache.addAll(STATIC_ASSETS);
  });
}

// Message handling for cache management
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    updateCache();
  }
  
  if (event.data && event.data.type === 'CACHE_CLEAR') {
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Performance monitoring
self.addEventListener('fetch', event => {
  const startTime = Date.now();
  
  event.respondWith(
    fetch(event.request).then(response => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log slow requests
      if (duration > 1000) {
        console.log(`Slow request detected: ${event.request.url} took ${duration}ms`);
      }
      
      return response;
    }).catch(error => {
      console.error('Request failed:', error);
      throw error;
    })
  );
});
