// Service Worker Version
// Version and cache configuration
const CACHE_VERSION = 'v1.0.2'; // Increment this to test updates
const CACHE_NAME = `pwa-test-cache-${CACHE_VERSION}`;
const OLD_CACHES = []; // To store old cache names for cleanup

// Files to cache
const CACHE_FILES = [
  '/',
  '/index.html',
  '/install-test.html',
  '/update-test.html',
  '/test-offline.txt',
  '/manifest-new.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/test-sw-new.js'
];

// Install event - cache all necessary files
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Installing new version: ${CACHE_VERSION}`);
  
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  
  // Cache all required assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[Service Worker] Caching app version ${CACHE_VERSION}`);
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        // Notify the page that a new version is available
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NEW_VERSION_AVAILABLE',
              version: CACHE_VERSION
            });
          });
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then((response) => {
        // Return cached response if found
        if (response) {
          console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
          return response;
        }
        
        // For navigation requests, try the network first, then fall back to offline page
        if (event.request.mode === 'navigate') {
          return fetch(event.request)
            .then(response => {
              // Cache the response if it's valid
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache));
              }
              return response;
            })
            .catch(() => {
              // If offline and not found in cache, return the offline page
              return caches.match('/offline.html');
            });
        }
        
        // For other requests, try network first, then cache
        return fetch(event.request)
          .then(response => {
            // Cache the response if it's valid
            if (response && response.status === 200) {
              // Clone the response because it's a stream
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  console.log('Caching new resource:', event.request.url);
                  return cache.put(event.request, responseToCache);
                });
            }
            return response;
          }
        ).catch(error => {
          console.error('Fetch failed; returning offline page instead.', error);
          // If fetch fails and we're offline, return the offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          throw error;
        });
      })
  );
});

// Listen for messages from the page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push event listener
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('Error parsing push data:', e);
    data = { title: 'New Notification', body: 'You have a new notification' };
  }
  
  const title = data.title || 'New Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    data: data.data || {},
    actions: data.actions || []
  };
  
  // Show the notification
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
  
  // Notify all clients about the push
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PUSH_NOTIFICATION_RECEIVED',
        data: data
      });
    });
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received');
  
  // Close the notification
  event.notification.close();
  
  // Handle action buttons (if any)
  if (event.action) {
    console.log(`Action clicked: ${event.action}`);
    // Handle different actions here
  }
  
  // Open the app or a specific URL
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(clients => {
        // Check if the app is already open
        const client = clients.find(c => c.url === urlToOpen && 'focus' in c);
        if (client) {
          return client.focus();
        }
        
        // Open a new window if the app isn't open
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Your background sync logic here
      // For example, sync data with the server
      syncData()
        .then(() => console.log('Background sync completed'))
        .catch(error => console.error('Background sync failed:', error))
    );
  }
});

// Example sync function
async function syncData() {
  // Get data from IndexedDB or cache
  const data = await getDataToSync();
  
  // Send data to server
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to sync data');
  }
  
  // Clear synced data
  await clearSyncedData();
  
  // Notify clients
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETED',
      data: { success: true }
    });
  });
}

// Helper function to get data to sync
async function getDataToSync() {
  // Implement your logic to get data from IndexedDB or cache
  return [];
}

// Helper function to clear synced data
async function clearSyncedData() {
  // Implement your logic to clear synced data
}

// Handle messages from the page
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'cacheTest') {
    const url = event.data.url;
    const port = event.ports[0];
    
    caches.open(CACHE_NAME)
      .then(cache => cache.add(url))
      .then(() => {
        port.postMessage({ message: `Successfully cached ${url}` });
      })
      .catch(error => {
        port.postMessage({ error: `Failed to cache ${url}: ${error.message}` });
      });
  }
});

// Background sync event
self.addEventListener('sync', event => {
  if (event.tag === 'test-sync') {
    console.log('Background sync fired!');
    // Add your background sync logic here
  }
});

// Push notification event
self.addEventListener('push', event => {
  const title = 'PWA Test';
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
