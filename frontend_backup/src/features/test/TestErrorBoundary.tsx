import React from 'react';
import { Button } from 'antd';

const TestErrorBoundary: React.FC = () => {
  const throwError = () => {
    // This will be caught by the ErrorBoundary
    throw new Error('This is a test error from the TestErrorBoundary component');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Error Boundary</h1>
      <p>Click the button below to test the error boundary:</p>
      <Button 
        type="primary" 
        danger 
        onClick={throwError}
        style={{ marginTop: '1rem' }}
      >
        Throw Test Error
      </Button>
    </div>
  );
};

export default TestErrorBoundary;
