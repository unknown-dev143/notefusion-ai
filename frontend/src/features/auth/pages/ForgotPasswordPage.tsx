import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      await resetPassword(values.email);
      setEmailSent(true);
      message.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      message.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" hoverable>
        <div className="auth-header">
          <Title level={3}>Reset Password</Title>
          <Text type="secondary">
            {emailSent
              ? 'Check your email for the reset link'
              : 'Enter your email to receive a reset link'}
          </Text>
        </div>

        {!emailSent ? (
          <Form
            form={form}
            name="forgot-password"
            onFinish={onFinish}
            className="auth-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="Email"
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
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="success-message">
            <Text>
              We've sent an email with instructions to reset your password. If you don't see it, check
              your spam folder.
            </Text>
            <Button
              type="primary"
              className="back-to-login"
              onClick={() => {
                setEmailSent(false);
                form.resetFields();
              }}
              block
            >
              Back to Login
            </Button>
          </div>
        )}

        <div className="auth-footer">
          <Text>
            Remember your password?{' '}
            <Link to="/login" className="login-link">
              Log in
            </Link>
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

        .success-message {
          text-align: center;
          margin-bottom: 24px;
        }

        .back-to-login {
          margin-top: 16px;
        }

        .auth-footer {
          text-align: center;
          margin-top: 16px;
        }

        .login-link {
          font-weight: 500;
          color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;
