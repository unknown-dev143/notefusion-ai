import { useCallback } from 'react';
import { message } from 'antd';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'editing' | 'creation' | 'view' | 'system';
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
  const { enabled = true, preventDefault = true } = options;

  const createShortcut = useCallback((
    key: string,
    action: () => void,
    description: string,
    category: KeyboardShortcut['category'],
    modifiers: Partial<Pick<KeyboardShortcut, 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey'>> = {}
  ): KeyboardShortcut => {
    return {
      key,
      action,
      description,
      category,
      ...modifiers
    };
  }, []);

  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.metaKey) parts.push('Cmd');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    
    // Format key for display
    let displayKey = shortcut.key;
    switch (shortcut.key.toLowerCase()) {
      case ' ':
        displayKey = 'Space';
        break;
      case 'escape':
        displayKey = 'Esc';
        break;
      case 'arrowup':
        displayKey = '↑';
        break;
      case 'arrowdown':
        displayKey = '↓';
        break;
      case 'arrowleft':
        displayKey = '←';
        break;
      case 'arrowright':
        displayKey = '→';
        break;
      default:
        displayKey = shortcut.key.toUpperCase();
    }
    
    parts.push(displayKey);
    return parts.join(' + ');
  }, []);

  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    return (
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!event.ctrlKey === !!shortcut.ctrlKey &&
      !!event.shiftKey === !!shortcut.shiftKey &&
      !!event.altKey === !!shortcut.altKey &&
      !!event.metaKey === !!shortcut.metaKey
    );
  }, []);

  return {
    createShortcut,
    formatShortcut,
    matchesShortcut,
    enabled,
    preventDefault
  };
};

export const defaultShortcuts = {
  // Navigation
  gotoDashboard: {
    key: 'g',
    ctrlKey: true,
    action: () => window.location.href = '/dashboard',
    description: 'Go to Dashboard',
    category: 'navigation' as const
  },
  gotoNotes: {
    key: 'n',
    ctrlKey: true,
    action: () => window.location.href = '/notes',
    description: 'Go to Notes',
    category: 'navigation' as const
  },
  gotoStudyGroups: {
    key: 'g',
    shiftKey: true,
    action: () => window.location.href = '/study-groups',
    description: 'Go to Study Groups',
    category: 'navigation' as const
  },
  gotoSettings: {
    key: ',',
    ctrlKey: true,
    action: () => window.location.href = '/settings',
    description: 'Go to Settings',
    category: 'navigation' as const
  },
  
  // Editing
  newNote: {
    key: 'n',
    ctrlKey: true,
    shiftKey: true,
    action: () => message.info('New Note shortcut triggered'),
    description: 'Create New Note',
    category: 'editing' as const
  },
  save: {
    key: 's',
    ctrlKey: true,
    action: () => message.info('Save shortcut triggered'),
    description: 'Save Current Document',
    category: 'editing' as const
  },
  copy: {
    key: 'c',
    ctrlKey: true,
    action: () => {
      document.execCommand('copy');
      message.success('Copied to clipboard');
    },
    description: 'Copy',
    category: 'editing' as const
  },
  paste: {
    key: 'v',
    ctrlKey: true,
    action: () => message.info('Paste shortcut triggered'),
    description: 'Paste',
    category: 'editing' as const
  },
  undo: {
    key: 'z',
    ctrlKey: true,
    action: () => message.info('Undo shortcut triggered'),
    description: 'Undo',
    category: 'editing' as const
  },
  redo: {
    key: 'y',
    ctrlKey: true,
    action: () => message.info('Redo shortcut triggered'),
    description: 'Redo',
    category: 'editing' as const
  },
  
  // Creation
  generateImage: {
    key: 'i',
    ctrlKey: true,
    altKey: true,
    action: () => window.location.href = '/image-generator',
    description: 'Open Image Generator',
    category: 'creation' as const
  },
  generateVideo: {
    key: 'v',
    ctrlKey: true,
    altKey: true,
    action: () => window.location.href = '/video-generator',
    description: 'Open Video Generator',
    category: 'creation' as const
  },
  generateQR: {
    key: 'q',
    ctrlKey: true,
    altKey: true,
    action: () => window.location.href = '/qr-generator',
    description: 'Open QR Generator',
    category: 'creation' as const
  },
  
  // View
  toggleSidebar: {
    key: 'b',
    ctrlKey: true,
    action: () => message.info('Toggle sidebar shortcut triggered'),
    description: 'Toggle Sidebar',
    category: 'view' as const
  },
  toggleDarkMode: {
    key: 'd',
    ctrlKey: true,
    shiftKey: true,
    action: () => message.info('Toggle dark mode shortcut triggered'),
    description: 'Toggle Dark Mode',
    category: 'view' as const
  },
  search: {
    key: 'k',
    ctrlKey: true,
    action: () => message.info('Search shortcut triggered'),
    description: 'Open Search',
    category: 'view' as const
  },
  
  // System
  help: {
    key: '?',
    action: () => message.info('Help shortcut triggered'),
    description: 'Show Help',
    category: 'system' as const
  },
  shortcuts: {
    key: '/',
    ctrlKey: true,
    action: () => message.info('Keyboard shortcuts panel'),
    description: 'Show Keyboard Shortcuts',
    category: 'system' as const
  },
  escape: {
    key: 'Escape',
    action: () => message.info('Escape shortcut triggered'),
    description: 'Cancel/Close',
    category: 'system' as const
  }
};

export type KeyboardShortcutType = typeof defaultShortcuts;
