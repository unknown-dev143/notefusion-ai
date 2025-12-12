import React, { useState } from 'react';
import { Card, List, Button, Typography, Tag, Modal, message, Space } from 'antd';
import { 
  LaptopOutlined, 
  MobileOutlined, 
  DesktopOutlined, 
  TabletOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'laptop';
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

const SessionsManager: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Windows PC',
      deviceType: 'desktop',
      browser: 'Chrome 120',
      location: 'New York, US',
      ipAddress: '192.168.1.100',
      lastActive: new Date().toISOString(),
      isCurrent: true
    },
    {
      id: '2',
      device: 'iPhone 14',
      deviceType: 'mobile',
      browser: 'Safari 16',
      location: 'Los Angeles, US',
      ipAddress: '192.168.1.101',
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      isCurrent: false
    },
    {
      id: '3',
      device: 'MacBook Pro',
      deviceType: 'laptop',
      browser: 'Firefox 121',
      location: 'London, UK',
      ipAddress: '192.168.1.102',
      lastActive: new Date(Date.now() - 7200000).toISOString(),
      isCurrent: false
    }
  ]);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <DesktopOutlined />;
      case 'mobile': return <MobileOutlined />;
      case 'tablet': return <TabletOutlined />;
      case 'laptop': return <LaptopOutlined />;
      default: return <LaptopOutlined />;
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const handleRevokeSession = (sessionId: string) => {
    Modal.confirm({
      title: 'Revoke Session',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to revoke this session? The user will be logged out immediately.',
      okText: 'Revoke',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setSessions(sessions.filter(s => s.id !== sessionId));
        message.success('Session revoked successfully');
      },
    });
  };

  const handleRevokeAllOther = () => {
    Modal.confirm({
      title: 'Revoke All Other Sessions',
      icon: <SafetyOutlined />,
      content: 'This will sign you out from all other devices except your current session. Are you sure?',
      okText: 'Revoke All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setSessions(sessions.filter(s => s.isCurrent));
        message.success('All other sessions have been revoked');
      },
    });
  };

  return (
    <Card 
      title={
        <Space>
          <SafetyOutlined />
          <span>Active Sessions</span>
        </Space>
      }
      extra={
        sessions.filter(s => !s.isCurrent).length > 0 && (
          <Button 
            type="link" 
            danger 
            onClick={handleRevokeAllOther}
          >
            Revoke All Others
          </Button>
        )
      }
    >
      <List
        dataSource={sessions}
        renderItem={(session) => (
          <List.Item
            actions={
              !session.isCurrent ? [
                <Button
                  key="revoke"
                  type="text"
                  danger
                  icon={<LogoutOutlined />}
                  onClick={() => handleRevokeSession(session.id)}
                >
                  Revoke
                </Button>
              ] : undefined
            }
          >
            <List.Item.Meta
              avatar={
                <div style={{ fontSize: '24px', color: '#1890ff' }}>
                  {getDeviceIcon(session.deviceType)}
                </div>
              }
              title={
                <Space>
                  <Text strong>{session.device}</Text>
                  {session.isCurrent && (
                    <Tag color="green">Current Session</Tag>
                  )}
                </Space>
              }
              description={
                <div>
                  <div style={{ marginBottom: '4px' }}>
                    <Text type="secondary">{session.browser} • {session.location}</Text>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      IP: {session.ipAddress}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Last active: {formatLastActive(session.lastActive)}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      
      <div style={{ marginTop: '16px', padding: '12px', background: '#f6f8fa', borderRadius: '6px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <SafetyOutlined style={{ marginRight: '4px' }} />
          For your security, we recommend reviewing your active sessions regularly and revoking any you don't recognize.
        </Text>
      </div>
    </Card>
  );
};

export default SessionsManager;
