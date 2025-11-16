// Service Worker for NoteFusion AI - Enhanced Version
const CACHE_NAME = 'notefusion-ai-v2';
const API_CACHE_NAME = 'notefusion-api-cache-v1';
const OFFLINE_PAGE = '/offline.html';
const CACHEABLE_ROUTES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  OFFLINE_PAGE
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(CACHEABLE_ROUTES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Network First, then Cache strategy for API calls
const apiFirst = async (request) => {
  try {
    // Try to fetch from network first
    const networkResponse = await fetch(request);
    
    // If successful, update cache and return response
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If network fails, try to get from cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || Response.error();
  }
};

// Cache First, then Network strategy for static assets
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
};

// Handle fetch events with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  
  // API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiFirst(request));
    return;
  }
  
  // Static assets
  if (CACHEABLE_ROUTES.some(route => url.pathname.endsWith(route))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // For navigation requests, show offline page if both network and cache fail
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }
  
  // For all other requests, try network first, then cache
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    console.log('[Service Worker] Background sync for notes');
    // TODO: Implement background sync logic
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const title = data.title || 'New Update';
  const options = {
    body: data.body || 'You have new updates in NoteFusion AI',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Handle install prompt
self.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the default install prompt
  event.preventDefault();
  // Store the event for later use
  self.deferredPrompt = event;
  
  // You can show your custom install button here
  console.log('[Service Worker] PWA install prompt available');
});
