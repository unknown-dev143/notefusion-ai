import { Button, Card, Typography, Space } from 'antd';
import { LoginOutlined, UserAddOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const Home = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title level={2}>
          {isAuthenticated ? `Welcome back, ${user?.name || 'User'}!` : 'Welcome to NoteFusion AI'}
        </Title>
        <Paragraph type="secondary">
          {isAuthenticated 
            ? 'What would you like to work on today?' 
            : 'Your intelligent note-taking and knowledge management solution'}
        </Paragraph>
        
        {isAuthenticated ? (
          <Space style={{ margin: '24px 0' }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<DashboardOutlined />}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button 
              size="large" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
            >
              Logout
            </Button>
          </Space>
        ) : (
          <div style={{ margin: '24px 0' }}>
            <Link to="/login">
              <Button type="primary" size="large" icon={<LoginOutlined />} style={{ marginRight: '16px' }}>
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="large" icon={<UserAddOutlined />}>
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <Card title="Smart Notes" bordered={false}>
          <p>Create and organize your notes with AI-powered suggestions and auto-tagging.</p>
        </Card>
        <Card title="AI-Powered" bordered={false}>
          <p>Get intelligent insights and summaries of your notes using advanced AI.</p>
        </Card>
        <Card title="Collaborate" bordered={false}>
          <p>Share and collaborate on notes with your team in real-time.</p>
        </Card>
      </div>
    </div>
  );
};

export default Home;
