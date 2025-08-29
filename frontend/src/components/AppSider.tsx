import React from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  SearchOutlined,
  SettingOutlined,
  CloudOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

interface AppSiderProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
}

const AppSider: React.FC<AppSiderProps> = ({ collapsed, onCollapse, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/notes',
      icon: <FileTextOutlined />,
      label: 'Notes',
      onClick: () => navigate('/notes'),
    },
    {
      key: '/backups',
      icon: <CloudOutlined />,
      label: 'Backups',
      onClick: () => navigate('/backups'),
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: 'Search',
      onClick: () => navigate('/search'),
    },
    {
      key: '/audio-demo',
      icon: <AudioOutlined />,
      label: 'Audio Notes',
      onClick: () => navigate('/audio-demo'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={onCollapse}
      width={250}
      className="site-layout-sider sider-layout"
      trigger={null}
      collapsedWidth={isMobile ? 0 : 80}
      breakpoint="lg"
    >
      <div className="logo" />
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapse(!collapsed)}
        style={{ width: '100%', height: 48 }}
      />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSider;
