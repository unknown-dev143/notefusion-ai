import { useState } from 'react';
import { Button, Card, Space } from 'antd';
import { SimpleErrorBoundary } from '../components/SimpleErrorBoundary';

// A component that throws an error when a button is clicked
const ErrorProneComponent = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error that was thrown on purpose');
  }

  return (
    <Card 
      title="Error Test Component" 
      style={{ maxWidth: 500, margin: '20px auto' }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <p>This is a safe component that won't throw an error.</p>
        <Button 
          type="primary" 
          danger 
          onClick={() => setShouldThrow(true)}
        >
          Click to throw an error
        </Button>
      </Space>
    </Card>
  );
};

const TestErrorBoundary = () => {
  const [key, setKey] = useState(0);

  const handleReset = () => {
    // Force remount the error boundary by changing its key
    setKey(prevKey => prevKey + 1);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Error Boundary Test Page</h1>
      <p>This page helps test the SimpleErrorBoundary component.</p>
      
      <SimpleErrorBoundary 
        key={key}
        componentName="TestErrorBoundary"
        onError={(error, errorInfo) => {
          console.error('Error caught by boundary:', { error, errorInfo });
        }}
      >
        <ErrorProneComponent />
      </SimpleErrorBoundary>
      
      <div style={{ marginTop: '24px' }}>
        <Button onClick={handleReset}>
          Reset Error Boundary
        </Button>
      </div>
    </div>
  );
};

export default TestErrorBoundary;
