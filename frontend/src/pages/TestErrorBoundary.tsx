import { useState } from 'react';
import { Button, Card, Space } from 'antd';
<<<<<<< HEAD
import { SimpleErrorBoundary } from '../components/ErrorBoundary/SimpleErrorBoundary';
import './ErrorBoundary.css';
=======
import { SimpleErrorBoundary } from '../components/SimpleErrorBoundary';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

// A component that throws an error when a button is clicked
const ErrorProneComponent = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error that was thrown on purpose');
  }

  return (
    <Card 
      title="Error Test Component" 
<<<<<<< HEAD
      className="error-boundary-card"
    >
      <Space direction="vertical" size="middle" className="error-boundary-content">
=======
      style={{ maxWidth: 500, margin: '20px auto' }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
    <div className="error-boundary-container">
=======
    <div style={{ padding: '24px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
      
<<<<<<< HEAD
      <div className="error-boundary-button-container">
=======
      <div style={{ marginTop: '24px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Button onClick={handleReset}>
          Reset Error Boundary
        </Button>
      </div>
    </div>
  );
};

export default TestErrorBoundary;
