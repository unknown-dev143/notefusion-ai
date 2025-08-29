import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { startMockServiceWorker } from './mocks/browser';
<<<<<<< HEAD
import { applyBrowserCompatibilityFixes } from './utils/browserCompatibility';
import TestErrorBoundary from './components/TestErrorBoundary';
import AIAssistantProvider from './components/ai/AIAssistantProvider';
import './styles/browser-compatibility.css';

// Apply browser compatibility fixes
applyBrowserCompatibilityFixes();
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

// Initialize mock service worker in development
if (import.meta.env.DEV) {
  startMockServiceWorker().catch(console.error);
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
<<<<<<< HEAD
      <TestErrorBoundary>
        <AIAssistantProvider>
          <App />
        </AIAssistantProvider>
      </TestErrorBoundary>
=======
      <App />
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
