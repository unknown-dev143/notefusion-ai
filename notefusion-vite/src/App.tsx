import { useState, useEffect, lazy } from 'react';
import type { FC, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Layout, Menu, Button, Typography } from 'antd';
import { 
  HomeOutlined, 
  FileTextOutlined, 
  RobotOutlined,
  LogoutOutlined
} from '@ant-design/icons';

// Pages - Using dynamic imports for better code splitting
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Whiteboard = lazy(() => import('./pages/Whiteboard'));
import AISettings from './components/AISettings';
import PrivateRoute from './components/PrivateRoute';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

interface AppContentProps {
  children?: ReactNode;
  onMount?: () => void;
}

const AppContent: FC<AppContentProps> = ({ onMount }) => {
  // Call onMount when component mounts
  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, [onMount]);
  const { currentUser, loading, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Navigation items
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/whiteboard',
      icon: <FileTextOutlined />,
      label: <Link to="/whiteboard">Whiteboard</Link>,
    },
    {
      key: '/ai-settings',
      icon: <RobotOutlined />,
      label: <Link to="/ai-settings">AI Settings</Link>,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
      {currentUser && (
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          theme="light"
          width={250}
          className="border-r"
        >
          <div className="p-4 h-16 flex items-center">
            <h1 className="text-xl font-bold text-blue-600">
              {collapsed ? 'NF' : 'NoteFusion AI'}
            </h1>
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-r-0"
          />
        </Sider>
      )}
      <Layout>
        {currentUser && (
          <Header className="bg-white shadow-sm p-0 px-6 flex items-center justify-between">
            <div></div>
            <div className="flex items-center space-x-4">
              <Button 
                type="text" 
                icon={<LogoutOutlined />} 
                onClick={signOut}
              >
                Logout
              </Button>
            </div>
          </Header>
        )}
        <Content className="p-6 bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/whiteboard"
              element={
                <PrivateRoute>
                  <Whiteboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-settings"
              element={
                <PrivateRoute>
                  <AISettings />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
        <Footer className="text-center bg-white border-t">
          <Text type="secondary">
            {new Date().getFullYear()} NoteFusion AI. All rights reserved.
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

// Main App component with AuthProvider
const App: FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
