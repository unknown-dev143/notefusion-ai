const { app, BrowserWindow } = require('electron');
const path = require('path');

console.log('Starting Electron test...');
console.log('Node.js version:', process.version);
console.log('Electron version:', process.versions.electron || 'Not available');
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

function createWindow() {
  console.log('Creating browser window...');
  const win = new BrowserWindow({
    width: 800,
    height: 600,
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

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);});
