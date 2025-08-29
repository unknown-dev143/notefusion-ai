import React from 'react';
import { Card, Radio, Space, Typography } from 'antd';
import { BulbOutlined, BulbFilled, DesktopOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ThemeSettings.module.css';

const { Text } = Typography;

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    icon: <BulbOutlined />,
    description: 'Bright theme for daytime use',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <BulbFilled />,
    description: 'Dark theme for night use',
  },
  {
    value: 'system',
    label: 'System',
    icon: <DesktopOutlined />,
    description: 'Follow system preference',
  },
];

const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card 
      title={
        <Space>
          <BulbOutlined />
          <span>Appearance</span>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary">
          Choose how NoteFusion looks to you. Select a theme that matches your preference.
        </Text>
        
        <Radio.Group
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          style={{ width: '100%', marginTop: 16 }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {themeOptions.map((option) => (
              <Card
                key={option.value}
                hoverable
                onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                className={`${styles['themeOption']} ${theme === option.value ? styles['selected'] : ''}`}
                style={{
                  width: '100%',
                  marginBottom: 16,
                }}
              >
                <Space>
                  <Radio value={option.value} />
                  <div className={styles['optionContent']}>
                    <div className={styles['optionLabel']}>
                      <span className={styles['optionIcon']}>{option.icon}</span>
                      <Text strong>{option.label}</Text>
                    </div>
                    <Text type="secondary" className={styles['optionDescription'] || ''}>
                      {option.description}
                    </Text>
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </Radio.Group>
      </Space>
    </Card>
  );
};

export default ThemeSettings;
