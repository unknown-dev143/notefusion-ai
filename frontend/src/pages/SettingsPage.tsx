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
} from 'antd';
import type { TabsProps } from 'antd';
import { 
  ShieldCheck, 
  BellRing, 
  Palette, 
  Trash2, 
  UserCircle,
  CreditCard,
  Zap,
  Globe,
  Sparkles
} from 'lucide-react';
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

import { useLanguage } from '../contexts/LanguageContext';

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
  
  const { language, setLanguage } = useLanguage();
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
    setLanguage(value as any);
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
          <UserCircle size={18} />
          Account Profile
        </span>
      ),
      children: (
        <div className={styles['settingsCard']}>
          <div className="p-8">
            <h3 className="text-xl font-black text-slate-900 mb-6">Profile Settings</h3>
            <Form
              layout="vertical"
              onFinish={handleProfileUpdate}
              className={styles['profileForm']}
            >
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input placeholder="E.g. Dr. Jane Doe" className="!rounded-2xl !py-4" />
              </Form.Item>
              <Form.Item name="email" label="Contact Email" rules={[{ type: 'email', required: true }]}>
                <Input type="email" placeholder="jane@example.com" className="!rounded-2xl !py-4" />
              </Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading.profile}
                className="!h-14 !rounded-2xl !px-10 !bg-slate-900 !font-black !uppercase !text-[10px] !tracking-widest !border-none hover:!bg-blue-600 transition-all"
              >
                Sync Changes
              </Button>
            </Form>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className={styles['tabLabel']}>
          <ShieldCheck size={18} />
          Security Access
        </span>
      ),
      children: (
        <div className={styles['settingsCard']}>
          <div className="p-8">
            <h3 className="text-xl font-black text-slate-900 mb-6">Security & Authentication</h3>
            <Form
              layout="vertical"
              onFinish={handlePasswordChange}
              className={styles['passwordForm']}
              form={passwordForm}
            >
              <Form.Item 
                name="currentPassword" 
                label="Current Authorization Key" 
                rules={[{ required: true }]}
              >
                <Input.Password placeholder="Enter current passphrase" stroke-width="3" className="!rounded-2xl !py-4" />
              </Form.Item>
              <Form.Item 
                name="newPassword" 
                label="New Neural Hash" 
                rules={[{ required: true, min: 8 }]}
              >
                <Input.Password placeholder="Enter new strong password" className="!rounded-2xl !py-4" />
              </Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading.password}
                className="!h-14 !rounded-2xl !px-10 !bg-slate-900 !font-black !uppercase !text-[10px] !tracking-widest !border-none hover:!bg-indigo-600 transition-all"
              >
                Update Access Key
              </Button>
            </Form>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span className={styles['tabLabel']}>
          <BellRing size={18} />
          Neural Alerts
        </span>
      ),
      children: (
        <div className={styles['settingsCard']}>
          <div className="p-8 space-y-6">
            <h3 className="text-xl font-black text-slate-900 mb-8">Notification Protocol</h3>
            <div className="space-y-4">
              {[
                { id: 'email', title: 'Intelligence Delivery', desc: 'Summary of AI research delivered to your inbox', icon: <Globe size={18}/> },
                { id: 'push', title: 'Neural Pulse', desc: 'Real-time desktop sync alerts', icon: <Zap size={18}/> },
                { id: 'news', title: 'System Updates', desc: 'New cognitive features and patches', icon: <Sparkles size={18}/> }
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800">{item.title}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</div>
                    </div>
                  </div>
                  <Switch 
                    checked={(notificationSettings as any)[item.id]} 
                    onChange={(checked) => handleNotificationChange(item.id as any, checked)} 
                    className="!bg-slate-200 data-[state=checked]:!bg-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <span className={styles['tabLabel']}>
          <Palette size={18} />
          Visual Matrix
        </span>
      ),
      children: (
        <div className={styles['settingsCard']}>
          <div className="p-8 space-y-10">
            <h3 className="text-xl font-black text-slate-900">Environment Preferences</h3>
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div>
                   <div className="text-sm font-black text-slate-800">Interface Language</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global localization settings</div>
                </div>
                <Select 
                  value={language} 
                  onChange={handleLanguageChange}
                  className="!w-48 !h-12"
                >
                  <Option value="en">English (US)</Option>
                  <Option value="es">Español</Option>
                  <Option value="fr">Français</Option>
                  <Option value="de">Deutsch</Option>
                  <Option value="zh">中文 (Chinese)</Option>
                  <Option value="ja">日本語 (Japanese)</Option>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                <div>
                   <div className="text-sm font-black text-slate-800">Visual Core Mode</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Switch between Dark and Light subspaces</div>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
                   <button className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Light</button>
                   <button className="px-5 py-2.5 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/50 transition-all">Dark</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '5',
      label: (
        <span className={styles['tabLabel']}>
          <Trash2 size={18} />
          Terminal Phase
        </span>
      ),
      children: (
        <div className={styles['settingsCard']}>
          <div className="p-8">
            <div className="bg-red-50/50 p-8 rounded-[32px] border border-red-100 flex flex-col items-center text-center">
               <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                 <Trash2 size={24}/>
               </div>
               <h3 className="text-xl font-black text-red-900 mb-2">Neural Deletion Zone</h3>
               <p className="max-w-md text-sm font-medium text-red-600/70 mb-8 leading-relaxed">
                  Permanently erase your entire knowledge repository and neural identity. This action is irreversible.
               </p>
               <Button 
                type="primary" 
                danger 
                onClick={handleDeleteAccount}
                loading={loading.account}
                className="!h-14 !rounded-2xl !px-12 !bg-red-600 !font-black !uppercase !text-[10px] !tracking-widest !border-none hover:!bg-red-700 transition-all shadow-xl shadow-red-200"
               >
                 Purge Neural Core
               </Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={`${styles['settingsPage']} animate-slide-up`}>
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center text-white shadow-2xl">
           <Zap size={32}/>
        </div>
        <div>
          <Title level={2} className="!m-0 font-black tracking-tight text-slate-900">
            System <span className="text-blue-600">Preferences</span>
          </Title>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">NoteFusion Core Version 1.2.0</p>
        </div>
      </div>
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
