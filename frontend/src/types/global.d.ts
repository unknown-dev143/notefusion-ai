// Type declarations for third-party modules
declare module 'react-window';
declare module 'react-virtualized-auto-sizer';

// Add any other missing type declarations here
interface Window {
  // Add any global window extensions here if needed
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
}
