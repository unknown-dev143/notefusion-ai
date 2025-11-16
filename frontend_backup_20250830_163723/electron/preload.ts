import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Whitelist of valid channels for IPC communication
const validChannels = {
  send: ['toMain'],
  receive: ['fromMain'],
  sendReceive: ['ping'],
} as const;

// Type-safe IPC API
type ValidSendChannel = typeof validChannels.send[number];
type ValidReceiveChannel = typeof validChannels.receive[number];
type ValidSendReceiveChannel = typeof validChannels.sendReceive[number];

// ContextBridge API with type safety
contextBridge.exposeInMainWorld('electron', {
  // Send a message to the main process
  send: (channel: ValidSendChannel, ...args: unknown[]) => {
    if (validChannels.send.includes(channel as any)) {
      ipcRenderer.send(channel, ...args);
    } else {
      console.warn(`Attempted to send to invalid channel: ${channel}`);
    }
  },
  
  // Receive a message from the main process
  receive: (channel: ValidReceiveChannel, listener: (...args: unknown[]) => void) => {
    if (validChannels.receive.includes(channel as any)) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => listener(...args);
      ipcRenderer.on(channel, subscription);
      
      // Return cleanup function
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    } else {
      console.warn(`Attempted to listen to invalid channel: ${channel}`);
      return () => {}; // Return empty cleanup function
    }
  },
  
  // Send a message and wait for a response
  invoke: async (channel: ValidSendReceiveChannel, ...args: unknown[]): Promise<unknown> => {
    if (validChannels.sendReceive.includes(channel as any)) {
      return await ipcRenderer.invoke(channel, ...args);
    }
    console.warn(`Attempted to invoke invalid channel: ${channel}`);
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },
  
  // Platform information
  platform: process.platform,
  
  // Environment information
  isDev: process.env.NODE_ENV === 'development',
  
  // App version
  appVersion: process.env.npm_package_version || '1.0.0',
});

// Log any errors from the main process
ipcRenderer.on('error', (_event, error) => {
  console.error('Error from main process:', error);
});
