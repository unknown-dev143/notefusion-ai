import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../features/auth/context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './LoginPage.module.css';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      message.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['loginContainer']}>
      <Card className={styles['loginCard']}>
        <Title level={2} className={styles['loginTitle']}>
          Login to NoteFusion AI
        </Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          className={styles['loginForm']}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              id="login-email"
              name="email"
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
              id="login-password"
              name="password"
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
              className={styles['loginButton']}
            >
              Log in
            </Button>
            <div className={styles['signupLink']}>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          <Link to="/forgot-password">Forgot password?</Link> |{' '}
          <Link to="/signup">Create an account</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
