import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      // TODO: Implement actual login logic
      console.log('Login values:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Login successful!');
      navigate('/notes');
    } catch (error) {
      console.error('Login error:', error);
      message.error('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: '1rem'
    }}>
      <Card 
        style={{ width: '100%', maxWidth: 500 }}
        bordered={false}
        className="card"
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Title level={3}>Welcome Back</Title>
          <p>Please login to your account</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters long!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '0.5rem' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              Log In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/forgot-password" style={{ float: 'right' }}>
              Forgot password?
            </Link>
          </div>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          Don't have an account?{' '}
          <Link to="/signup">
            <Button type="link" style={{ padding: 0 }}>Sign up</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
