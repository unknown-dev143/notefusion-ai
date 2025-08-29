import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { resolve } from 'path';
import { pwaConfig } from './src/config/pwa.config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  const plugins = [
    react(),
    VitePWA({
      ...pwaConfig,
      // Only enable PWA in production or when explicitly enabled in dev
      devOptions: {
        ...pwaConfig.devOptions,
        enabled: isProduction || process.env.VITE_PWA_DEV === 'true'
      }
    })
  ];

  // Only include Sentry in production builds
  if (isProduction) {
    plugins.push(
      sentryVitePlugin({
        org: env.VITE_SENTRY_ORG,
        project: env.VITE_SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        release: {
          name: `notefusion-ai@${process.env.npm_package_version || '0.0.0'}`,
          // Source maps configuration
          uploadLegacySourcemaps: {
            paths: ['dist'],
            urlPrefix: '~/'
          }
        },
        // Don't upload source maps in development
        disable: !isProduction,
        // Clean up source maps after upload in production
        cleanArtifacts: isProduction
      })
    );
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 3000,
      open: true
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['antd', '@ant-design/icons']
          }
        }
      }
    },
    define: {
      'process.env': {}
    }
  };
});
