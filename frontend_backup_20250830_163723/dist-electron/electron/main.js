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
const electron_1 = require("electron");
const path = __importStar(require("path"));
const isDev = __importStar(require("electron-is-dev"));
const ipc_handlers_1 = require("./ipc-handlers");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
// Set application name
electron_1.app.setName('NoteFusion AI');
// Set application version
if (process.env.npm_package_version) {
    electron_1.app.setVersion(process.env.npm_package_version);
}
let mainWindow = null;
const createWindow = () => {
    // Create the browser window with better security practices
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false, // Don't show until ready-to-show
        title: 'NoteFusion AI',
        icon: path.join(__dirname, '../public/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Disable Node.js integration in the renderer
            contextIsolation: true, // Enable context isolation
            webSecurity: !isDev, // Only disable in development for localhost
            webviewTag: true,
            sandbox: false, // Required for some nodeIntegration features
            devTools: isDev,
        },
    });
    // Set up IPC handlers
    (0, ipc_handlers_1.setupIpcHandlers)();
    // Show window when page is ready
    mainWindow.once('ready-to-show', () => {
        if (mainWindow) {
            mainWindow.show();
            // Focus on the main window if another window is focused
            if (process.platform === 'darwin') {
                electron_1.app.dock.show();
            }
            // Open DevTools in development
            if (isDev) {
                mainWindow.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });
    // Handle window being closed by the user
    mainWindow.on('close', (event) => {
        // Add any cleanup or confirmation logic here
        // event.preventDefault(); // Uncomment to prevent closing
    });
    // Load the appropriate URL based on environment
    const loadApp = () => {
        if (isDev) {
            // Try to load from Vite dev server first
            const devUrl = 'http://localhost:3000';
            console.log('Loading from Vite dev server:', devUrl);
            mainWindow.loadURL(devUrl).catch(err => {
                console.warn('Failed to load from dev server, falling back to static HTML:', err);
                // Fall back to static HTML if dev server is not available
                const fallbackPath = path.join(__dirname, 'index.html');
                mainWindow.loadFile(fallbackPath).catch(console.error);
            });
        }
        else {
            // In production, load from the built files
            const prodPath = path.join(__dirname, '../dist/index.html');
            console.log('Loading production build from:', prodPath);
            mainWindow.loadFile(prodPath).catch(err => {
                console.error('Failed to load production build, showing error page:', err);
                // Show error page if production build fails to load
                mainWindow.loadFile(path.join(__dirname, 'index.html'));
            });
        }
    };
    // Load the app
    loadApp();
    // Handle window being closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Handle external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Open http/https URLs in the default browser
        if (url.startsWith('http:') || url.startsWith('https:')) {
            electron_1.shell.openExternal(url);
        }
        return { action: 'deny' }; // Prevent opening in the app
    });
    // Handle navigation within the app
    mainWindow.webContents.on('will-navigate', (event, url) => {
        // Prevent navigation to external URLs
        if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
            event.preventDefault();
            electron_1.shell.openExternal(url);
        }
    });
    // Handle unresponsive renderer process
    mainWindow.webContents.on('render-process-gone', (event, details) => {
        console.error('Renderer process gone:', details);
    });
    // Handle uncaught exceptions
    mainWindow.webContents.on('uncaughtException', (error) => {
        console.error('Uncaught exception in renderer:', error);
    });
    // Open the DevTools in development mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};
// This method will be called when Electron has finished initialization
electron_1.app.on('ready', createWindow);
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map