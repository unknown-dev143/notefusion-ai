// Electron API TypeScript declarations
declare global {
  interface Window {
    electron?: {
      getAppVersion: () => Promise<string>;
      minimize: () => void;
      maximize: () => void;
      unmaximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      onUpdateAvailable: (callback: (event: any, info: any) => void) => void;
      onUpdateDownloaded: (callback: (event: any, info: any) => void) => void;
      restartApp: () => void;
      openExternal: (url: string) => void;
      selectDirectory: () => Promise<string | null>;
      platform: NodeJS.Platform;
      isDev: boolean;
    };
  }
}

// Check if running in Electron
const isElectron = () => {
  return !!(
    typeof window !== 'undefined' &&
    window.process &&
    window.process.versions &&
    window.process.versions.electron
  );
};

// Get Electron API with type safety
const getElectron = () => {
  if (!isElectron() || !window.electron) {
    throw new Error('Electron API not available');
  }
  return window.electron;
};

// Safe wrapper for Electron functions
const electron = {
  // App info
  getAppVersion: async (): Promise<string> => {
    if (!isElectron()) return process.env.npm_package_version || '0.0.0';
    return getElectron().getAppVersion();
  },

  // Window controls
  minimize: () => isElectron() && getElectron().minimize(),
  maximize: () => isElectron() && getElectron().maximize(),
  unmaximize: () => isElectron() && getElectron().unmaximize(),
  close: () => isElectron() && getElectron().close(),
  isMaximized: async (): Promise<boolean> => 
    isElectron() ? getElectron().isMaximized() : false,

  // Auto-update
  onUpdateAvailable: (callback: (info: any) => void) => {
    if (isElectron()) {
      getElectron().onUpdateAvailable((event, info) => callback(info));
    }
  },
  
  onUpdateDownloaded: (callback: () => void) => {
    if (isElectron()) {
      getElectron().onUpdateDownloaded(() => callback());
    }
  },
  
  restartApp: () => isElectron() && getElectron().restartApp(),

  // Platform info
  platform: isElectron() ? getElectron().platform : null,
  isDev: isElectron() ? getElectron().isDev : process.env.NODE_ENV === 'development',

  // File system
  selectDirectory: async (): Promise<string | null> => {
    if (!isElectron()) return null;
    try {
      return await getElectron().selectDirectory();
    } catch (error) {
      console.error('Error selecting directory:', error);
      return null;
    }
  },

  // Open external links
  openExternal: (url: string) => {
    if (isElectron()) {
      getElectron().openExternal(url);
    } else if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  },
};

export { isElectron, electron };
