// Test Service Worker
const CACHE_NAME = 'pwa-test-cache-v1';
const CACHE_ASSETS = [
  '/pwa-test/test-pwa-fixed.html',
  '/pwa-test/offline.html',
  '/pwa-test/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Test SW] Installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Test SW] Caching test assets');
        return cache.addAll(CACHE_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Test SW] Activating...');
  
  // Claim control of all clients immediately
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Test SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          console.log(`[Test SW] Serving from cache: ${event.request.url}`);
          return response;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Cache the response for future use
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache));
            return response;
          })
          .catch(() => {
            // If network fails and this is a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/pwa-test/offline.html');
            }
          });
      })
  );
});
