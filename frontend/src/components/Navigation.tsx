import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Avatar, Dropdown, Switch, Input, Drawer } from 'antd';
import { 
  BookOutlined, 
  FileTextOutlined, 
  RobotOutlined, 
  CheckSquareOutlined,
  CreditCardOutlined,
  UserOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  SearchOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';

const { Header } = Layout;

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVisible, setSearchVisible] = useState(false);

  const menuItems = [
    {
      key: '/notes',
      icon: <FileTextOutlined />,
      label: 'Notes',
    },
    {
      key: '/flashcards',
      icon: <BookOutlined />,
      label: 'Flashcards',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tasks',
    },
    {
      key: '/ai-chat',
      icon: <RobotOutlined />,
      label: 'AI Chat',
    },
    {
      key: '/subscription',
      icon: <CreditCardOutlined />,
      label: 'Subscription',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  if (!user) {
    return (
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '0 2rem'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1890ff' }}>
          NoteFusion AI
        </div>
        <Space>
          <Button type="link" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button type="primary" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
        </Space>
      </Header>
    );
  }

  return (
    <Header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '0 2rem'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1890ff' }}>
        NoteFusion AI
      </div>
      
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ 
          flex: 1, 
          border: 'none', 
          justifyContent: 'center',
          minWidth: '400px'
        }}
        onClick={({ key }) => navigate(key)}
      />
      
      <Space>
        <Button
          type="text"
          icon={<SearchOutlined />}
          onClick={() => setSearchVisible(true)}
        />
        <NotificationCenter />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user.email}</span>
          </Space>
        </Dropdown>
        
        <Switch
          checked={theme === 'dark'}
          onChange={toggleTheme}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
        />
      </Space>
      
      <Drawer
        title="Search"
        placement="top"
        height="400px"
        onClose={() => setSearchVisible(false)}
        open={searchVisible}
      >
        <GlobalSearch />
      </Drawer>
    </Header>
  );
};

export default Navigation;
