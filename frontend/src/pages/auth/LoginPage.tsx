import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../features/auth/context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
<<<<<<< HEAD
import styles from './LoginPage.module.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

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
<<<<<<< HEAD
    <div className={styles['loginContainer']}>
      <Card className={styles['loginCard']}>
        <Title level={2} className={styles['loginTitle']}>
=======
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          Login to NoteFusion AI
        </Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
<<<<<<< HEAD
          className={styles['loginForm']}
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
<<<<<<< HEAD
              id="login-email"
              name="email"
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
              id="login-password"
              name="password"
              prefix={<LockOutlined />}
=======
              prefix={<LockOutlined />}
              type="password"
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
<<<<<<< HEAD
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
=======
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Log in
            </Button>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
