import React, { ErrorInfo } from 'react';
// Assuming native buttons are used to avoid extra dependencies in the error boundary

interface ErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  title?: string;
  subtitle?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReportDialog?: boolean;
  errorContext?: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const { title, subtitle, componentName } = this.props;
      
      // If minimal styling is needed or custom UI logic can be added here
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              {title || (componentName ? `Error in ${componentName}` : 'Something went wrong')}
            </h2>
            <p className="text-red-600 mb-4">
              {subtitle || 'The application encountered an error. Please try again.'}
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 w-full max-w-2xl text-left">
              <summary className="cursor-pointer text-red-800 font-medium mb-2">
                Error Details (Development)
              </summary>
              <pre className="p-4 bg-red-100 rounded text-sm overflow-auto max-h-60 border border-red-200 font-mono text-red-900">
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
