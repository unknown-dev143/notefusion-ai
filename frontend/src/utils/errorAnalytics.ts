/**
 * Error Analytics Service
 * 
 * Provides centralized error tracking and analytics for the application.
 * Integrates with Sentry and Google Analytics for comprehensive error monitoring.
 */

type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

interface ErrorContext {
  componentName?: string;
  userId?: string;
  route?: string;
  [key: string]: unknown;
}

interface ErrorAnalyticsOptions {
  trackInConsole?: boolean;
  trackInSentry?: boolean;
  trackInGA?: boolean;
  environment?: string;
  appVersion?: string;
}

class ErrorAnalytics {
  private static instance: ErrorAnalytics;
  private options: Required<ErrorAnalyticsOptions>;
  private sentryInitialized = false;

  private constructor(options: ErrorAnalyticsOptions = {}) {
    this.options = {
      trackInConsole: process.env.NODE_ENV === 'development',
      trackInSentry: process.env.NODE_ENV === 'production',
      trackInGA: process.env.NODE_ENV === 'production',
      environment: process.env.NODE_ENV || 'development',
      appVersion: process.env.REACT_APP_VERSION || '0.0.0',
      ...options,
    };

    this.initialize();
  }

  public static getInstance(options?: ErrorAnalyticsOptions): ErrorAnalytics {
    if (!ErrorAnalytics.instance) {
      ErrorAnalytics.instance = new ErrorAnalytics(options);
    }
    return ErrorAnalytics.instance;
  }

  private initialize(): void {
    if (this.options.trackInSentry && !this.sentryInitialized) {
      this.initializeSentry();
    }
  }

  private initializeSentry(): void {
    if (typeof window === 'undefined') return;

    try {
      // Sentry is already initialized in ErrorBoundary
      this.sentryInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Track an error with the given severity and context
   */
  public trackError(
    error: Error,
    severity: ErrorSeverity = 'error',
    context: ErrorContext = {}
  ): void {
    const { trackInConsole, trackInSentry, trackInGA } = this.options;
    const { componentName, userId, route, ...extra } = context;

    // Prepare error context
    const errorContext = {
      component: componentName || 'unknown',
      route: route || window.location.pathname,
      userId,
      ...extra,
    };

    // Log to console in development
    if (trackInConsole) {
      this.logToConsole(error, severity, errorContext);
    }

    // Send to Sentry
    if (trackInSentry && this.sentryInitialized) {
      this.sendToSentry(error, severity, errorContext);
    }

    // Send to Google Analytics
    if (trackInGA && typeof window.gtag === 'function') {
      this.sendToGoogleAnalytics(error, severity, errorContext);
    }
  }

  /**
   * Track a handled exception
   */
  public trackHandledError(error: Error, context: ErrorContext = {}): void {
    this.trackError(error, 'warning', { ...context, handled: true });
  }

  /**
   * Track a critical error
   */
  public trackCriticalError(error: Error, context: ErrorContext = {}): void {
    this.trackError(error, 'critical', context);
  }

  /**
   * Track a performance metric
   */
  public trackPerformance(
    metricName: string,
    duration: number,
    context: ErrorContext = {}
  ): void {
    if (this.options.trackInConsole) {
      console.log(`[Perf] ${metricName}: ${duration.toFixed(2)}ms`, context);
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'timing_complete', {
        name: metricName,
        value: Math.round(duration),
        event_category: 'Performance',
        ...context,
      });
    }
  }

  private logToConsole(
    error: Error,
    severity: ErrorSeverity,
    context: Record<string, unknown>
  ): void {
    const { message, stack } = error;
    const logMethod = {
      critical: console.error,
      error: console.error,
      warning: console.warn,
      info: console.info,
    }[severity];

    logMethod(`[${severity.toUpperCase()}] ${message}`, {
      stack,
      ...context,
    });
  }

  private sendToSentry(
    error: Error,
    severity: ErrorSeverity,
    context: Record<string, unknown>
  ): void {
    if (typeof window === 'undefined' || !window.Sentry) return;

    window.Sentry.withScope((scope: any) => {
      scope.setLevel(severity as any);
      scope.setExtras(context);
      scope.setTag('environment', this.options.environment);
      scope.setTag('app_version', this.options.appVersion);
      
      if (context.userId) {
        scope.setUser({ id: String(context.userId) });
      }

      window.Sentry.captureException(error);
    });
  }

  private sendToGoogleAnalytics(
    error: Error,
    severity: ErrorSeverity,
    context: Record<string, unknown>
  ): void {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'exception', {
      description: error.message,
      fatal: severity === 'critical',
      ...context,
    });
  }
}

// Export a singleton instance
export const errorAnalytics = ErrorAnalytics.getInstance();

// Helper hook for React components
export function useErrorAnalytics(componentName?: string) {
  const trackError = React.useCallback(
    (error: Error, severity?: ErrorSeverity, context: ErrorContext = {}) => {
      errorAnalytics.trackError(error, severity, {
        componentName,
        ...context,
      });
    },
    [componentName]
  );

  const trackHandledError = React.useCallback(
    (error: Error, context: ErrorContext = {}) => {
      errorAnalytics.trackHandledError(error, {
        componentName,
        ...context,
      });
    },
    [componentName]
  );

  const trackCriticalError = React.useCallback(
    (error: Error, context: ErrorContext = {}) => {
      errorAnalytics.trackCriticalError(error, {
        componentName,
        ...context,
      });
    },
    [componentName]
  );

  const trackPerformance = React.useCallback(
    (metricName: string, duration: number, context: ErrorContext = {}) => {
      errorAnalytics.trackPerformance(metricName, duration, {
        componentName,
        ...context,
      });
    },
    [componentName]
  );

  return {
    trackError,
    trackHandledError,
    trackCriticalError,
    trackPerformance,
  };
}

export default ErrorAnalytics;
