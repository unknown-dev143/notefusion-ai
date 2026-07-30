// Simple MSW browser setup
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup the worker
export const worker = setupWorker(...handlers);

// Start the worker function
export const startMockServiceWorker = async () => {
  if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass',
      });
      console.log('Mock service worker started');
    } catch (error) {
      console.error('Error starting mock service worker:', error);
      throw error;
    }
  }
};

export default worker;
