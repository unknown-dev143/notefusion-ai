// Simple MSW browser setup
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup the worker
export const worker = setupWorker(...handlers);

// Start the worker in development
if (process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'bypass',
  }).then(() => {
    console.log('Mock service worker started');
  }).catch(error => {
    console.error('Error starting mock service worker:', error);
  });
}

export default worker;
