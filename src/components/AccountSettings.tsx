import React, { useState } from 'react';
import { Card, Typography, Button, Space, Divider, message, Input, Select, Modal, Avatar } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

interface AccountInfo {
  username: string;
  email: string;
  phone: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  bio: string;
  location: string;
  website: string;
  birthday: string;
  verified: boolean;
  premium: boolean;
  twoFactorEnabled: boolean;
  lastLogin: string;
  accountCreated: string;
}

const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    username: user?.name || '',
    email: user?.email || '',
    phone: '+1234567890',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    bio: 'Passionate learner and knowledge enthusiast',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    birthday: '1990-01-01',
    verified: true,
    premium: false,
    twoFactorEnabled: false,
    lastLogin: '2024-01-15 10:30 AM',
    accountCreated: '2023-06-15'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleAccountInfoChange = (field: keyof AccountInfo, value: string) => {
    setAccountInfo(prev => ({ ...prev, [field]: value }));
  };

  const saveAccountInfo = () => {
    // Here you would typically save to backend
    message.success('Account information saved successfully!');
    setIsEditing(false);
  };

  const changePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      message.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      message.error('Password must be at least 8 characters long');
      return;
    }

    // Here you would typically handle password change
    message.success('Password changed successfully!');
    setPasswordModalVisible(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const deactivateAccount = () => {
    // Here you would typically handle account deactivation
    message.warning('Account deactivation request submitted. You will receive an email with instructions.');
  };

  return (
    <Card title="Account Settings" extra={<UserOutlined />}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>Profile Information</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <Text strong>{accountInfo.username}</Text>
                <br />
                <Text type="secondary">{accountInfo.email}</Text>
              </div>
            </div>

            <div>
              <Text strong>Username</Text>
              {isEditing ? (
                <Input
                  value={accountInfo.username}
                  onChange={(e) => handleAccountInfoChange('username', e.target.value)}
                  style={{ marginTop: 8 }}
                />
              ) : (
                <div style={{ marginTop: 8 }}>
                  <Text>{accountInfo.username}</Text>
                </div>
              )}
            </div>

            <div>
              <Text strong>Email Address</Text>
              {isEditing ? (
                <Input
                  value={accountInfo.email}
                  onChange={(e) => handleAccountInfoChange('email', e.target.value)}
                  style={{ marginTop: 8 }}
                />
              ) : (
                <div style={{ marginTop: 8 }}>
                  <Text>{accountInfo.email}</Text>
                </div>
              )}
            </div>

            <div>
              <Text strong>Phone Number</Text>
              {isEditing ? (
                <Input
                  value={accountInfo.phone}
                  onChange={(e) => handleAccountInfoChange('phone', e.target.value)}
                  style={{ marginTop: 8 }}
                />
              ) : (
                <div style={{ marginTop: 8 }}>
                  <Text>{accountInfo.phone}</Text>
                </div>
              )}
            </div>
          </Space>

          <div style={{ marginTop: 16 }}>
            {isEditing ? (
              <Space>
                <Button type="primary" onClick={saveAccountInfo}>
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Space>
            ) : (
              <Button type="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Divider />

        <div>
          <Title level={5}>Preferences</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Timezone</Text>
              <Select
                value={accountInfo.timezone}
                onChange={(value) => handleAccountInfoChange('timezone', value)}
                style={{ width: '100%', marginTop: 8 }}
                disabled={!isEditing}
              >
                <Option value="UTC">UTC</Option>
                <Option value="America/New_York">Eastern Time</Option>
                <Option value="America/Chicago">Central Time</Option>
                <Option value="America/Denver">Mountain Time</Option>
                <Option value="America/Los_Angeles">Pacific Time</Option>
                <Option value="Europe/London">London</Option>
                <Option value="Europe/Paris">Paris</Option>
                <Option value="Asia/Tokyo">Tokyo</Option>
              </Select>
            </div>

            <div>
              <Text strong>Language</Text>
              <Select
                value={accountInfo.language}
                onChange={(value) => handleAccountInfoChange('language', value)}
                style={{ width: '100%', marginTop: 8 }}
                disabled={!isEditing}
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
              <Text strong>Date Format</Text>
              <Select
                value={accountInfo.dateFormat}
                onChange={(value) => handleAccountInfoChange('dateFormat', value)}
                style={{ width: '100%', marginTop: 8 }}
                disabled={!isEditing}
              >
                <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
              </Select>
            </div>

            <div>
              <Text strong>Time Format</Text>
              <Select
                value={accountInfo.timeFormat}
                onChange={(value) => handleAccountInfoChange('timeFormat', value)}
                style={{ width: '100%', marginTop: 8 }}
                disabled={!isEditing}
              >
                <Option value="12h">12-hour (AM/PM)</Option>
                <Option value="24h">24-hour</Option>
              </Select>
            </div>
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={5}>Security</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button icon={<LockOutlined />} onClick={() => setPasswordModalVisible(true)} block>
              Change Password
            </Button>
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={5}>Account Actions</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button danger onClick={deactivateAccount} block>
              Deactivate Account
            </Button>
          </Space>
        </div>
      </Space>

      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onOk={changePassword}
        onCancel={() => setPasswordModalVisible(false)}
        okText="Change Password"
        cancelText="Cancel"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Current Password</Text>
            <Input.Password
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Text strong>New Password</Text>
            <Input.Password
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Text strong>Confirm New Password</Text>
            <Input.Password
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>
    </Card>
  );
};

export default AccountSettings;
