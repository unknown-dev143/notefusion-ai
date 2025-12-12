import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import TermsAndConditions from '../components/TermsAndConditions';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [form] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTermsAccept = () => {
    form.setFieldsValue({ acceptedTerms: true });
    setShowTerms(false);
  };

  const handleTermsDecline = () => {
    form.setFieldsValue({ acceptedTerms: false });
    setShowTerms(false);
  };

  const onFinish = async (values: LoginFormValues & { acceptedTerms?: boolean }) => {
    try {
      if (!values.acceptedTerms) {
        message.warning('Please accept the Terms and Conditions');
        return;
      }
      
      setLoading(true);
      await login(values.email, values.password);
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      message.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" hoverable>
        <div className="auth-header">
          <Title level={3}>Welcome Back</Title>
          <Text type="secondary">Please enter your credentials to login</Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
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

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="acceptedTerms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must accept the Terms and Conditions')),
              },
            ]}
          >
            <Checkbox>
              I agree to the{' '}
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  setShowTerms(true);
                }}
              >
                Terms and Conditions
              </a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <div className="auth-actions">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
              </Form.Item>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              size="large"
              loading={loading}
              block
            >
              Log in
            </Button>
          </Form.Item>

          <div className="auth-footer">
            <Text>
              Don't have an account?{' '}
              <Link to="/register" className="register-link">
                Sign up
              </Link>
            </Text>
          </div>
        </Form>
      </Card>

      <TermsAndConditions 
        visible={showTerms}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />

      <style jsx>{`
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

        .auth-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .forgot-password {
          color: #1890ff;
        }

        .login-button {
          font-weight: 500;
        }

        .auth-footer {
          text-align: center;
          margin-top: 16px;
        }

        .register-link {
          font-weight: 500;
          color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
