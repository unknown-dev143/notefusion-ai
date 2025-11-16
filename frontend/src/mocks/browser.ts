import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Export a function to start the worker
export async function startMockServiceWorker() {
  const useMocks = (import.meta as any).env?.USE_MOCKS === 'true' || process.env.NODE_ENV === 'development';
  
  if (useMocks) {
    try {
      // Start the worker
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      console.log('Mock service worker started');
    } catch (error) {
      console.error('Error starting mock service worker:', error);
    }
  }
}

// Start the worker when this module is imported
startMockServiceWorker().catch(console.error);

// Export the worker instance for programmatic access
export default worker;
