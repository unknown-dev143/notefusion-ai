import React, { useState, useEffect } from 'react';
import { Card, Switch, Button, Space, Typography, Row, Col, message } from 'antd';
import { BulbOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DarkMode: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved preference or system preference
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'true' || (!savedMode && systemPrefersDark)) {
      setIsDarkMode(true);
      applyDarkMode(true);
    }
  }, []);

  const applyDarkMode = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark-mode');
      root.style.setProperty('--bg-color', '#141414');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--card-bg', '#1f1f1f');
      root.style.setProperty('--border-color', '#434343');
    } else {
      root.classList.remove('dark-mode');
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--border-color', '#d9d9d9');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    applyDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    message.success(`${newMode ? 'Dark' : 'Light'} mode enabled`);
  };

  const shortcuts = [
    { key: 'Ctrl + D', action: 'Toggle Dark Mode' },
    { key: 'Ctrl + N', action: 'New Note' },
    { key: 'Ctrl + S', action: 'Save Note' },
    { key: 'Ctrl + F', action: 'Search' },
    { key: 'Ctrl + B', action: 'Toggle Bold' },
    { key: 'Ctrl + I', action: 'Toggle Italic' },
    { key: 'Ctrl + /', action: 'Show Shortcuts' },
    { key: 'Esc', action: 'Close Modal' }
  ];

  return (
    <Card title="Theme & Shortcuts">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              {isDarkMode ? <MoonOutlined /> : <SunOutlined />}
              <Text strong>Dark Mode</Text>
            </Space>
          </Col>
          <Col>
            <Switch
              checked={isDarkMode}
              onChange={toggleDarkMode}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
          </Col>
        </Row>

        <Card size="small" title="Keyboard Shortcuts">
          <Space direction="vertical" style={{ width: '100%' }}>
            {shortcuts.map((shortcut, index) => (
              <Row key={index} justify="space-between">
                <Col>
                  <Text>{shortcut.action}</Text>
                </Col>
                <Col>
                  <Text code style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5' }}>
                    {shortcut.key}
                  </Text>
                </Col>
              </Row>
            ))}
          </Space>
        </Card>

        <Button 
          type="primary" 
          icon={<BulbOutlined />}
          onClick={() => message.info('Press Ctrl + / to see all shortcuts')}
        >
          Learn More Shortcuts
        </Button>
      </Space>
    </Card>
  );
};

export default DarkMode;
