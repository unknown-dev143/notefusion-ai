import * as React from 'react';

/**
 * Error recovery strategies for different types of errors
 */
type RecoveryStrategy = 'retry' | 'refresh' | 'clearData' | 'navigateAway';

interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError(error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

/**
 * Creates a recovery function with retry logic
 */
export function createRetryHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RecoveryOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  const { maxRetries = 3, retryDelay = 1000, onSuccess, onFailure } = options;
  let retryCount = 0;

  return async function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    while (retryCount < maxRetries) {
      try {
        const result = await fn.apply(this, args);
        if (onSuccess) onSuccess();
        return result;
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          if (onFailure) onFailure(error as Error);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      }
    }
    throw new Error('Max retries exceeded');
  };
}

/**
 * Handles different types of errors with appropriate recovery strategies
 */
class ErrorRecoveryHandler {
  private static instance: ErrorRecoveryHandler;
  private recoveryHandlers: Map<string, (error: Error) => Promise<boolean>>;

  private constructor() {
    this.recoveryHandlers = new Map();
    this.initializeDefaultHandlers();
  }

  public static getInstance(): ErrorRecoveryHandler {
    if (!ErrorRecoveryHandler.instance) {
      ErrorRecoveryHandler.instance = new ErrorRecoveryHandler();
    }
    return ErrorRecoveryHandler.instance;
  }

  private initializeDefaultHandlers(): void {
    // Network error handler
    this.recoveryHandlers.set('NetworkError', async (error) => {
      console.log('Handling network error:', error.message);
      // Try to refresh the page
      window.location.reload();
      return true;
    });

    // Authentication error handler
    this.recoveryHandlers.set('AuthError', async (error) => {
      console.log('Handling auth error:', error.message);
      // Redirect to login
      window.location.href = '/login';
      return true;
    });
  }

  public registerHandler(
    errorType: string,
    handler: (error: Error) => Promise<boolean>,
    options: { priority?: 'low' | 'medium' | 'high' } = {}
  ): void {
    this.recoveryHandlers.set(errorType, handler);
  }

  public async handleError(error: Error, context: Record<string, unknown> = {}): Promise<boolean> {
    console.error('Error occurred:', error, 'Context:', context);
    
    // Try specific handler first
    const handler = this.recoveryHandlers.get(error.constructor.name);
    if (handler) {
      try {
        return await handler(error);
      } catch (handlerError) {
        console.error('Error in recovery handler:', handlerError);
      }
    }

    // Fallback to generic recovery
    return this.tryGenericRecovery(error, context);
  }

  private async tryGenericRecovery(error: Error, context: unknown): Promise<boolean> {
    // Try to recover from common error patterns
    if (error.message.includes('network')) {
      const handler = this.recoveryHandlers.get('NetworkError');
      return handler ? await handler(error) : false;
    }
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      const handler = this.recoveryHandlers.get('AuthError');
      return handler ? await handler(error) : false;
    }
    return false;
  }
}

// Export a singleton instance
export const errorRecovery = ErrorRecoveryHandler.getInstance();

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = (props: ErrorFallbackProps) => {
  const { error, resetError } = props;
  return React.createElement(
    'div',
    { className: 'default-error-fallback' },
    React.createElement('h2', null, 'Something went wrong'),
    React.createElement('p', null, error.message),
    React.createElement(
      'button',
      { onClick: resetError, type: 'button' },
      'Try again'
    )
  );
};

/**
 * Higher-order component for error recovery
 */
export function withErrorRecovery<T extends React.ComponentType>(
  WrappedComponent: T,
  options: {
    errorBoundary?: boolean;
    recoveryHandler?: (error: Error) => Promise<boolean>;
    fallback?: React.ComponentType<ErrorFallbackProps>;
  } = {}
): React.FC<React.ComponentProps<T>> {
  const { errorBoundary = true, recoveryHandler, fallback: Fallback = DefaultErrorFallback } = options;

  return function ErrorBoundaryWrapper(props: React.ComponentProps<T>) {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = React.useCallback(() => {
      setError(null);
    }, []);

    const handleError = React.useCallback(
      async (err: Error) => {
        setError(err);
        
        if (recoveryHandler) {
          const recovered = await recoveryHandler(err);
          if (recovered) {
            resetError();
          }
        } else {
          const recovered = await errorRecovery.handleError(err, { component: WrappedComponent.name });
          if (recovered) {
            resetError();
          }
        }
      },
      [recoveryHandler, resetError]
    );

    if (error) {
      return React.createElement(
        'div',
        { className: 'error-boundary' },
        React.createElement(Fallback, { error, resetError })
      );
    }

    const component = React.createElement(WrappedComponent, props);
    
    if (errorBoundary) {
      return React.createElement(
        ErrorBoundary, 
        { 
          onError: handleError,
          children: component
        },
        component
      );
    }
    return component;
  };
}

export default withErrorRecovery;
