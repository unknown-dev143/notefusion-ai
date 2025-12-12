import React, { useState } from 'react';
import { Card, Typography, Switch, Select, Slider, Button, Space, Divider } from 'antd';
import { LayoutOutlined, ColumnWidthOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LayoutSettings {
  sidebarCollapsed: boolean;
  sidebarPosition: 'left' | 'right';
  cardSize: 'small' | 'default' | 'large';
  gridColumns: number;
  showTimestamps: boolean;
  compactView: boolean;
  animationsEnabled: boolean;
}

const LayoutSettingsComponent: React.FC = () => {
  const [settings, setSettings] = useState<LayoutSettings>({
    sidebarCollapsed: false,
    sidebarPosition: 'left',
    cardSize: 'default',
    gridColumns: 3,
    showTimestamps: true,
    compactView: false,
    animationsEnabled: true,
  });

  const updateSetting = <K extends keyof LayoutSettings>(
    key: K,
    value: LayoutSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem('layoutSettings', JSON.stringify({ ...settings, [key]: value }));
  };

  const resetToDefaults = () => {
    const defaults: LayoutSettings = {
      sidebarCollapsed: false,
      sidebarPosition: 'left',
      cardSize: 'default',
      gridColumns: 3,
      showTimestamps: true,
      compactView: false,
      animationsEnabled: true,
    };
    setSettings(defaults);
    localStorage.setItem('layoutSettings', JSON.stringify(defaults));
  };

  return (
    <Card 
      title={
        <Space>
          <LayoutOutlined />
          <span>Layout Preferences</span>
        </Space>
      }
      extra={
        <Button type="link" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Sidebar Settings */}
        <div>
          <Title level={5}>Sidebar</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Collapsed by default</Text>
              <Switch
                checked={settings.sidebarCollapsed}
                onChange={(checked) => updateSetting('sidebarCollapsed', checked)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Position</Text>
              <Select
                value={settings.sidebarPosition}
                onChange={(value) => updateSetting('sidebarPosition', value)}
                style={{ width: 120 }}
              >
                <Select.Option value="left">Left</Select.Option>
                <Select.Option value="right">Right</Select.Option>
              </Select>
            </div>
          </Space>
        </div>

        <Divider />

        {/* Card Display Settings */}
        <div>
          <Title level={5}>Card Display</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Card Size</Text>
              <Select
                value={settings.cardSize}
                onChange={(value) => updateSetting('cardSize', value)}
                style={{ width: 120 }}
              >
                <Select.Option value="small">Small</Select.Option>
                <Select.Option value="default">Default</Select.Option>
                <Select.Option value="large">Large</Select.Option>
              </Select>
            </div>
            <div>
              <Text>Grid Columns: {settings.gridColumns}</Text>
              <Slider
                min={1}
                max={5}
                value={settings.gridColumns}
                onChange={(value) => updateSetting('gridColumns', value)}
                style={{ marginTop: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Show timestamps</Text>
              <Switch
                checked={settings.showTimestamps}
                onChange={(checked) => updateSetting('showTimestamps', checked)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Compact view</Text>
              <Switch
                checked={settings.compactView}
                onChange={(checked) => updateSetting('compactView', checked)}
              />
            </div>
          </Space>
        </div>

        <Divider />

        {/* Visual Effects */}
        <div>
          <Title level={5}>Visual Effects</Title>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Enable animations</Text>
            <Switch
              checked={settings.animationsEnabled}
              onChange={(checked) => updateSetting('animationsEnabled', checked)}
            />
          </div>
        </div>

        <div style={{ padding: '12px', background: '#f6f8fa', borderRadius: '6px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <ColumnWidthOutlined style={{ marginRight: '4px' }} />
            Layout preferences are saved locally and will persist across sessions.
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default LayoutSettingsComponent;
