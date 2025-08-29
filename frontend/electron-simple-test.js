// Simple Electron test script
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Log file path
const logPath = path.join(__dirname, 'electron-test.log');

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(logPath, logMessage);
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

try {
  log('=== Starting Electron Test ===');
  log(`Node.js version: ${process.version}`);
  log(`Platform: ${process.platform} (${process.arch})`);
  log(`Electron version: ${process.versions.electron || 'Not available'}`);
  log(`Current directory: ${__dirname}`);
  
  let mainWindow;

  function createWindow() {
    log('Creating browser window...');
    
    // Create the browser window
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      show: false // Don't show until ready
    });

    // Load a simple HTML page
    const htmlPath = path.join(__dirname, 'electron-test.html');
    log(`Loading HTML from: ${htmlPath}`);
    
    mainWindow.loadFile(htmlPath).then(() => {
      log('Window loaded successfully');
      mainWindow.show();
    }).catch(err => {
      log(`Failed to load HTML: ${err.message}`);
    });

    // Open DevTools in development
    if (process.env.NODE_ENV !== 'production') {
      mainWindow.webContents.openDevTools();
    }

    // Log window events
    mainWindow.on('closed', () => {
      log('Window closed');
      mainWindow = null;
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log(`Failed to load: ${errorCode} - ${errorDescription}`);
    });

    mainWindow.webContents.on('console-message', (event, level, message) => {
      log(`Renderer [${level}]: ${message}`);
    });
  }

  // When Electron has finished initialization
  app.whenReady().then(() => {
    log('App is ready');
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  // Quit when all windows are closed, except on macOS
  app.on('window-all-closed', () => {
    log('All windows closed');
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Log unhandled errors
  process.on('uncaughtException', (error) => {
    log(`Uncaught Exception: ${error.stack}`);
  });

  process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  });

} catch (error) {
  log(`Fatal error: ${error.stack}`);
  process.exit(1);
}
