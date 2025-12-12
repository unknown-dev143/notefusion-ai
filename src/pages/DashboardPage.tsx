import React from 'react';
import { Card, Typography, Button, Row, Col, Space, Statistic, List, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  BookOutlined,
  CalendarOutlined,
  RobotOutlined,
  FileTextOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  DownloadOutlined,
  SearchOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  BarChartOutlined,
  FilePdfOutlined,
  EditOutlined,
  ShareAltOutlined,
  HistoryOutlined,
  CameraOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import StreakTracker from '../components/StreakTracker';
import Calendar from '../components/Calendar';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      category: 'Core Features',
      items: [
        { title: 'Notes Management', icon: <FileTextOutlined />, path: '/notes', description: 'Create and organize intelligent notes' },
        { title: 'Whiteboard', icon: <EditOutlined />, path: '/whiteboard', description: 'Digital canvas for brainstorming' },
        { title: 'Calendar', icon: <CalendarOutlined />, path: '/calendar', description: 'Schedule and track events' }
      ]
    },
    {
      category: 'Study Tools',
      items: [
        { title: 'Module Management', icon: <BookOutlined />, path: '/modules', description: 'Organize course modules' },
        { title: 'Study Scheduler', icon: <ClockCircleOutlined />, path: '/study', description: 'Plan study sessions' },
        { title: 'Session Manager', icon: <VideoCameraOutlined />, path: '/sessions', description: 'Manage study sessions' },
        { title: 'Flashcard System', icon: <RobotOutlined />, path: '/flashcards', description: 'Smart flashcards for learning' },
        { title: 'Quiz System', icon: <TrophyOutlined />, path: '/quiz', description: 'Interactive quizzes and assessments' }
      ]
    },
    {
      category: 'AI Tools',
      items: [
        { title: 'AI Assistant', icon: <RobotOutlined />, path: '/ai', description: 'Get AI-powered help' },
        { title: 'Note Generator', icon: <BulbOutlined />, path: '/ai/generator', description: 'AI-powered note creation' },
        { title: 'Advanced Search', icon: <SearchOutlined />, path: '/ai/search', description: 'Intelligent content search' },
        { title: 'Export System', icon: <DownloadOutlined />, path: '/ai/export', description: 'Export in multiple formats' },
        { title: 'Transcript Editor', icon: <AudioOutlined />, path: '/ai/transcript', description: 'Audio transcription' },
        { title: 'Social Integration', icon: <ShareAltOutlined />, path: '/ai/social', description: 'Share with social platforms' },
        { title: 'Analytics', icon: <BarChartOutlined />, path: '/ai/analytics', description: 'Track learning progress' },
        { title: 'Image Generator', icon: <CameraOutlined />, path: '/ai/image', description: 'AI image creation' }
      ]
    },
    {
      category: 'Content Tools',
      items: [
        { title: 'Voice Recorder', icon: <AudioOutlined />, path: '/voice', description: 'Record audio notes' },
        { title: 'PDF Processor', icon: <FilePdfOutlined />, path: '/pdf', description: 'Process PDF documents' },
        { title: 'Version History', icon: <HistoryOutlined />, path: '/history', description: 'Track document changes' },
        { title: 'Streak Tracker', icon: <TrophyOutlined />, path: '/streak', description: 'Track learning streaks and goals' },
        { title: 'Presentation Mode', icon: <EditOutlined />, path: '/presentation', description: 'Create and present slides' }
      ]
    }
  ];

  const recentActivity = [
    { action: 'Created new note', time: '2 hours ago', icon: <FileTextOutlined /> },
    { action: 'Completed flashcard review', time: '4 hours ago', icon: <RobotOutlined /> },
    { action: 'Scheduled study session', time: '6 hours ago', icon: <CalendarOutlined /> },
    { action: 'Generated AI notes', time: '1 day ago', icon: <RobotOutlined /> }
  ];

  const stats = [
    { title: 'Total Notes', value: 127, icon: <FileTextOutlined />, color: '#1890ff' },
    { title: 'Study Sessions', value: 23, icon: <VideoCameraOutlined />, color: '#52c41a' },
    { title: 'Flashcards', value: 156, icon: <RobotOutlined />, color: '#722ed1' },
    { title: 'AI Interactions', value: 89, icon: <RobotOutlined />, color: '#fa8c16' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Welcome to NoteFusion AI Dashboard</Title>
        <Text type="secondary">Your intelligent learning and productivity hub</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<Avatar icon={stat.icon} style={{ backgroundColor: stat.color }} />}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginBottom: '32px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/notes')}
              block
            >
              Create New Note
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button 
              size="large" 
              icon={<RobotOutlined />}
              onClick={() => navigate('/ai')}
              block
            >
              Open AI Assistant
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button 
              size="large" 
              icon={<CalendarOutlined />}
              onClick={() => navigate('/study')}
              block
            >
              Schedule Study
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Features Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        {features.map((category, catIndex) => (
          <Col xs={24} lg={12} key={catIndex}>
            <Card title={category.category} style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {category.items.map((item, itemIndex) => (
                  <Card 
                    key={itemIndex}
                    size="small" 
                    hoverable
                    onClick={() => navigate(item.path)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Space>
                      <Avatar icon={item.icon} />
                      <div style={{ flex: 1 }}>
                        <Text strong>{item.title}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.description}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Activity, Streak Tracker & Calendar */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Recent Activity">
            <List
              dataSource={recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={item.icon} />}
                    title={item.action}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Streak Tracker">
            <StreakTracker />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Calendar">
            <Calendar />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
