/// <reference types="@types/serviceworker" />

declare module '*.worker' {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}

declare module 'service-worker:sw' {
  const content: string;
  export default content;
}

declare module 'service-worker:*' {
  const content: string;
  export default content;
}

// Extend the Window interface to include service worker types
interface Window {
  __WB_MANIFEST: string[];
  skipWaiting: () => void;
  clients: {
    claim: () => Promise<void>;
    matchAll: (options?: { includeUncontrolled?: boolean; type?: string }) => Promise<ReadonlyArray<Client>>;
  };
}

// Extend the ServiceWorkerRegistration interface if needed
interface ServiceWorkerRegistration {
  // Add any custom properties or methods if needed
  update?: () => Promise<void>;
}

// Add types for the service worker events
declare const self: ServiceWorkerGlobalScope;
