import React, { useState } from 'react';
import { Layout, Button, Dropdown, Menu, Avatar } from 'antd';
import './AdminLayout.css';
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

  const menuItems = [
    {
      key: 'logout',
      danger: true,
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        collapsedWidth={0}
        width={200}
        className="admin-sider"
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
        <div className="admin-logo" style={{ height: '64px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)' }} />
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
      <Layout 
        className={`admin-layout-container ${collapsed ? 'collapsed' : ''}`}
        style={{ marginLeft: collapsed ? 0 : 200, transition: 'all 0.2s' }}
      >
        <Header 
          className={`admin-header ${collapsed ? 'collapsed' : ''}`}
          style={{ 
            padding: 0, 
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            zIndex: 9,
            position: 'sticky',
            top: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="admin-header-button"
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </div>
          <div style={{ paddingRight: 16 }} className="admin-header-right">
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <div 
                className="admin-header-dropdown"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Avatar style={{ marginRight: 8 }} className="user-avatar">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </Avatar>
                <span style={{ marginRight: 8 }} className="user-name">
                  {user?.name || 'Admin'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content 
          className={`admin-content ${collapsed ? 'collapsed' : ''}`}
          style={{ 
            margin: '24px 16px 0', 
            overflow: 'initial',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <div className="site-layout-background" style={{ padding: 24, minHeight: '100%' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
