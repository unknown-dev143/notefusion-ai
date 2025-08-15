import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button, Result, Space, Typography } from 'antd';
import { ReloadOutlined, BugOutlined, HomeOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReportDialog?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reported: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    reported: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to your error tracking service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      reported: false,
    });
  };

  private handleReportError = (): void => {
    const { error, errorInfo } = this.state;
    // Here you would typically send the error to your error tracking service
    console.log('Error reported:', { error, errorInfo });
    this.setState({ reported: true });
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, reported } = this.state;
      const errorDetails = error?.stack || 'No stack trace available';

      return (
        <div className="error-boundary" style={{ padding: '24px' }}>
          <Result
            status="error"
            title="Oops! Something went wrong"
            subTitle="We've been notified about this issue and are working on it. Please try again later."
            extra={[
              <Space key="actions" direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReset}
                  style={{ marginRight: 8 }}
                >
                  Try Again
                </Button>
                <Button
                  icon={<HomeOutlined />}
                  onClick={this.handleGoHome}
                  style={{ marginRight: 8 }}
                >
                  Go to Home
                </Button>
                {!reported && this.props.showReportDialog && (
                  <Button
                    type="dashed"
                    icon={<BugOutlined />}
                    onClick={this.handleReportError}
                  >
                    Report Error
                  </Button>
                )}
                {reported && <Text type="secondary">Thank you for reporting this issue!</Text>}
              </Space>
            ]}
          >
            <div className="error-details" style={{ textAlign: 'left' }}>
              <Paragraph>
                <Text strong>Error Details:</Text>
              </Paragraph>
              <Paragraph>
                <Text code>{error?.message || 'Unknown error'}</Text>
              </Paragraph>
              <details style={{ marginTop: '1em' }}>
                <summary>Stack Trace</summary>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '1em', 
                  borderRadius: '4px',
                  overflowX: 'auto',
                  maxHeight: '300px'
                }}>
                  {errorDetails}
                </pre>
              </details>
            </div>
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
