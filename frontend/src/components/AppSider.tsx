<<<<<<< HEAD
import React from 'react';
import { Layout, Menu, Button, theme } from 'antd';
=======
import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import {
  DashboardOutlined,
  FileTextOutlined,
  SearchOutlined,
  SettingOutlined,
<<<<<<< HEAD
  CloudOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AudioOutlined,
=======
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloudOutlined,
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

<<<<<<< HEAD
interface AppSiderProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
}

const AppSider: React.FC<AppSiderProps> = ({ collapsed, onCollapse, isMobile }) => {
=======
const AppSider: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
      key: '/audio-demo',
      icon: <AudioOutlined />,
      label: 'Audio Notes',
      onClick: () => navigate('/audio-demo'),
    },
    {
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
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
=======
      onCollapse={(value) => setCollapsed(value)}
      trigger={null}
      width={200}
      className="site-layout-background"
    >
      <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)' }} />
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
