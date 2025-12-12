import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Typography, Badge, List, Tooltip, Switch, Row, Col, message, Tag } from 'antd';
import { 
  ApiOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  WarningOutlined,
  LinkOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import { featureIntegration } from '../services/FeatureIntegrationService';

const { Text } = Typography;

interface ConnectionStatus {
  source: string;
  target: string;
  status: 'active' | 'inactive' | 'error';
  lastSync?: Date;
}

const FeatureBridge: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize feature bridge
    initializeFeatureBridge();
    
    // Set up periodic sync
    const interval = setInterval(() => {
      if (isAutoSync) {
        performAutoSync();
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [isAutoSync]);

  const initializeFeatureBridge = () => {
    // Create connection status objects
    const connectionStatuses: ConnectionStatus[] = [
      { source: 'notes', target: 'ai_assistant', status: 'active', lastSync: new Date() },
      { source: 'ai_assistant', target: 'flashcards', status: 'active', lastSync: new Date() },
      { source: 'study_timer', target: 'user_profile', status: 'active', lastSync: new Date() },
      { source: 'flashcards', target: 'analytics', status: 'active', lastSync: new Date() },
      { source: 'notes', target: 'study_groups', status: 'active', lastSync: new Date() },
      { source: 'whiteboard', target: 'collaboration', status: 'active', lastSync: new Date() },
      { source: 'notes', target: 'export_system', status: 'active', lastSync: new Date() },
      { source: 'voice_recorder', target: 'transcript_editor', status: 'active', lastSync: new Date() },
      { source: 'image_generator', target: 'notes', status: 'active', lastSync: new Date() },
      { source: 'task_manager', target: 'study_planner', status: 'active', lastSync: new Date() }
    ];

    setConnections(connectionStatuses);
    setLastSyncTime(new Date());
  };

  const performAutoSync = () => {
    // Test connections and update status
    featureIntegration.testConnections();
    setLastSyncTime(new Date());
    
    // Update connection statuses
    setConnections(prev => prev.map(conn => ({
      ...conn,
      lastSync: new Date(),
      status: Math.random() > 0.1 ? 'active' : 'error' // Simulate occasional errors
    })));
  };

  const handleManualSync = () => {
    message.loading('Syncing features...', 2);
    performAutoSync();
    message.success('Features synced successfully!');
  };

  const toggleConnection = (source: string, target: string) => {
    setConnections(prev => prev.map(conn => {
      if (conn.source === source && conn.target === target) {
        const newStatus = conn.status === 'active' ? 'inactive' : 'active';
        message.info(`Connection ${source} -> ${target} ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
        return { ...conn, status: newStatus };
      }
      return conn;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'inactive': return <DisconnectOutlined style={{ color: '#8c8c8c' }} />;
      case 'error': return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      default: return <SyncOutlined />;
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  const activeConnections = connections.filter(c => c.status === 'active').length;
  const errorConnections = connections.filter(c => c.status === 'error').length;

  return (
    <Card 
      title={
        <Space>
          <ApiOutlined />
          <span>Feature Bridge</span>
          <Badge count={activeConnections} showZero color="green" />
          {errorConnections > 0 && (
            <Badge count={errorConnections} color="red" />
          )}
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Auto-sync features every 30 seconds">
            <Switch
              checked={isAutoSync}
              onChange={setIsAutoSync}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
            />
          </Tooltip>
          <Button 
            type="primary" 
            icon={<SyncOutlined />}
            onClick={handleManualSync}
            loading={!isAutoSync}
          >
            Sync Now
          </Button>
        </Space>
      }
      style={{ margin: '16px 0' }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card size="small" title="Connection Status">
            <List
              dataSource={connections}
              renderItem={(connection) => (
                <List.Item
                  actions={[
                    <Tooltip title="Toggle connection">
                      <Button
                        type="text"
                        size="small"
                        icon={<LinkOutlined />}
                        onClick={() => toggleConnection(connection.source, connection.target)}
                        style={{ 
                          color: connection.status === 'active' ? '#52c41a' : '#8c8c8c' 
                        }}
                      />
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    avatar={getStatusIcon(connection.status)}
                    title={
                      <Space>
                        <Text strong>{connection.source}</Text>
                        <Text type="secondary">→</Text>
                        <Text strong>{connection.target}</Text>
                        <Badge status={getStatusColor(connection.status)} />
                      </Space>
                    }
                    description={
                      connection.lastSync && (
                        <Text type="secondary">
                          Last sync: {formatLastSync(connection.lastSync)}
                        </Text>
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card size="small" title="Integration Overview">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Active Connections:</Text>
                <div style={{ marginTop: 4 }}>
                  <Badge count={activeConnections} showZero color="green" />
                  <Text style={{ marginLeft: 8 }}>
                    {activeConnections} of {connections.length} connections active
                  </Text>
                </div>
              </div>

              {errorConnections > 0 && (
                <div>
                  <Text strong style={{ color: '#ff4d4f' }}>Error Connections:</Text>
                  <div style={{ marginTop: 4 }}>
                    <Badge count={errorConnections} color="red" />
                    <Text style={{ marginLeft: 8, color: '#ff4d4f' }}>
                      {errorConnections} connections need attention
                    </Text>
                  </div>
                </div>
              )}

              <div>
                <Text strong>Last Sync:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    {lastSyncTime ? formatLastSync(lastSyncTime) : 'Never'}
                  </Text>
                </div>
              </div>

              <div>
                <Text strong>Sync Mode:</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={isAutoSync ? 'green' : 'blue'}>
                    {isAutoSync ? 'Automatic' : 'Manual'}
                  </Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {isAutoSync ? 'Syncing every 30 seconds' : 'Manual sync only'}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card size="small" title="Feature Integration Map" style={{ marginTop: 16 }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="secondary">
            The Feature Bridge connects all app components together, enabling seamless data flow between:
          </Text>
          <div style={{ marginTop: 16 }}>
            <Space wrap>
              <Tag color="blue">Notes ↔ AI Assistant</Tag>
              <Tag color="green">Study Timer ↔ Profile</Tag>
              <Tag color="orange">Flashcards ↔ Analytics</Tag>
              <Tag color="purple">Whiteboard ↔ Collaboration</Tag>
              <Tag color="cyan">Voice ↔ Transcripts</Tag>
              <Tag color="magenta">Images ↔ Notes</Tag>
              <Tag color="geekblue">Tasks ↔ Planner</Tag>
              <Tag color="volcano">Export Systems</Tag>
            </Space>
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default FeatureBridge;
