import React, { useState } from 'react';
import { Tabs, Card, Button, Switch, Form, Select, Input, Typography, Divider, message } from 'antd';
import { 
  UserOutlined, 
  BellOutlined, 
  LockOutlined, 
  CreditCardOutlined, 
  NotificationOutlined,
  GlobalOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useAuth } from '../features/auth/context/AuthContext';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleProfileUpdate = async (values: any) => {
    try {
      setLoading(true);
      // Replace with actual API call
      // await userApi.updateProfile(values);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      setLoading(true);
      // Replace with actual API call
      // await authApi.changePassword(values);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      message.success('Password updated successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Failed to update password:', error);
      message.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (checked: boolean, setting: string) => {
    console.log(`Notification setting ${setting} changed to ${checked}`);
    // Here you would typically update the notification settings via an API
  };

  const handleLanguageChange = (value: string) => {
    console.log(`Language changed to ${value}`);
    // Here you would typically update the language setting via an API
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested');
      // Here you would typically call an API to delete the account
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Settings</Title>
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Profile
            </span>
          }
          key="1"
        >
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
              initialValues={{
                name: user?.name || '',
                email: user?.email || '',
              }}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input placeholder="Full Name" size="large" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input placeholder="Email" size="large" disabled />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BellOutlined />
              Notifications
            </span>
          }
          key="2"
        >
          <Card>
            <Title level={4}>Email Notifications</Title>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <Text strong>Account Notifications</Text>
                  <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                    Receive emails about your account activity
                  </div>
                </div>
                <Switch 
                  defaultChecked 
                  onChange={(checked) => handleNotificationChange(checked, 'account')} 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <Text strong>Product Updates</Text>
                  <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                    Get updates about new features and improvements
                  </div>
                </div>
                <Switch 
                  defaultChecked 
                  onChange={(checked) => handleNotificationChange(checked, 'updates')} 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text strong>Marketing Emails</Text>
                  <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                    Receive promotional emails and offers
                  </div>
                </div>
                <Switch 
                  defaultChecked 
                  onChange={(checked) => handleNotificationChange(checked, 'marketing')} 
                />
              </div>
            </div>

            <Divider />

            <Title level={4}>In-App Notifications</Title>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <Text strong>Desktop Notifications</Text>
                  <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                    Show desktop notifications
                  </div>
                </div>
                <Switch 
                  defaultChecked 
                  onChange={(checked) => handleNotificationChange(checked, 'desktop')} 
                />
              </div>
            </div>

            <Button type="primary" loading={loading}>
              Save Notification Settings
            </Button>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <LockOutlined />
              Security
            </span>
          }
          key="3"
        >
          <Card>
            <Title level={4}>Change Password</Title>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
              style={{ maxWidth: '500px', marginBottom: '2rem' }}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password placeholder="Current Password" size="large" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required: true, message: 'Please input your new password!' }]}
              >
                <Input.Password placeholder="New Password" size="large" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm New Password" size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            <Title level={4}>Two-Factor Authentication</Title>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Two-Factor Authentication</Text>
                  <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                    Add an extra layer of security to your account
                  </div>
                </div>
                <Switch 
                  defaultChecked={false}
                  onChange={(checked) => console.log('2FA:', checked)} 
                />
              </div>
            </div>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <GlobalOutlined />
              Preferences
            </span>
          }
          key="4"
        >
          <Card>
            <Title level={4}>Language & Region</Title>
            <div style={{ maxWidth: '500px', marginBottom: '2rem' }}>
              <Form layout="vertical">
                <Form.Item label="Language" name="language">
                  <Select 
                    defaultValue="en" 
                    style={{ width: '100%' }}
                    onChange={handleLanguageChange}
                  >
                    <Option value="en">English</Option>
                    <Option value="es">Español</Option>
                    <Option value="fr">Français</Option>
                    <Option value="de">Deutsch</Option>
                    <Option value="ja">日本語</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Time Zone" name="timezone">
                  <Select 
                    defaultValue="UTC+00:00" 
                    style={{ width: '100%' }}
                  >
                    <Option value="UTC-12:00">(UTC-12:00) International Date Line West</Option>
                    <Option value="UTC-11:00">(UTC-11:00) Coordinated Universal Time-11</Option>
                    <Option value="UTC+00:00">(UTC+00:00) Dublin, Edinburgh, Lisbon, London</Option>
                    <Option value="UTC+04:00">(UTC+04:00) Abu Dhabi, Muscat</Option>
                    <Option value="UTC+05:30">(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</Option>
                  </Select>
                </Form.Item>
              </Form>
            </div>

            <Divider />

            <Title level={4}>Danger Zone</Title>
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Button 
                  type="primary" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteAccount}
                >
                  Delete My Account
                </Button>
                <div style={{ color: 'rgba(0, 0, 0, 0.45)', marginTop: '0.5rem' }}>
                  Permanently delete your account and all associated data
                </div>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
