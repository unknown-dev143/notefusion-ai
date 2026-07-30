/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-utils': ['axios', 'date-fns', 'lodash'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    open: false,
    proxy: {
      // Forwards /api/** to the backend.
      // Inside Docker the backend hostname is "api"; locally it is 127.0.0.1.
      '/api': {
        target: `http://${process.env.VITE_BACKEND_HOST ?? '127.0.0.1'}:${process.env.VITE_BACKEND_PORT ?? '8000'}`,
        changeOrigin: true,
        secure: false,
      },
      // Forwards /ws/** to the WebSocket endpoint
      '/ws': {
        target: `ws://${process.env.VITE_BACKEND_HOST ?? '127.0.0.1'}:${process.env.VITE_BACKEND_PORT ?? '8000'}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
