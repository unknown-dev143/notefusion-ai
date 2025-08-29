import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Layout, notification, ConfigProvider, theme } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';
import AppHeader from '../components/AppHeader';
import AppSider from '../components/AppSider';
import ErrorBoundary from '../components/ErrorBoundary';
import './AppLayout.css';

const { Content } = Layout;
const { defaultAlgorithm } = theme;

// Move theme configuration to a constant
const themeConfig = {
  algorithm: defaultAlgorithm,
  token: {
    colorPrimary: 'var(--primary-color, #1890ff)',
    borderRadius: 6,
    colorBgContainer: 'var(--bg-color, #ffffff)',
  },
  components: {
    Layout: {
      headerBg: 'var(--header-bg, #001529)',
      siderBg: 'var(--sider-bg, #001529)',
    },
  },
};

interface AppLayoutProps {
  children: React.ReactNode;
}

// Enhanced error handler with different error types
const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Application Error:', error, errorInfo);
  
  const getErrorMessage = (error: Error): { message: string; description: string } => {
    if (error.name === 'NetworkError') {
      return {
        message: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.'
      };
    }
    if (error.name === 'AuthError') {
      return {
        message: 'Authentication Error',
        description: 'Your session has expired. Please log in again.'
      };
    }
    return {
      message: 'Something went wrong',
      description: 'We\'ve encountered an error. Our team has been notified.'
    };
  };
  
  const { message, description } = getErrorMessage(error);
  
  notification.error({
    message,
    description,
    placement: 'topRight' as NotificationPlacement,
    duration: 5,
  });
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }: React.PropsWithChildren<AppLayoutProps>) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !collapsed) {
      setCollapsed(true);
    }
  }, [collapsed]);

  return (
    <ConfigProvider theme={themeConfig}>
      <ErrorBoundary 
        onError={handleError}
        showReportDialog={process.env.NODE_ENV === 'production'}
      >
        <Layout 
          style={{ minHeight: '100vh' }}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div 
            className={`sider-overlay ${!collapsed && isMobile ? 'active' : ''}`}
            onClick={() => setCollapsed(true)}
            role="button"
            aria-label="Close menu"
            tabIndex={-1}
          />
          <AppSider 
            collapsed={collapsed} 
            onCollapse={setCollapsed} 
            isMobile={isMobile} 
            aria-hidden={collapsed}
          />
          <Layout 
            className={`site-layout ${isMobile && !collapsed ? 'menu-open' : ''}`}
            role="main"
          >
            <AppHeader 
              collapsed={collapsed} 
              toggleCollapsed={toggleCollapsed} 
              isMobile={isMobile} 
              aria-expanded={!collapsed}
              aria-controls="main-content"
            />
            <Content 
              id="main-content"
              className="site-layout-content"
              aria-live="polite"
              aria-atomic="true"
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </ErrorBoundary>
    </ConfigProvider>
  );
};

export default AppLayout;
