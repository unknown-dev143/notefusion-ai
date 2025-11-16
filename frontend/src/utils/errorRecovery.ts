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
export class ErrorRecoveryHandler {
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
    this.registerHandler(
      'network',
      async (error: Error) => {
        if (!navigator.onLine) {
          // Wait for network to come back online
          await new Promise<void>((resolve) => {
            const handleOnline = () => {
              window.removeEventListener('online', handleOnline);
              resolve();
            };
            window.addEventListener('online', handleOnline);
          });
          return true;
        }
        return false;
      },
      { priority: 'high' }
    );

    // Authentication error handler
    this.registerHandler(
      'auth',
      async (error: Error) => {
        // Redirect to login page or refresh token
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          return true;
        }
        return false;
      },
      { priority: 'high' }
    );
  }

  public registerHandler(
    errorType: string,
    handler: (error: Error) => Promise<boolean>,
    options: { priority?: 'low' | 'medium' | 'high' } = {}
  ): void {
    this.recoveryHandlers.set(errorType, handler);
  }

  public async handleError(error: Error, context: Record<string, unknown> = {}): Promise<boolean> {
    // Try specific handlers first
    for (const [errorType, handler] of this.recoveryHandlers) {
      try {
        const handled = await handler(error);
        if (handled) return true;
      } catch (e) {
        console.error(`Error in ${errorType} recovery handler:`, e);
      }
    }

    // Fallback to generic strategies
    return this.tryGenericRecovery(error, context);
  }

  private async tryGenericRecovery(error: Error, context: any): Promise<boolean> {
    // Try to recover from common error patterns
    if (error.message.includes('NetworkError')) {
      return this.recoveryHandlers.get('network')?.(error) ?? false;
    }

    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return this.recoveryHandlers.get('auth')?.(error) ?? false;
    }

    // Add more generic recovery strategies here
    return false;
  }
}

// Export a singleton instance
export const errorRecovery = ErrorRecoveryHandler.getInstance();

/**
 * Higher-order component for error recovery
 */
export function withErrorRecovery<T extends React.ComponentType>(
  WrappedComponent: T,
  options: {
    errorBoundary?: boolean;
    recoveryHandler?: (error: Error) => Promise<boolean>;
    fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  } = {}
): React.FC<React.ComponentProps<T>> {
  const { errorBoundary = true, recoveryHandler, fallback: Fallback } = options;

  return function ErrorRecoveryWrapper(props: React.ComponentProps<T>) {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = () => setError(null);

    const handleError = async (err: Error) => {
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
    };

    if (error) {
      return Fallback ? (
        <Fallback error={error} reset={resetError} />
      ) : (
        <div>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={resetError}>Try again</button>
        </div>
      );
    }

    const component = <WrappedComponent {...props} />;
    
    return errorBoundary ? (
      <ErrorBoundary onError={handleError}>
        {component}
      </ErrorBoundary>
    ) : (
      component
    );
  };
}
