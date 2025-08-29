import React from 'react';
import ReactDOM from 'react-dom/client';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  </React.StrictMode>
);

// Configure service worker with callbacks
const onServiceWorkerUpdate = (registration) => {
  // This will be called when a new service worker is available
  console.log('New service worker available');
  
  // You can show a notification to the user here
  if (window.confirm('A new version of NoteFusion AI is available. Reload to update?')) {
    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
      // Send message to the waiting service worker to skip waiting
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Once the new service worker is activated, reload the page
      waitingServiceWorker.addEventListener('statechange', (event) => {
        if (event.target.state === 'activated') {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  }
};

// Register service worker for PWA with configuration
serviceWorkerRegistration.register({
  onUpdate: onServiceWorkerUpdate,
  onSuccess: (registration) => {
    console.log('Service worker registration successful', registration);
  },
  onError: (error) => {
    console.error('Service worker registration failed:', error);
  }
});

// Handle service worker messages
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'RELOAD_PAGE') {
      window.location.reload();
    }
  });
}