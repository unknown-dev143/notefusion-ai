import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Tag, Space, Select, Table } from 'antd';
import { TrophyOutlined, FireOutlined, BookOutlined, ClockCircleOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line
} from 'recharts';

const { Title, Text } = Typography;
const { Option } = Select;

interface LearningData {
  date: string;
  studyTime: number;
  cardsReviewed: number;
  accuracy: number;
  streak: number;
  difficulty: number;
}

interface SubjectPerformance {
  subject: string;
  timeSpent: number;
  accuracy: number;
  totalSessions: number;
  improvement: number;
  lastStudied: string;
}

interface WeaknessArea {
  topic: string;
  accuracy: number;
  attempts: number;
  difficulty: number;
  recommendedAction: string;
}

const LearningAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  const [learningData] = useState<LearningData[]>([
    { date: '2025-12-03', studyTime: 45, cardsReviewed: 20, accuracy: 85, streak: 3, difficulty: 2.5 },
    { date: '2025-12-04', studyTime: 60, cardsReviewed: 30, accuracy: 90, streak: 4, difficulty: 2.8 },
    { date: '2025-12-05', studyTime: 30, cardsReviewed: 15, accuracy: 80, streak: 5, difficulty: 2.3 },
    { date: '2025-12-06', studyTime: 90, cardsReviewed: 45, accuracy: 92, streak: 6, difficulty: 3.1 },
    { date: '2025-12-07', studyTime: 75, cardsReviewed: 35, accuracy: 88, streak: 7, difficulty: 2.9 },
    { date: '2025-12-08', studyTime: 50, cardsReviewed: 25, accuracy: 86, streak: 8, difficulty: 2.7 },
    { date: '2025-12-09', studyTime: 120, cardsReviewed: 60, accuracy: 94, streak: 9, difficulty: 3.3 },
  ]);

  const [subjectPerformance] = useState<SubjectPerformance[]>([
    { subject: 'React', timeSpent: 240, accuracy: 92, totalSessions: 12, improvement: 15, lastStudied: '2025-12-09' },
    { subject: 'JavaScript', timeSpent: 180, accuracy: 88, totalSessions: 10, improvement: 12, lastStudied: '2025-12-08' },
    { subject: 'TypeScript', timeSpent: 150, accuracy: 85, totalSessions: 8, improvement: 20, lastStudied: '2025-12-07' },
    { subject: 'CSS', timeSpent: 120, accuracy: 90, totalSessions: 9, improvement: 8, lastStudied: '2025-12-06' },
    { subject: 'Node.js', timeSpent: 100, accuracy: 82, totalSessions: 6, improvement: 18, lastStudied: '2025-12-05' },
  ]);

  const [weaknessAreas] = useState<WeaknessArea[]>([
    { topic: 'React Hooks', accuracy: 65, attempts: 12, difficulty: 3.5, recommendedAction: 'Review fundamentals' },
    { topic: 'Async JavaScript', accuracy: 70, attempts: 8, difficulty: 4.0, recommendedAction: 'Practice with examples' },
    { topic: 'TypeScript Generics', accuracy: 60, attempts: 6, difficulty: 4.2, recommendedAction: 'Watch tutorial videos' },
    { topic: 'CSS Grid', accuracy: 75, attempts: 10, difficulty: 3.0, recommendedAction: 'Build projects' },
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const calculateOverallStats = () => {
    const totalStudyTime = learningData.reduce((sum, day) => sum + day.studyTime, 0);
    const totalCards = learningData.reduce((sum, day) => sum + day.cardsReviewed, 0);
    const avgAccuracy = learningData.reduce((sum, day) => sum + day.accuracy, 0) / learningData.length;
    const currentStreak = learningData[learningData.length - 1]?.streak || 0;
    
    return { totalStudyTime, totalCards, avgAccuracy, currentStreak };
  };

  const getSkillRadarData = () => {
    return subjectPerformance.map((subject: any) => ({
      subject: subject.subject,
      accuracy: subject.accuracy,
      timeSpent: subject.timeSpent / 10, // Scale for visualization
      sessions: subject.totalSessions * 10, // Scale for visualization
    }));
  };

  const getPerformanceTrend = () => {
    return learningData.map(day => ({
      date: day.date.substring(5), // Show only month-day
      accuracy: day.accuracy,
      studyTime: day.studyTime,
      cardsReviewed: day.cardsReviewed,
    }));
  };

  const stats = calculateOverallStats();

  const weaknessColumns = [
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => (
        <Progress percent={accuracy} size="small" status={accuracy < 70 ? 'exception' : 'normal'} />
      ),
    },
    {
      title: 'Attempts',
      dataIndex: 'attempts',
      key: 'attempts',
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: number) => (
        <Tag color={difficulty > 3.5 ? 'red' : difficulty > 2.5 ? 'orange' : 'green'}>
          {difficulty.toFixed(1)}
        </Tag>
      ),
    },
    {
      title: 'Recommended Action',
      dataIndex: 'recommendedAction',
      key: 'recommendedAction',
      render: (action: string) => (
        <Tag color="blue">{action}</Tag>
      ),
    },
  ];

  const subjectColumns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Time Spent',
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      render: (time: number) => `${time} min`,
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => `${accuracy}%`,
    },
    {
      title: 'Sessions',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
    },
    {
      title: 'Improvement',
      dataIndex: 'improvement',
      key: 'improvement',
      render: (improvement: number) => (
        <Space>
          {improvement > 0 ? <RiseOutlined style={{ color: '#52c41a' }} /> : <FallOutlined style={{ color: '#ff4d4f' }} />}
          <Text style={{ color: improvement > 0 ? '#52c41a' : '#ff4d4f' }}>
            {improvement > 0 ? '+' : ''}{improvement}%
          </Text>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <TrophyOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ margin: 0 }}>Learning Analytics Dashboard</Title>
            <Text type="secondary">Comprehensive insights into your learning progress and performance</Text>
          </Col>
          <Col>
            <Space>
              <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
                <Option value="7d">Last 7 days</Option>
                <Option value="30d">Last 30 days</Option>
                <Option value="90d">Last 90 days</Option>
              </Select>
              <Select value={selectedSubject} onChange={setSelectedSubject} style={{ width: 150 }}>
                <Option value="all">All Subjects</Option>
                {subjectPerformance.map(subject => (
                  <Option key={subject.subject} value={subject.subject}>{subject.subject}</Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Study Time"
              value={stats.totalStudyTime}
              suffix="min"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Cards Reviewed"
              value={stats.totalCards}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Accuracy"
              value={stats.avgAccuracy}
              precision={1}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Current Streak"
              value={stats.currentStreak}
              suffix="days"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Performance Trend" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getPerformanceTrend()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#1890ff" name="Accuracy %" />
                <Line type="monotone" dataKey="studyTime" stroke="#52c41a" name="Study Time (min)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Subject Performance" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ subject, timeSpent }) => `${subject}: ${timeSpent}min`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="timeSpent"
                >
                  {subjectPerformance.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Skills Radar Chart */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Skills Overview" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={getSkillRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar name="Accuracy" dataKey="accuracy" stroke="#1890ff" fill="#1890ff" fillOpacity={0.6} />
                <Radar name="Time Spent" dataKey="timeSpent" stroke="#52c41a" fill="#52c41a" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Study Activity" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getPerformanceTrend()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cardsReviewed" fill="#1890ff" name="Cards Reviewed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Detailed Tables */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Subject Performance" size="small">
            <Table
              columns={subjectColumns}
              dataSource={subjectPerformance}
              size="small"
              pagination={false}
              rowKey="subject"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Areas for Improvement" size="small">
            <Table
              columns={weaknessColumns}
              dataSource={weaknessAreas}
              size="small"
              pagination={false}
              rowKey="topic"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LearningAnalytics;
