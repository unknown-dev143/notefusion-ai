import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';

// A component that throws an error
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <div>No Error</div>;
};

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    // Suppress error logs from tests
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('No Error')).toBeInTheDocument();
  });

  it('displays error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('calls onError when error is caught', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
  });

  it('resets error state when try again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Try Again'));
    
    rerender(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No Error')).toBeInTheDocument();
  });

  it('shows error details when toggle is clicked', () => {
    render(
      <ErrorBoundary showDetailsInDev={true}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Show error details'));
    expect(screen.getByText('Error Details:')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });
});
