import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Drawer } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  RobotOutlined,
  TeamOutlined,
  SettingOutlined,
  MenuOutlined,
  PlusOutlined,
  SearchOutlined,
  BellOutlined,
} from '@ant-design/icons';
import './MobileNavigation.css';

interface MobileNavigationProps {
  unreadNotifications?: number;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  unreadNotifications = 0,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/notes',
      icon: <BookOutlined />,
      label: 'Notes',
    },
    {
      key: '/robot',
      icon: <RobotOutlined />,
      label: 'Robot',
    },
    {
      key: '/collaboration',
      icon: <TeamOutlined />,
      label: 'Collab',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="mobile-top-nav">
        <div className="mobile-nav-left">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            className="mobile-menu-btn"
          />
          <div className="mobile-nav-title">
            <h1>NoteFusion AI</h1>
            <span className="mobile-nav-subtitle">
              {navItems.find(item => item.key === location.pathname)?.label || 'Dashboard'}
            </span>
          </div>
        </div>
        <div className="mobile-nav-right">
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => navigate('/search')}
            className="mobile-nav-btn"
          />
          <Badge count={unreadNotifications} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              onClick={() => navigate('/notifications')}
              className="mobile-nav-btn"
            />
          </Badge>
        </div>
      </div>

      {/* Side Drawer */}
      <Drawer
        title="Navigation"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        bodyStyle={{ padding: 0 }}
        className="mobile-nav-drawer"
      >
        <div className="mobile-drawer-content">
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`mobile-drawer-item ${
                location.pathname === item.key ? 'active' : ''
              }`}
              onClick={() => {
                handleNavClick(item.key);
                setDrawerOpen(false);
              }}
            >
              <span className="mobile-drawer-icon">{item.icon}</span>
              <span className="mobile-drawer-label">{item.label}</span>
            </div>
          ))}
        </div>
      </Drawer>

      {/* Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <div className="mobile-nav-container">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.key}
              className={`mobile-nav-item ${
                location.pathname === item.key ? 'active' : ''
              }`}
              onClick={() => handleNavClick(item.key)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        className="mobile-fab"
        onClick={() => {
          // Context-aware FAB action
          if (location.pathname === '/notes') {
            // Open new note modal
            navigate('/notes/new');
          } else if (location.pathname === '/robot') {
            // Start voice interaction
            navigate('/robot/chat');
          } else {
            // Default action
            navigate('/notes/new');
          }
        }}
      />
    </>
  );
};

export default MobileNavigation;
