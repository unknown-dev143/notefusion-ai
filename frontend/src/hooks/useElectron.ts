import { useEffect, useCallback } from 'react';
import { isElectron } from '../utils/electron-utils';

type ElectronAPI = typeof window.electron;

export const useElectron = () => {
  // Check if running in Electron
  const isElectronAvailable = isElectron();
  
  // Type-safe send function
  const send = useCallback(<T = unknown>(
    channel: string, 
    ...args: unknown[]
  ): Promise<T> => {
    if (!isElectronAvailable) {
      console.warn(`Attempted to send IPC message '${channel}' but Electron is not available`);
      return Promise.reject(new Error('Electron is not available'));
    }
    
    return window.electron.invoke<T>(channel, ...args);
  }, [isElectronAvailable]);
  
  // Type-safe receive function
  const receive = useCallback((
    channel: string, 
    listener: (...args: unknown[]) => void
  ) => {
    if (!isElectronAvailable) {
      console.warn(`Attempted to listen to IPC channel '${channel}' but Electron is not available`);
      return () => {};
    }
    
    return window.electron.receive(channel, listener) || (() => {});
  }, [isElectronAvailable]);
  
  // Get platform information
  const getPlatform = useCallback((): NodeJS.Platform | undefined => {
    if (!isElectronAvailable) return undefined;
    return window.electron.platform;
  }, [isElectronAvailable]);
  
  // Check if running in development
  const isDev = useCallback((): boolean => {
    if (!isElectronAvailable) return process.env.NODE_ENV === 'development';
    return window.electron.isDev;
  }, [isElectronAvailable]);
  
  // Get app version
  const getAppVersion = useCallback((): string => {
    if (!isElectronAvailable) return process.env.npm_package_version || '1.0.0';
    return window.electron.appVersion;
  }, [isElectronAvailable]);
  
  return {
    isAvailable: isElectronAvailable,
    send,
    receive,
    getPlatform,
    isDev,
    getAppVersion,
  };
};

// Example usage:
/*
const MyComponent = () => {
  const { isAvailable, send, receive } = useElectron();
  
  useEffect(() => {
    if (!isAvailable) return;
    
    // Send a message to the main process
    send('some-channel', { data: 'test' })
      .then(response => console.log('Response:', response))
      .catch(console.error);
      
    // Listen for messages from the main process
    const cleanup = receive('from-main', (data) => {
      console.log('Received from main process:', data);
    });
    
    return () => cleanup();
  }, [isAvailable, send, receive]);
  
  return <div>Electron: {isAvailable ? 'Available' : 'Not Available'}</div>;
};
*/
