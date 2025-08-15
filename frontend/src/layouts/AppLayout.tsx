import React from 'react';
import { Layout, notification } from 'antd';
import AppHeader from '../components/AppHeader';
import AppSider from '../components/AppSider';
import ErrorBoundary from '../components/ErrorBoundary';

const { Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

// Error handler function that can be reused
const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log to your error tracking service (e.g., Sentry, LogRocket)
  console.error('Application Error:', error, errorInfo);
  
  // Show error notification to the user
  notification.error({
    message: 'An error occurred',
    description: 'We encountered an error. Our team has been notified.',
    duration: 5,
  });
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary 
      onError={handleError}
      showReportDialog={process.env.NODE_ENV === 'production'}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <AppSider />
        <Layout className="site-layout">
          <AppHeader />
          <Content style={{ margin: '24px 16px 0' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ErrorBoundary>
  );
};

export default AppLayout;
