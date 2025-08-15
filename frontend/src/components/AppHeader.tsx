import React from 'react';
import { Layout, Dropdown, Menu, Avatar, Badge, Button } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate('/profile')}>
        <UserOutlined /> Profile
      </Menu.Item>
      <Menu.Item key="settings" onClick={() => navigate('/settings')}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" danger onClick={handleLogout}>
        <LogoutOutlined /> Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="site-layout-background" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <div style={{ marginRight: '24px' }}>
        <Badge count={5}>
          <Button type="text" icon={<BellOutlined style={{ fontSize: '16px' }} />} />
        </Badge>
      </div>
      <Dropdown overlay={userMenu} trigger={['click']}>
        <div style={{ padding: '0 16px', cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <span>{user?.name || 'User'}</span>
        </div>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
