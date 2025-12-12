import React, { useState } from 'react';
import { Card, Typography, Switch, Select, Button, Space, Divider, message } from 'antd';
import { BellOutlined, MailOutlined, NotificationOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  studyReminders: boolean;
  achievementAlerts: boolean;
  paymentAlerts: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    achievementAlerts: true,
    paymentAlerts: true,
    securityAlerts: true,
    weeklyDigest: false,
    productUpdates: false,
    notificationFrequency: 'immediate'
  });

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // Here you would typically save to backend
    message.success('Notification settings saved successfully!');
  };

  const resetToDefaults = () => {
    setPreferences({
      emailNotifications: true,
      pushNotifications: true,
      studyReminders: true,
      achievementAlerts: true,
      paymentAlerts: true,
      securityAlerts: true,
      weeklyDigest: false,
      productUpdates: false,
      notificationFrequency: 'immediate'
    });
    message.info('Settings reset to defaults');
  };

  return (
    <Card title="Notification Preferences" extra={<BellOutlined />}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>Notification Channels</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <MailOutlined />
                <div>
                  <Text strong>Email Notifications</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Receive notifications via email
                  </Text>
                </div>
              </Space>
              <Switch
                checked={preferences.emailNotifications}
                onChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <NotificationOutlined />
                <div>
                  <Text strong>Push Notifications</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Receive browser push notifications
                  </Text>
                </div>
              </Space>
              <Switch
                checked={preferences.pushNotifications}
                onChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
              />
            </div>
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={5}>Notification Types</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Study Reminders</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Reminders for scheduled study sessions
                </Text>
              </div>
              <Switch
                checked={preferences.studyReminders}
                onChange={(checked) => handlePreferenceChange('studyReminders', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Achievement Alerts</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Notifications for achievements and milestones
                </Text>
              </div>
              <Switch
                checked={preferences.achievementAlerts}
                onChange={(checked) => handlePreferenceChange('achievementAlerts', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Payment Alerts</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Billing and payment related notifications
                </Text>
              </div>
              <Switch
                checked={preferences.paymentAlerts}
                onChange={(checked) => handlePreferenceChange('paymentAlerts', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Security Alerts</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Important security notifications
                </Text>
              </div>
              <Switch
                checked={preferences.securityAlerts}
                onChange={(checked) => handlePreferenceChange('securityAlerts', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Weekly Digest</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Weekly summary of your activity
                </Text>
              </div>
              <Switch
                checked={preferences.weeklyDigest}
                onChange={(checked) => handlePreferenceChange('weeklyDigest', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Product Updates</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                New features and product announcements
                </Text>
              </div>
              <Switch
                checked={preferences.productUpdates}
                onChange={(checked) => handlePreferenceChange('productUpdates', checked)}
              />
            </div>
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={5}>Notification Frequency</Title>
          <Select
            value={preferences.notificationFrequency}
            onChange={(value) => handlePreferenceChange('notificationFrequency', value)}
            style={{ width: '100%' }}
          >
            <Option value="immediate">Immediate</Option>
            <Option value="hourly">Hourly Digest</Option>
            <Option value="daily">Daily Digest</Option>
            <Option value="weekly">Weekly Digest</Option>
          </Select>
        </div>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button type="primary" onClick={saveSettings}>
            Save Settings
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export default NotificationSettings;
