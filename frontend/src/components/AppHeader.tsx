import React from 'react';
<<<<<<< HEAD
import { Layout, Dropdown, Avatar, Button as AntdButton, Menu as AntdMenu, Space, theme } from 'antd';
import LanguageSelector from './LanguageSelector';
import type { MenuProps } from 'antd';
import { 
=======
import { Layout, Dropdown, Avatar, Badge, Button, Menu as AntdMenu } from 'antd';
import type { MenuProps } from 'antd';
import { 
  BellOutlined, 
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  UserOutlined, 
  LogoutOutlined, 
  FlagOutlined,
  BookOutlined,
<<<<<<< HEAD
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ClockCircleOutlined
=======
  TeamOutlined
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
} from '@ant-design/icons';
import { useAuth } from '../features/auth/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useFeatureFlag } from '../features/feature-flags';
<<<<<<< HEAD
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from '../features/notifications';
import './AppHeader.css';

const { Header } = Layout;
const Button = AntdButton as any; // Temporary fix for casing issue

interface AppHeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  isMobile: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, toggleCollapsed, isMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
=======

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  
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
<<<<<<< HEAD
=======
      key: 'settings',
      label: 'Settings',
      onClick: () => navigate('/settings')
    },
    {
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
      key: 'study',
      icon: <ClockCircleOutlined />,
      label: <Link to="/study">Study Tools</Link>,
    },
    {
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
    <Header 
      className="site-layout-background" 
      style={{ 
        padding: isMobile ? '0 10px' : '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: colorBgContainer,
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
      }}
    >
      <Space>
        {isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            className="menu-collapse-button"
          />
        )}
        <div className="header-container">
          {!isMobile && (
            <div className="logo">
              <h1>NoteFusion AI</h1>
            </div>
          )}
        </div>
      </Space>
      <div className="nav-container">
=======
    <Header className="site-layout-background" style={{ padding: 0, display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ marginLeft: '24px', marginRight: '24px' }}>
          <h2 style={{ color: '#1890ff', margin: 0 }}>NoteFusion AI</h2>
        </div>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <AntdMenu
          theme="light"
          mode="horizontal"
          items={navItems}
<<<<<<< HEAD
          className="nav-menu"
        />
      </div>
      <div className="actions-container">
        <Space size="middle" align="center">
          <LanguageSelector />
          <ThemeToggle />
          {user && <NotificationCenter />}
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="user-avatar" style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} className="user-avatar" />
                <span>{user?.name || 'User'}</span>
              </div>
            </Dropdown>
          )}
        </Space>
      </div>
=======
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    </Header>
  );
};

export default AppHeader;
