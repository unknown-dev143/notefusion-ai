const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Send a message to the main process (fire and forget)
  send: (channel, ...args) => {
    const validChannels = [
      'app:minimize',
      'app:maximize',
      'app:close',
      'note:save',
      'note:delete',
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },

  // Listen for messages from the main process
  receive: (channel, listener) => {
    const validChannels = [
      'menu:new-note',
      'menu:import',
      'menu:export',
      'menu:shortcuts',
      'app:update-available',
      'app:update-downloaded',
    ];
    if (validChannels.includes(channel)) {
      const subscription = (event, ...args) => listener(...args);
      ipcRenderer.on(channel, subscription);
      
      // Return cleanup function
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
    return () => {};
  },

  // Send a message and wait for a response
  invoke: async (channel, ...args) => {
    const validChannels = [
      'app:info',
      'app:version',
      'app:platform',
      'dialog:open-file',
      'dialog:save-file',
      'fs:read-file',
      'fs:write-file',
    ];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },

  // Platform information
  platform: process.platform,

  // Environment information
  isDev: process.env.NODE_ENV !== 'production',

  // App version (will be set by main process)
  appVersion: process.env.npm_package_version || '1.0.0',
});

// Log that preload script has loaded
console.log('NoteFusion AI: Preload script loaded successfully');
