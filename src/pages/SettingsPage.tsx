import { useState } from 'react';
import { Card, Typography, message, Space, Row, Col, Tabs, Switch, Slider, Select, Button, Table, Tag, Input } from 'antd';
import { 
  GlobalOutlined,
  DatabaseOutlined,
  CloudOutlined,
  EyeOutlined,
  BellOutlined,
  LockOutlined,
  ExperimentOutlined,
  RobotOutlined,
  KeyOutlined,
  QuestionCircleOutlined,
  CreditCardOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useKeyboardShortcuts } from '../components/KeyboardShortcutsProvider';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SettingsPage = () => {
  const { shortcuts } = useKeyboardShortcuts();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    autoSave: true,
    autoSaveInterval: 30,
    
    // Appearance
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
    sidebarCollapsed: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    groupUpdates: true,
    systemAlerts: true,
    
    // Privacy
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    dataCollection: true,
    
    // AI Settings
    aiAssistEnabled: true,
    aiModel: 'gpt-4',
    aiTemperature: 0.7,
    aiMaxTokens: 2048,
    
    // Media Settings
    autoPlayVideos: false,
    videoQuality: 'auto',
    imageQuality: 'high',
    soundEnabled: true,
    
    // Storage & Sync
    cloudSync: true,
    offlineMode: false,
    cacheSize: 500,
    autoCleanup: true,
    
    // Payment Settings
    paymentEnabled: false,
    defaultPaymentMethod: 'credit-card',
    currency: 'USD',
    autoRenew: true,
    
    // Advanced
    developerMode: false,
    experimentalFeatures: false,
    apiAccess: false,
    debugMode: false
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    message.success('Setting updated successfully');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Settings</Title>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab="General" key="general">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<Space><GlobalOutlined />Regional Settings</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Language:</Text>
                    <Select
                      value={settings.language}
                      onChange={(value) => updateSetting('language', value)}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Option value="en">English</Option>
                      <Option value="es">Español</Option>
                      <Option value="fr">Français</Option>
                      <Option value="de">Deutsch</Option>
                      <Option value="zh">中文</Option>
                      <Option value="ja">日本語</Option>
                    </Select>
                  </div>
                  
                  <div>
                    <Text strong>Timezone:</Text>
                    <Select
                      value={settings.timezone}
                      onChange={(value) => updateSetting('timezone', value)}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Option value="UTC">UTC</Option>
                      <Option value="EST">Eastern Time</Option>
                      <Option value="PST">Pacific Time</Option>
                      <Option value="GMT">Greenwich Mean Time</Option>
                      <Option value="CET">Central European Time</Option>
                    </Select>
                  </div>
                  
                  <div>
                    <Text strong>Date Format:</Text>
                    <Select
                      value={settings.dateFormat}
                      onChange={(value) => updateSetting('dateFormat', value)}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                    </Select>
                  </div>
                  
                  <div>
                    <Text strong>Time Format:</Text>
                    <Select
                      value={settings.timeFormat}
                      onChange={(value) => updateSetting('timeFormat', value)}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Option value="12h">12-hour</Option>
                      <Option value="24h">24-hour</Option>
                    </Select>
                  </div>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title={<Space><DatabaseOutlined />Auto-Save Settings</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Space>
                      <Switch
                        checked={settings.autoSave}
                        onChange={(checked) => updateSetting('autoSave', checked)}
                      />
                      <Text>Enable Auto-Save</Text>
                    </Space>
                  </div>
                  
                  {settings.autoSave && (
                    <div>
                      <Text strong>Auto-Save Interval:</Text>
                      <Slider
                        min={10}
                        max={300}
                        step={10}
                        value={settings.autoSaveInterval}
                        onChange={(value) => updateSetting('autoSaveInterval', value)}
                        marks={{
                          30: '30s',
                          60: '1m',
                          120: '2m',
                          300: '5m'
                        }}
                        style={{ marginTop: 8 }}
                      />
                      <Text type="secondary">Every {settings.autoSaveInterval} seconds</Text>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Appearance" key="appearance">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<Space><EyeOutlined />Visual Settings</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Theme:</Text>
                    <Select
                      value={settings.theme}
                      onChange={(value) => updateSetting('theme', value)}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Option value="light">Light</Option>
                      <Option value="dark">Dark</Option>
                      <Option value="auto">Auto (System)</Option>
                    </Select>
                  </div>
                  
                  <div>
                    <Text strong>Font Size:</Text>
                    <Select
                      value={settings.fontSize}
                      onChange={(value) => updateSetting('fontSize', value)}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Option value="small">Small</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="large">Large</Option>
                      <Option value="extra-large">Extra Large</Option>
                    </Select>
                  </div>
                  
                  <div>
                    <Space>
                      <Switch
                        checked={settings.compactMode}
                        onChange={(checked) => updateSetting('compactMode', checked)}
                      />
                      <Text>Compact Mode</Text>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Notifications" key="notifications">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<Space><BellOutlined />Notification Preferences</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Space>
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(checked) => updateSetting('emailNotifications', checked)}
                      />
                      <Text>Email Notifications</Text>
                    </Space>
                  </div>
                  
                  <div>
                    <Space>
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={(checked) => updateSetting('pushNotifications', checked)}
                      />
                      <Text>Push Notifications</Text>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Privacy" key="privacy">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<Space><LockOutlined />Privacy Settings</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Profile Visibility:</Text>
                    <Select
                      value={settings.profileVisibility}
                      onChange={(value) => updateSetting('profileVisibility', value)}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Option value="public">Public</Option>
                      <Option value="friends">Friends Only</Option>
                      <Option value="private">Private</Option>
                    </Select>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="AI & Media" key="ai">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<Space><RobotOutlined />AI Assistant Settings</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Space>
                      <Switch
                        checked={settings.aiAssistEnabled}
                        onChange={(checked) => updateSetting('aiAssistEnabled', checked)}
                      />
                      <Text>Enable AI Assistant</Text>
                    </Space>
                  </div>
                  
                  <div>
                    <Text strong>AI Model:</Text>
                    <Select
                      value={settings.aiModel}
                      onChange={(value) => updateSetting('aiModel', value)}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Option value="gpt-3.5">GPT-3.5 Turbo</Option>
                      <Option value="gpt-4">GPT-4</Option>
                      <Option value="gpt-4-turbo">GPT-4 Turbo</Option>
                    </Select>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Storage & Sync" key="storage">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<Space><CloudOutlined />Cloud Sync</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Space>
                      <Switch
                        checked={settings.cloudSync}
                        onChange={(checked) => updateSetting('cloudSync', checked)}
                      />
                      <Text>Enable Cloud Sync</Text>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Keyboard Shortcuts" key="shortcuts">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title={<Space><KeyOutlined />Keyboard Shortcuts</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <Text>
                      Keyboard shortcuts help you navigate the application faster. Press <Tag style={{ fontFamily: 'monospace' }}>Ctrl + /</Tag> to see available shortcuts anywhere in the app.
                    </Text>
                  </div>
                  
                  <div>
                    <Input.Search
                      placeholder="Search shortcuts..."
                      style={{ marginBottom: 16 }}
                    />
                  </div>
                  
                  <Table
                    dataSource={shortcuts}
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Shortcut',
                        key: 'shortcut',
                        render: (_, record) => (
                          <Tag color="blue" style={{ fontFamily: 'monospace' }}>
                            {record.ctrlKey && 'Ctrl + '}
                            {record.shiftKey && 'Shift + '}
                            {record.altKey && 'Alt + '}
                            {record.metaKey && 'Cmd + '}
                            {record.key.toUpperCase()}
                          </Tag>
                        )
                      },
                      {
                        title: 'Action',
                        dataIndex: 'description',
                        key: 'description'
                      }
                    ]}
                  />
                  
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button icon={<QuestionCircleOutlined />} type="link">
                      Learn more about keyboard shortcuts
                    </Button>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Payment" key="payment">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<Space><CreditCardOutlined />Payment Methods</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Space>
                      <Switch
                        checked={settings.paymentEnabled}
                        onChange={(checked) => updateSetting('paymentEnabled', checked)}
                      />
                      <Text>Enable Payment Processing</Text>
                    </Space>
                  </div>
                  
                  <div>
                    <Text strong>Default Payment Method:</Text>
                    <Select
                      value={settings.defaultPaymentMethod}
                      onChange={(value) => updateSetting('defaultPaymentMethod', value)}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      <Option value="credit-card">Credit Card</Option>
                      <Option value="debit-card">Debit Card</Option>
                      <Option value="paypal">PayPal</Option>
                      <Option value="stripe">Stripe</Option>
                    </Select>
                  </div>

                  <div>
                    <Text strong>Currency:</Text>
                    <Select
                      value={settings.currency}
                      onChange={(value) => updateSetting('currency', value)}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      <Option value="USD">USD - US Dollar</Option>
                      <Option value="EUR">EUR - Euro</Option>
                      <Option value="GBP">GBP - British Pound</Option>
                      <Option value="JPY">JPY - Japanese Yen</Option>
                    </Select>
                  </div>

                  <Button type="primary" icon={<CreditCardOutlined />}>
                    Manage Payment Methods
                  </Button>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title={<Space><CrownOutlined />Subscription</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Current Plan: </Text>
                    <Tag color="gold">Premium</Tag>
                  </div>
                  
                  <div>
                    <Text type="secondary">Next billing date: December 31, 2024</Text>
                  </div>

                  <div>
                    <Text strong>Auto-renewal:</Text>
                    <Switch
                      checked={settings.autoRenew}
                      onChange={(checked) => updateSetting('autoRenew', checked)}
                    />
                  </div>

                  <Button type="default">
                    View Billing History
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Advanced" key="advanced">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<Space><ExperimentOutlined />Experimental Features</Space>} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Space>
                      <Switch
                        checked={settings.developerMode}
                        onChange={(checked) => updateSetting('developerMode', checked)}
                      />
                      <Text>Developer Mode</Text>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
