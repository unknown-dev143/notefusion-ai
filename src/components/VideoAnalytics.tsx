import React, { useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Progress, Table, Tag, DatePicker, Space, Select } from 'antd';
import { EyeOutlined, ClockCircleOutlined, UserOutlined, TrophyOutlined } from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface VideoAnalytics {
  id: string;
  title: string;
  views: number;
  uniqueViewers: number;
  avgWatchTime: number;
  completionRate: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  uploadDate: Date;
}

interface EngagementData {
  date: string;
  views: number;
  engagement: number;
  watchTime: number;
}

const VideoAnalytics: React.FC = () => {
  const [analytics] = useState<VideoAnalytics[]>([
    {
      id: '1',
      title: 'React Tutorial Part 1',
      views: 1250,
      uniqueViewers: 980,
      avgWatchTime: 8.5,
      completionRate: 75,
      engagement: 85,
      likes: 120,
      comments: 35,
      shares: 28,
      uploadDate: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Advanced JavaScript Concepts',
      views: 890,
      uniqueViewers: 720,
      avgWatchTime: 12.3,
      completionRate: 82,
      engagement: 78,
      likes: 95,
      comments: 28,
      shares: 15,
      uploadDate: new Date('2024-01-20')
    }
  ]);

  const [engagementData] = useState<EngagementData[]>([
    { date: '2024-01-15', views: 450, engagement: 85, watchTime: 8.5 },
    { date: '2024-01-16', views: 520, engagement: 88, watchTime: 9.2 },
    { date: '2024-01-17', views: 480, engagement: 82, watchTime: 8.8 },
    { date: '2024-01-18', views: 610, engagement: 90, watchTime: 10.1 },
    { date: '2024-01-19', views: 580, engagement: 86, watchTime: 9.5 },
    { date: '2024-01-20', views: 720, engagement: 92, watchTime: 11.2 },
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  const totalViews = analytics.reduce((sum, video) => sum + video.views, 0);
  const totalWatchTime = analytics.reduce((sum, video) => sum + (video.avgWatchTime * video.views), 0);
  const avgEngagement = analytics.reduce((sum, video) => sum + video.engagement, 0) / analytics.length;

  const engagementConfig = {
    data: engagementData,
    xField: 'date',
    yField: 'engagement',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  const viewsConfig = {
    data: engagementData,
    xField: 'date',
    yField: 'views',
    columnWidthRatio: 0.8,
    color: '#52c41a',
  };

  const completionData = analytics.map(video => ({
    title: video.title,
    value: video.completionRate,
  }));

  const completionConfig = {
    data: completionData,
    angleField: 'value',
    colorField: 'title',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
  };

  const columns = [
    {
      title: 'Video Title',
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
      title: 'Watch Time',
      dataIndex: 'avgWatchTime',
      key: 'avgWatchTime',
      render: (time: number) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{time} min</Text>
        </Space>
      ),
    },
    {
      title: 'Completion Rate',
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
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Video Analytics</Title>
            <Text type="secondary">Track your video performance and engagement</Text>
          </Col>
          <Col>
            <Space>
              <Select value={selectedPeriod} onChange={setSelectedPeriod} style={{ width: 120 }}>
                <Option value="7days">Last 7 Days</Option>
                <Option value="30days">Last 30 Days</Option>
                <Option value="90days">Last 90 Days</Option>
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
              title="Total Watch Time"
              value={Math.round(totalWatchTime)}
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
              title="Unique Viewers"
              value={analytics.reduce((sum, video) => sum + video.uniqueViewers, 0)}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Engagement Trend" size="small">
            <Line {...engagementConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Views Overview" size="small">
            <Column {...viewsConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Completion Rates" size="small">
            <Pie {...completionConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Video Performance" size="small">
            <Table
              columns={columns}
              dataSource={analytics}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VideoAnalytics;
