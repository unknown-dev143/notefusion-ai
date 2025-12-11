import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Modal, Select, DatePicker, Statistic, Row, Col, Tabs, Badge, Tooltip, Switch } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  TeamOutlined, 
  DollarOutlined, 
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user' | 'premium';
  status: 'active' | 'suspended' | 'banned';
  joinDate: string;
  lastLogin: string;
  subscription: 'free' | 'premium' | 'enterprise';
  usage: {
    notes: number;
    storage: number;
    apiCalls: number;
  };
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  serverLoad: number;
  storageUsed: number;
  apiCalls: number;
}

const AdminDashboard: React.FC = () => {
  const { } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [stats] = useState<SystemStats>({
    totalUsers: 1250,
    activeUsers: 890,
    premiumUsers: 156,
    totalRevenue: 45678,
    systemHealth: 'healthy',
    serverLoad: 45,
    storageUsed: 78,
    apiCalls: 125000
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [systemLogs] = useState([
    { id: '1', timestamp: '2024-01-15 10:30', level: 'info', message: 'User registration spike detected', user: 'system' },
    { id: '2', timestamp: '2024-01-15 10:15', level: 'warning', message: 'High server load on API endpoint', user: 'system' },
    { id: '3', timestamp: '2024-01-15 09:45', level: 'error', message: 'Database connection timeout', user: 'system' }
  ]);

  useEffect(() => {
    // Mock user data
    setUsers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'premium',
        status: 'active',
        joinDate: '2023-06-15',
        lastLogin: '2024-01-15 10:30',
        subscription: 'premium',
        usage: { notes: 234, storage: 1.2, apiCalls: 5678 }
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2023-08-20',
        lastLogin: '2024-01-14 15:22',
        subscription: 'free',
        usage: { notes: 89, storage: 0.3, apiCalls: 1234 }
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'admin',
        status: 'active',
        joinDate: '2023-01-10',
        lastLogin: '2024-01-15 09:15',
        subscription: 'enterprise',
        usage: { notes: 567, storage: 3.4, apiCalls: 12345 }
      }
    ]);
  }, []);

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'red',
      moderator: 'orange',
      premium: 'gold',
      user: 'blue'
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      suspended: 'orange',
      banned: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getHealthColor = (health: string) => {
    const colors = {
      healthy: 'green',
      warning: 'orange',
      critical: 'red'
    };
    return colors[health as keyof typeof colors] || 'default';
  };

  const getLogLevelIcon = (level: string) => {
    const icons = {
      info: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      error: <WarningOutlined style={{ color: '#ff4d4f' }} />
    };
    return icons[level as keyof typeof icons] || <CheckCircleOutlined />;
  };

  const userColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <Space>
          <Text strong>{name}</Text>
          {record.role === 'admin' && <CrownOutlined style={{ color: '#faad14' }} />}
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {role.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription',
      key: 'subscription',
      render: (subscription: string) => (
        <Tag color={subscription === 'free' ? 'default' : subscription === 'premium' ? 'gold' : 'purple'}>
          {subscription.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (record: User) => (
        <Space direction="vertical" size="small">
          <Text type="secondary">{record.usage.notes} notes</Text>
          <Text type="secondary">{record.usage.storage}GB storage</Text>
          <Text type="secondary">{record.usage.apiCalls} API calls</Text>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => {
              setSelectedUser(record);
              setUserModalVisible(true);
            }} />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Suspend' : 'Activate'}>
            <Button 
              type="text" 
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />} 
              danger={record.status === 'active'}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const logColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp'
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Space>
          {getLogLevelIcon(level)}
          <Tag color={level === 'error' ? 'red' : level === 'warning' ? 'orange' : 'green'}>
            {level.toUpperCase()}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <Space>
            <CrownOutlined />
            Admin Dashboard
          </Space>
        </Title>
        <Badge count={systemLogs.filter(log => log.level === 'error').length}>
          <Button type="primary" icon={<WarningOutlined />}>
            System Alerts
          </Button>
        </Badge>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Users"
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Active Users"
                  value={stats.activeUsers}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Premium Users"
                  value={stats.premiumUsers}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} md={12}>
              <Card title="System Health" extra={
                <Tag color={getHealthColor(stats.systemHealth)}>
                  {stats.systemHealth.toUpperCase()}
                </Tag>
              }>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>Server Load</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                        <div style={{ width: `${stats.serverLoad}%`, backgroundColor: stats.serverLoad > 80 ? '#ff4d4f' : stats.serverLoad > 60 ? '#faad14' : '#52c41a', height: '8px', borderRadius: '4px' }} />
                      </div>
                      <Text>{stats.serverLoad}%</Text>
                    </div>
                  </div>
                  <div>
                    <Text>Storage Used</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                        <div style={{ width: `${stats.storageUsed}%`, backgroundColor: '#1890ff', height: '8px', borderRadius: '4px' }} />
                      </div>
                      <Text>{stats.storageUsed}%</Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Recent Activity">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>API Calls Today</Text>
                    <Text strong>{stats.apiCalls.toLocaleString()}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>New Registrations</Text>
                    <Text strong>23</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Support Tickets</Text>
                    <Text strong>5</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="User Management" key="users">
          <Card title="Users" extra={
            <Space>
              <Button icon={<UserOutlined />}>Add User</Button>
              <Button icon={<SettingOutlined />}>Bulk Actions</Button>
            </Space>
          }>
            <Table
              dataSource={users}
              columns={userColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="System Logs" key="logs">
          <Card title="System Logs" extra={
            <Space>
              <Select defaultValue="all" style={{ width: 120 }}>
                <Option value="all">All Levels</Option>
                <Option value="info">Info</Option>
                <Option value="warning">Warning</Option>
                <Option value="error">Error</Option>
              </Select>
              <RangePicker />
            </Space>
          }>
            <Table
              dataSource={systemLogs}
              columns={logColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Settings" key="settings">
          <Card title="Admin Settings">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={5}>System Configuration</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Maintenance Mode</Text>
                      <br />
                      <Text type="secondary">Temporarily disable user access</Text>
                    </div>
                    <Switch />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Debug Mode</Text>
                      <br />
                      <Text type="secondary">Enable detailed logging</Text>
                    </div>
                    <Switch />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>API Rate Limiting</Text>
                      <br />
                      <Text type="secondary">Limit API requests per user</Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Space>
              </div>

              <div>
                <Title level={5}>Security Settings</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Two-Factor Authentication</Text>
                      <br />
                      <Text type="secondary">Require 2FA for all admin users</Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Session Timeout</Text>
                      <br />
                      <Text type="secondary">Auto-logout inactive users</Text>
                    </div>
                    <Select defaultValue="30" style={{ width: 120 }}>
                      <Option value="15">15 minutes</Option>
                      <Option value="30">30 minutes</Option>
                      <Option value="60">1 hour</Option>
                      <Option value="120">2 hours</Option>
                    </Select>
                  </div>
                </Space>
              </div>
            </Space>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="User Details"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUserModalVisible(false)}>
            Close
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />}>
            Edit User
          </Button>
        ]}
        width={800}
      >
        {selectedUser && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Name:</Text> {selectedUser.name}
              </Col>
              <Col span={12}>
                <Text strong>Email:</Text> {selectedUser.email}
              </Col>
              <Col span={12}>
                <Text strong>Role:</Text> <Tag color={getRoleColor(selectedUser.role)}>{selectedUser.role.toUpperCase()}</Tag>
              </Col>
              <Col span={12}>
                <Text strong>Status:</Text> <Tag color={getStatusColor(selectedUser.status)}>{selectedUser.status.toUpperCase()}</Tag>
              </Col>
              <Col span={12}>
                <Text strong>Subscription:</Text> <Tag color={selectedUser.subscription === 'free' ? 'default' : selectedUser.subscription === 'premium' ? 'gold' : 'purple'}>{selectedUser.subscription.toUpperCase()}</Tag>
              </Col>
              <Col span={12}>
                <Text strong>Join Date:</Text> {selectedUser.joinDate}
              </Col>
            </Row>
            
            <div>
              <Title level={5}>Usage Statistics</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="Notes" value={selectedUser.usage.notes} />
                </Col>
                <Col span={8}>
                  <Statistic title="Storage" value={selectedUser.usage.storage} suffix="GB" />
                </Col>
                <Col span={8}>
                  <Statistic title="API Calls" value={selectedUser.usage.apiCalls} />
                </Col>
              </Row>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
