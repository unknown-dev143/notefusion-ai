import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Space, Alert, Button, Select, Tooltip, Modal, Form, Input, Switch, Divider, Badge } from 'antd';
import {
  SecurityScanOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';

const { Title, Text } = Typography;
const { Option } = Select;

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  source: string;
  status: 'active' | 'resolved' | 'investigating';
  details?: Record<string, any>;
}

interface SecurityMetrics {
  totalEvents: number;
  blockedAttacks: number;
  activeSessions: number;
  suspiciousIPs: number;
  dataBreaches: number;
  complianceScore: number;
}

interface ThreatData {
  date: string;
  attacks: number;
  blocked: number;
  severity: string;
}

const SecurityDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [threatTrends, setThreatTrends] = useState<ThreatData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);

  useEffect(() => {
    loadSecurityData();
    if (realTimeMode) {
      const interval = setInterval(loadSecurityData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, selectedSeverity, realTimeMode]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual API calls
      const [eventsData, metricsData, trendsData] = await Promise.all([
        fetchSecurityEvents(),
        fetchSecurityMetrics(),
        fetchThreatTrends()
      ]);

      setEvents(eventsData);
      setMetrics(metricsData);
      setThreatTrends(trendsData);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityEvents = async (): Promise<SecurityEvent[]> => {
    // Mock data - replace with API call
    return [
      {
        id: '1',
        type: 'SQL Injection Attempt',
        severity: 'critical',
        description: 'SQL injection attempt detected from IP 192.168.1.100',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        source: '192.168.1.100',
        status: 'resolved',
        details: { endpoint: '/api/users', payload: 'SELECT * FROM users' }
      },
      {
        id: '2',
        type: 'Suspicious Login',
        severity: 'medium',
        description: 'Multiple failed login attempts detected',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        source: '10.0.0.50',
        status: 'investigating',
        details: { attempts: 5, user: 'admin@example.com' }
      },
      {
        id: '3',
        type: 'Bot Detection',
        severity: 'low',
        description: 'Automated bot activity detected',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        source: '203.0.113.1',
        status: 'resolved',
        details: { user_agent: 'curl/7.68.0' }
      },
      {
        id: '4',
        type: 'XSS Attempt',
        severity: 'high',
        description: 'Cross-site scripting attempt blocked',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        source: '198.51.100.1',
        status: 'resolved',
        details: { payload: '<script>alert(1)</script>' }
      },
      {
        id: '5',
        type: 'Rate Limit Exceeded',
        severity: 'medium',
        description: 'API rate limit exceeded for IP address',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        source: '172.16.0.1',
        status: 'active',
        details: { requests: 150, limit: 100, window: '1 minute' }
      }
    ];
  };

  const fetchSecurityMetrics = async (): Promise<SecurityMetrics> => {
    // Mock data - replace with API call
    return {
      totalEvents: 1247,
      blockedAttacks: 892,
      activeSessions: 342,
      suspiciousIPs: 28,
      dataBreaches: 0,
      complianceScore: 94
    };
  };

  const fetchThreatTrends = async (): Promise<ThreatData[]> => {
    // Mock data - replace with API call
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => ({
      date: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toISOString(),
      attacks: Math.floor(Math.random() * 50) + 10,
      blocked: Math.floor(Math.random() * 40) + 5,
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)]
    }));
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      critical: 'magenta'
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      investigating: <SecurityScanOutlined style={{ color: '#faad14' }} />,
      resolved: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    };
    return icons[status as keyof typeof icons] || null;
  };

  const eventColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Text strong>{type}</Text>
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => <Text code>{source}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Space>
          {getStatusIcon(status)}
          <Text>{status}</Text>
        </Space>
      )
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => (
        <Tooltip title={new Date(timestamp).toLocaleString()}>
          <Text>{new Date(timestamp).toLocaleTimeString()}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SecurityEvent) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewEvent(record)}
          />
          {record.status === 'active' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleInvestigateEvent(record.id)}
            >
              Investigate
            </Button>
          )}
        </Space>
      )
    }
  ];

  const threatTrendConfig = {
    data: threatTrends,
    xField: 'date',
    yField: 'attacks',
    seriesField: 'severity',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    }
  };

  const attackTypeConfig = {
    data: [
      { type: 'SQL Injection', value: 156 },
      { type: 'XSS', value: 89 },
      { type: 'Bot Activity', value: 234 },
      { type: 'Brute Force', value: 67 },
      { type: 'DDoS', value: 45 },
      { type: 'Other', value: 123 }
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}'
    }
  };

  const handleViewEvent = (event: SecurityEvent) => {
    Modal.info({
      title: `Security Event Details: ${event.type}`,
      width: 600,
      content: (
        <div>
          <p><strong>Description:</strong> {event.description}</p>
          <p><strong>Severity:</strong> <Tag color={getSeverityColor(event.severity)}>{event.severity}</Tag></p>
          <p><strong>Source:</strong> <Text code>{event.source}</Text></p>
          <p><strong>Status:</strong> {event.status}</p>
          <p><strong>Timestamp:</strong> {new Date(event.timestamp).toLocaleString()}</p>
          {event.details && (
            <div>
              <p><strong>Details:</strong></p>
              <pre>{JSON.stringify(event.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )
    });
  };

  const handleInvestigateEvent = (eventId: string) => {
    // Implement investigation logic
    console.log('Investigating event:', eventId);
  };

  const filteredEvents = events.filter(event => 
    selectedSeverity === 'all' || event.severity === selectedSeverity
  );

  if (!metrics) {
    return <div>Loading security data...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>
            <SecurityScanOutlined /> Security Dashboard
          </Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={selectedTimeRange}
              onChange={setSelectedTimeRange}
              style={{ width: 120 }}
            >
              <Option value="1h">Last Hour</Option>
              <Option value="24h">Last 24h</Option>
              <Option value="7d">Last 7 Days</Option>
              <Option value="30d">Last 30 Days</Option>
            </Select>
            <Select
              value={selectedSeverity}
              onChange={setSelectedSeverity}
              style={{ width: 120 }}
            >
              <Option value="all">All Severities</Option>
              <Option value="critical">Critical</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
            <Switch
              checked={realTimeMode}
              onChange={setRealTimeMode}
              checkedChildren="Real-time"
              unCheckedChildren="Manual"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={loadSecurityData}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setShowSettings(true)}
            >
              Settings
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Critical Alerts */}
      {events.filter(e => e.severity === 'critical' && e.status === 'active').length > 0 && (
        <Alert
          message="Critical Security Events Detected"
          description={`There are ${events.filter(e => e.severity === 'critical' && e.status === 'active').length} critical security events requiring immediate attention.`}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Events"
              value={metrics.totalEvents}
              prefix={<SecurityScanOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Blocked Attacks"
              value={metrics.blockedAttacks}
              prefix={<SecurityScanOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={metrics.activeSessions}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Compliance Score"
              value={metrics.complianceScore}
              suffix="%"
              prefix={<LockOutlined />}
              valueStyle={{ 
                color: metrics.complianceScore >= 90 ? '#52c41a' : 
                       metrics.complianceScore >= 70 ? '#faad14' : '#ff4d4f'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Threat Trends" extra={<BarChartOutlined />}>
            <Line {...threatTrendConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Attack Types" extra={<BarChartOutlined />}>
            <Pie {...attackTypeConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Security Events Table */}
      <Card 
        title="Recent Security Events" 
        extra={
          <Space>
            <Badge count={filteredEvents.filter(e => e.status === 'active').length} />
            <Text type="secondary">Active Events</Text>
          </Space>
        }
      >
        <Table
          dataSource={filteredEvents}
          columns={eventColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      {/* Settings Modal */}
      <Modal
        title="Security Settings"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowSettings(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={() => setShowSettings(false)}>
            Save Settings
          </Button>
        ]}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Real-time Monitoring">
            <Switch checked={realTimeMode} onChange={setRealTimeMode} />
          </Form.Item>
          <Form.Item label="Alert Threshold">
            <Select defaultValue="high">
              <Option value="critical">Critical Only</Option>
              <Option value="high">High and Above</Option>
              <Option value="medium">Medium and Above</Option>
              <Option value="low">All Events</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Notification Email">
            <Input placeholder="security@example.com" />
          </Form.Item>
          <Divider />
          <Title level={5}>Advanced Settings</Title>
          <Form.Item label="Enable AI Threat Detection">
            <Switch defaultChecked />
          </Form.Item>
          <Form.Item label="Auto-block Suspicious IPs">
            <Switch defaultChecked />
          </Form.Item>
          <Form.Item label="Session Timeout (minutes)">
            <Input type="number" defaultValue={30} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SecurityDashboard;
