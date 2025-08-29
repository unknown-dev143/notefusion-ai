import React, { useState } from 'react';
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
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string }) => {
    setLoading(prev => ({ ...prev, password: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Password updated successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Failed to update password:', error);
      message.error('Failed to update password');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleNotificationChange = (type: 'email' | 'push' | 'news', checked: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: checked
    }));
    // Here you would typically update the notification settings via an API
  };

  const handleLanguageChange = (value: string) => {
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
    </div>
  );
};

export default SettingsPage;
