import React, { 
  Component, 
  ErrorInfo, 
  ReactNode, 
  ComponentType, 
  ReactElement,
  useCallback,
  useMemo,
  memo
} from 'react';
import { Button, Result, Space, Typography, theme } from 'antd';
import { 
  ReloadOutlined, 
  HomeOutlined, 
  BugOutlined, 
  CloseOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
// Optional: Uncomment when Sentry is set up
// import { captureException } from '@sentry/react';

// Mock captureException if Sentry is not available
const captureException = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported to error boundary:', error, context);
  }
};

const { Text, Paragraph, Title } = Typography;

export interface ErrorBoundaryProps {
  /** The child components to be wrapped by the error boundary */
  children: ReactNode;
  /** 
   * Custom fallback UI to display when an error occurs
   * @default Default error UI from ErrorBoundary
   */
  fallback?: ReactElement | null;
  /** 
   * Callback function called when an error occurs
   * @param error - The error that was caught
   * @param errorInfo - Additional error information including component stack
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 
   * Whether to show the report error button
   * @default true
   */
  showReportDialog?: boolean;
  /** 
   * Component name for better error reporting
   */
  componentName?: string;
  /** 
   * Additional error context for error reporting
   */
  errorContext?: Record<string, unknown>;
  /**
   * Custom error message to display
   */
  errorMessage?: string;
  /**
   * Whether to show error details in development
   * @default true in development, false in production
   */
  showDetailsInDev?: boolean;
  /**
   * Custom title for the error boundary
   */
  title?: string;
  /**
   * Custom subtitle for the error boundary
   */
  subtitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reported: boolean;
  showDetails: boolean;
  lastErrorTime: number | null;
  errorCount: number;
}

type ErrorBoundaryAction = 
  | { type: 'SET_ERROR'; payload: { error: Error; errorInfo: ErrorInfo } }
  | { type: 'REPORT_ERROR' }
  | { type: 'RESET' }
  | { type: 'TOGGLE_DETAILS' };

const MAX_ERRORS = 5;
const ERROR_WINDOW_MS = 60000; // 1 minute

