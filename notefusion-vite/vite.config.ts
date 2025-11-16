import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Environment variables for the client
  const envWithProcess = {
    ...env,
    VITE_WS_URL: env.VITE_WS_URL || 'ws://localhost:8007/ws',
    VITE_API_URL: env.VITE_API_URL || 'http://localhost:8000'
  };

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
        manifest: {
          name: 'NoteFusion AI',
          short_name: 'NoteFusion',
          description: 'AI-powered note taking application',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    
    // Environment variables configuration
    define: {
      'process.env': Object.fromEntries(
        Object.entries(envWithProcess)
          .filter(([key]) => key.startsWith('VITE_'))
          .map(([key, value]) => [key, JSON.stringify(value)])
      )
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      open: true,
      hmr: {
        clientPort: 5173,
        protocol: 'ws',
        host: 'localhost'
      }
    },
    
    preview: {
      port: 5173,
      strictPort: true
    },
    
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true
    },
    
    root: __dirname
  };
});
