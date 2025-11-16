import React, { Component, ReactNode, ErrorInfo, ReactElement, ComponentType } from 'react';
<<<<<<< HEAD
import { Button, Typography } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import styles from './ErrorBoundary.module.css';

const { Text } = Typography;
=======
import { Button, Typography, Result } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

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
<<<<<<< HEAD
=======
  errorCount: number;
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  recoveryAttempts: number;
  isRecovering: boolean;
  lastRecoveryAttempt: number | null;
}

<<<<<<< HEAD
=======
// Error rate limiting constants
const MAX_ERRORS = 5;
const ERROR_WINDOW_MS = 60000; // 1 minute

// Mock captureException if not using Sentry
const captureException = (error: Error, context: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported to boundary:', error, context);
  }
};
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  lastErrorTime: number | null;
  errorCount: number;
  recoveryAttempts: number;
  isRecovering: boolean;
  lastRecoveryAttempt: number | null;
  reported: boolean;
}

// Constants for rate limiting
const MAX_ERRORS = 5;
const ERROR_WINDOW_MS = 60000; // 1 minute

>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
    showDetails: this.props.showDetailsInDev ?? false,
<<<<<<< HEAD
    reported: false,
    recoveryAttempts: 0,
    isRecovering: false,
    lastRecoveryAttempt: null,
    lastErrorTime: null
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
=======
    lastErrorTime: null,
    errorCount: 0,
    recoveryAttempts: 0,
    isRecovering: false,
    lastRecoveryAttempt: null,
    reported: false
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const now = Date.now();
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    return {
      hasError: true,
      error,
      errorInfo: { componentStack: '' } as ErrorInfo,
<<<<<<< HEAD
      reported: false,
      lastErrorTime: Date.now(),
      showDetails: process.env.NODE_ENV === 'development',
      recoveryAttempts: 0,
      isRecovering: false,
      lastRecoveryAttempt: null
=======
      lastErrorTime: now,
      errorCount: 1,
      showDetails: process.env.NODE_ENV === 'development',
      reported: false
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        }
      };

      // Report to error tracking service
      if (!this.state.reported && this.props.showReportDialog) {
<<<<<<< HEAD
        this.handleReport();
=======
        this.reportError(error, errorContext);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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

<<<<<<< HEAD
  private handleReset = (): void => {
=======
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
    
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
<<<<<<< HEAD
      showDetails: this.props.showDetailsInDev ?? false,
      reported: false,
      recoveryAttempts: 0,
      isRecovering: false,
      lastRecoveryAttempt: null,
      lastErrorTime: null
=======
      showDetails: this.props.showDetailsInDev ?? false
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    });
  };

  private toggleDetails = (): void => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

<<<<<<< HEAD
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

  private handleReport = (): void => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    captureException(error, {
      ...this.props.errorContext,
      componentStack: errorInfo?.componentStack
    });

    this.setState({ reported: true });
  };

  private renderErrorContent(): ReactNode {
    // Cast styles to any to bypass TypeScript module type issues
    const style: any = styles;
    const { error, errorInfo, showDetails } = this.state;
    const { 
      componentName, 
      title = 'Something went wrong', 
      subtitle = 'An unexpected error occurred. Please try again.',
      allowRecovery = true,
      recoveryHandler,
      maxRecoveryAttempts = 3
    } = this.props;

    const canRecover = allowRecovery && 
      recoveryHandler && 
      this.state.recoveryAttempts < maxRecoveryAttempts &&
      (!this.state.lastRecoveryAttempt || 
        Date.now() - this.state.lastRecoveryAttempt > 5000);

    if (!error) {
      return null;
    }

    return (
      <div className={style['errorContainer']}>
        <div className={style['errorHeader']}>
          <Text className={style['errorEmoji']}>⚠️</Text>
          <h1 className={style['errorTitle']}>{title}</h1>
          {componentName && (
            <p>Error in component: <strong>{componentName}</strong></p>
          )}
          <p className={style['errorSubtitle']}>{subtitle}</p>
        </div>

        <div className={style['errorActions']}>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
          
          {canRecover && (
            <Button 
              type="primary" 
              danger
              icon={<ReloadOutlined />}
              onClick={this.handleRecovery}
              loading={this.state.isRecovering}
              className={style['recoveryButton']}
            >
              Try to Recover
            </Button>
          )}
          
          <Button 
            type="link" 
            icon={<HomeOutlined />} 
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </div>

        {showDetails && error && (
          <div className={style['errorDetailsContainer']}>
            <Text strong>Error Details:</Text>
            <pre className={style['errorDetails']}>
              {error.toString()}
              {errorInfo?.componentStack}
            </pre>
          </div>
        )}

        {!showDetails && (
          <Button 
            type="link" 
            onClick={() => this.toggleDetails()}
            className={style['detailsButton']}
          >
            Show Error Details
          </Button>
        )}
=======
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      </div>
    );
  }

  public override render(): ReactNode {
<<<<<<< HEAD
    const { hasError } = this.state;
    const { children, fallback } = this.props;
=======
    const { 
      hasError, 
      showDetails 
    } = this.state;
    
    const { 
      children, 
      fallback,
      title,
      subtitle,
      errorMessage
    } = this.props;
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

<<<<<<< HEAD
    return this.renderErrorContent();
=======
    const errorMessageToShow = errorMessage || 'An unexpected error occurred';

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
            <Button 
              type="primary" 
              key="tryAgain" 
              icon={<ReloadOutlined />} 
              onClick={this.handleReset}
              aria-label="Try again"
            >
              Try Again
            </Button>,
            <Button 
              key="home" 
              icon={<HomeOutlined />}
              onClick={() => window.location.href = '/'}
              aria-label="Go to home"
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
          ]}
        >
          <Paragraph>
            <Text type="secondary">
              {errorMessageToShow}
            </Text>
          </Paragraph>
          
          {showDetails && this.renderErrorDetails()}
        </Result>
      </div>
    );
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
