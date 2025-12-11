import React from 'react';
import { Button, Card, Typography, Space, Row, Col, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  PlusOutlined,
  RobotOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SearchOutlined,
  EditOutlined,
  AudioOutlined,
  ShareAltOutlined,
  BarChartOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  FilePdfOutlined,
  CreditCardOutlined,
  UserOutlined,
  VideoCameraOutlined,
  CameraOutlined,
  PlayCircleOutlined,
  PictureOutlined,
  StarOutlined,
  SettingOutlined,
  TeamOutlined,
  FilePptOutlined,
  SoundOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  ApiOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    { title: 'Create Note', icon: <PlusOutlined />, path: '/notes', type: 'primary' },
    { title: 'AI Assistant', icon: <RobotOutlined />, path: '/ai', type: 'default' },
    { title: 'Study Session', icon: <CalendarOutlined />, path: '/study', type: 'default' },
    { title: 'Voice Record', icon: <AudioOutlined />, path: '/voice', type: 'default' },
    { title: 'Take Quiz', icon: <TrophyOutlined />, path: '/quiz', type: 'default' },
    { title: 'Screen Capture', icon: <CameraOutlined />, path: '/screen', type: 'default' },
    { title: 'Video Record', icon: <VideoCameraOutlined />, path: '/record', type: 'default' },
    { title: 'Payment', icon: <CreditCardOutlined />, path: '/payment', type: 'default' },
    { title: 'Profile', icon: <UserOutlined />, path: '/settings', type: 'default' }
  ];

  const features = [
    {
      title: 'AI-Powered Intelligence',
      icon: <RobotOutlined />,
      color: '#1890ff',
      items: [
        'Smart note generation with AI',
        'Intelligent content recommendations',
        'Automated summarization',
        'Natural language processing'
      ]
    },
    {
      title: 'Study & Learning Tools',
      icon: <TrophyOutlined />,
      color: '#52c41a',
      items: [
        'Interactive flashcard system',
        'Study session scheduling',
        'Progress tracking analytics',
        'Module organization'
      ]
    },
    {
      title: 'Content Management',
      icon: <FileTextOutlined />,
      color: '#722ed1',
      items: [
        'Advanced search capabilities',
        'PDF processing & extraction',
        'Voice recording & transcription',
        'Version history tracking'
      ]
    },
    {
      title: 'Collaboration & Sharing',
      icon: <ShareAltOutlined />,
      color: '#fa8c16',
      items: [
        'Social media integration',
        'Export in multiple formats',
        'Real-time collaboration',
        'Content sharing tools'
      ]
    }
  ];

  const tools = [
    { name: 'AI Assistant', icon: <RobotOutlined />, path: '/ai', description: 'Get intelligent help' },
    { name: 'Note Generator', icon: <BulbOutlined />, path: '/ai/generator', description: 'AI-powered creation' },
    { name: 'Advanced Search', icon: <SearchOutlined />, path: '/ai/search', description: 'Smart content search' },
    { name: 'Flashcards', icon: <BulbOutlined />, path: '/flashcards', description: 'Interactive learning' },
    { name: 'Voice Recorder', icon: <AudioOutlined />, path: '/voice', description: 'Audio notes' },
    { name: 'PDF Processor', icon: <FilePdfOutlined />, path: '/pdf', description: 'Document processing' },
    { name: 'Whiteboard', icon: <EditOutlined />, path: '/whiteboard', description: 'Digital canvas' },
    { name: 'File Manager', icon: <FileTextOutlined />, path: '/files', description: 'Organize documents' },
    { name: 'Task Manager', icon: <BarChartOutlined />, path: '/tasks', description: 'Manage tasks' },
    { name: 'Study Timer', icon: <ClockCircleOutlined />, path: '/timer', description: 'Focus timer' },
    { name: 'Bookmarks', icon: <StarOutlined />, path: '/bookmarks', description: 'Quick access' },
    { name: 'Dashboard Widgets', icon: <SettingOutlined />, path: '/widgets', description: 'Custom dashboard' },
    { name: 'Collaboration', icon: <TeamOutlined />, path: '/collaboration', description: 'Work together' },
    { name: 'Study Planner', icon: <CalendarOutlined />, path: '/planner', description: 'Plan studies' },
    { name: 'Progress Tracker', icon: <TrophyOutlined />, path: '/progress', description: 'Track progress' },
    { name: 'Gamification', icon: <StarOutlined />, path: '/gamification', description: 'Earn rewards' },
    { name: 'Image Editor', icon: <PictureOutlined />, path: '/image-editor', description: 'Edit images' },
    { name: 'Video Editor', icon: <PlayCircleOutlined />, path: '/video-editor', description: 'Edit videos' },
    { name: 'Advanced Whiteboard', icon: <EditOutlined />, path: '/advanced-whiteboard', description: 'Advanced canvas' },
    { name: 'Presentation Generator', icon: <FilePptOutlined />, path: '/presentation', description: 'AI presentations' },
    { name: 'Voice Assistant', icon: <SoundOutlined />, path: '/voice-assistant', description: 'Voice commands' },
    { name: 'Voice Recorder', icon: <AudioOutlined />, path: '/voice', description: 'Record & transcribe' },
    { name: 'Study Groups', icon: <TeamOutlined />, path: '/study-groups', description: 'Collaborative learning' },
    { name: 'Integrations', icon: <ApiOutlined />, path: '/integrations', description: 'Connect services' },
    { name: 'Offline Mode', icon: <DatabaseOutlined />, path: '/offline', description: 'Work offline' },
    { name: 'Mind Mapping', icon: <BranchesOutlined />, path: '/mindmap', description: 'Visual thinking' },
    { name: 'Analytics', icon: <BarChartOutlined />, path: '/ai/analytics', description: 'Learning insights' },
    { name: 'Quiz System', icon: <TrophyOutlined />, path: '/quiz', description: 'Interactive quizzes' },
    { name: 'Streak Tracker', icon: <TrophyOutlined />, path: '/streak', description: 'Track learning streaks' },
    { name: 'Presentation', icon: <EditOutlined />, path: '/presentation', description: 'Create presentations' },
    { name: 'Image Generator', icon: <PictureOutlined />, path: '/ai/image', description: 'AI image creation' },
    { name: 'Video Generator', icon: <PlayCircleOutlined />, path: '/ai/video', description: 'AI video creation' },
    { name: 'Screen Capture', icon: <CameraOutlined />, path: '/screen', description: 'Take screenshots' },
    { name: 'Video Recorder', icon: <VideoCameraOutlined />, path: '/record', description: 'Record videos' },
    { name: 'Payment System', icon: <CreditCardOutlined />, path: '/payment', description: 'Manage billing' },
    { name: 'User Profile', icon: <UserOutlined />, path: '/settings', description: 'Profile settings' }
  ];

  return (
    <div className="home-page">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Title level={1} style={{ marginBottom: '1rem', background: 'linear-gradient(45deg, #1890ff, #722ed1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome to NoteFusion AI
          </Title>
          <Paragraph style={{ fontSize: '1.3rem', marginBottom: '2rem', color: '#666' }}>
            Your intelligent learning companion with advanced AI-powered features for modern education
          </Paragraph>
          <Space size="large" wrap>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/notes')}
            >
              Get Started
            </Button>
            <Button 
              size="large"
              icon={<RobotOutlined />}
              onClick={() => navigate('/ai')}
            >
              Try AI Features
            </Button>
          </Space>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions" style={{ marginBottom: '3rem' }}>
          <Row gutter={[16, 16]}>
            {quickActions.map((action, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Button
                  type={action.type as any}
                  size="large"
                  icon={action.icon}
                  onClick={() => navigate(action.path)}
                  block
                  style={{ height: '60px' }}
                >
                  {action.title}
                </Button>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Features Grid */}
        <Row gutter={[24, 24]} style={{ marginBottom: '3rem' }}>
          {features.map((feature, index) => (
            <Col xs={24} md={12} lg={6} key={index}>
              <Card 
                hoverable
                style={{ height: '100%', textAlign: 'center' }}
                bodyStyle={{ padding: '24px' }}
              >
                <Avatar 
                  icon={feature.icon} 
                  size={64} 
                  style={{ backgroundColor: feature.color, marginBottom: '16px' }}
                />
                <Title level={4}>{feature.title}</Title>
                <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} style={{ marginBottom: '8px', color: '#666' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tools Section */}
        <Card title="Powerful Tools at Your Fingertips" style={{ marginBottom: '3rem' }}>
          <Row gutter={[16, 16]}>
            {tools.map((tool, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card 
                  size="small"
                  hoverable
                  onClick={() => navigate(tool.path)}
                  style={{ cursor: 'pointer', height: '100%' }}
                >
                  <Space>
                    <Avatar icon={tool.icon} size="small" />
                    <div>
                      <Text strong>{tool.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {tool.description}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Stats Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '3rem' }}>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <TrophyOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                <Title level={3}>15+</Title>
                <Text>AI Features</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <TrophyOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={3}>1000+</Title>
                <Text>Active Users</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={3}>24/7</Title>
                <Text>AI Availability</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* CTA Section */}
        <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ color: 'white' }}>
            <Title level={3} style={{ color: 'white', marginBottom: '16px' }}>
              Ready to Transform Your Learning Experience?
            </Title>
            <Paragraph style={{ color: 'white', fontSize: '16px', marginBottom: '24px' }}>
              Join thousands of students using AI-powered learning tools
            </Paragraph>
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/notes')}
                style={{ background: 'white', color: '#764ba2', border: 'none' }}
              >
                Start Learning
              </Button>
              <Button 
                size="large"
                onClick={() => navigate('/about')}
                style={{ borderColor: 'white', color: 'white' }}
              >
                Learn More
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
