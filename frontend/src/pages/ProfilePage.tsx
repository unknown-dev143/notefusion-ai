<<<<<<< HEAD
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UserProfile } from '@/features/user/components/UserProfile';
import styles from './ProfilePage.module.css';

// Type definition for CSS modules with exact properties
type ProfilePageStyles = {
  readonly [key: string]: string;
  readonly container: string;
  readonly card: string;
  readonly title: string;
};

const typedStyles = styles as unknown as ProfilePageStyles;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className={typedStyles.container}>
      <Card className={typedStyles.card}>
        <Typography.Title level={2} className={typedStyles.title}>
          User Profile
        </Typography.Title>
        <UserProfile />
=======
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Upload, Avatar, Space, Skeleton } from 'antd';
import { UserOutlined, UploadOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../features/auth/context/AuthContext';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      // Simulate loading user data
      setTimeout(() => {
        form.setFieldsValue({
          name: user.name || '',
          email: user.email || '',
        });
        setLoading(false);
      }, 500);
    }
  }, [user, form]);

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      // Here you would typically upload the file to your server
      // and get back the URL to save in the user's profile
      const url = URL.createObjectURL(info.file.originFileObj);
      setAvatarUrl(url);
      message.success('Profile picture updated successfully');
    }
  };

  const onFinish = async (values: any) => {
    try {
      setUpdating(true);
      // Replace with actual API call
      // await userApi.updateProfile(values);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (updateProfile) {
        updateProfile({
          ...user,
          ...values,
          avatar: avatarUrl || user?.avatar,
        });
      }
      
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      setUpdating(true);
      // Replace with actual API call
      // await authApi.changePassword(values);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      message.success('Password updated successfully');
    } catch (error) {
      console.error('Failed to update password:', error);
      message.error('Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Profile Settings</Title>
      
      <Card title="Profile Information" style={{ marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            onChange={handleAvatarChange}
            beforeUpload={() => false} // Prevent default upload
          >
            {avatarUrl || user?.avatar ? (
              <Avatar
                src={avatarUrl || user?.avatar}
                size={100}
                style={{ fontSize: '40px' }}
              />
            ) : (
              <div>
                <UserOutlined style={{ fontSize: '40px' }} />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={user}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              disabled
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              size="large"
            >
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Change Password">
        <Form
          name="change_password"
          onFinish={handlePasswordChange}
          layout="vertical"
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Current Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, message: 'Please input your new password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
              size="large"
            />
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
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm New Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              size="large"
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      </Card>
    </div>
  );
};

export default ProfilePage;
