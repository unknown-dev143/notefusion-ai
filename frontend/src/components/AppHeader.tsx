import React from 'react';
import { Layout, Dropdown, Avatar, Badge, Button, Menu as AntdMenu } from 'antd';
import type { MenuProps } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  FlagOutlined,
  BookOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../features/auth/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useFeatureFlag } from '../features/feature-flags';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has admin role
  const isAdmin = user && typeof user === 'object' && 'role' in user 
    ? user.role === 'admin' 
    : false;
  const isFeatureFlagsEnabled = useFeatureFlag('feature-flags-page');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      label: 'Settings',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];

  const navItems = [
    {
      key: 'notes',
      icon: <BookOutlined />,
      label: <Link to="/notes">Notes</Link>,
    },
    {
      key: 'backups',
      icon: <TeamOutlined />,
      label: <Link to="/backups">Backups</Link>,
    },
  ];

  // Only add feature flags menu item if user is admin and the feature is enabled
  if (isAdmin && isFeatureFlagsEnabled) {
    navItems.push({
      key: 'feature-flags',
      icon: <FlagOutlined />,
      label: <Link to="/feature-flags">Feature Flags</Link>,
    });
  }

  return (
    <Header className="site-layout-background" style={{ padding: 0, display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ marginLeft: '24px', marginRight: '24px' }}>
          <h2 style={{ color: '#1890ff', margin: 0 }}>NoteFusion AI</h2>
        </div>
        <AntdMenu
          theme="light"
          mode="horizontal"
          items={navItems}
          style={{ flex: 1, borderBottom: 'none', lineHeight: '64px' }}
        />
      </div>
      <div style={{ marginRight: '24px' }}>
        <Badge count={5}>
          <Button type="text" icon={<BellOutlined style={{ fontSize: '16px' }} />} />
        </Badge>
      </div>
      <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
        <div style={{ padding: '0 24px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <span>{user?.name || 'User'}</span>
        </div>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
