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

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" danger onClick={handleLogout}>
        <LogoutOutlined /> Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="admin-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        collapsedWidth={0}
        width={200}
        className="admin-sider"
      >
        <div className="admin-logo" />
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
      <Layout className={`admin-layout-container ${collapsed ? 'collapsed' : ''}`}>
        <Header className={`admin-header ${collapsed ? 'collapsed' : ''}`}>
          <div className="admin-header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="admin-header-button"
            />
          </div>
          <div className="admin-header-right">
            <Dropdown overlay={userMenu} trigger={['click']}>
              <div className="admin-header-dropdown">
                <Avatar className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</Avatar>
                <span className="user-name">{user?.name || 'Admin'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
          <div className="site-layout-background">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
