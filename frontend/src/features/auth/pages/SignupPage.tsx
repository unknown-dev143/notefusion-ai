import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Card, message, Modal } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styles from './SignupPage.module.css';
import TermsAndConditions from '../components/TermsAndConditions';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();
  const { login, resendVerificationEmail } = useAuth();
  const [form] = Form.useForm();
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [email, setEmail] = useState('');

  const handleTermsAccept = () => {
    form.setFieldsValue({ acceptedTerms: true });
    setShowTerms(false);
  };

  const handleTermsDecline = () => {
    form.setFieldsValue({ acceptedTerms: false });
    setShowTerms(false);
  };

  const onFinish = async (values: SignupFormValues & { acceptedTerms?: boolean }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    if (!values.acceptedTerms) {
      message.warning('Please accept the Terms and Conditions');
      return;
    }

    try {
      setLoading(true);
      try {
        // Since we don't have a register method yet, we'll use login
        await login(values.email, values.password);
        setEmail(values.email);
        setVerificationModalVisible(true);
      } catch (error) {
        message.error(error instanceof Error ? error.message : 'Failed to create account');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" hoverable>
        <div className="auth-header">
          <Title level={3}>Create an Account</Title>
          <Text type="secondary">Join us to get started</Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          className="auth-form"
          scrollToFirstError
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Please input your name!' },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>

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

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
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
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
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
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="acceptedTerms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject('You must accept the terms and conditions'),
              },
            ]}
          >
            <div>
              <input
                type="checkbox"
                id="terms-checkbox"
                onChange={(e) => form.setFieldsValue({ acceptedTerms: e.target.checked })}
                className={styles.termsCheckbox}
              />
              <label htmlFor="terms-checkbox">
                I agree to the{' '}
                <Button type="link" onClick={() => setShowTerms(true)} style={{ padding: 0 }}>
                  Terms and Conditions
                </Button>
              </label>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="signup-button"
              size="large"
              loading={loading}
              block
            >
              Sign Up
            </Button>
          </Form.Item>

          <div className={styles.authFooter}>
            <Text>
              Already have an account?{' '}
              <Link to="/login" className={styles.loginLink}>
                Log in
              </Link>
            </Text>
          </div>
        </Form>
      </Card>

      <Modal
        title="Verify Your Email"
        open={verificationModalVisible}
        footer={null}
        closable={false}
      >
        <div className={styles.verificationModal}>
          <CheckCircleOutlined className={styles.verificationIcon} />
          <h3>Account Created Successfully!</h3>
          <p>We've sent a verification link to <strong>{email}</strong>.</p>
          <p>Please check your email and click the verification link to activate your account.</p>
          <Button 
            type="primary" 
            onClick={() => {
              setVerificationModalVisible(false);
              navigate('/verify-email', { state: { email } });
            }}
            className={styles.verificationButton}
          >
            Go to Verification Page
          </Button>
          <div className={styles.verificationLink}>
            <Button 
              type="link" 
              onClick={async () => {
                try {
                  await resendVerificationEmail(email);
                  message.success('Verification email resent!');
                } catch (error) {
                  message.error('Failed to resend verification email');
                }
              }}
            >
              Resend Verification Email
            </Button>
          </div>
        </div>
      </Modal>

      <TermsAndConditions 
        visible={showTerms}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />

      <style>{`
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

        .signup-button {
          font-weight: 500;
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

export default SignupPage;
