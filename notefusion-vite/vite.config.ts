import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Filter and stringify only the VITE_* environment variables
  const envWithProcessPrefix = Object.entries(env).reduce(
    (prev, [key, val]) => {
      if (key.startsWith('VITE_')) {
        return {
          ...prev,
          [`import.meta.env.${key}`]: JSON.stringify(val),
        };
      }
      return prev;
    },
    {
      'process.env.NODE_ENV': JSON.stringify(mode),
    }
  );

  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
    ],
    server: {
      port: 3000,
      open: true,
      host: true,
      fs: {
        strict: true,
      },
    },
    build: {
      outDir: 'build',
      sourcemap: mode !== 'production',
      minify: 'esbuild',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            antd: ['antd', '@ant-design/icons'],
            vendor: ['@tanstack/react-query', 'react-hot-toast'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    define: envWithProcessPrefix,
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
        // Add this to handle Node.js global variables
        define: {
          global: 'globalThis',
        },
      },
    },
    // Add this to handle process shim
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // Add process shim
        process: 'process/browser',
        util: 'util',
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
  };
});
