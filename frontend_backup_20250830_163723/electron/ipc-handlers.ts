import { ipcMain, IpcMainInvokeEvent } from 'electron';
import * as os from 'os';

// Initialize all IPC handlers
export function setupIpcHandlers() {
  // Handle app info request
  ipcMain.handle('app:info', async (event: IpcMainInvokeEvent) => {
    return {
      platform: process.platform,
      arch: process.arch,
      versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      cpus: os.cpus().length,
      message: 'Hello from the main process!',
      timestamp: new Date().toISOString(),
    };
  });

  // Add more IPC handlers here as needed
  // Example:
  // ipcMain.handle('another:action', async (event, ...args) => {
  //   // Handle the action
  //   return { success: true };
  // });
}

// Utility function to send messages to all windows
export function broadcastToWindows(channel: string, ...args: any[]) {
  const { BrowserWindow } = require('electron');
  BrowserWindow.getAllWindows().forEach(window => {
    if (window.webContents && !window.webContents.isDestroyed()) {
      window.webContents.send(channel, ...args);
    }
  });
}
