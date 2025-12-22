import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true,
  },
  define: {
    'process.env': {}
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons'],
          charts: ['recharts'],
          editor: ['@uiw/react-md-editor', 'react-markdown'],
          router: ['react-router-dom'],
          utils: ['lodash', 'dayjs', 'uuid', 'firebase', 'exceljs']
        }
      }
    },
    chunkFileNames: 'assets/[name]-[hash].js',
    entryFileNames: 'assets/[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash].[ext]',
    sourcemap: false, // Disable source maps for faster builds
    minify: 'esbuild', // Use esbuild for faster minification
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'react-router-dom']
  }
});
