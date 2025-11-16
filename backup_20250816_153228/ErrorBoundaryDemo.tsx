import React, { useState } from 'react';
import { Card, Button, Space, Typography, Divider, Alert } from 'antd';
import { BugOutlined, HomeOutlined } from '@ant-design/icons';
import ErrorBoundary from '../components/ErrorBoundary';

const { Title, Text, Paragraph } = Typography;

// Component that will throw an error
const BuggyComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('💥 This is a test error! 💥');
  }
  return <Text>This component is working fine.</Text>;
};

const ErrorBoundaryDemo = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.log('Error caught by boundary:', error, errorInfo);
    setErrorCount(prev => prev + 1);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Error Boundary Demo</Title>
      <Paragraph>
        This page demonstrates the ErrorBoundary component in action. The ErrorBoundary catches 
        JavaScript errors in its child component tree and displays a fallback UI.
      </Paragraph>

      <Card 
        title="Error Boundary Example" 
        style={{ marginBottom: '24px' }}
        extra={
          <Space>
            <Button 
              type="primary" 
              danger 
              icon={<BugOutlined />}
              onClick={() => setShouldThrow(true)}
              disabled={shouldThrow}
            >
              Trigger Error
            </Button>
            <Button 
              icon={<HomeOutlined />}
              onClick={() => setShouldThrow(false)}
              disabled={!shouldThrow}
            >
              Reset
            </Button>
          </Space>
        }
      >
        <ErrorBoundary 
          onError={handleError}
          componentName="BuggyComponent"
          errorContext={{ errorCount }}
          title="Something went wrong!"
          subtitle="Don't worry, we've been notified and are working on it."
        >
          <BuggyComponent shouldThrow={shouldThrow} />
        </ErrorBoundary>
      </Card>

      <Divider orientation="left">Error Boundary Features</Divider>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <Card title="Error Catching">
          <Text>Catches JavaScript errors in child components and displays a fallback UI.</Text>
        </Card>
        
        <Card title="Error Reporting">
          <Text>Provides error details and stack traces in development mode.</Text>
        </Card>
        
        <Card title="Recovery">
          <Text>Allows users to recover from errors by providing a retry mechanism.</Text>
        </Card>
      </div>

      <Divider orientation="left">Usage Example</Divider>
      
      <Card>
        <Title level={4}>Basic Usage</Title>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
{`import ErrorBoundary from './components/ErrorBoundary';

const App = () => (
  <ErrorBoundary>
    <YourComponent />
  </ErrorBoundary>
);`}
        </pre>
      </Card>

      <Divider />
      
      <Alert 
        type="info"
        message="Note"
        description={
          <Text>
            In production, consider integrating with an error monitoring service like 
            <Text code>Sentry</Text> or <Text code>LogRocket</Text> for better error tracking.
          </Text>
        }
        showIcon
        style={{ marginTop: '24px' }}
      />
    </div>
  );
};

export default ErrorBoundaryDemo;
