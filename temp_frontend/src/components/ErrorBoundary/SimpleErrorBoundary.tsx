import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Card } from 'antd';
import styles from './SimpleErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  componentName: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class SimpleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: { componentStack: '' } // Initialize with empty component stack
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card 
          title={`Error in ${this.props.componentName}`} 
          className={styles['errorBoundaryCard']}
        >
          <Alert
            message="Something went wrong"
            description={
              <div>
                <p>{this.state.error?.message}</p>
                {this.state.errorInfo?.componentStack && (
                  <details className={styles['details']}>
                    <summary>Component Stack Trace</summary>
                    <pre className={styles['stackTrace']}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            }
            type="error"
            showIcon
            action={
              <Button 
                type="primary" 
                onClick={this.handleReset}
                style={{ marginTop: '1em' }}
              >
                Try Again
              </Button>
            }
          />
        </Card>
      );
    }

    return this.props.children;
  }
}

export { SimpleErrorBoundary };
