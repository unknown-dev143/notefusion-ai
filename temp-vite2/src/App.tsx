import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider, Layout, Drawer } from 'antd';
import { ErrorBoundary } from './components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AIProvider } from './contexts/AIContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import HistoryPanel from './components/HistoryPanel';
import MainNav from './components/MainNav';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AIDemo from './components/AIDemo';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';

const { Content } = Layout;

// Layout components
const PublicLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <MainNav collapsed={collapsed} onCollapse={setCollapsed} />
      
      <Layout style={{
        marginLeft: collapsed ? 80 : 250,
        transition: 'all 0.2s',
        minHeight: '100vh',
      }}>
        <div style={{ 
          padding: '80px 24px 24px',
          minHeight: '100vh',
          background: isDarkMode ? '#141414' : '#f0f2f5',
        }}>
          <Content style={{ 
            background: isDarkMode ? '#1f1f1f' : '#fff',
            padding: 24,
            borderRadius: 8,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          }}>
            <Outlet />
          </Content>
          
          <Drawer
            title="Edit History"
            placement="right"
            onClose={() => setShowHistory(false)}
            open={showHistory}
            width={400}
            styles={{
              body: { 
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
              }
            }}
          >
            <div style={{ flex: 1, overflow: 'auto' }}>
              <HistoryPanel />
            </div>
          </Drawer>
        </div>
      </Layout>
    </Layout>
  );
};

// Protected Route component
const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 8,
              },
            }}
          >
            <AuthProvider>
              <AIProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<PublicLayout />}>
                      <Route index element={
                        <div style={{ padding: '24px' }}>
                          <AIDemo />
                          <Home />
                        </div>
                      } />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                    </Route>

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Dashboard />} />
                    </Route>
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<SettingsPage />} />
                    </Route>

                    {/* 404 Route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </BrowserRouter>
              </AIProvider>
            </AuthProvider>
          </ConfigProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
