const { app, BrowserWindow } = require('electron');
const path = require('path');

// Enable better error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

function createWindow() {
  console.log('Creating browser window...');
  
  // Create the browser window
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: false // Don't show until ready-to-show
  });

  // Load the test HTML file
  const testHtmlPath = path.join(__dirname, 'electron-test.html');
  console.log('Loading test HTML from:', testHtmlPath);
  
  win.loadFile(testHtmlPath).catch(err => {
    console.error('Failed to load HTML file:', err);
  });

  // Show window when page is ready
  win.once('ready-to-show', () => {
    console.log('Window is ready to show');
    win.show();
    // Open DevTools if in development
    if (process.env.NODE_ENV !== 'production') {
      win.webContents.openDevTools();
    }
  });

  // Log window events
  win.on('closed', () => {
    console.log('Window closed');
    app.quit();
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  win.webContents.on('console-message', (event, level, message) => {
    console.log(`Renderer [${level}]:`, message);
  });

  return win;
}

// When Electron has finished initialization
app.whenReady().then(() => {
  console.log('App is ready');
  createWindow();

  // On macOS it's common to re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(err => {
  console.error('Error in app.whenReady:', err);
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Log app events
app.on('will-quit', () => {
  console.log('App will quit');});

console.log('App initialization started');
