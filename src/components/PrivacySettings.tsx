import React, { useState } from 'react';
import { Card, Typography, Switch, Button, Space, Divider, message, Select, Modal } from 'antd';
import { LockOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showAchievements: boolean;
  showStudyStats: boolean;
  allowDataCollection: boolean;
  allowPersonalization: boolean;
  allowAnalytics: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  autoDeleteData: boolean;
  dataRetentionPeriod: number;
}

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'private',
    showOnlineStatus: false,
    showAchievements: true,
    showStudyStats: false,
    allowDataCollection: false,
    allowPersonalization: true,
    allowAnalytics: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    autoDeleteData: false,
    dataRetentionPeriod: 365
  });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean | string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // Here you would typically save to backend
    message.success('Privacy settings saved successfully!');
  };

  const exportData = () => {
    // Simulate data export
    message.info('Data export request submitted. You will receive an email with your data.');
  };

  const deleteAccount = () => {
    // Here you would typically handle account deletion
    message.warning('Account deletion request submitted. You will receive a confirmation email.');
    setDeleteModalVisible(false);
  };

  return (
    <Card title="Privacy & Security" extra={<LockOutlined />}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>Profile Privacy</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Profile Visibility</Text>
              <Select
                value={settings.profileVisibility}
                onChange={(value) => handleSettingChange('profileVisibility', value)}
                style={{ width: '100%', marginTop: 8 }}
              >
                <Option value="public">Public - Anyone can view</Option>
                <Option value="friends">Friends Only</Option>
                <Option value="private">Private - Only you</Option>
              </Select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Show Online Status</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Let others see when you're online
                </Text>
              </div>
              <Switch
                checked={settings.showOnlineStatus}
                onChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Show Achievements</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Display your achievements on your profile
                </Text>
              </div>
              <Switch
                checked={settings.showAchievements}
                onChange={(checked) => handleSettingChange('showAchievements', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Show Study Statistics</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Share your learning progress and stats
                </Text>
              </div>
              <Switch
                checked={settings.showStudyStats}
                onChange={(checked) => handleSettingChange('showStudyStats', checked)}
              />
            </div>
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={5}>Data & Analytics</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Allow Data Collection</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Help us improve our services
                </Text>
              </div>
              <Switch
                checked={settings.allowDataCollection}
                onChange={(checked) => handleSettingChange('allowDataCollection', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Personalization</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Get personalized recommendations
                </Text>
              </div>
              <Switch
                checked={settings.allowPersonalization}
                onChange={(checked) => handleSettingChange('allowPersonalization', checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Analytics Tracking</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Help us understand feature usage
                </Text>
              </div>
              <Switch
                checked={settings.allowAnalytics}
                onChange={(checked) => handleSettingChange('allowAnalytics', checked)}
              />
            </div>
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={5}>Security Settings</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Session Timeout (minutes)</Text>
              <Select
                value={settings.sessionTimeout}
                onChange={(value) => handleSettingChange('sessionTimeout', value)}
                style={{ width: '100%', marginTop: 8 }}
              >
                <Option value={15}>15 minutes</Option>
                <Option value={30}>30 minutes</Option>
                <Option value={60}>1 hour</Option>
                <Option value={120}>2 hours</Option>
                <Option value={240}>4 hours</Option>
              </Select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Auto-Delete Data</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Automatically delete old data after retention period
                </Text>
              </div>
              <Switch
                checked={settings.autoDeleteData}
                onChange={(checked) => handleSettingChange('autoDeleteData', checked)}
              />
            </div>

            {settings.autoDeleteData && (
              <div>
                <Text strong>Data Retention Period (days)</Text>
                <Select
                  value={settings.dataRetentionPeriod}
                  onChange={(value) => handleSettingChange('dataRetentionPeriod', value)}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value={30}>30 days</Option>
                  <Option value={90}>90 days</Option>
                  <Option value={180}>180 days</Option>
                  <Option value={365}>1 year</Option>
                  <Option value={730}>2 years</Option>
                </Select>
              </div>
            )}
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={5}>Data Management</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button icon={<EyeOutlined />} onClick={exportData} block>
              Export My Data
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteModalVisible(true)} block>
              Delete Account
            </Button>
          </Space>
        </div>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={saveSettings}>
            Save Privacy Settings
          </Button>
        </div>
      </Space>

      <Modal
        title="Delete Account"
        open={deleteModalVisible}
        onOk={deleteAccount}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete Account"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
          </div>
          <Title level={4} style={{ textAlign: 'center' }}>
            Are you sure you want to delete your account?
          </Title>
          <Text type="secondary">
            This action cannot be undone. All your data, including notes, settings, and progress, will be permanently deleted.
          </Text>
        </Space>
      </Modal>
    </Card>
  );
};

export default PrivacySettings;
