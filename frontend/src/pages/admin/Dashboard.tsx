import React, { useState } from 'react';
import styles from './Dashboard.module.css';

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
  
  const getStatusClassName = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return styles['statusActive'];
      case 'inactive':
        return styles['statusInactive'];
      case 'suspended':
        return styles['statusError'];
      case 'pending':
        return styles['statusWarning'];
      default:
        return '';
    }
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
      render: (text: string) => <a>{text}</a>,
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
        const statusClass = getStatusClassName(status);
        return (
          <Tag className={`${styles['statusTag']} ${statusClass}`}>
            {status.toUpperCase()}
          </Tag>
        );
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
          <Button type="primary" className={styles['actionButton']}>Edit</Button>
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
    <div className={styles['dashboardContainer']}>
      <div className={styles['header']}>
        <div className={styles['titleContainer']}>
          <Title level={3} className={styles['title']}><DashboardOutlined /> Admin Dashboard</Title>
          <Text className={styles['subtitle']}>Welcome back! Here's what's happening with your application.</Text>
        </div>
        <Space>
          <RangePicker 
            onChange={handleDateRangeChange}
            value={dateRange}
            className={styles['rangePicker']}
          />
          <Select 
            value={timeRange}
            onChange={handleTimeRangeChange}
            className={styles['timeRangeSelect']}
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
            className={styles['refreshButton']}
          >
            Refresh
          </Button>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} className={styles['statsRow']}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={subscriptionStats.total}
              prefix={<TeamOutlined className={styles['iconInfo']} />}
              valueStyle={{ color: '#1890ff' }}
              className={styles['statistic']}
            />
            <div className={styles['statisticFooter']}>
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
              prefix={<CheckCircleOutlined className={styles['iconSuccess']} />}
              valueStyle={{ color: '#52c41a' }}
              className={styles['statistic']}
            />
            <div className={styles['statisticFooter']}>
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
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
              className={styles['statistic']}
              prefixCls={styles['statusPurple']}
            />
            <div className={styles['statisticFooter']}>
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
              prefix={<ClockCircleOutlined className={styles['iconWarning']} />}
              valueStyle={{ color: '#faad14' }}
              className={styles['statistic']}
            />
            <div className={styles['statisticFooter']}>
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
            className={styles['chartCard']}
          >
            <div className={styles['chartContainer']}>
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
            className={styles['chartCard']}
          >
            <div className={styles['chartContainer']}>
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
      <Row className={styles['sectionRow']}>
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
            className={styles['tableCard']}
          >
            <div className={styles['tableContainer']}>
              <Table 
                columns={columns} 
                dataSource={recentUsers} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
                onRow={(userRecord) => ({
                  onClick: () => navigateTo(`/admin/users/${userRecord.id}`),
                  className: styles['tableRow']
                })}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className={styles['statsRow']}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => navigateTo('/admin/users')}
            className={styles['statsCard']}
          >
            <Statistic
              title="Total Users"
              value={subscriptionStats.total}
              prefix={<UserOutlined className={styles['iconInfo']} />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span className={styles['statisticSuffix']}>
                  +12% <ArrowUpOutlined />
                </span>
              }
              className={styles['statistic']}
            />
            <div className={styles['statisticFooter']}>
              <Text type="secondary">
                <CheckCircleOutlined className={`${styles['iconSuccess']} ${styles['iconMargin']}`} />
                {subscriptionStats.active} active
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => navigateTo('/admin/analytics')}
            className={styles['statsCard']}
          >
            <Statistic
              title="MRR"
              value={subscriptionStats.mrr}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <span className={styles['statisticSuffix']}>
                  +15% <ArrowUpOutlined />
                </span>
              }
              className={styles['statistic']}
            />
            <div className={styles['statisticFooter']}>
              <Text type="secondary">
                <DollarOutlined className={`${styles['iconPurple']} ${styles['iconMargin']}`} />
                ${subscriptionStats.arr.toLocaleString()} ARR
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            className={styles['statsCard']}
          >
            <Statistic
              title="Active Subscriptions"
              value={subscriptionStats.active}
              prefix={<CheckCircleOutlined className={styles['iconSuccess']} />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <span className={styles['statisticSuffix']}>
                  +8% <ArrowUpOutlined />
                </span>
              }
              className={styles['statistic']}
            />
            <div className={styles['statisticFooter']}>
              <Text type="secondary">
                <WarningOutlined className={`${styles['iconWarning']} ${styles['iconMargin']}`} />
                {subscriptionStats.trial} trials
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            className={styles['statsCard']}
          >
            <Statistic
              title="Churn Rate"
              value={5.2}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<StopOutlined className={styles['iconError']} />}
              className={styles['statistic']}
            />
            <div className={styles['statisticFooter']}>
              <Text type="secondary">
                <span className={styles['statusError']}>{subscriptionStats.canceled} canceled</span>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Tabs defaultActiveKey="overview" className={styles['tabs']}>
        <Tabs.TabPane tab={
          <span><DashboardOutlined /> Overview</span>
        } key="overview">
          {/* Main Content */}
          <Row gutter={[16, 16]} className={styles['contentRow']}>
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
                className={styles['chartCard']}
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
                className={styles['chartCard']}
              >
                <Line data={subscriptionChartData} options={chartOptions} />
                <div className={styles['chartFooter']}>
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

          <Row gutter={[16, 16]} className={styles['sectionRow']}>
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
                className={styles['tableCard']}
              >
                <div className={styles['tableContainer']}>
                  <Table 
                    columns={columns} 
                    dataSource={recentUsers} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    size="small"
                    onRow={(userRecord) => ({
                      onClick: () => navigateTo(`/admin/users/${userRecord.id}`),
                      className: styles['tableRow']
                    })}
                  />
                </div>
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
                <div className={styles['chartWrapper']}>
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
                <Space direction="vertical" className={styles['fullWidthContainer']}>
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
                <Space direction="vertical" className={styles['fullWidthContainer']}>
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
