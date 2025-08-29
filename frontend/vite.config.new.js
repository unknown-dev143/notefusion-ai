import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3001,
    open: true,
    host: true,
  },
  plugins: [
    react(),
  ],
});
