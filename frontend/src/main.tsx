import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { startMockServiceWorker } from './mocks/browser';
import { applyBrowserCompatibilityFixes } from './utils/browserCompatibility';
import TestErrorBoundary from './components/TestErrorBoundary';
import AIAssistantProvider from './components/ai/AIAssistantProvider';
import './styles/browser-compatibility.css';

// Apply browser compatibility fixes
applyBrowserCompatibilityFixes();

// Initialize mock service worker in development
if (import.meta.env.DEV) {
  startMockServiceWorker().catch(console.error);
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <TestErrorBoundary>
        <AIAssistantProvider>
          <App />
        </AIAssistantProvider>
      </TestErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
