import { Layout, Menu, Button, Space, Typography, theme } from 'antd';
import { 
  DashboardOutlined, 
  SettingOutlined, 
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const { Sider } = Layout;
const { Text } = Typography;

interface MainNavProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const MainNav = ({ collapsed, onCollapse }: MainNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { token: { colorBgContainer, colorBorder } } = theme.useToken();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={250}
      style={{
        background: colorBgContainer,
        borderRight: `1px solid ${colorBorder}`,
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      <div style={{ 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '16px 8px 24px', textAlign: 'center' }}>
            <Text strong style={{ fontSize: '1.2rem' }}>
              {collapsed ? 'NF' : 'NoteFusion AI'}
            </Text>
          </div>
          
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </div>

        <div style={{ 
          padding: '16px 0',
          borderTop: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
        }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" ellipsis style={{ maxWidth: collapsed ? 0 : 120 }}>
                {user?.email}
              </Text>
              <ThemeToggle />
            </div>
            
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={logout}
              style={{ width: '100%', textAlign: 'left' }}
            >
              {!collapsed && 'Logout'}
            </Button>
          </Space>
        </div>
      </div>
    </Sider>
  );
};

export default MainNav;
