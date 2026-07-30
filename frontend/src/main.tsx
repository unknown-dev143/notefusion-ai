import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { startMockServiceWorker } from './mocks/browser';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

// Initialize mock service worker in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
  startMockServiceWorker().catch(console.error);
}

// Register service worker only in production to avoid dev/HMR issues.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw-enhanced.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] ServiceWorker registration failed:', error);
        });
      return;
    }

    // In development, remove stale service workers that can break resource loading.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  });
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary componentName="AppRoot">
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
