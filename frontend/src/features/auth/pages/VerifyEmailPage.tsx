import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Typography, Space, Button, Result, Spin, message } from 'antd';
import { useAuth } from '../context/AuthContext';
import { MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      verifyEmail(token)
        .then(() => {
          setStatus('success');
          message.success('Email verified successfully!');
        })
        .catch(() => {
          setStatus('error');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setStatus('resend');
      setLoading(false);
    }
  }, [searchParams, verifyEmail]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const { success, message: msg } = await resendVerificationEmail(email);
      if (success) {
        message.success('Verification email resent successfully!');
      } else {
        message.error(msg);
      }
    } catch (error) {
      message.error('Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <Card>
        {status === 'verifying' && (
          <Result
            title="Verifying your email..."
            subTitle="Please wait while we verify your email address."
            icon={<Spin size="large" />}
          />
        )}

        {status === 'success' && (
          <Result
            status="success"
            title="Email Verified!"
            subTitle="Your email has been successfully verified. You can now log in to your account."
            extra={[
              <Button type="primary" key="login" onClick={() => navigate('/login')}>
                Go to Login
              </Button>,
            ]}
          />
        )}

        {status === 'error' && (
          <Result
            status="error"
            title="Verification Failed"
            subTitle="The verification link is invalid or has expired. Please request a new verification email."
            extra={[
              <Button type="primary" key="resend" onClick={handleResendEmail}>
                Resend Verification Email
              </Button>,
            ]}
          />
        )}

        {status === 'resend' && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={3} style={{ textAlign: 'center' }}>
              Verify Your Email
            </Title>
            <Text>
              We've sent a verification link to <strong>{email || 'your email address'}</strong>.
              Please check your inbox and click the link to verify your email.
            </Text>
            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                icon={<MailOutlined />}
                onClick={handleResendEmail}
                loading={loading}
              >
                Resend Verification Email
              </Button>
            </div>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
              Didn't receive the email? Check your spam folder or request a new verification email.
            </Text>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
