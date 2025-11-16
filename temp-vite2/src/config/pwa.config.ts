import type { VitePWAOptions } from 'vite-plugin-pwa';

export const pwaConfig: Partial<VitePWAOptions> = {
  // Use our custom service worker
  srcDir: 'public',
  filename: 'sw.js',
  strategies: 'injectManifest',
  injectManifest: {
    globPatterns: [
      '**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,json}',
    ],
  },
  
  // PWA manifest configuration
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: 'NoteFusion AI',
    short_name: 'NoteFusion',
    description: 'Your intelligent note-taking assistant',
    theme_color: '#1890ff',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    orientation: 'portrait',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    screenshots: [
      {
        src: 'screenshot-desktop.png',
        sizes: '1280x800',
        type: 'image/png',
        form_factor: 'wide',
        label: 'NoteFusion AI Desktop View'
      },
      {
        src: 'screenshot-mobile.png',
        sizes: '375x667',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'NoteFusion AI Mobile View'
      }
    ]
  },
  
  // Workbox configuration
  workbox: {
    sourcemap: true,
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,
    navigateFallback: '/index.html',
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
          }
        }
      },
      {
        urlPattern: /^https?:\/\/.*\.(?:json|xml)$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'data-cache',
          cacheableResponse: {
            statuses: [0, 200]
          },
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
          }
        }
      }
    ]
  },
  
  // Development options
  devOptions: {
    enabled: true,
    type: 'module',
    navigateFallback: 'index.html',
  },
  
  // PWA features
  includeManifestIcons: true,
  manifestFilename: 'manifest.json',
  minify: true,
  
  // PWA installation prompt
  injectRegister: 'auto'
} as const;