/**
 * A reusable error boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private reportTimeout: NodeJS.Timeout | null = null;

  public static defaultProps: Partial<ErrorBoundaryProps> = {
    showReportDialog: true,
    showDetailsInDev: process.env.NODE_ENV === 'development',
    title: 'Oops! Something went wrong',
    subtitle: 'We\'ve been notified about this issue and are working on it.'
  };

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    reported: false,
    showDetails: this.props.showDetailsInDev ?? false,
    lastErrorTime: null,
    errorCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const prevState = {} as ErrorBoundaryState; // Default empty state
    const now = Date.now();
    const lastErrorTime = prevState.lastErrorTime ?? 0;
    const errorCount = now - lastErrorTime < ERROR_WINDOW_MS 
      ? prevState.errorCount + 1 
      : 1;

    // Prevent infinite error loops
    if (errorCount > MAX_ERRORS) {
      console.error('Maximum error count reached, preventing infinite loop');
      return { hasError: false };
    }

    return { 
      hasError: true, 
      error,
      errorCount,
      lastErrorTime: now,
      showDetails: process.env.NODE_ENV === 'development'
    };
  }


  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    try {
      // Safely update state with error info
      this.setState({ errorInfo });
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error caught by boundary:', error, errorInfo);
      }
      
      // Add more context to the error
      const errorContext = {
        componentName: this.props.componentName || 'unknown',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...(this.props.errorContext || {})
      };
      
      // Prepare error data for reporting
      const errorData = {
        contexts: {
          react: { componentStack: errorInfo?.componentStack || 'No component stack' },
          error: { ...errorContext },
          environment: {
            url: window.location.href,
            userAgent: window.navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        },
        tags: {
          component: errorContext.componentName,
          boundary: 'ErrorBoundary',
          environment: process.env.NODE_ENV || 'development',
          errorType: error.name || 'UnknownError'
        },
        extra: {
          errorInfo: errorInfo?.componentStack || 'No error info',
          errorMessage: error.message,
          errorStack: error.stack,
          errorName: error.name,
          state: this.state,
          ...(error instanceof Error ? { 
            errorMessage: error.message,
            errorStack: error.stack,
            errorName: error.name
          } : {})
        },
        level: 'error' as const,
        fingerprint: [
          '{{ default }}',
          error.name,
          error.message.split('\n')[0] // First line of error message
        ]
      };
      
      // Send to error tracking service (e.g., Sentry) with more context
      try {
        captureException(error, errorData);
      } catch (reportingError) {
        console.error('Failed to report error to Sentry:', reportingError);
        // Fallback to console if Sentry fails
        console.error('Original error:', error);
        console.error('Error context:', errorData);
      }
      
      // Call custom error handler if provided
      if (this.props.onError) {
        try {
          this.props.onError(error, errorInfo);
        } catch (handlerError) {
          console.error('Error in onError handler:', handlerError);
        }
      }
    } catch (errorHandlingError) {
      console.error('Error in error boundary:', errorHandlingError);
    }
  }

  public componentWillUnmount(): void {
    // Clean up any pending timeouts
    if (this.reportTimeout) {
      clearTimeout(this.reportTimeout);
      this.reportTimeout = null;
    }
  }

  private handleReset = (): void => {
    // Clear any pending timeouts
    if (this.reportTimeout) {
      clearTimeout(this.reportTimeout);
      this.reportTimeout = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      reported: false,
      showDetails: false,
    });
  };

  private handleReportError = (): void => {
    try {
      const { error, errorInfo } = this.state;
      
      // Clear any existing timeout
      if (this.reportTimeout) {
        clearTimeout(this.reportTimeout);
      }
      
      // In a real app, you would send this to your backend
      const reportData = { 
        error: error?.toString(), 
        componentStack: errorInfo?.componentStack,
        component: this.props.componentName,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...(this.props.errorContext || {}),
      };
      
      console.log('Error reported:', reportData);
      
      // Simulate async report submission
      this.reportTimeout = setTimeout(() => {
        try {
          // Here you would typically make an API call to your backend
          this.setState({ reported: true });
        } catch (e) {
          console.error('Failed to update report status:', e);
        }
      }, 1000);
      
    } catch (reportError) {
      console.error('Error in handleReportError:', reportError);
    }
  };

  private toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { error, reported, showDetails } = this.state;
    const { token } = theme.useToken();
    const errorMessage = error?.message || 'An unknown error occurred';
    const errorStack = error?.stack || 'No stack trace available';
    const componentName = this.props.componentName ? ` in ${this.props.componentName}` : '';

    return (
      <div 
        className="error-boundary" 
        style={{ 
          padding: 24,
          maxWidth: '100%',
          margin: '0 auto',
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadow,
        }}
      >
        <Result
          status="error"
          title={
            <Text style={{ color: token.colorError }}>
              Oops! Something went wrong{componentName}
            </Text>
          }
          subTitle={
            <Text type="secondary">
              {errorMessage}
            </Text>
          }
          extra={[
            <Space key="actions" direction="horizontal" size="middle">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
                size="large"
              >
                Try Again
              </Button>
              <Button
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
                size="large"
              >
                Go to Home
              </Button>
              {!reported && this.props.showReportDialog && (
                <Button
                  type="dashed"
                  icon={<BugOutlined />}
                  onClick={this.handleReportError}
                  size="large"
                >
                  Report Error
                </Button>
              )}
              {reported && (
                <Text type="success">
                  Thank you for reporting this issue!
                </Text>
              )}
            </Space>
          ]}
        >
          <div style={{ marginTop: 24 }}>
            <Button 
              type="link" 
              onClick={this.toggleDetails}
              icon={showDetails ? <CloseOutlined /> : <BugOutlined />}
            >
              {showDetails ? 'Hide details' : 'Show error details'}
            </Button>
            
            {showDetails && (
              <div style={{ marginTop: 16 }}>
                <Paragraph>
                  <Text strong>Error Details:</Text>
                </Paragraph>
                <pre style={{ 
                  background: token.colorBgLayout,
                  padding: 16,
                  borderRadius: token.borderRadius,
                  border: `1px solid ${token.colorBorder}`,
                  overflowX: 'auto',
                  maxHeight: '300px',
                  fontSize: '0.85em',
                  lineHeight: 1.5,
                }}>
                  {errorStack}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </Result>
      </div>
    );
  }
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 * @param WrappedComponent The component to wrap
 * @param errorBoundaryProps Props to pass to the ErrorBoundary
 * @returns A new component wrapped with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
 
  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <ErrorBoundary 
        componentName={displayName}
        {...errorBoundaryProps}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
 
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
