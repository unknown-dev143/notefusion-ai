"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = setupIpcHandlers;
exports.broadcastToWindows = broadcastToWindows;
const electron_1 = require("electron");
const os = __importStar(require("os"));
// Initialize all IPC handlers
function setupIpcHandlers() {
    // Handle app info request
    electron_1.ipcMain.handle('app:info', async (event) => {
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
function broadcastToWindows(channel, ...args) {
    const { BrowserWindow } = require('electron');
    BrowserWindow.getAllWindows().forEach(window => {
        if (window.webContents && !window.webContents.isDestroyed()) {
            window.webContents.send(channel, ...args);
        }
    });
}
//# sourceMappingURL=ipc-handlers.js.map