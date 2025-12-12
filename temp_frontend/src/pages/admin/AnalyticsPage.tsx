import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Typography, 
  Statistic, 
  Table, 
  Tag, 
  Progress, 
  Space, 
  Button,
  Tabs,
  List,
  Avatar,
  Tooltip
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  ReloadOutlined, 
  DownloadOutlined,
  UserOutlined,
  FileOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined
} from '@ant-design/icons';
import { 
  Bar, 
  Line, 
  Pie, 
  Doughnut 
} from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend, 
  Filler
} from 'chart.js';
<<<<<<< HEAD
import './AnalyticsPage.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const { Title: AntTitle, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock data - replace with API calls in a real application
const userActivityData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'New Users',
      data: [120, 190, 150, 250, 200, 180, 300],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      tension: 0.3,
      fill: true,
    },
    {
      label: 'Active Users',
      data: [80, 150, 120, 200, 180, 150, 250],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      tension: 0.3,
      fill: true,
    },
  ],
};

const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Revenue ($)',
      data: [8500, 9200, 9800, 11000, 12000, 11800, 13500],
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      tension: 0.4,
      fill: true,
    },
  ],
};

const planDistributionData = {
  labels: ['Free', 'Pro', 'Business'],
  datasets: [
    {
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
    },
  ],
};

const featureUsageData = {
  labels: ['Notes', 'AI Summaries', 'File Uploads', 'Exports', 'API Calls'],
  datasets: [
    {
      label: 'Usage Count',
      data: [1200, 800, 600, 400, 300],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const recentActivities = [
  { id: 1, user: 'John Doe', action: 'created a new note', time: '2 minutes ago', avatar: 'J' },
  { id: 2, user: 'Jane Smith', action: 'upgraded to Pro plan', time: '10 minutes ago', avatar: 'JS' },
  { id: 3, user: 'Bob Johnson', action: 'exported notes to PDF', time: '25 minutes ago', avatar: 'B' },
  { id: 4, user: 'Alice Brown', action: 'shared a note with team', time: '1 hour ago', avatar: 'A' },
  { id: 5, user: 'Charlie Wilson', action: 'deleted a note', time: '2 hours ago', avatar: 'C' },
];

const topUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', activity: 98, plan: 'Pro' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', activity: 87, plan: 'Business' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', activity: 76, plan: 'Pro' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', activity: 65, plan: 'Free' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', activity: 54, plan: 'Business' },
];

const systemMetrics = {
  uptime: '99.99%',
  responseTime: '120ms',
  activeSessions: 245,
  storageUsed: '2.5GB / 10GB',
  storagePercentage: 25,
  apiCalls: '12,345',
  errorRate: '0.05%',
};

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [dateRange, setDateRange] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    // In a real app, you would fetch data based on the selected time range
    fetchAnalyticsData();
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    if (dates) {
      // In a real app, you would fetch data based on the selected date range
      fetchAnalyticsData();
    }
  };

  const fetchAnalyticsData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = () => {
    // In a real app, this would trigger a data export
<<<<<<< HEAD
    // message.success('Export started. You will receive an email when ready.');
=======
    message.success('Export started. You will receive an email when ready.');
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  };

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

  return (
<<<<<<< HEAD
    <div className="analytics-page">
      <div className="analytics-header">
=======
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <AntTitle level={3}>Analytics Dashboard</AntTitle>
        <Space>
          <RangePicker 
            onChange={handleDateRangeChange} 
            value={dateRange}
<<<<<<< HEAD
          />
          <Select value={timeRange} onChange={handleTimeRangeChange} className="analytics-select">
=======
            style={{ marginRight: '16px' }}
          />
          <Select value={timeRange} onChange={handleTimeRangeChange} style={{ width: '120px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            <Option value="24h">Last 24h</Option>
            <Option value="7days">Last 7 days</Option>
            <Option value="30days">Last 30 days</Option>
            <Option value="90days">Last 90 days</Option>
            <Option value="custom">Custom</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
          >
            Export
          </Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
<<<<<<< HEAD
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              <span className="tab-label">Overview</span>
            </span>
          } 
          key="overview"
        >
          {/* Stats Cards */}
          <Row gutter={[16, 16]} className="analytics-row">
            <Col xs={24} sm={12} md={6}>
              <Card className="analytics-card">
                <div className="analytics-statistic">
                  <Statistic
                    title="Total Users"
                    value={1128}
                    precision={0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<UserOutlined />}
                    suffix="users"
                  />
                  <div className="positive-change">
                    <ArrowUpOutlined /> 12% from last month
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="analytics-card">
                <div className="analytics-statistic">
                  <Statistic
                    title="Active Users (30d)"
                    value={856}
                    precision={0}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                    suffix="users"
                  />
                  <div className="positive-change">
                    <ArrowUpOutlined /> 8% from last month
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="analytics-card">
                <div className="analytics-statistic">
                  <Statistic
                    title="Monthly Revenue"
                    value={12500}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: '#722ed1' }}
                    suffix="USD"
                  />
                  <div className="positive-change">
                    <ArrowUpOutlined /> 15% from last month
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="analytics-card">
                <div className="analytics-statistic">
                  <Statistic
                    title="Avg. Session Duration"
                    value={8.5}
                    precision={1}
                    suffix="min"
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ClockCircleOutlined />}
                  />
                  <div className="negative-change">
                    <ArrowDownOutlined /> -2% from last month
                  </div>
                </div>
