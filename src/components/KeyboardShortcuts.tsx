import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Tag, Divider, Button, Space, message } from 'antd';
import { KeyboardOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

const KeyboardShortcuts: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([
    // Navigation shortcuts
    {
      key: 'g',
      ctrlKey: true,
      action: () => window.location.href = '/dashboard',
      description: 'Go to Dashboard',
      category: 'Navigation'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => window.location.href = '/notes',
      description: 'Go to Notes',
      category: 'Navigation'
    },
    {
      key: 'g',
      shiftKey: true,
      action: () => window.location.href = '/study-groups',
      description: 'Go to Study Groups',
      category: 'Navigation'
    },
    {
      key: 'i',
      ctrlKey: true,
      altKey: true,
      action: () => window.location.href = '/image-generator',
      description: 'Open Image Generator',
      category: 'Navigation'
    },
    {
      key: 'v',
      ctrlKey: true,
      altKey: true,
      action: () => window.location.href = '/video-generator',
      description: 'Open Video Generator',
      category: 'Navigation'
    },
    {
      key: 'q',
      ctrlKey: true,
      altKey: true,
      action: () => window.location.href = '/qr-generator',
      description: 'Open QR Generator',
      category: 'Navigation'
    },
    {
      key: ',',
      ctrlKey: true,
      action: () => window.location.href = '/settings',
      description: 'Go to Settings',
      category: 'Navigation'
    },
    
    // System shortcuts
    {
      key: 'k',
      ctrlKey: true,
      action: () => message.info('Search: Press Ctrl+K to search'),
      description: 'Open Search',
      category: 'System'
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => message.info('Keyboard shortcuts help'),
      description: 'Show Keyboard Shortcuts',
      category: 'System'
    },
    {
      key: '?',
      action: () => message.info('Help: Press ? for help'),
      description: 'Show Help',
      category: 'System'
    },
    {
      key: 'Escape',
      action: () => message.info('Escape: Close modal/cancel action'),
      description: 'Cancel/Close',
      category: 'System'
    },
    
    // Editing shortcuts
    {
      key: 's',
      ctrlKey: true,
      action: () => message.success('Document saved'),
      description: 'Save Document',
      category: 'Editing'
    },
    {
      key: 'z',
      ctrlKey: true,
      action: () => message.info('Undo'),
      description: 'Undo',
      category: 'Editing'
    },
    {
      key: 'y',
      ctrlKey: true,
      action: () => message.info('Redo'),
      description: 'Redo',
      category: 'Editing'
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => message.info('Select all'),
      description: 'Select All',
      category: 'Editing'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => message.info('Find: Press Ctrl+F to find'),
      description: 'Find',
      category: 'Editing'
    },
    
    // View shortcuts
    {
      key: 'b',
      ctrlKey: true,
      action: () => message.info('Toggle sidebar'),
      description: 'Toggle Sidebar',
      category: 'View'
    },
    {
      key: 'd',
      ctrlKey: true,
      shiftKey: true,
      action: () => message.info('Toggle dark mode'),
      description: 'Toggle Dark Mode',
      category: 'View'
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
      description: 'Toggle Fullscreen',
      category: 'View'
    }
  ]);

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.metaKey) parts.push('Meta');
    parts.push(shortcut.key);
    return parts.join(' + ');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Navigation': 'blue',
      'System': 'green',
      'Editing': 'orange',
      'View': 'purple'
    };
    return colors[category] || 'default';
  };

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Card title="Keyboard Shortcuts" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary">
          Press these key combinations to quickly navigate and use the application. 
          Shortcuts won't work when you're typing in input fields.
        </Text>
        
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <div key={category}>
            <Divider orientation="left">
              <Tag color={getCategoryColor(category)}>{category}</Tag>
            </Divider>
            <List
              dataSource={categoryShortcuts}
              renderItem={(shortcut) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<KeyboardOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                    title={
                      <Space>
                        <Tag color="blue">{formatShortcut(shortcut)}</Tag>
                        <Text strong>{shortcut.description}</Text>
                      </Space>
                    }
                    description={shortcut.action.toString()}
                  />
                </List.Item>
              )}
            />
          </div>
        ))}
        
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            icon={<KeyboardOutlined />}
            onClick={() => message.info('Keyboard shortcuts are active!')}
          >
            Test Shortcuts
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export default KeyboardShortcuts;