import { Component, ErrorInfo, ReactNode } from 'react';
<<<<<<< HEAD
import styles from './ErrorBoundary.module.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
<<<<<<< HEAD
        <div className={styles.errorContainer}>
          <h2>Something went wrong</h2>
          <details className={styles.details}>
            <summary>Error details</summary>
            <p>{this.state.error?.message}</p>
            <pre className={styles.stackTrace}>
=======
        <div style={{ 
          padding: '20px', 
          fontFamily: 'sans-serif',
          color: '#ff4d4f',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            <p>{this.state.error?.message}</p>
            <pre style={{ overflowX: 'auto' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              {this.state.error?.stack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
<<<<<<< HEAD
            className={styles.reloadButton}
=======
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
