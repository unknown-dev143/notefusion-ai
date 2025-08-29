import React from 'react';
import { Layout, Dropdown, Avatar, Button as AntdButton, Menu as AntdMenu, Space, theme } from 'antd';
import LanguageSelector from './LanguageSelector';
import type { MenuProps } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  FlagOutlined,
  BookOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../features/auth/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useFeatureFlag } from '../features/feature-flags';
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
      key: 'study',
      icon: <ClockCircleOutlined />,
      label: <Link to="/study">Study Tools</Link>,
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
        <AntdMenu
          theme="light"
          mode="horizontal"
          items={navItems}
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
    </Header>
  );
};

export default AppHeader;
