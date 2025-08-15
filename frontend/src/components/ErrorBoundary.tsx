import React, { Component, ErrorInfo, ReactNode, ComponentType } from 'react';
import { Button, Result, Space, Typography, Modal, theme } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined, CloseOutlined } from '@ant-design/icons';
import { captureException } from '@sentry/react';

const { Text, Paragraph } = Typography;
const { useToken } = theme;

export interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Custom fallback UI to display when an error occurs
   */
  fallback?: ReactNode;
  /**
   * Callback function called when an error occurs
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
   * Additional error context
   */
  errorContext?: Record<string, unknown>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reported: boolean;
  showDetails: boolean;
}

/**
 * A reusable error boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static defaultProps: Partial<ErrorBoundaryProps> = {
    showReportDialog: true,
  };

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    reported: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      showDetails: process.env.NODE_ENV === 'development'
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // Send to error tracking service (e.g., Sentry)
    captureException(error, {
      contexts: {
        react: { componentStack: errorInfo.componentStack },
        ...(this.props.errorContext || {}),
      },
      tags: {
        component: this.props.componentName || 'unknown',
        boundary: 'ErrorBoundary',
      },
    });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      reported: false,
      showDetails: false,
    });
  };

  private handleReportError = (): void => {
    const { error, errorInfo } = this.state;
    
    // In a real app, you would send this to your backend
    console.log('Error reported:', { 
      error: error?.toString(), 
      componentStack: errorInfo?.componentStack,
      component: this.props.componentName,
      timestamp: new Date().toISOString(),
      ...(this.props.errorContext || {}),
    });
    
    this.setState({ reported: true });
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
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {errorStack}
                </pre>
                {this.state.errorInfo?.componentStack && (
                  <div style={{ marginTop: 16 }}>
                    <Paragraph>
                      <Text strong>Component Stack:</Text>
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
                      whiteSpace: 'pre-wrap',
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
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
