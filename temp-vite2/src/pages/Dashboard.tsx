import { useState } from 'react';
import { Layout, Menu, Dropdown, Button, Avatar, Typography, Card, Space, List } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  PlusOutlined, 
  FileTextOutlined, 
  TeamOutlined, 
  StarOutlined, 
  EditOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Content } = Layout;
const { Title, Text } = Typography;

// Mock data - replace with actual data from your API
const recentNotes = [
  { id: 1, title: 'Project Kickoff', updatedAt: '2 hours ago', isStarred: true },
  { id: 2, title: 'Meeting Notes', updatedAt: '1 day ago', isStarred: false },
  { id: 3, title: 'Ideas Board', updatedAt: '3 days ago', isStarred: true },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3}>Dashboard</Title>
            <Text type="secondary">Welcome back, {user?.name || 'User'}!</Text>
          </div>
          <Space>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar size="small" style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                {user?.name || 'User'}
              </Button>
            </Dropdown>
            <Link to="/notes/new">
              <Button type="primary" icon={<PlusOutlined />}>
                New Note
              </Button>
            </Link>
          </Space>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card>
            <Space direction="vertical">
              <Text type="secondary">Total Notes</Text>
              <Title level={3} style={{ margin: 0 }}>24</Title>
            </Space>
          </Card>
          <Card>
            <Space direction="vertical">
              <Text type="secondary">Starred</Text>
              <Title level={3} style={{ margin: 0 }}>5</Title>
            </Space>
          </Card>
          <Card>
            <Space direction="vertical">
              <Text type="secondary">Shared</Text>
              <Title level={3} style={{ margin: 0 }}>8</Title>
            </Space>
          </Card>
          <Card>
            <Space direction="vertical">
              <Text type="secondary">Storage Used</Text>
              <Title level={3} style={{ margin: 0 }}>15%</Title>
            </Space>
          </Card>
        </div>

        {/* Tabs */}
        <Card 
          tabList={[
            { key: 'recent', tab: 'Recent Notes' },
            { key: 'starred', tab: 'Starred' },
            { key: 'shared', tab: 'Shared with Me' },
          ]}
          activeTabKey={activeTab}
          onTabChange={key => setActiveTab(key as string)}
        >
          {activeTab === 'recent' && (
            <List
              dataSource={recentNotes}
              renderItem={note => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<StarOutlined style={{ color: note.isStarred ? '#faad14' : undefined }} />} key="star" />,
                    <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/notes/${note.id}`)} key="edit" />,
                  ]}
                >
                  <List.Item.Meta
                    title={<Link to={`/notes/${note.id}`}>{note.title}</Link>}
                    description={`Updated ${note.updatedAt}`}
                  />
                </List.Item>
              )}
            />
          )}
          {activeTab === 'starred' && (
            <List
              dataSource={recentNotes.filter(note => note.isStarred)}
              renderItem={note => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<StarOutlined style={{ color: note.isStarred ? '#faad14' : undefined }} />} key="star" />,
                    <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/notes/${note.id}`)} key="edit" />,
                  ]}
                >
                  <List.Item.Meta
                    title={<Link to={`/notes/${note.id}`}>{note.title}</Link>}
                    description={`Updated ${note.updatedAt}`}
                  />
                </List.Item>
              )}
            />
          )}
          {activeTab === 'shared' && (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <Text type="secondary">No shared notes yet</Text>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" style={{ marginTop: '24px' }}>
          <Space wrap>
            <Button icon={<FileTextOutlined />} size="large">New Note</Button>
            <Button icon={<TeamOutlined />} size="large">Share Note</Button>
            <Button icon={<StarOutlined />} size="large">View Starred</Button>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default Dashboard;
