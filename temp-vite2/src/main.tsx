import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, message, App as AntdApp } from 'antd';
// Routing and history are handled by App component
import App from './App';
import './index.css';
import { register } from './serviceWorkerRegistration';
import UpdateNotification from './components/UpdateNotification';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Handle service worker updates
const handleServiceWorkerUpdate = () => {
  console.log('Service worker update available');
  // The UpdateNotification component will handle the UI for updates
};

// Register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  register({
    onSuccess: (registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    },
    onUpdate: handleServiceWorkerUpdate,
    onError: (error) => {
      console.error('Error during service worker registration:', error);
    },
    onOfflineReady: () => {
      console.log('App is ready for offline use');
    },
    onNewServiceWorker: () => {
      console.log('New service worker detected');
    },
  });
}

// Root component
const Root = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  useEffect(() => {
    // Get the current service worker registration
    const getRegistration = async () => {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);
      }
    };
    
    getRegistration();
  }, []);
  
  useEffect(() => {
    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      
      message.info({
        content: 'Install NoteFusion AI for a better experience!',
        duration: 5,
        key: 'install-prompt',
        onClick: () => {
          const promptEvent = (window as any).deferredPrompt;
          if (promptEvent) {
            promptEvent.prompt();
            promptEvent.userChoice.then((choiceResult: { outcome: string }) => {
              if (choiceResult.outcome === 'accepted') {
                message.success('App installed successfully!');
              } else {
                message.info('Installation dismissed');
              }
              (window as any).deferredPrompt = null;
            });
          }
        }
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
          },
        }}
      >
        <AntdApp>
          <App />
          {registration && (
            <UpdateNotification 
              registration={registration} 
              onUpdate={() => {
                // Additional logic to run when update is triggered
                console.log('Update initiated by user');
              }}
            />
          )}
        </AntdApp>
      </ConfigProvider>
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
};

// Render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}
