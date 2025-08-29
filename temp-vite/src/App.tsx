import React, { useState, FC, ReactNode, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Layout, Menu, Button, Typography, Spin, Modal } from 'antd';
import { 
  HomeOutlined, 
  FileTextOutlined, 
  RobotOutlined,
  LogoutOutlined,
  DashboardOutlined
} from '@ant-design/icons';

// Import the register function only on the client side
const registerServiceWorker = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const { register } = await import('./serviceWorkerRegistration');
    register();
  }
};

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Whiteboard from './pages/Whiteboard';
import AISettings from './components/AISettings';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/Dashboard';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

interface AppContentProps {
  children?: ReactNode;
}

const AppContent: FC<AppContentProps> = () => {
  const { currentUser, loading, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // PWA Installation prompt
  useEffect(() => {
    registerServiceWorker();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    setShowInstallPrompt(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    }
  };

  // Navigation items
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Dashboard</Link>,
      hidden: false,
    },
    {
      key: '/whiteboard',
      icon: <FileTextOutlined />,
      label: <Link to="/whiteboard">Whiteboard</Link>,
      hidden: false,
    },
    {
      key: '/ai-settings',
      icon: <RobotOutlined />,
      label: <Link to="/ai-settings">AI Settings</Link>,
      hidden: false,
    },
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Admin</Link>,
      hidden: !currentUser?.isAdmin,
    },
  ].filter(item => !item.hidden);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
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
          className="bg-white border-r"
          width={250}
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
      <Layout className="min-h-screen">
        {currentUser && (
          <Header className="bg-white shadow-sm p-0 px-6 flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-800">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/whiteboard' && 'Whiteboard'}
              {location.pathname === '/ai-settings' && 'AI Settings'}
              {location.pathname === '/admin' && 'Admin Dashboard'}
            </div>
            <div className="flex items-center space-x-4">
              {currentUser?.isAdmin && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Admin Mode
                </span>
              )}
              <Button 
                type="text" 
                icon={<LogoutOutlined />} 
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </Header>
        )}
        <Content className="p-6 bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/" replace />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/whiteboard" element={<Whiteboard />} />
              <Route path="/ai-settings" element={<AISettings />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* PWA Install Prompt */}
          <Modal
            title="Install NoteFusion AI"
            open={showInstallPrompt}
            onCancel={() => setShowInstallPrompt(false)}
            footer={[
              <Button key="cancel" onClick={() => setShowInstallPrompt(false)}>
                Not Now
              </Button>,
              <Button key="install" type="primary" onClick={handleInstallClick}>
                Install
              </Button>,
            ]}
          >
            <p>Add NoteFusion AI to your home screen for quick access and offline capabilities.</p>
          </Modal>
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
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
