import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import '@testing-library/jest-dom';

// A component that throws an error
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <div>No Error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for this test file
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    console.error = vi.fn(); // Suppress error logs during tests
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary fallback={<div>Error Fallback</div>}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('No Error')).toBeInTheDocument();
  });

  it('renders fallback when there is an error', () => {
    render(
      <ErrorBoundary fallback={<div>Error Fallback</div>}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Error Fallback')).toBeInTheDocument();
  });

  it('calls onError when there is an error', () => {
    const mockOnError = vi.fn();
    
    render(
      <ErrorBoundary fallback={<div>Error Fallback</div>} onError={mockOnError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });
});
