import { useState } from 'react';
import { Modal, Button, Input, Typography, Space, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { QRCode } from 'antd';

const { Title, Text } = Typography;

const MFASetup = () => {
  const { user, enableMFA, verifyMFA } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [secret, setSecret] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const handleEnableMFA = async () => {
    try {
      const { secret, otpauthUrl } = await enableMFA();
      setSecret(secret);
      setQrCodeData(otpauthUrl);
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to enable MFA. Please try again.');
    }
  };

  const handleVerify = async () => {
    try {
      await verifyMFA(otp, secret);
      setIsVerified(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsVerified(false);
        setOtp('');
      }, 2000);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    }
  };

  if (!user || user.mfaEnabled) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <Button type="primary" onClick={handleEnableMFA} icon={<LockOutlined />}>
        Enable Two-Factor Authentication
      </Button>

      <Modal
        title="Set Up Two-Factor Authentication"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
        
        {!isVerified ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Scan the QR Code</Title>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <QRCode value={qrCodeData} size={200} />
              </div>
              <div style={{ margin: '16px 0' }}>
                <Text>Or enter this secret key manually:</Text>
                <Text code>{secret}</Text>
              </div>
            </div>

            <div>
              <Title level={5}>Enter Verification Code</Title>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <Button type="primary" onClick={handleVerify} disabled={otp.length !== 6}>
                  Verify
                </Button>
              </Space.Compact>
            </div>
          </Space>
        ) : (
          <Alert
            message="Two-Factor Authentication Enabled Successfully!"
            type="success"
            showIcon
          />
        )}
      </Modal>
    </div>
  );
};

export default MFASetup;
