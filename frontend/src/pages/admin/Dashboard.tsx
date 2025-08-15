import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Typography, 
  DatePicker, 
  Select, 
  Space, 
  Menu,
  Dropdown,
  message,
  Tabs
} from 'antd';
const { RangePicker } = DatePicker;
const { Option } = Select;
import { 
  UserOutlined, 
  FileTextOutlined, 
  ArrowUpOutlined, 
  ReloadOutlined,
  DollarOutlined,
  BarChartOutlined,
  TeamOutlined,
  DashboardOutlined,
  SettingOutlined,
  MoreOutlined,
  LineChartOutlined,
  TableOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  StopOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title as ChartTitle, 
  Tooltip as ChartTooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  ChartTitle,
  ChartTooltip,
  Legend
);

const { Text, Title } = Typography;

// Mock data - replace with API calls in a real application
const userActivityData = [
  { date: '2023-01-01', activeUsers: 100, newUsers: 20 },
  { date: '2023-01-02', activeUsers: 150, newUsers: 30 },
  { date: '2023-01-03', activeUsers: 200, newUsers: 50 },
  { date: '2023-01-04', activeUsers: 180, newUsers: 40 },
  { date: '2023-01-05', activeUsers: 250, newUsers: 70 },
  { date: '2023-01-06', activeUsers: 300, newUsers: 80 },
  { date: '2023-01-07', activeUsers: 280, newUsers: 60 },
];

const recentUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', lastActive: '2023-01-07T14:30:00Z' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', lastActive: '2023-01-07T12:15:00Z' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', lastActive: '2023-01-05T09:45:00Z' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'active', lastActive: '2023-01-07T10:20:00Z' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', status: 'suspended', lastActive: '2023-01-02T16:30:00Z' },
];

