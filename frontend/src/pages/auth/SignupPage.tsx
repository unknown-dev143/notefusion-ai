import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import styles from './SignupPage.module.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

const { Title } = Typography;

const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    try {
      setLoading(true);
      // Replace with actual signup logic
      // await authApi.signup(values);
      message.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      message.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className={styles['signupContainer']}>
      <Card className={styles['signupCard']}>
        <Title level={2} className={styles['signupTitle']}>
=======
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          Create an Account
        </Title>
        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
<<<<<<< HEAD
          className={styles['signupForm']}
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input
<<<<<<< HEAD
              id="signup-name"
              name="name"
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
<<<<<<< HEAD
              id="signup-email"
              name="email"
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              prefix={<MailOutlined />}
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
              id="signup-password"
              name="password"
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
<<<<<<< HEAD
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match! '));
                },
              }),
            ]}
          >
            <Input.Password
              id="signup-confirm-password"
              name="confirmPassword"
=======
            rules={[{ required: true, message: 'Please confirm your password!' }]}
          >
            <Input.Password
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
<<<<<<< HEAD
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className={styles['signupButton']}
            >
              Sign Up
            </Button>
            <div className={styles['loginLink']}>
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </Form.Item>
        </Form>
=======
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </div>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      </Card>
    </div>
  );
};

export default SignupPage;