=======
        <TabPane tab={
          <span>
            <BarChartOutlined />
            Overview
          </span>
        } key="overview">
          {/* Stats Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Users"
                  value={1245}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                  suffix={
                    <span style={{ fontSize: '14px', color: '#52c41a' }}>
                      +12% <ArrowUpOutlined />
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Active Users (30d)"
                  value={856}
                  prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                  suffix={
                    <span style={{ fontSize: '14px', color: '#52c41a' }}>
                      +8% <ArrowUpOutlined />
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Monthly Revenue"
                  value={12500}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#722ed1' }}
                  suffix={
                    <span style={{ fontSize: '14px', color: '#52c41a' }}>
                      +15% <ArrowUpOutlined />
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Avg. Session Duration"
                  value={8.5}
                  precision={1}
                  suffix="min"
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                  suffix={
                    <span style={{ fontSize: '14px', color: '#ff4d4f' }}>
                      -2% <ArrowDownOutlined />
                    </span>
                  }
                />
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              </Card>
            </Col>
          </Row>

          {/* Main Charts */}
<<<<<<< HEAD
          <Row gutter={[16, 16]} className="analytics-row">
=======
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            <Col xs={24} xl={16}>
              <Card title="User Activity" loading={loading}>
                <Line data={userActivityData} options={chartOptions} />
              </Card>
            </Col>
            <Col xs={24} xl={8}>
              <Card title="Revenue" loading={loading}>
                <Line data={revenueData} options={chartOptions} />
              </Card>
            </Col>
          </Row>

          {/* Secondary Charts */}
<<<<<<< HEAD
          <Row gutter={[16, 16]} className="analytics-row">
            <Col xs={24} md={12}>
              <Card title="Plan Distribution" loading={loading}>
                <div className="analytics-chart">
=======
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Plan Distribution" loading={loading}>
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Doughnut 
                    data={planDistributionData} 
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
            <Col xs={24} md={12}>
              <Card title="Feature Usage" loading={loading}>
<<<<<<< HEAD
                <div className="analytics-chart">
=======
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Bar 
                    data={featureUsageData} 
                    options={{
                      indexAxis: 'y' as const,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }} 
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

<<<<<<< HEAD
        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              <span className="tab-label">User Analytics</span>
            </span>
          } 
          key="users"
        >
          <Row gutter={[16, 16]} className="analytics-row">
=======
        <TabPane tab={
          <span>
            <LineChartOutlined />
            User Analytics
          </span>
        } key="users">
          <Row gutter={[16, 16]}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            <Col xs={24} xl={16}>
              <Card title="User Growth" loading={loading}>
                <Line 
                  data={userActivityData} 
                  options={chartOptions} 
                />
              </Card>
            </Col>
            <Col xs={24} xl={8}>
              <Card title="Top Users by Activity" loading={loading}>
                <List
                  itemLayout="horizontal"
                  dataSource={topUsers}
                  renderItem={(user) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: '#1890ff' }}>
                            {user.name.charAt(0)}
                          </Avatar>
                        }
                        title={user.name}
                        description={user.email}
                      />
                      <div>
                        <Tag color={user.plan === 'Business' ? 'purple' : user.plan === 'Pro' ? 'blue' : 'default'}>
                          {user.plan}
                        </Tag>
                        <Progress 
                          percent={user.activity} 
                          size="small" 
                          showInfo={false} 
                          style={{ width: '100px', marginLeft: '8px' }} 
                        />
                        <Text type="secondary">{user.activity}%</Text>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

<<<<<<< HEAD
        <TabPane 
          tab={
            <span>
              <DollarOutlined />
              <span className="tab-label">Revenue</span>
            </span>
          } 
          key="revenue"
        >
          <Row gutter={[16, 16]} className="analytics-row">
=======
        <TabPane tab={
          <span>
            <DollarOutlined />
            Revenue
          </span>
        } key="revenue">
          <Row gutter={[16, 16]}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            <Col xs={24} xl={16}>
              <Card title="Revenue Over Time" loading={loading}>
                <Line 
                  data={revenueData} 
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value: any) => `$${value}`,
                        },
                      },
                    },
                  }} 
                />
              </Card>
            </Col>
            <Col xs={24} xl={8}>
              <Card title="Revenue by Plan" loading={loading}>
