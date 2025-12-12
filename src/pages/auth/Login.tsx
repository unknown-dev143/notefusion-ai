import { useState } from 'react';
import { Button, Form, Input, Card, Typography, message, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result?.requiresMfa) {
        // MFA verification will be handled by the MFAVerification component
        return;
      }
      navigate(from, { replace: true });
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    message.info(`${provider} login is not yet implemented. This is a demo.`);
    // In a real app, this would redirect to OAuth provider
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Login</Title>
          <Text type="secondary">Welcome back to NoteFusion AI</Text>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email' }
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
            rules={[{ required: true, message: 'Please input your password!' }]}
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
              block
              size="large"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>

        <Divider>Or continue with</Divider>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            icon={<GoogleOutlined />}
            onClick={() => handleSocialLogin('Google')}
            block
            size="large"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Continue with Google
          </Button>
          
          <Button 
            icon={<GithubOutlined />}
            onClick={() => handleSocialLogin('GitHub')}
            block
            size="large"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Continue with GitHub
          </Button>
        </Space>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text>Don't have an account? <Link to="/signup">Sign up</Link></Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
