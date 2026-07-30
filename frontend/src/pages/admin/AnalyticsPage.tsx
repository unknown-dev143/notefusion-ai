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
  message
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
import './AnalyticsPage.css';

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
    fetchAnalyticsData();
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    if (dates) {
      fetchAnalyticsData();
    }
  };

  const fetchAnalyticsData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = () => {
    message.success('Export started. You will receive an email when ready.');
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
    <div className="analytics-page" style={{ padding: '24px' }}>
      <div className="analytics-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AntTitle level={3}>Analytics Dashboard</AntTitle>
        <Space>
          <RangePicker 
            onChange={handleDateRangeChange} 
            value={dateRange}
          />
          <Select value={timeRange} onChange={handleTimeRangeChange} className="analytics-select" style={{ width: '120px' }}>
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

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              <span className="tab-label">Overview</span>
            </span>
          } 
          key="overview"
        >
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card className="analytics-card">
                <Statistic
                  title="Total Users"
                  value={1128}
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
              <Card className="analytics-card">
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
              <Card className="analytics-card">
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
              <Card className="analytics-card">
                <Statistic
                  title="Avg. Session Duration"
                  value={8.5}
                  precision={1}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                  suffix={
                    <>
                      <span className="mr-1">min</span>
                      <span style={{ fontSize: '14px', color: '#ff4d4f' }}>
                        -2% <ArrowDownOutlined />
                      </span>
                    </>
                  }
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
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

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Plan Distribution" loading={loading}>
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
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
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
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

        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              <span className="tab-label">User Analytics</span>
            </span>
          } 
          key="users"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={16}>
              <Card title="User Growth" loading={loading}>
                <Line data={userActivityData} options={chartOptions} />
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
                          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        }
                        title={user.name}
                        description={user.email}
                      />
                      <div style={{ textAlign: 'right' }}>
                        <Tag color={user.plan === 'Business' ? 'purple' : user.plan === 'Pro' ? 'blue' : 'default'}>
                          {user.plan}
                        </Tag>
                        <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>Activity: {user.activity}%</div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <DollarOutlined />
              <span className="tab-label">Revenue</span>
            </span>
          } 
          key="revenue"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={16}>
              <Card title="Revenue Over Time" loading={loading}>
                <Line data={revenueData} options={chartOptions} />
              </Card>
            </Col>
            <Col xs={24} xl={8}>
              <Card title="Revenue Details" loading={loading}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <Statistic title="Total Revenue" value={12500} prefix="$" precision={2} />
                </div>
                <Pie 
                  data={planDistributionData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }} 
                  style={{ height: '250px' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <TableOutlined />
              <span className="tab-label">System Metrics</span>
            </span>
          } 
          key="metrics"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={8}>
              <Card title="System Health" loading={loading}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Uptime</Text>
                    <Text strong>{systemMetrics.uptime}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Response Time</Text>
                    <Text strong>{systemMetrics.responseTime}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Active Sessions</Text>
                    <Text strong>{systemMetrics.activeSessions}</Text>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <Text>Storage Usage ({systemMetrics.storageUsed})</Text>
                    <Progress percent={systemMetrics.storagePercentage} status={systemMetrics.storagePercentage > 80 ? 'exception' : 'active'} />
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card title="Recent Activities" loading={loading}>
                <List
                  itemLayout="horizontal"
                  dataSource={recentActivities}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{item.avatar}</Avatar>}
                        title={item.user}
                        description={item.action}
                      />
                      <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.45)' }}>{item.time}</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Card title="API Performance" loading={loading}>
                <div style={{ marginBottom: '16px' }}>
                  <Statistic title="Total API Calls" value={systemMetrics.apiCalls} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Text>Error Rate</Text>
                  <Progress 
                    percent={parseFloat(systemMetrics.errorRate) * 100} 
                    format={percent => `${systemMetrics.errorRate}`}
                    status="exception"
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
