import React, { useState } from 'react';
import { Layout, Button, Dropdown, Menu, Avatar } from 'antd';
<<<<<<< HEAD
import './AdminLayout.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import { 
  LogoutOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined 
} from '@ant-design/icons';
import { useAuth } from '../features/auth/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" danger onClick={handleLogout}>
        <LogoutOutlined /> Logout
      </Menu.Item>
    </Menu>
  );

  return (
<<<<<<< HEAD
    <Layout className="admin-layout">
=======
    <Layout style={{ minHeight: '100vh' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        collapsedWidth={0}
        width={200}
<<<<<<< HEAD
        className="admin-sider"
      >
        <div className="admin-logo" />
=======
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div className="logo" style={{ height: '64px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)' }} />
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          items={[
            {
              key: '/sys/console',
              label: 'Dashboard',
              icon: <DashboardOutlined />,
              onClick: () => navigate('/sys/console'),
            },
            {
              key: '/sys/console/users',
              label: 'Users',
              icon: <TeamOutlined />,
              onClick: () => navigate('/sys/console/users'),
            },
            {
              key: '/sys/console/pricing',
              label: 'Pricing',
              icon: <DollarOutlined />,
              onClick: () => navigate('/sys/console/pricing'),
            },
            {
              key: '/sys/console/analytics',
              label: 'Analytics',
              icon: <BarChartOutlined />,
              onClick: () => navigate('/sys/console/analytics'),
            },
          ]}
        />
      </Sider>
<<<<<<< HEAD
      <Layout className={`admin-layout-container ${collapsed ? 'collapsed' : ''}`}>
        <Header className={`admin-header ${collapsed ? 'collapsed' : ''}`}>
          <div className="admin-header-left">
=======
      <Layout style={{ marginLeft: collapsed ? 0 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: 0, 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 9,
          position: 'sticky',
          top: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
<<<<<<< HEAD
              className="admin-header-button"
            />
          </div>
          <div className="admin-header-right">
            <Dropdown overlay={userMenu} trigger={['click']}>
              <div className="admin-header-dropdown">
                <Avatar className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</Avatar>
                <span className="user-name">{user?.name || 'Admin'}</span>
=======
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </div>
          <div style={{ paddingRight: 16 }}>
            <Dropdown overlay={userMenu} trigger={['click']}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar style={{ marginRight: 8 }}>{user?.name?.[0]?.toUpperCase() || 'A'}</Avatar>
                <span style={{ marginRight: 8 }}>{user?.name || 'Admin'}</span>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              </div>
            </Dropdown>
          </div>
        </Header>
<<<<<<< HEAD
        <Content className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
          <div className="site-layout-background">
=======
        <Content style={{ 
          margin: '24px 16px 0', 
          overflow: 'initial',
          minHeight: 'calc(100vh - 112px)',
        }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: '100%' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
