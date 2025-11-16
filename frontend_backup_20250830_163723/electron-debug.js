const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'electron-debug.log'), { flags: 'a' });

// Override console methods to log to file
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

function logToFile(level, ...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  // Log to file
  logStream.write(logEntry);
  
  // Also log to console
  originalConsole[level](...args);
}

// Override console methods
console.log = (...args) => logToFile('log', ...args);
console.error = (...args) => logToFile('error', ...args);
console.warn = (...args) => logToFile('warn', ...args);
console.info = (...args) => logToFile('info', ...args);
console.debug = (...args) => logToFile('debug', ...args);

// Log environment information
console.log('=== Environment Information ===');
console.log('Node.js Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current Directory:', process.cwd());
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  ELECTRON_RUN_AS_NODE: process.env.ELECTRON_RUN_AS_NODE,
  ELECTRON_ENABLE_LOGGING: process.env.ELECTRON_ENABLE_LOGGING,
  PATH: process.env.PATH
});
console.log('==============================');

// Try to require Electron
let electron;
try {
  electron = require('electron');
  console.log('Electron module loaded successfully:', electron);
} catch (err) {
  console.error('Failed to load Electron module:', err);
  process.exit(1);
}

// Create a simple Electron app
const { app, BrowserWindow } = electron;

console.log('Creating browser window...');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, 'electron', 'index.html'));
  win.webContents.openDevTools();
  console.log('Window created successfully!');
}

app.whenReady().then(() => {
  console.log('App is ready');
  createWindow();
}).catch(err => {
  console.error('Error in app.whenReady():', err);
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Electron app initialization complete');