const subscriptionStats = {
  total: 1245,
  active: 856,
  trial: 124,
  canceled: 265,
  mrr: 12500,
  arr: 150000,
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');
  const [dateRange, setDateRange] = useState<any>(null);
  const navigate = useNavigate();
  
  const statusColors: Record<string, string> = {
    active: 'green',
    inactive: 'orange',
    suspended: 'red',
  };

  // Chart data
  const activityChartData = {
    labels: userActivityData.map(item => item.date),
    datasets: [
      {
        label: 'Active Users',
        data: userActivityData.map(item => item.activeUsers),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'New Users',
        data: userActivityData.map(item => item.newUsers),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const subscriptionChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Monthly Recurring Revenue',
        data: [8500, 9200, 9800, 11000, 12000, 11800, 12500],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('Dashboard refreshed successfully');
    }, 1000);
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    if (dates) {
      setTimeRange('custom');
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    // In a real app, you would fetch data based on the selected time range
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a href={`/admin/users/${text.toLowerCase().replace(/\s+/g, '-')}`}>{text}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'active') color = 'success';
        if (status === 'suspended') color = 'error';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, _record: any) => (
        <Space size="middle">
          <Button size="small">View</Button>
          <Button size="small" danger>Suspend</Button>
        </Space>
      ),
    },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const menu = (
    <Menu>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Item key="export" icon={<DownloadOutlined />}>
        Export Data
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="help" icon={<FileTextOutlined />}>
        Help & Support
      </Menu.Item>
    </Menu>
  );

  const navigateTo = (path: string) => {
    // Prepend the admin console base path
    const adminPath = path.startsWith('/') ? `/sys/console${path}` : `/sys/console/${path}`;
    navigate(adminPath);
  };

  return (
    <div className="admin-dashboard" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}><DashboardOutlined /> Admin Dashboard</Title>
          <Text type="secondary">Welcome back! Here's what's happening with your application.</Text>
        </div>
        <Space>
          <RangePicker 
            onChange={handleDateRangeChange}
            value={dateRange}
            style={{ width: 250 }}
          />
          <Select 
            value={timeRange}
            onChange={handleTimeRangeChange}
            style={{ width: 150 }}
          >
            <Option value="7days">Last 7 Days</Option>
            <Option value="30days">Last 30 Days</Option>
            <Option value="90days">Last 90 Days</Option>
            <Option value="custom">Custom Range</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={subscriptionStats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="success">
                <ArrowUpOutlined /> 12% from last month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Subscriptions"
              value={subscriptionStats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="success">
                <ArrowUpOutlined /> 5% from last month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={subscriptionStats.mrr}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="success">
                <ArrowUpOutlined /> 8% from last month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Trial Users"
              value={subscriptionStats.trial}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="warning">
                {subscriptionStats.trial} trials active
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card 
            title={
              <Space>
                <LineChartOutlined />
                <span>User Activity</span>
              </Space>
            }
            loading={loading}
            style={{ marginBottom: '16px' }}
          >
            <div style={{ height: '300px' }}>
              <Line
                data={{
                  labels: userActivityData.map(item => item.date),
                  datasets: [
                    {
                      label: 'Active Users',
                      data: userActivityData.map(item => item.activeUsers),
                      borderColor: '#1890ff',
                      backgroundColor: 'rgba(24, 144, 255, 0.2)',
                      tension: 0.4,
                    },
                    {
                      label: 'New Users',
                      data: userActivityData.map(item => item.newUsers),
                      borderColor: '#52c41a',
                      backgroundColor: 'rgba(82, 196, 26, 0.2)',
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} xl={8}>
          <Card 
            title={
              <Space>
                <PieChartOutlined />
                <span>Subscription Status</span>
              </Space>
            }
            loading={loading}
            style={{ height: '100%' }}
          >
            <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
              <Pie
                data={{
                  labels: ['Active', 'Trial', 'Canceled'],
                  datasets: [
                    {
                      data: [
                        subscriptionStats.active,
                        subscriptionStats.trial,
                        subscriptionStats.canceled,
                      ],
                      backgroundColor: [
                        'rgba(82, 196, 26, 0.7)',
                        'rgba(250, 173, 20, 0.7)',
                        'rgba(255, 77, 79, 0.7)',
                      ],
                      borderColor: [
                        'rgba(82, 196, 26, 1)',
                        'rgba(250, 173, 20, 1)',
                        'rgba(255, 77, 79, 1)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Users */}
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                <span>Recent Users</span>
              </Space>
            }
            extra={
              <Button 
                type="link" 
                icon={<TableOutlined />}
                onClick={() => navigateTo('/admin/users')}
              >
                View All
              </Button>
            }
            loading={loading}
          >
            <Table 
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <Space>
                      <UserOutlined />
                      <a onClick={() => navigateTo(`/admin/users/${record.id}`)}>{text}</a>
                    </Space>
                  ),
                },
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={statusColors[status]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Tag>
                  ),
                },
                {
                  title: 'Last Active',
                  dataIndex: 'lastActive',
                  key: 'lastActive',
                  render: (date: string) => new Date(date).toLocaleString(),
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Space size="middle">
                      <Button size="small" onClick={() => navigateTo(`/admin/users/${record.id}`)}>
                        View
                      </Button>
                      <Button size="small" danger>
                        {record.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </Button>
                    </Space>
                  ),
                },
              ]}
              dataSource={recentUsers}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => navigateTo('/admin/users')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Total Users"
              value={subscriptionStats.total}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  +12% <ArrowUpOutlined />
                </span>
              }
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
                {subscriptionStats.active} active
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => navigateTo('/admin/analytics')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Monthly Revenue"
              value={subscriptionStats.mrr}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  +15% <ArrowUpOutlined />
                </span>
              }
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                <DollarOutlined style={{ color: '#722ed1', marginRight: '4px' }} />
                ${subscriptionStats.arr.toLocaleString()} ARR
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Subscriptions"
              value={subscriptionStats.active}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  +8% <ArrowUpOutlined />
                </span>
              }
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                <WarningOutlined style={{ color: '#faad14', marginRight: '4px' }} />
                {subscriptionStats.trial} trials
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Churn Rate"
              value={5.2}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<StopOutlined style={{ color: '#ff4d4f' }} />}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                <span style={{ color: '#ff4d4f' }}>{subscriptionStats.canceled} canceled</span>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Tabs defaultActiveKey="overview">
        <Tabs.TabPane tab={
          <span><DashboardOutlined /> Overview</span>
        } key="overview">
          {/* Main Content */}
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={16}>
              <Card 
                title={
                  <Space>
                    <LineChartOutlined />
                    <span>User Activity</span>
                  </Space>
                } 
                loading={loading}
                extra={
                  <Button type="link" onClick={() => navigateTo('/admin/analytics')}>
                    View Details
                  </Button>
                }
              >
                <Line data={activityChartData} options={chartOptions} />
              </Card>
            </Col>
            <Col xs={24} xl={8}>
              <Card 
                title={
                  <Space>
                    <DollarOutlined />
                    <span>Revenue Overview</span>
                  </Space>
                } 
                loading={loading}
                extra={
                  <Button type="link" onClick={() => navigateTo('/admin/analytics?tab=revenue')}>
                    View Details
                  </Button>
                }
              >
                <Line data={subscriptionChartData} options={chartOptions} />
                <div style={{ marginTop: '16px' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic 
                        title="MRR" 
                        value={subscriptionStats.mrr} 
                        prefix="$" 
                        precision={2}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="ARR" 
                        value={subscriptionStats.arr} 
                        prefix="$" 
                        precision={2}
                      />
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col xs={24} xl={12}>
              <Card 
                title={
                  <Space>
                    <TeamOutlined />
                    <span>Recent Users</span>
                  </Space>
                }
                loading={loading}
                extra={
                  <Button type="link" onClick={() => navigateTo('/admin/users')}>
                    View All
                  </Button>
                }
              >
                <Table 
                  columns={columns} 
                  dataSource={recentUsers} 
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                  onRow={(userRecord) => ({
                    onClick: () => navigateTo(`/admin/users/${userRecord.id}`),
                    style: { cursor: 'pointer' }
                  })}
                />
              </Card>
            </Col>
            <Col xs={24} xl={12}>
              <Card 
                title={
                  <Space>
                    <PieChartOutlined />
                    <span>Subscription Plan Distribution</span>
                  </Space>
                }
                loading={loading}
              >
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                  <Pie 
                    data={{
                      labels: ['Free', 'Pro', 'Business'],
                      datasets: [{
                        data: [300, 500, 200],
                        backgroundColor: [
                          'rgba(54, 162, 235, 0.7)',
                          'rgba(75, 192, 192, 0.7)',
                          'rgba(153, 102, 255, 0.7)',
                        ],
                        borderColor: [
                          'rgba(54, 162, 235, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                        ],
                        borderWidth: 1,
                      }],
                    }} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane tab={
          <span><TableOutlined /> Quick Actions</span>
        } key="actions">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="User Management">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    block 
                    type="primary" 
                    onClick={() => navigateTo('/admin/users')}
                    icon={<TeamOutlined />}
                  >
                    Manage All Users
                  </Button>
                  <Button 
                    block 
                    onClick={() => navigateTo('/admin/users?filter=active')}
                    icon={<CheckCircleOutlined />}
                  >
                    View Active Users
                  </Button>
                  <Button 
                    block 
                    onClick={() => navigateTo('/admin/users?filter=trial')}
                    icon={<ClockCircleOutlined />}
                  >
                    View Trial Users
                  </Button>
                  <Button 
                    block 
                    danger
                    onClick={() => navigateTo('/admin/users?filter=suspended')}
                    icon={<StopOutlined />}
                  >
                    View Suspended Users
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Analytics & Reports">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    block 
                    onClick={() => navigateTo('/admin/analytics')}
                    icon={<BarChartOutlined />}
                  >
                    View Full Analytics
                  </Button>
                  <Button 
                    block 
                    onClick={() => navigateTo('/admin/analytics?tab=revenue')}
                    icon={<DollarOutlined />}
                  >
                    Revenue Reports
                  </Button>
                  <Button 
                    block 
                    onClick={() => navigateTo('/admin/analytics?tab=users')}
                    icon={<UserOutlined />}
                  >
                    User Growth
                  </Button>
                  <Button 
                    block 
                    onClick={() => message.info('Exporting data...')}
                    icon={<DownloadOutlined />}
                  >
                    Export Data
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
