import { useState, useEffect } from 'react';
import { Modal, Input, Button, Typography, Alert, Space, Progress, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const MFAVerification = () => {
  const { login, pendingAuth, setMfaRequired } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendEnabled(true);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      if (!pendingAuth) return;
      await login(pendingAuth.email, pendingAuth.password, otp);
      setMfaRequired(false);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimeLeft(30);
    setResendEnabled(false);
    setError('');
    // In a real app, this would trigger a new OTP to be sent
    message.info('A new verification code has been sent to your device');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6) {
      handleVerify();
    }
  };

  if (!pendingAuth) return null;

  return (
    <Modal
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Two-Factor Authentication
          </Title>
        </Space>
      }
      open={true}
      footer={null}
      closable={false}
      width={400}
    >
      {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
      
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Title level={5}>Enter Verification Code</Title>
        <Text type="secondary">
          We've sent a 6-digit code to your authenticator app
        </Text>
        
        <Input
          placeholder="000000"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          onKeyPress={handleKeyPress}
          style={{ 
            width: 200, 
            margin: '24px 0',
            textAlign: 'center',
            fontSize: '24px',
            letterSpacing: '8px'
          }}
          autoFocus
        />
        
        <div style={{ marginBottom: '16px' }}>
          <Progress 
            percent={((30 - timeLeft) / 30) * 100} 
            showInfo={false} 
            strokeColor="#1890ff"
            size="small"
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Code expires in {timeLeft}s
          </Text>
        </div>
        
        <Space>
          <Button 
            type="primary" 
            onClick={handleVerify} 
            disabled={otp.length !== 6 || loading}
            loading={loading}
          >
            Verify
          </Button>
          
          <Button 
            type="link" 
            onClick={handleResend}
            disabled={!resendEnabled}
          >
            Resend Code
          </Button>
        </Space>
        
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Lost access to your device?{' '}
            <Button type="link" style={{ padding: 0, height: 'auto' }}>
              Contact Support
            </Button>
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default MFAVerification;
