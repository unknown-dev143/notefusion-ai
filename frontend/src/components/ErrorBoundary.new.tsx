import React, { Component, ReactNode, ErrorInfo, ReactElement, ComponentType } from 'react';
import { Button, Typography, Result } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';
import './ErrorBoundary.css';

const { Text, Paragraph } = Typography;

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
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  lastErrorTime: number | null;
  errorCount: number;
  recoveryAttempts: number;
  isRecovering: boolean;
  lastRecoveryAttempt: number | null;
  reported: boolean;
}

// Error rate limiting constants
const MAX_ERRORS = 5;
const ERROR_WINDOW_MS = 60000; // 1 minute

// Mock captureException if not using Sentry
const captureException = (error: Error, context: any = {}): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported to boundary:', error, context);
  }
  // In production, this would report to your error tracking service
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private reportTimeout: NodeJS.Timeout | null = null;

  public static defaultProps: Partial<ErrorBoundaryProps> = {
    showReportDialog: true,
    showDetailsInDev: process.env.NODE_ENV === 'development',
    title: 'Oops! Something went wrong',
    subtitle: 'We\'ve been notified about this issue and are working on it.',
    allowRecovery: true,
    maxRecoveryAttempts: 3,
  };

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: this.props.showDetailsInDev ?? false,
    lastErrorTime: null,
    errorCount: 0,
    recoveryAttempts: 0,
    isRecovering: false,
    lastRecoveryAttempt: null,
    reported: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorInfo: { componentStack: '' } as ErrorInfo,
      showDetails: process.env.NODE_ENV === 'development',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
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
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    };

    // Report error if not already reported
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
  }

  private reportError = (error: Error, context: any = {}): void => {
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
            url: window.location?.href,
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

  public componentWillUnmount(): void {
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
    });
  };

  private toggleDetails = (): void => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  private renderErrorDetails(): ReactNode {
    const { error, errorInfo } = this.state;
    if (!error || !errorInfo) return null;

    return (
      <div className="error-details">
        <Paragraph strong>Error Details:</Paragraph>
        <pre className="error-pre">
          {error.toString()}
          {errorInfo.componentStack}
        </pre>
      </div>
    );
  }

  private renderErrorUI(): ReactNode {
    const { error, showDetails } = this.state;
    const { 
      title = 'Something went wrong', 
      subtitle = 'We\'ve been notified about this issue.',
      allowRecovery = true,
    } = this.props;

    return (
      <Result
        status="error"
        title={title}
        subTitle={subtitle}
        extra={[
          <Button 
            key="reload" 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={this.handleReset}
            style={{ marginRight: '8px' }}
          >
            Reload Page
          </Button>,
          <Button 
            key="home" 
            href="/" 
            icon={<HomeOutlined />}
            style={{ marginRight: '8px' }}
          >
            Back Home
          </Button>,
          <Button 
            key="details" 
            type="text" 
            icon={<BugOutlined />} 
            onClick={this.toggleDetails}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>,
        ]}
      >
        {showDetails && this.renderErrorDetails()}
      </Result>
    );
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Higher-order component for using the error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props as P} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
