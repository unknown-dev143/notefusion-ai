import React from 'react';
import { Card, Space, Select, Slider, Switch, Divider, Button, theme } from 'antd';
import { 
  BulbOutlined, 
  FontSizeOutlined, 
  BorderOuterOutlined, 
  ColumnWidthOutlined, 
  UndoOutlined 
} from '@ant-design/icons';
import { useTheme, AccentColor, FontFamily, LayoutDensity } from '../../contexts/ThemeContext';

const { useToken } = theme;

const ThemeSettings: React.FC = () => {
  const { 
    theme, 
    accentColor, 
    fontFamily, 
    layoutDensity, 
    borderRadius, 
    enableAnimations,
    updateSettings,
    resetToDefault,
  } = useTheme();
  
  const { token } = useToken();
  
  const accentColors: { label: string; value: AccentColor; color: string }[] = [
    { label: 'Blue', value: 'blue', color: '#1677ff' },
    { label: 'Green', value: 'green', color: '#52c41a' },
    { label: 'Purple', value: 'purple', color: '#722ed1' },
    { label: 'Red', value: 'red', color: '#f5222d' },
    { label: 'Orange', value: 'orange', color: '#fa8c16' },
    { label: 'Pink', value: 'pink', color: '#eb2f96' },
  ];
  
  const fontFamilies: { label: string; value: FontFamily }[] = [
    { label: 'Inter', value: 'inter' },
    { label: 'Roboto', value: 'roboto' },
    { label: 'Open Sans', value: 'open-sans' },
    { label: 'System UI', value: 'system-ui' },
  ];
  
  const layoutDensities: { label: string; value: LayoutDensity }[] = [
    { label: 'Compact', value: 'compact' },
    { label: 'Normal', value: 'normal' },
    { label: 'Comfortable', value: 'comfortable' },
  ];

  return (
    <Card 
      title={
        <Space>
          <BulbOutlined />
          <span>Theme Settings</span>
        </Space>
      }
      bordered={false}
      extra={
        <Button 
          icon={<UndoOutlined />} 
          onClick={resetToDefault}
        >
          Reset to Default
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 8 }}>
            <Space>
              <FontSizeOutlined />
              <span>Font Family</span>
            </Space>
          </div>
          <Select
            style={{ width: '100%' }}
            value={fontFamily}
            onChange={(value) => updateSettings({ fontFamily: value as FontFamily })}
            options={fontFamilies}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: 8 }}>
            <Space>
              <ColumnWidthOutlined />
              <span>Layout Density</span>
            </Space>
          </div>
          <Select
            style={{ width: '100%' }}
            value={layoutDensity}
            onChange={(value) => updateSettings({ layoutDensity: value as LayoutDensity })}
            options={layoutDensities}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: 8 }}>
            <Space>
              <BorderOuterOutlined />
              <span>Border Radius</span>
              <span style={{ color: token.colorTextSecondary }}>({borderRadius}px)</span>
            </Space>
          </div>
          <Slider
            min={0}
            max={16}
            step={1}
            value={borderRadius}
            onChange={(value) => updateSettings({ borderRadius: value })}
            tooltip={{ formatter: (value) => `${value}px` }}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: 8 }}>Accent Color</div>
          <Space wrap>
            {accentColors.map(({ value, color, label }) => (
              <div 
                key={value}
                onClick={() => updateSettings({ accentColor: value })}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: color,
                  cursor: 'pointer',
                  border: `2px solid ${accentColor === value ? token.colorPrimary : 'transparent'}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 12,
                }}
                title={label}
              >
                {accentColor === value && '✓'}
              </div>
            ))}
          </Space>
        </div>
        
        <Divider style={{ margin: '16px 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Enable Animations</div>
            <div style={{ color: token.colorTextSecondary, fontSize: 13 }}>
              Toggle animations and transitions throughout the app
            </div>
          </div>
          <Switch 
            checked={enableAnimations}
            onChange={(checked) => updateSettings({ enableAnimations: checked })}
          />
        </div>
      </Space>
    </Card>
  );
};

export default ThemeSettings;
