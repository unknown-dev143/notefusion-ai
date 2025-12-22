import React from 'react';
import { Modal, Typography, Space, Card, Progress, Badge } from 'antd';
import { ThunderboltOutlined, TrophyOutlined, GiftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface AdRewardsScreenProps {
  visible: boolean;
  onClose: () => void;
}

const AdRewardsScreen: React.FC<AdRewardsScreenProps> = ({ visible, onClose }) => {
  const handleWatchAd = () => {
    console.log('Watching ad to earn tokens...');
    setTimeout(() => {
      console.log('Ad completed, tokens earned!');
      onClose();
    }, 2000);
  };

  const handleCompleteOffer = () => {
    console.log('Completing offer to earn tokens...');
    setTimeout(() => {
      console.log('Offer completed, tokens earned!');
      onClose();
    }, 1500);
  };

  return (
    <Modal
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#52c41a' }} />
          <span>Earn More Tokens</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        <Title level={4}>Choose how to earn tokens:</Title>
        
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <Card
            title={
              <Space>
                <GiftOutlined style={{ color: '#1890ff' }} />
                <span>Watch Advertisement</span>
              </Space>
            }
            extra={<Badge count='10 tokens' style={{ backgroundColor: '#52c41a' }} />}
            style={{ cursor: 'pointer' }}
            onClick={handleWatchAd}
          >
            <Text>Watch a short advertisement to earn 10 tokens. Takes approximately 30 seconds.</Text>
            <Progress percent={100} showInfo={false} style={{ marginTop: 10 }} />
          </Card>

          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: '#faad14' }} />
                <span>Complete Offer</span>
              </Space>
            }
            extra={<Badge count='25 tokens' style={{ backgroundColor: '#faad14' }} />}
            style={{ cursor: 'pointer' }}
            onClick={handleCompleteOffer}
          >
            <Text>Complete a sponsored offer to earn 25 tokens. Takes approximately 1 minute.</Text>
            <Progress percent={75} showInfo={false} style={{ marginTop: 10 }} />
          </Card>

          <Card
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#f5222d' }} />
                <span>Daily Bonus</span>
              </Space>
            }
            extra={<Badge count='5 tokens' style={{ backgroundColor: '#f5222d' }} />}
            style={{ cursor: 'pointer', opacity: 0.5 }}
          >
            <Text>Claim your daily bonus tokens. Available once every 24 hours.</Text>
            <Progress percent={30} showInfo={false} style={{ marginTop: 10 }} />
            <Text type='secondary' style={{ fontSize: 12 }}>Available in 18 hours</Text>
          </Card>
        </Space>

        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Text type='secondary'>
            Tokens can be used to unlock premium features, get AI assistance, and access advanced tools.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default AdRewardsScreen;
