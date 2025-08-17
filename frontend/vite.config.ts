import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'NoteFusion AI',
        short_name: 'NoteFusion',
        description: 'AI-powered note taking application',
        theme_color: '#1a1a1a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'screenshots/dark-mode.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'NoteFusion AI Dark Mode',
          },
          {
            src: 'screenshots/mobile-view.png',
            sizes: '414x896',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'NoteFusion AI Mobile',
          },
        ],
        categories: ['productivity', 'utilities'],
        shortcuts: [
          {
            name: 'New Note',
            short_name: 'New',
            description: 'Create a new note',
            url: '/new',
            icons: [{ src: 'icons/plus.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,gif,ico,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.yourapi\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: process.env.NODE_ENV === 'development',
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: env.USE_MOCKS === 'true' ? undefined : {
      // Proxy API requests to the backend in production
      '/api': {
        target: env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  // Add mock service worker in development mode
  ...(env.USE_MOCKS === 'true' && {
    define: {
      'import.meta.env.USE_MOCKS': JSON.stringify('true'),
    },
  }),
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/setupTests.ts', '**/*.d.ts', '**/*.test.{ts,tsx}'],
    },
    },
  };
});
