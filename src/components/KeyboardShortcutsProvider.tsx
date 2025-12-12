import React, { useState, useEffect, createContext, useContext } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  addShortcut: (shortcut: KeyboardShortcut) => void;
  removeShortcut: (key: string) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([
    // Navigation shortcuts
    {
      key: 'g',
      ctrlKey: true,
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => navigate('/notes'),
      description: 'Go to Notes'
    },
    {
      key: 'g',
      shiftKey: true,
      action: () => navigate('/study-groups'),
      description: 'Go to Study Groups'
    },
    {
      key: 'i',
      ctrlKey: true,
      altKey: true,
      action: () => navigate('/image-generator'),
      description: 'Open Image Generator'
    },
    {
      key: 'v',
      ctrlKey: true,
      altKey: true,
      action: () => navigate('/video-generator'),
      description: 'Open Video Generator'
    },
    {
      key: 'q',
      ctrlKey: true,
      altKey: true,
      action: () => navigate('/qr-generator'),
      description: 'Open QR Generator'
    },
    {
      key: ',',
      ctrlKey: true,
      action: () => navigate('/settings'),
      description: 'Go to Settings'
    },
    
    // System shortcuts
    {
      key: 'k',
      ctrlKey: true,
      action: () => message.info('Search: Press Ctrl+K to search'),
      description: 'Open Search'
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => message.info('Keyboard shortcuts help'),
      description: 'Show Keyboard Shortcuts'
    },
    {
      key: '?',
      action: () => message.info('Help: Press ? for help'),
      description: 'Show Help'
    },
    {
      key: 'Escape',
      action: () => message.info('Escape: Close modal/cancel action'),
      description: 'Cancel/Close'
    },
    
    // Editing shortcuts
    {
      key: 's',
      ctrlKey: true,
      action: () => message.success('Document saved'),
      description: 'Save Document'
    },
    {
      key: 'z',
      ctrlKey: true,
      action: () => message.info('Undo'),
      description: 'Undo'
    },
    {
      key: 'y',
      ctrlKey: true,
      action: () => message.info('Redo'),
      description: 'Redo'
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => message.info('Select all'),
      description: 'Select All'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => message.info('Find: Press Ctrl+F to find'),
      description: 'Find'
    },
    
    // View shortcuts
    {
      key: 'b',
      ctrlKey: true,
      action: () => message.info('Toggle sidebar'),
      description: 'Toggle Sidebar'
    },
    {
      key: 'd',
      ctrlKey: true,
      shiftKey: true,
      action: () => message.info('Toggle dark mode'),
      description: 'Toggle Dark Mode'
    },
    {
      key: 'F11',
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      },
      description: 'Toggle Fullscreen'
    }
  ]);

  const addShortcut = (shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev, shortcut]);
  };

  const removeShortcut = (key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      shortcuts.forEach(shortcut => {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.altKey === !!shortcut.altKey &&
          !!event.metaKey === !!shortcut.metaKey
        ) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <KeyboardShortcutsContext.Provider value={{ shortcuts, addShortcut, removeShortcut }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};
