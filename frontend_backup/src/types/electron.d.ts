// This file contains TypeScript declarations for the Electron API exposed via the preload script

declare global {
  interface Window {
    electron: {
      // Send a message to the main process
      send: (channel: string, ...args: unknown[]) => void;
      
      // Listen for messages from the main process
      receive: (
        channel: string, 
        listener: (...args: unknown[]) => void
      ) => (() => void) | void;
      
      // Send a message and wait for a response
      invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<T>;
      
      // Platform information
      platform: NodeJS.Platform;
      
      // Environment information
      isDev: boolean;
      
      // App version
      appVersion: string;
    };
  }
}

export {};