<<<<<<< HEAD
                <div className="analytics-chart">
=======
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Pie 
                    data={{
                      labels: ['Free', 'Pro', 'Business'],
                      datasets: [{
                        data: [500, 5000, 7000],
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
                        tooltip: {
                          callbacks: {
                            label: (context: any) => {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
<<<<<<< HEAD
                <div className="analytics-filters">
=======
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Text strong>Total Revenue: </Text>
                  <Text type="success" strong>$12,500</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

<<<<<<< HEAD
        <TabPane 
          tab={
            <span>
              <TableOutlined />
              <span className="tab-label">System Metrics</span>
            </span>
          } 
          key="metrics"
        >
          <Row gutter={[16, 16]} className="analytics-row">
            <Col xs={24} md={12} lg={8}>
              <Card title="System Health" loading={loading}>
                <div className="analytics-metric">
                  <Text>Uptime: </Text>
                  <Text strong>{systemMetrics.uptime}</Text>
                </div>
                <div className="analytics-metric">
                  <Text>Avg. Response Time: </Text>
                  <Text strong>{systemMetrics.responseTime}</Text>
                </div>
                <div className="analytics-metric">
                  <Text>Active Sessions: </Text>
                  <Text strong>{systemMetrics.activeSessions}</Text>
                </div>
                <div className="analytics-metric">
=======
        <TabPane tab={
          <span>
            <TableOutlined />
            System Metrics
          </span>
        } key="metrics">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={8}>
              <Card title="System Health" loading={loading}>
                <div style={{ marginBottom: '16px' }}>
                  <Text>Uptime: </Text>
                  <Text strong>{systemMetrics.uptime}</Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Text>Avg. Response Time: </Text>
                  <Text strong>{systemMetrics.responseTime}</Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Text>Active Sessions: </Text>
                  <Text strong>{systemMetrics.activeSessions}</Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Text>Storage Used: </Text>
                  <Text strong>{systemMetrics.storageUsed}</Text>
                  <Progress 
                    percent={systemMetrics.storagePercentage} 
                    size="small" 
                    status={systemMetrics.storagePercentage > 80 ? 'exception' : 'normal'}
                  />
                </div>
<<<<<<< HEAD
                <div className="analytics-metric">
                  <Text>API Calls (24h): </Text>
                  <Text strong>{systemMetrics.apiCalls}</Text>
                </div>
                <div className="analytics-metric">
=======
                <div style={{ marginBottom: '16px' }}>
                  <Text>API Calls (24h): </Text>
                  <Text strong>{systemMetrics.apiCalls}</Text>
                </div>
                <div>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Text>Error Rate: </Text>
                  <Text strong type={parseFloat(systemMetrics.errorRate) > 1 ? 'danger' : 'success'}>
                    {systemMetrics.errorRate}
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card title="Recent Activities" loading={loading}>
                <List
                  itemLayout="horizontal"
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: '#1890ff' }}>
                            {item.avatar}
                          </Avatar>
                        }
                        title={item.user}
                        description={
                          <>
                            <Text>{item.action}</Text>
                            <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                              {item.time}
                            </Text>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Feature Usage" loading={loading}>
<<<<<<< HEAD
                <div className="analytics-metric">
=======
                <div style={{ marginBottom: '16px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Text>Notes Created: </Text>
                  <Text strong>1,234</Text>
                  <Progress percent={82} size="small" status="active" />
                </div>
<<<<<<< HEAD
                <div className="analytics-metric">
=======
                <div style={{ marginBottom: '16px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Text>AI Summaries Generated: </Text>
                  <Text strong>876</Text>
                  <Progress percent={65} size="small" status="active" />
                </div>
<<<<<<< HEAD
                <div className="analytics-metric">
=======
                <div style={{ marginBottom: '16px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Text>Files Uploaded: </Text>
                  <Text strong>543</Text>
                  <Progress percent={45} size="small" status="active" />
                </div>
<<<<<<< HEAD
                <div className="analytics-metric">
=======
                <div style={{ marginBottom: '16px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  <Text>Notes Exported: </Text>
                  <Text strong>321</Text>
                  <Progress percent={28} size="small" status="active" />
                </div>
<<<<<<< HEAD
                <div className="analytics-metric">
                  <Text>API Calls: </Text>
                  <Text strong>12,345</Text>
                  <Progress percent={92} size="small" status="active" />
=======
                <div>
                  <Text>API Calls: </Text>
                  <Text strong>12,345</Text>
                  <Progress percent={92} size="small" status="active" />
                </div>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
