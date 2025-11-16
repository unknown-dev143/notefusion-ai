// Service Worker for offline support
const CACHE_NAME = 'notefusion-offline-v1';
const OFFLINE_PAGE = '/offline.html';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest-clean.json',
  '/logo192.png',
  '/logo512.png',
  '/pwa-test.html',
  '/test-pwa.html',
  '/test-notifications.html',
  '/test-offline.html',
  OFFLINE_PAGE,
  '/offline-icon.svg'
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - Handle network requests with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser-sync
  if (event.request.method !== 'GET' || 
      event.request.url.includes('browser-sync') ||
      event.request.url.includes('sockjs-node')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request)
          .then((response) => {
            // If not in cache and it's a navigation request, show offline page
            if (!response && event.request.mode === 'navigate') {
              return caches.match(OFFLINE_PAGE);
            }
            return response;
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Update';
  const options = {
    body: data.body || 'You have new updates',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Handle messages from the page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_OFFLINE') {
    // Handle forced offline mode
    console.log('Service Worker: Offline mode forced');
  } else if (event.data && event.data.type === 'FORCE_ONLINE') {
    // Handle forced online mode
    console.log('Service Worker: Online mode restored');
  }
});

// Handle fetch errors with a custom offline page
const handleFetchError = async (event) => {
  // If it's a navigation request, return the offline page
  if (event.request.mode === 'navigate') {
    return caches.match(OFFLINE_PAGE);
  }
  
  // For other requests, try to return a fallback response
  if (event.request.destination === 'image') {
    return caches.match('/offline-icon.svg');
  }
  
  return new Response('Offline - No connection available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
};
