import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Progress, List, Switch, message, Alert, Row, Col, Badge } from 'antd';
import { 
  WifiOutlined, 
  DownloadOutlined, 
  SyncOutlined, 
  CloudOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface OfflineContent {
  id: string;
  title: string;
  type: 'note' | 'document' | 'video' | 'image';
  size: number;
  lastSynced: string;
  isAvailable: boolean;
}

interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  itemType: string;
  itemName: string;
  timestamp: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

const OfflineMode: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageQuota, setStorageQuota] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([
    {
      id: '1',
      title: 'Mathematics Study Notes',
      type: 'note',
      size: 2.5,
      lastSynced: '2024-01-16T10:30:00',
      isAvailable: true
    },
    {
      id: '2',
      title: 'Physics Lecture Video',
      type: 'video',
      size: 45.2,
      lastSynced: '2024-01-15T14:20:00',
      isAvailable: true
    },
    {
      id: '3',
      title: 'Chemistry Formula Sheet',
      type: 'document',
      size: 1.8,
      lastSynced: '2024-01-14T09:15:00',
      isAvailable: false
    }
  ]);

  const [syncQueue, setSyncQueue] = useState<SyncQueue[]>([
    {
      id: '1',
      action: 'update',
      itemType: 'note',
      itemName: 'Biology Chapter 5',
      timestamp: '2024-01-16T11:45:00',
      status: 'pending'
    },
    {
      id: '2',
      action: 'create',
      itemType: 'note',
      itemName: 'New Study Plan',
      timestamp: '2024-01-16T12:00:00',
      status: 'pending'
    }
  ]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check storage usage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        if (estimate.usage && estimate.quota) {
          setStorageQuota(Math.round((estimate.quota / 1024 / 1024) * 100) / 100);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && syncQueue.some(item => item.status === 'pending')) {
      autoSync();
    }
  }, [isOnline]);

  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);
    message.info(offlineMode ? 'Offline mode disabled' : 'Offline mode enabled');
  };

  const downloadForOffline = (contentId: string) => {
    const content = offlineContent.find(c => c.id === contentId);
    if (!content) return;

    // Simulate download
    message.loading(`Downloading ${content.title}...`, 0);
    
    setTimeout(() => {
      message.destroy();
      message.success(`${content.title} downloaded for offline use`);
      
      setOfflineContent(prev => prev.map(c => 
        c.id === contentId ? { ...c, isAvailable: true } : c
      ));
    }, 2000);
  };

  const removeFromOffline = (contentId: string) => {
    const content = offlineContent.find(c => c.id === contentId);
    if (!content) return;

    setOfflineContent(prev => prev.map(c => 
      c.id === contentId ? { ...c, isAvailable: false } : c
    ));
    
    message.success(`${content.title} removed from offline storage`);
  };

  const autoSync = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(0);

    const pendingItems = syncQueue.filter(item => item.status === 'pending');
    
    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      
      // Update status to syncing
      setSyncQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'syncing' } : q
      ));

      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status to completed
      setSyncQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'completed' } : q
      ));

      setSyncProgress(((i + 1) / pendingItems.length) * 100);
    }

    setIsSyncing(false);
    message.success('All changes synced successfully!');

    // Remove completed items from queue after a delay
    setTimeout(() => {
      setSyncQueue(prev => prev.filter(q => q.status !== 'completed'));
    }, 2000);
  };

  const manualSync = () => {
    if (!isOnline) {
      message.error('Cannot sync while offline');
      return;
    }
    autoSync();
  };

  const clearStorage = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }

    setOfflineContent(prev => prev.map(c => ({ ...c, isAvailable: false })));
    message.success('Offline storage cleared');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'syncing':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const totalStorageUsed = offlineContent
    .filter(c => c.isAvailable)
    .reduce((acc, c) => acc + c.size, 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Offline Mode</Title>
      
      {!isOnline && (
        <Alert
          message="You are currently offline"
          description="Some features may be limited. Your changes will be synced when you reconnect."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Connection Status">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  {isOnline ? (
                    <WifiOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                  ) : (
                    <WifiOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
                  )}
                  <Text strong>{isOnline ? 'Online' : 'Offline'}</Text>
                </Space>
                <Badge status={isOnline ? 'success' : 'error'} />
              </div>

              <div>
                <Text>Offline Mode:</Text>
                <Switch
                  checked={offlineMode}
                  onChange={toggleOfflineMode}
                  style={{ marginLeft: 8 }}
                />
              </div>

              <div>
                <Text>Storage Usage: {totalStorageUsed.toFixed(1)} MB / {storageQuota.toFixed(0)} MB</Text>
                <Progress
                  percent={(totalStorageUsed / storageQuota) * 100}
                  status={totalStorageUsed > storageQuota * 0.8 ? 'exception' : 'normal'}
                />
              </div>

              <Space>
                <Button
                  icon={<SyncOutlined />}
                  onClick={manualSync}
                  loading={isSyncing}
                  disabled={!isOnline}
                >
                  Sync Now
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={clearStorage}
                  danger
                >
                  Clear Storage
                </Button>
              </Space>
            </Space>
          </Card>

          <Card title="Sync Queue" style={{ marginTop: 16 }}>
            {syncQueue.length > 0 ? (
              <List
                dataSource={syncQueue}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={getStatusIcon(item.status)}
                      title={
                        <Space>
                          <Text>{item.action} {item.itemType}</Text>
                          <Text type="secondary">- {item.itemName}</Text>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <CloudOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
                <Text type="secondary">No pending sync items</Text>
              </div>
            )}

            {isSyncing && (
              <div style={{ marginTop: 16 }}>
                <Text>Syncing changes...</Text>
                <Progress percent={syncProgress} />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Offline Content">
            <List
              dataSource={offlineContent}
              renderItem={(content) => (
                <List.Item
                  actions={[
                    content.isAvailable ? (
                      <Button
                        key="remove"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromOffline(content.id)}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        key="download"
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadForOffline(content.id)}
                        disabled={!isOnline}
                      >
                        Download
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <DatabaseOutlined
                        style={{
                          color: content.isAvailable ? '#52c41a' : '#d9d9d9',
                          fontSize: 20
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text>{content.title}</Text>
                        {content.isAvailable && (
                          <Badge status="success" text="Available" />
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">
                          Type: {content.type} • Size: {content.size} MB
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Last synced: {new Date(content.lastSynced).toLocaleString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OfflineMode;
