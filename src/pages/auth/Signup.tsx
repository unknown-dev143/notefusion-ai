import { useState } from 'react';
import { Button, Form, Input, Card, Typography, message, Divider, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password);
      message.success('Registration successful! You are now logged in.');
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      message.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    message.info(`${provider} signup is not yet implemented. This is a demo.`);
    // In a real app, this would redirect to OAuth provider
  };

  // If user is already logged in, redirect them to the home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 450, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Create an Account</Title>
          <Text type="secondary">Join NoteFusion AI today</Text>
        </div>
        
        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Full Name" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%' }}
              size="large"
            >
              Sign Up
            </Button>
          </Form.Item>

        <Divider>Or continue with</Divider>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            icon={<GoogleOutlined />}
            onClick={() => handleSocialSignup('Google')}
            block
            size="large"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Continue with Google
          </Button>
          
          <Button 
            icon={<GithubOutlined />}
            onClick={() => handleSocialSignup('GitHub')}
            block
            size="large"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Continue with GitHub
          </Button>
        </Space>

        <div style={{ textAlign: 'center' }}>
          <Text>Already have an account? </Text>
          <Link to="/login">Log in</Link>
        </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
