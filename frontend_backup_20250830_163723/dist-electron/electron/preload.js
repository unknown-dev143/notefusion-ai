"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Whitelist of valid channels for IPC communication
const validChannels = {
    send: ['toMain'],
    receive: ['fromMain'],
    sendReceive: ['ping'],
};
// ContextBridge API with type safety
electron_1.contextBridge.exposeInMainWorld('electron', {
    // Send a message to the main process
    send: (channel, ...args) => {
        if (validChannels.send.includes(channel)) {
            electron_1.ipcRenderer.send(channel, ...args);
        }
        else {
            console.warn(`Attempted to send to invalid channel: ${channel}`);
        }
    },
    // Receive a message from the main process
    receive: (channel, listener) => {
        if (validChannels.receive.includes(channel)) {
            const subscription = (_event, ...args) => listener(...args);
            electron_1.ipcRenderer.on(channel, subscription);
            // Return cleanup function
            return () => {
                electron_1.ipcRenderer.removeListener(channel, subscription);
            };
        }
        else {
            console.warn(`Attempted to listen to invalid channel: ${channel}`);
            return () => { }; // Return empty cleanup function
        }
    },
    // Send a message and wait for a response
    invoke: async (channel, ...args) => {
        if (validChannels.sendReceive.includes(channel)) {
            return await electron_1.ipcRenderer.invoke(channel, ...args);
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
electron_1.ipcRenderer.on('error', (_event, error) => {
    console.error('Error from main process:', error);
});
//# sourceMappingURL=preload.js.map