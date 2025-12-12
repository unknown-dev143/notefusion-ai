import React, { useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, DatePicker, Select, Progress, Space, Button } from 'antd';
import { 
  EyeOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface PresentationAnalytics {
  id: string;
  title: string;
  views: number;
  uniqueViewers: number;
  avgViewTime: number;
  completionRate: number;
  engagement: number;
  shares: number;
  downloads: number;
  comments: number;
  slideViews: number[];
  createdAt: Date;
  lastViewed: Date;
}

const PresentationAnalytics: React.FC = () => {
  const [analytics] = useState<PresentationAnalytics[]>([
    {
      id: '1',
      title: 'Q4 Marketing Strategy',
      views: 1250,
      uniqueViewers: 980,
      avgViewTime: 8.5,
      completionRate: 75,
      engagement: 85,
      shares: 45,
      downloads: 120,
      comments: 23,
      slideViews: [1250, 1180, 1100, 1050, 980, 920],
      createdAt: new Date('2024-01-15'),
      lastViewed: new Date()
    },
    {
      id: '2',
      title: 'Product Launch 2024',
      views: 890,
      uniqueViewers: 720,
      avgViewTime: 12.3,
      completionRate: 82,
      engagement: 78,
      shares: 32,
      downloads: 85,
      comments: 18,
      slideViews: [890, 850, 820, 780, 750, 720],
      createdAt: new Date('2024-01-20'),
      lastViewed: new Date()
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [selectedPresentation, setSelectedPresentation] = useState<string>('all');

  const totalViews = analytics.reduce((sum, pres) => sum + pres.views, 0);
  const totalViewTime = analytics.reduce((sum, pres) => sum + (pres.avgViewTime * pres.views), 0);
  const avgEngagement = analytics.reduce((sum, pres) => sum + pres.engagement, 0) / analytics.length;
  const totalShares = analytics.reduce((sum, pres) => sum + pres.shares, 0);

  const columns = [
    {
      title: 'Presentation',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      render: (views: number) => (
        <Space>
          <EyeOutlined />
          <Text>{views.toLocaleString()}</Text>
        </Space>
      ),
    },
    {
      title: 'View Time',
      dataIndex: 'avgViewTime',
      key: 'avgViewTime',
      render: (time: number) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{time} min</Text>
        </Space>
      ),
    },
    {
      title: 'Completion',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => (
        <Progress percent={rate} size="small" style={{ width: 100 }} />
      ),
    },
    {
      title: 'Engagement',
      dataIndex: 'engagement',
      key: 'engagement',
      render: (engagement: number) => (
        <Tag color={engagement >= 80 ? 'green' : engagement >= 60 ? 'orange' : 'red'}>
          {engagement}%
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any) => (
        <Space>
          <Button size="small" icon={<BarChartOutlined />}>
            Details
          </Button>
          <Button size="small" icon={<DownloadOutlined />}>
            Export
          </Button>
        </Space>
      ),
    },
  ];

  const filteredAnalytics = selectedPresentation === 'all' 
    ? analytics 
    : analytics.filter(p => p.id === selectedPresentation);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Presentation Analytics</Title>
            <Text type="secondary">Track presentation performance and engagement</Text>
          </Col>
          <Col>
            <Space>
              <Select value={selectedPeriod} onChange={setSelectedPeriod} style={{ width: 120 }}>
                <Option value="7days">Last 7 Days</Option>
                <Option value="30days">Last 30 Days</Option>
                <Option value="90days">Last 90 Days</Option>
              </Select>
              <Select value={selectedPresentation} onChange={setSelectedPresentation} style={{ width: 200 }}>
                <Option value="all">All Presentations</Option>
                {analytics.map(pres => (
                  <Option key={pres.id} value={pres.id}>{pres.title}</Option>
                ))}
              </Select>
              <RangePicker />
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Views"
              value={totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total View Time"
              value={Math.round(totalViewTime)}
              suffix="minutes"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Engagement"
              value={Math.round(avgEngagement)}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Shares"
              value={totalShares}
              prefix={<ShareAltOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Engagement Trend" size="small">
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <BarChartOutlined style={{ fontSize: 48 }} />
              <div style={{ marginTop: 16 }}>Engagement chart visualization</div>
              <Text type="secondary">Chart component would be displayed here</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Views Overview" size="small">
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <EyeOutlined style={{ fontSize: 48 }} />
              <div style={{ marginTop: 16 }}>Views chart visualization</div>
              <Text type="secondary">Chart component would be displayed here</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Completion Rates" size="small">
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <TrophyOutlined style={{ fontSize: 48 }} />
              <div style={{ marginTop: 16 }}>Completion rate chart</div>
              <Text type="secondary">Chart component would be displayed here</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Slide Engagement Heatmap" size="small">
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <BarChartOutlined style={{ fontSize: 48 }} />
              <div style={{ marginTop: 16 }}>Engagement heatmap</div>
              <Text type="secondary">Chart component would be displayed here</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Key Metrics" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Unique Viewers:</Text>
                <div style={{ fontSize: 24, color: '#1890ff' }}>
                  {analytics.reduce((sum, pres) => sum + pres.uniqueViewers, 0)}
                </div>
              </div>
              <div>
                <Text strong>Total Comments:</Text>
                <div style={{ fontSize: 24, color: '#52c41a' }}>
                  {analytics.reduce((sum, pres) => sum + pres.comments, 0)}
                </div>
              </div>
              <div>
                <Text strong>Total Downloads:</Text>
                <div style={{ fontSize: 24, color: '#fa8c16' }}>
                  {analytics.reduce((sum, pres) => sum + pres.downloads, 0)}
                </div>
              </div>
              <div>
                <Text strong>Avg Completion:</Text>
                <div style={{ fontSize: 24, color: '#722ed1' }}>
                  {Math.round(analytics.reduce((sum, pres) => sum + pres.completionRate, 0) / analytics.length)}%
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Presentation Performance" size="small" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredAnalytics}
          pagination={{ pageSize: 10 }}
          size="small"
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default PresentationAnalytics;
