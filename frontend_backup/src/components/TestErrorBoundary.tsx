import React, { Component, ErrorInfo, ReactNode, ComponentType } from 'react';
import { Result, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './TestErrorBoundary.module.css';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  navigate: (path: string) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

// Wrapper component to use hooks in class component
const ErrorBoundaryWithNavigation: React.FC<Omit<ErrorBoundaryProps, 'navigate'>> = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error(`Error in ${this.props.componentName || 'component'}:`, error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    this.props.navigate('/');
    this.handleReset();
  };

  public override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className={styles['errorBoundaryContainer']}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle={
              <div>
                <p>We're sorry, but an unexpected error occurred.</p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className={styles['errorDetails']}>
                    <summary>Error Details</summary>
                    <p><strong>Error:</strong> {this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className={styles['errorStack']}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                )}
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="home" 
                icon={<HomeOutlined />} 
                onClick={this.handleGoHome}
              >
                Back to Home
              </Button>,
              <Button 
                key="tryAgain" 
                onClick={this.handleReset}
              >
                Try Again
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWithNavigation;
