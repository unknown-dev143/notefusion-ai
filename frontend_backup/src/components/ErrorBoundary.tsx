import React, { Component, ReactNode, ErrorInfo, ReactElement, ComponentType } from 'react';
import { Button, Typography, Result } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';
import styles from './ErrorBoundary.module.css';

const { Text, Paragraph } = Typography;

// Error rate limiting constants
const MAX_ERRORS = 5;
const ERROR_WINDOW_MS = 60000; // 1 minute

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactElement | null;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReportDialog?: boolean;
  componentName?: string;
  errorContext?: Record<string, unknown>;
  errorMessage?: string;
  showDetailsInDev?: boolean;
  title?: string;
  subtitle?: string;
  allowRecovery?: boolean;
  recoveryHandler?: () => Promise<boolean>;
  maxRecoveryAttempts?: number;
  sentryDsn?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reported: boolean;
  showDetails: boolean;
  lastErrorTime: number | null;
  errorCount: number;
  recoveryAttempts: number;
  isRecovering: boolean;
  lastRecoveryAttempt: number | null;
}

// Mock captureException if not using Sentry
const captureException = (error: Error, context: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported to boundary:', error, context);
  }
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private reportTimeout: NodeJS.Timeout | null = null;

  public static defaultProps: Partial<ErrorBoundaryProps> = {
    showReportDialog: true,
    showDetailsInDev: process.env.NODE_ENV === 'development',
    title: 'Oops! Something went wrong',
    subtitle: 'We\'ve been notified about this issue and are working on it.'
  };

  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    reported: false,
    showDetails: this.props.showDetailsInDev ?? false,
    lastErrorTime: null,
    errorCount: 0,
    recoveryAttempts: 0,
    isRecovering: false,
    lastRecoveryAttempt: null
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const now = Date.now();
    return {
      hasError: true,
      error,
      errorInfo: { componentStack: '' } as ErrorInfo,
      reported: false,
      lastErrorTime: now,
      errorCount: 1,
      showDetails: process.env.NODE_ENV === 'development',
      recoveryAttempts: 0,
      isRecovering: false,
      lastRecoveryAttempt: null
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    try {
      this.setState({ errorInfo });
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Error caught by boundary:', error, errorInfo);
      }

      // Prepare error context
      const errorContext = {
        componentName: this.props.componentName || 'Unknown',
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        ...this.props.errorContext
      };

      // Report to error tracking service
      if (!this.state.reported && this.props.showReportDialog) {
        this.reportError(error, errorContext);
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

  private reportError = (error: Error, context: any): void => {
    if (this.state.reported) return;
    
    this.setState({ reported: true });
    
    // Clear any existing timeout
    if (this.reportTimeout) {
      clearTimeout(this.reportTimeout);
    }
    
    // Use a timeout to prevent blocking the main thread
    this.reportTimeout = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          context = {
            ...context,
            userAgent: window.navigator?.userAgent,
            url: window.location?.href
          };
        }
        captureException(error, context);
      } catch (reportingError) {
        console.error('Error reporting to error service:', reportingError);
      } finally {
        this.reportTimeout = null;
      }
    }, 0);
  };

  public override componentWillUnmount(): void {
    if (this.reportTimeout) {
      clearTimeout(this.reportTimeout);
      this.reportTimeout = null;
    }
  }

  private handleReset = (): void => {
    if (this.reportTimeout) {
      clearTimeout(this.reportTimeout);
      this.reportTimeout = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: this.props.showDetailsInDev ?? false,
      recoveryAttempts: 0,
      isRecovering: false,
      lastRecoveryAttempt: null
    });
  };

  private handleRecovery = async (): Promise<void> => {
    const { recoveryHandler } = this.props;
    if (!recoveryHandler) return;

    this.setState({ isRecovering: true });
    
    try {
      const success = await recoveryHandler();
      if (success) {
        this.handleReset();
      }
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      this.setState(prevState => ({
        recoveryAttempts: prevState.recoveryAttempts + 1,
        isRecovering: false,
        lastRecoveryAttempt: Date.now()
      }));
    }
  };

  private toggleDetails = (): void => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  private renderErrorDetails(): ReactNode {
    const { error, errorInfo } = this.state;
    if (!error) return null;

    return (
      <div style={{ marginTop: '1rem' }}>
        <Text strong>Error Details:</Text>
        <pre style={{
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '4px',
          maxHeight: '300px',
          overflow: 'auto',
          marginTop: '0.5rem'
        }}>
          {error.toString()}
          {errorInfo?.componentStack}
        </pre>
      </div>
    );
  }

  public override render(): ReactNode {
    const { hasError, showDetails, isRecovering } = this.state;
    const { 
      children, 
      fallback,
      title = 'Something went wrong',
      subtitle = 'We\'re working on fixing this issue. Please try again later.',
      errorMessage = 'An unexpected error occurred',
      allowRecovery,
      recoveryHandler
    } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    const recoveryButton = allowRecovery && recoveryHandler && (
      <Button 
        type="primary" 
        key="recover"
        loading={isRecovering}
        onClick={this.handleRecovery}
        disabled={isRecovering}
        style={{ marginRight: 8 }}
      >
        {isRecovering ? 'Recovering...' : 'Recover'}
      </Button>
    );

    return (
      <div style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <Result
          status="error"
          title={title}
          subTitle={subtitle}
          extra={[
            recoveryButton,
            <Button 
              type="primary" 
              key="tryAgain" 
              icon={<ReloadOutlined />} 
              onClick={this.handleReset}
              aria-label="Try again"
              style={{ marginRight: 8 }}
            >
              Try Again
            </Button>,
            <Button 
              key="home" 
              icon={<HomeOutlined />}
              onClick={() => window.location.href = '/'}
              aria-label="Go to home"
              style={{ marginRight: 8 }}
            >
              Go to Home
            </Button>,
            <Button 
              key="details" 
              type="text" 
              icon={<BugOutlined />}
              onClick={this.toggleDetails}
              aria-label={showDetails ? 'Hide error details' : 'Show error details'}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          ].filter(Boolean)}
        >
          <Paragraph>
            <Text type="secondary">
              {errorMessage}
            </Text>
          </Paragraph>
          
          {showDetails && this.renderErrorDetails()}
        </Result>
      </div>
    );
  }
}

export const withErrorBoundary = <P extends Record<string, unknown>>(
  WrappedComponent: ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> => {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary 
      componentName={displayName}
      {...errorBoundaryProps}
    >
      <WrappedComponent {...props as P} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return ComponentWithErrorBoundary;
};

export default ErrorBoundary;
