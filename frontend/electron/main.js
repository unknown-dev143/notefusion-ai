const { app, BrowserWindow, ipcMain, Menu, Tray, shell, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object
let mainWindow = null;
let tray = null;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'NoteFusion AI',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true,
    },
    show: false, // Don't show until ready
    backgroundColor: '#1a1a2e', // Match app dark theme
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new-note'),
        },
        { type: 'separator' },
        {
          label: 'Import Notes',
          click: () => mainWindow?.webContents.send('menu:import'),
        },
        {
          label: 'Export Notes',
          click: () => mainWindow?.webContents.send('menu:export'),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About NoteFusion AI',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About NoteFusion AI',
              message: 'NoteFusion AI',
              detail: `Version: ${app.getVersion()}\n\nAI-powered note-taking application with smart organization, collaboration, and productivity features.`,
            });
          },
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click: () => mainWindow?.webContents.send('menu:shortcuts'),
        },
        { type: 'separator' },
        {
          label: 'Learn More',
          click: () => shell.openExternal('https://notefusion.ai'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/favicon.ico');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open NoteFusion AI',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'New Note',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('menu:new-note');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setToolTip('NoteFusion AI');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// IPC Handlers
ipcMain.handle('app:info', () => {
  return `Running NoteFusion AI v${app.getVersion()} on ${process.platform}`;
});

ipcMain.handle('app:version', () => app.getVersion());

ipcMain.handle('app:platform', () => process.platform);

ipcMain.handle('dialog:open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Notes', extensions: ['md', 'txt', 'json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  return result;
});

ipcMain.handle('dialog:save-file', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'Markdown', extensions: ['md'] },
      { name: 'JSON', extensions: ['json'] },
      { name: 'Text', extensions: ['txt'] },
    ],
  });
  return result;
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle certificate errors in development
if (isDev) {
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  });
}
