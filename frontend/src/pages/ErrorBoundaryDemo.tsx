import React, { useState } from 'react';
<<<<<<< HEAD
import { Card, Button, Typography, Divider, Alert } from 'antd';
import { BugOutlined, HomeOutlined } from '@ant-design/icons';
import ErrorBoundary from '../components/ErrorBoundary';
import styles from './ErrorBoundaryDemo.module.css';
=======
import { Card, Button, Space, Typography, Divider, Alert } from 'antd';
import { BugOutlined, HomeOutlined } from '@ant-design/icons';
import ErrorBoundary from '../components/ErrorBoundary';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

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
<<<<<<< HEAD
    <div className={styles['demoContainer']}>
      <Title level={2} className={styles['title']}>Error Boundary Demo</Title>
=======
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Error Boundary Demo</Title>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      <Paragraph>
        This page demonstrates the ErrorBoundary component in action. The ErrorBoundary catches 
        JavaScript errors in its child component tree and displays a fallback UI.
      </Paragraph>

      <Card 
        title="Error Boundary Example" 
<<<<<<< HEAD
        className={styles['card']}
        extra={
          <div className={styles['controls']}>
            <Button 
              className={`${styles['button']} ${styles['dangerButton']}`}
=======
        style={{ marginBottom: '24px' }}
        extra={
          <Space>
            <Button 
              type="primary" 
              danger 
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              icon={<BugOutlined />}
              onClick={() => setShouldThrow(true)}
              disabled={shouldThrow}
            >
<<<<<<< HEAD
              Throw Error
            </Button>
            <Button 
              className={styles['button']}
=======
              Trigger Error
            </Button>
            <Button 
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              icon={<HomeOutlined />}
              onClick={() => setShouldThrow(false)}
              disabled={!shouldThrow}
            >
              Reset
            </Button>
<<<<<<< HEAD
          </div>
=======
          </Space>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
        <div className={styles['content']}>
=======
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
{`import ErrorBoundary from './components/ErrorBoundary';

const App = () => (
  <ErrorBoundary>
    <YourComponent />
  </ErrorBoundary>
);`}
<<<<<<< HEAD
        </div>
=======
        </pre>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
