import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import { setupIpcHandlers } from './ipc-handlers';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Set application name
app.setName('NoteFusion AI');

// Set application version
if (process.env.npm_package_version) {
  app.setVersion(process.env.npm_package_version);
}

let mainWindow: Electron.BrowserWindow | null = null;

const createWindow = (): void => {
  // Create the browser window with better security practices
  mainWindow = new BrowserWindow({
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
  setupIpcHandlers();

  // Show window when page is ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      
      // Focus on the main window if another window is focused
      if (process.platform === 'darwin') {
        app.dock.show();
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
    } else {
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
      shell.openExternal(url);
    }
    return { action: 'deny' }; // Prevent opening in the app
  });
  
  // Handle navigation within the app
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Prevent navigation to external URLs
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
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
}

// This method will be called when Electron has finished initialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
