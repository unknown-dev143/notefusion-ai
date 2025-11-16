import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { Button, Card, Form, Input, message, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ProfileFormValues {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const UserProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: ProfileFormValues) => {
    try {
      setLoading(true);
      await updateProfile({
        name: values.name,
        email: values.email,
        ...(values.newPassword && {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      message.success('Profile updated successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={2}>User Profile</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            name: user?.name,
            email: user?.email,
          }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Title level={4} style={{ marginTop: 24 }}>Change Password</Title>
          
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              {
                validator(_, value) {
                  if (!value || !form.getFieldValue('newPassword')) {
                    return Promise.resolve();
                  }
                  if (value.length < 6) {
                    return Promise.reject(new Error('Password must be at least 6 characters long'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              {
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  if (value.length < 6) {
                    return Promise.reject(new Error('Password must be at least 6 characters long'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              {
                validator(_, value) {
                  if (!value || !form.getFieldValue('newPassword')) {
                    return Promise.resolve();
                  }
                  if (value !== form.getFieldValue('newPassword')) {
                    return Promise.reject(new Error('The two passwords do not match!'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Profile
              </Button>
              <Button htmlType="button" onClick={() => form.resetFields()}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserProfile;
