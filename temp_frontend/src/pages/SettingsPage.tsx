import React, { useState } from 'react';
<<<<<<< HEAD
import { 
  Tabs, 
  Form, 
  Select, 
  Typography, 
  message, 
  Switch, 
  Card, 
  Button, 
  Input,
  Divider,
  CardProps,
  ButtonProps,
  SelectProps
} from 'antd';
import type { TabsProps } from 'antd';
import { 
  GlobalOutlined,
  UserOutlined,
  LockOutlined,
  BulbOutlined
} from '@ant-design/icons';
import styles from './SettingsPage.module.css';

const { Title } = Typography;
const { Option } = Select;

interface NotificationSettings {
  email: boolean;
  push: boolean;
  news: boolean;
}

interface LoadingState {
  profile: boolean;
  password: boolean;
  notifications: boolean;
  account: boolean;
}

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState<LoadingState>({
    profile: false,
    password: false,
    notifications: false,
    account: false
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    news: true
  });
  
  const [language, setLanguage] = useState('en');
  const [passwordForm] = Form.useForm();


  const handleProfileUpdate = async (values: Record<string, unknown>) => {
    setLoading(prev => ({ ...prev, profile: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
=======
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Failed to update profile');
    } finally {
<<<<<<< HEAD
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string }) => {
    setLoading(prev => ({ ...prev, password: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
=======
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      setLoading(true);
      // Replace with actual API call
      // await authApi.changePassword(values);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      message.success('Password updated successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Failed to update password:', error);
      message.error('Failed to update password');
    } finally {
<<<<<<< HEAD
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleNotificationChange = (type: 'email' | 'push' | 'news', checked: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: checked
    }));
=======
      setLoading(false);
    }
  };

  const handleNotificationChange = (checked: boolean, setting: string) => {
    console.log(`Notification setting ${setting} changed to ${checked}`);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    // Here you would typically update the notification settings via an API
  };

  const handleLanguageChange = (value: string) => {
<<<<<<< HEAD
    setLanguage(value);
    // Here you would typically update the language setting via an API
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setLoading(prev => ({ ...prev, account: true }));
        // Here you would typically call an API to delete the account
        await new Promise(resolve => setTimeout(resolve, 1000));
        message.success('Account deleted successfully');
        // Redirect to home or login page
      } catch (error) {
        console.error('Failed to delete account:', error);
        message.error('Failed to delete account');
      } finally {
        setLoading(prev => ({ ...prev, account: false }));
      }
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className={styles['tabLabel']}>
          <UserOutlined className={styles['tabIcon']} />
          Profile
        </span>
      ),
      children: (
        <Card className={styles['settingsCard'] as string}>
          <Form
            layout="vertical"
            onFinish={handleProfileUpdate}
            className={styles['profileForm']}
          >
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined />} placeholder="Your name" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}>
              <Input type="email" placeholder="your.email@example.com" />
            </Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading.profile}
              className={styles['submitButton'] as string}
            >
              Save Changes
            </Button>
          </Form>
        </Card>
      ),
    },
    {
      key: '2',
      label: 'Security',
      children: (
        <Card className={styles['settingsCard'] as string}>
          <Form
            layout="vertical"
            onFinish={handlePasswordChange}
            className={styles['passwordForm']}
          >
            <Form.Item 
              name="currentPassword" 
              label="Current Password" 
              rules={[{ required: true }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Current password" />
            </Form.Item>
            <Form.Item 
              name="newPassword" 
              label="New Password" 
              rules={[{ required: true, min: 8 }]}
            >
              <Input.Password placeholder="New password" />
            </Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading.password}
              className={styles['submitButton'] as string}
            >
              Update Password
            </Button>
          </Form>
        </Card>
      ),
    },
    {
      key: '3',
      label: 'Notifications',
      children: (
        <Card className={styles['settingsCard'] as string}>
          <div className={styles['notificationSettings']}>
            <div className={styles['notificationSetting']}>
              <div className={styles['settingTitle']}>Email Notifications</div>
              <div className={styles['settingDescription']}>Receive email notifications</div>
              <Switch 
                checked={notificationSettings.email} 
                onChange={(checked) => handleNotificationChange('email', checked)} 
              />
            </div>
            <div className={styles['notificationSetting']}>
              <div className={styles['settingTitle']}>Push Notifications</div>
              <div className={styles['settingDescription']}>Receive push notifications</div>
              <Switch 
                checked={notificationSettings.push} 
                onChange={(checked) => handleNotificationChange('push', checked)} 
              />
            </div>
            <div className={styles['notificationSetting']}>
              <div className={styles['settingTitle']}>Newsletter</div>
              <div className={styles['settingDescription']}>Receive our newsletter</div>
              <Switch 
                checked={notificationSettings.news} 
                onChange={(checked) => handleNotificationChange('news', checked)} 
              />
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: '4',
      label: 'Preferences',
      children: (
        <Card className={styles['settingsCard'] as string}>
          <div className={styles['preferences']}>
            <div className={styles['preference']}>
              <div className={styles['preferenceTitle']}>Language</div>
              <Select 
                value={language} 
                onChange={handleLanguageChange}
                className={styles['languageSelect'] as string}
              >
                <Option value="en">English</Option>
                <Option value="es">Español</Option>
                <Option value="fr">Français</Option>
                <Option value="de">Deutsch</Option>
              </Select>
            </div>
            <div className={styles['preference']}>
              <div className={styles['preferenceTitle']}>Theme</div>
              <div className={styles['theme']}>
                <BulbOutlined className={styles['themeIcon']} />
                <span className={styles['themeText']}>Light / Dark</span>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: '5',
      label: 'Account',
      children: (
        <Card className={styles['settingsCard'] as string}>
          <div className={styles['dangerZoneContainer']}>
            <Title level={4} className={styles['dangerZoneTitle'] as string}>Danger Zone</Title>
            <div className={styles['dangerZone']}>
              <div className={styles['dangerAction']}>
                <div className={styles['optionTitle']}>Delete Account</div>
                <div className={styles['optionDescription']}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </div>
                <Button 
                  type="primary" 
                  danger 
                  onClick={handleDeleteAccount}
                  loading={loading.account}
                  className={styles['deleteButton'] as string}
                >
                  Delete My Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className={styles['settingsPage']}>
      <Title level={2} className={styles['sectionTitle'] as string}>
        <GlobalOutlined className={styles['settingsIcon']} />
        Settings
      </Title>
      <Tabs 
        defaultActiveKey="1" 
        items={items} 
        tabPosition="left"
        className="settings-tabs"
      />
=======
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    </div>
  );
};

export default SettingsPage;
