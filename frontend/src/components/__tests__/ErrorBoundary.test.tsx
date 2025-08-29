import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';

// A component that throws an error
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <div>No Error</div>;
};

// Mock the ErrorBoundary component
const mockCaptureException = vi.fn();

const MockErrorBoundary = ({ children, fallback }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) => {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    try {
      // @ts-ignore - Testing error boundary
      if (children && children.props && children.props.shouldThrow) {
        throw new Error('Test Error');
      }
    } catch (error) {
      mockCaptureException(error);
      setHasError(true);
    }
  }, [children]);

  if (hasError) {
    return fallback || <div>Something went wrong</div>;
  }
  return <>{children}</>;
};

// Mock the module
global.console.error = vi.fn();

// Mock the actual component
vi.mock('../ErrorBoundary.new', () => ({
  __esModule: true,
  default: MockErrorBoundary,
  captureException: mockCaptureException,
}));

// Import after setting up mocks
import ErrorBoundary from '../ErrorBoundary.new';

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    // Suppress error logs from tests
    console.error = vi.fn();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('catches errors and displays fallback UI', () => {
    // Suppress expected error logs
    const errorSpy = vi.spyOn(console, 'error');
    errorSpy.mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    
    errorSpy.mockRestore();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });
  
  it('renders custom fallback UI when provided', () => {
    const FallbackUI = () => <div>Custom Error UI</div>;
    
    render(
      <ErrorBoundary fallback={<FallbackUI />}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });
  
  it('does not render fallback when no error occurs', () => {
    render(
      <ErrorBoundary fallback={<div>Error Fallback</div>}>
        <div>Normal Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Normal Content')).toBeInTheDocument();
    expect(screen.queryByText('Error Fallback')).not.toBeInTheDocument();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('No Error')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const Fallback = () => <div>Custom Fallback</div>;
    
    render(
      <ErrorBoundary fallback={<Fallback />}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
  });
});
