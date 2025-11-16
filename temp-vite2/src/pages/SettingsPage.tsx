import React from 'react';
import { Card, Tabs, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, BellOutlined, RobotOutlined, AppstoreOutlined } from '@ant-design/icons';
import ThemeSettings from '../components/settings/ThemeSettings';

const { Title } = Typography;

const SettingsPage: React.FC = () => {
  const items = [
    {
      key: 'appearance',
      label: (
        <span>
          <AppstoreOutlined />
          Appearance
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Theme Settings</Title>
          <p>Customize the look and feel of the application.</p>
          <ThemeSettings />
        </Card>
      ),
    },
    {
      key: 'account',
      label: (
        <span>
          <UserOutlined />
          Account
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Account Settings</Title>
          <p>Manage your account information and preferences.</p>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          Security
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Security Settings</Title>
          <p>Manage your password and security settings.</p>
        </Card>
      ),
    },
    {
      key: 'ai-assistant',
      label: (
        <span>
          <RobotOutlined />
          AI Assistant
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>AI Assistant Settings</Title>
          <p>Configure your AI assistant preferences.</p>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Notification Preferences</Title>
          <p>Customize how you receive notifications.</p>
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Settings</Title>
        <Tabs
          defaultActiveKey="appearance"
          tabPosition="left"
          style={{ minHeight: 'calc(100vh - 180px)' }}
          items={items}
        />
      </Space>
    </div>
  );
};

export default SettingsPage;
