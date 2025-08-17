import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // Validate the reset token
    const validateToken = async () => {
      if (!token || !email) {
        setValidToken(false);
        message.error('Invalid reset link. Please request a new one.');
        return;
      }

      try {
        // In a real app, you would validate the token with your backend
        // const isValid = await verifyResetToken(token, email);
        setValidToken(true);
      } catch (error) {
        setValidToken(false);
        message.error('This reset link is invalid or has expired.');
      }
    };

    validateToken();
  }, [token, email]);

  const onFinish = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    if (!token || !email) {
      message.error('Invalid reset link');
      return;
    }

    try {
      setLoading(true);
      // In a real app, you would call your API to reset the password
      // await resetPasswordWithToken(token, email, values.password);
      message.success('Password has been reset successfully!');
      navigate('/login');
    } catch (error) {
      message.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validToken === null) {
    return (
      <div className="auth-page">
        <Card className="auth-card" loading>
          <div style={{ height: '200px' }} />
        </Card>
      </div>
    );
  }

  if (validToken === false) {
    return (
      <div className="auth-page">
        <Card className="auth-card">
          <div className="auth-header">
            <Title level={3}>Invalid Reset Link</Title>
            <Text type="secondary">
              The password reset link is invalid or has expired. Please request a new one.
            </Text>
          </div>
          <div className="auth-footer">
            <Button type="primary" onClick={() => navigate('/forgot-password')} block>
              Request New Link
            </Button>
            <Button type="link" onClick={() => navigate('/login')} block>
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Card className="auth-card" hoverable>
        <div className="auth-header">
          <Title level={3}>Create New Password</Title>
          <Text type="secondary">Enter your new password below</Text>
        </div>

        <Form
          form={form}
          name="reset-password"
          onFinish={onFinish}
          className="auth-form"
          layout="vertical"
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: 'Must include uppercase, lowercase, and number',
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="New Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your new password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Confirm New Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="reset-button"
              size="large"
              loading={loading}
              block
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Text>
            Remembered your password?{' '}
            <a onClick={() => navigate('/login')} className="login-link">
              Log in
            </a>
          </Text>
        </div>
      </Card>

      <style jsx global>{`
        .auth-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f2f5;
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .reset-button {
          font-weight: 500;
        }

        .auth-footer {
          text-align: center;
          margin-top: 16px;
        }

        .login-link {
          font-weight: 500;
          color: #1890ff;
          cursor: pointer;
        }

        .ant-form-item-label > label {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;
