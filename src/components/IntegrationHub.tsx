import React, { useState } from 'react';
import { Card, Typography, Button, Space, List, Avatar, Switch, Modal, Input, Row, Col, Badge, Progress, Tag, Select } from 'antd';
import { 
  ApiOutlined, 
  GoogleOutlined, 
  SlackOutlined,
  DropboxOutlined,
  GithubOutlined,
  CalendarOutlined,
  CloudSyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  KeyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'productivity' | 'storage' | 'communication' | 'development' | 'calendar';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  features: string[];
  isPremium?: boolean;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggered?: string;
}

const IntegrationHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Google Drive',
      description: 'Sync notes and files with Google Drive',
      icon: <GoogleOutlined />,
      category: 'storage',
      status: 'connected',
      lastSync: '2024-01-16T14:30:00',
      features: ['File sync', 'Backup', 'Collaboration'],
      isPremium: false
    },
    {
      id: '2',
      name: 'Microsoft OneDrive',
      description: 'Connect with Microsoft OneDrive for cloud storage',
      icon: <ApiOutlined />,
      category: 'storage',
      status: 'disconnected',
      features: ['File sync', 'Backup', 'Version history'],
      isPremium: false
    },
    {
      id: '3',
      name: 'Slack',
      description: 'Share notes and get notifications in Slack',
      icon: <SlackOutlined />,
      category: 'communication',
      status: 'connected',
      lastSync: '2024-01-16T15:45:00',
      features: ['Note sharing', 'Notifications', 'Commands'],
      isPremium: false
    },
    {
      id: '4',
      name: 'GitHub',
      description: 'Sync code snippets and technical notes',
      icon: <GithubOutlined />,
      category: 'development',
      status: 'disconnected',
      features: ['Gist sync', 'Repository notes', 'Code snippets'],
      isPremium: true
    },
    {
      id: '5',
      name: 'Google Calendar',
      description: 'Sync study sessions and deadlines',
      icon: <CalendarOutlined />,
      category: 'calendar',
      status: 'connected',
      lastSync: '2024-01-16T09:00:00',
      features: ['Event sync', 'Reminders', 'Schedule'],
      isPremium: false
    },
    {
      id: '6',
      name: 'Dropbox',
      description: 'Additional cloud storage option',
      icon: <DropboxOutlined />,
      category: 'storage',
      status: 'error',
      features: ['File sync', 'Backup', 'Sharing'],
      isPremium: true
    }
  ]);

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Note Created',
      url: 'https://api.example.com/webhooks/note-created',
      events: ['note.created'],
      isActive: true,
      lastTriggered: '2024-01-16T14:30:00'
    },
    {
      id: '2',
      name: 'Study Session Complete',
      url: 'https://api.example.com/webhooks/session-complete',
      events: ['session.completed'],
      isActive: false
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [webhookModalVisible, setWebhookModalVisible] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[]
  });

  const categories = [
    { key: 'all', label: 'All Integrations' },
    { key: 'productivity', label: 'Productivity' },
    { key: 'storage', label: 'Storage' },
    { key: 'communication', label: 'Communication' },
    { key: 'development', label: 'Development' },
    { key: 'calendar', label: 'Calendar' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
      default: return status;
    }
  };

  const connectIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId
        ? { ...integration, status: 'connected' as const, lastSync: new Date().toISOString() }
        : integration
    ));
    setConnectModalVisible(false);
    setSelectedIntegration(null);
  };

  const disconnectIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId
        ? { ...integration, status: 'disconnected' as const, lastSync: undefined }
        : integration
    ));
  };

  const syncIntegration = (integrationId: string) => {
    // Simulate sync process
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId
          ? { ...integration, lastSync: new Date().toISOString() }
          : integration
      ));
    }, 2000);
  };

  const createWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      return;
    }

    const webhook: Webhook = {
      id: Date.now().toString(),
      ...newWebhook,
      isActive: true
    };

    setWebhooks(prev => [...prev, webhook]);
    setWebhookModalVisible(false);
    setNewWebhook({ name: '', url: '', events: [] });
  };

  const toggleWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === webhookId
        ? { ...webhook, isActive: !webhook.isActive }
        : webhook
    ));
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
  };

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const availableEvents = [
    'note.created',
    'note.updated',
    'note.deleted',
    'session.started',
    'session.completed',
    'group.created',
    'user.registered'
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Integration Hub</Title>
      
      <Space style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<ApiOutlined />} onClick={() => setWebhookModalVisible(true)}>
          Create Webhook
        </Button>
        <Button icon={<CloudSyncOutlined />}>
          Sync All
        </Button>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Integrations">
            <Space style={{ marginBottom: 16 }}>
              {categories.map(category => (
                <Button
                  key={category.key}
                  type={selectedCategory === category.key ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory(category.key)}
                >
                  {category.label}
                </Button>
              ))}
            </Space>

            <List
              dataSource={filteredIntegrations}
              renderItem={(integration) => (
                <List.Item
                  actions={[
                    integration.status === 'connected' ? (
                      <Space>
                        <Button 
                          size="small" 
                          icon={<SyncOutlined />}
                          onClick={() => syncIntegration(integration.id)}
                        >
                          Sync
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => disconnectIntegration(integration.id)}
                        >
                          Disconnect
                        </Button>
                      </Space>
                    ) : (
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setConnectModalVisible(true);
                        }}
                      >
                        Connect
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={integration.icon} />}
                    title={
                      <Space>
                        <Text strong>{integration.name}</Text>
                        {integration.isPremium && <Badge count="PRO" style={{ backgroundColor: '#fa8c16' }} />}
                        <Badge status={getStatusColor(integration.status)} text={getStatusText(integration.status)} />
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">{integration.description}</Text>
                        <Space wrap>
                          {integration.features.map((feature, index) => (
                            <Tag key={index}>{feature}</Tag>
                          ))}
                        </Space>
                        {integration.lastSync && (
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            Last sync: {new Date(integration.lastSync).toLocaleString()}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Quick Stats">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Connected: </Text>
                <Text>{integrations.filter(i => i.status === 'connected').length}/{integrations.length}</Text>
              </div>
              <div>
                <Text strong>Active Webhooks: </Text>
                <Text>{webhooks.filter(w => w.isActive).length}/{webhooks.length}</Text>
              </div>
              <div>
                <Text strong>Last Sync: </Text>
                <Text>2 hours ago</Text>
              </div>
              <Progress 
                percent={(integrations.filter(i => i.status === 'connected').length / integrations.length) * 100}
                size="small"
                style={{ marginTop: 8 }}
              />
            </Space>
          </Card>

          <Card title="Recent Activity" style={{ marginTop: 16 }}>
            <List
              dataSource={[
                { action: 'Google Drive synced', time: '2 hours ago', icon: <CheckCircleOutlined /> },
                { action: 'Slack notification sent', time: '3 hours ago', icon: <CheckCircleOutlined /> },
                { action: 'Dropbox sync failed', time: '5 hours ago', icon: <ExclamationCircleOutlined /> },
                { action: 'Calendar updated', time: '1 day ago', icon: <CheckCircleOutlined /> }
              ]}
              renderItem={(activity, index) => (
                <List.Item key={index}>
                  <List.Item.Meta
                    avatar={<Avatar icon={activity.icon} />}
                    title={activity.action}
                    description={activity.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Webhooks" style={{ marginTop: 16 }}>
        <List
          dataSource={webhooks}
          renderItem={(webhook) => (
            <List.Item
              actions={[
                <Switch
                  checked={webhook.isActive}
                  onChange={() => toggleWebhook(webhook.id)}
                />,
                <Button
                  size="small"
                  danger
                  onClick={() => deleteWebhook(webhook.id)}
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<KeyOutlined />} />}
                title={
                  <Space>
                    <Text strong>{webhook.name}</Text>
                    {webhook.isActive && <Badge status="success" text="Active" />}
                  </Space>
                }
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text code style={{ fontSize: '12px' }}>{webhook.url}</Text>
                    <Space wrap>
                      {webhook.events.map((event, index) => (
                        <Tag key={index}>{event}</Tag>
                      ))}
                    </Space>
                    {webhook.lastTriggered && (
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Connect Integration Modal */}
      <Modal
        title={`Connect ${selectedIntegration?.name}`}
        open={connectModalVisible}
        onOk={() => selectedIntegration && connectIntegration(selectedIntegration.id)}
        onCancel={() => setConnectModalVisible(false)}
      >
        {selectedIntegration && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Connecting to {selectedIntegration.name} will allow NoteFusion AI to:</Text>
            <List
              size="small"
              dataSource={selectedIntegration.features}
              renderItem={(feature) => (
                <List.Item>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  {feature}
                </List.Item>
              )}
            />
            {selectedIntegration.isPremium && (
              <Text type="warning">
                This integration requires a premium subscription.
              </Text>
            )}
          </Space>
        )}
      </Modal>

      {/* Create Webhook Modal */}
      <Modal
        title="Create Webhook"
        open={webhookModalVisible}
        onOk={createWebhook}
        onCancel={() => setWebhookModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text>Webhook Name:</Text>
            <Input
              value={newWebhook.name}
              onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter webhook name"
            />
          </div>

          <div>
            <Text>Callback URL:</Text>
            <Input
              value={newWebhook.url}
              onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://your-app.com/webhook"
            />
          </div>

          <div>
            <Text>Events:</Text>
            <Select
              mode="multiple"
              value={newWebhook.events}
              onChange={(events: string[]) => setNewWebhook(prev => ({ ...prev, events }))}
              style={{ width: '100%' }}
              placeholder="Select events"
            >
              {availableEvents.map(event => (
                <Option key={event} value={event}>{event}</Option>
              ))}
            </Select>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default IntegrationHub;
