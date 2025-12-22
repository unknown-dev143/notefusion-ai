interface ErrorReport {
  error: Error;
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    timestamp: string;
    url: string;
    userAgent: string;
    additionalInfo?: Record<string, any>;
  };
  level: 'error' | 'warning' | 'info';
}

class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 100;
  private isOnline = navigator.onLine;

  private constructor() {
    this.setupGlobalErrorHandlers();
    this.setupOfflineHandling();
  }

  static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  private setupGlobalErrorHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        component: 'Global',
        action: 'UncaughtError',
        additionalInfo: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message
        }
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        component: 'Global',
        action: 'UnhandledPromiseRejection',
        additionalInfo: {
          reason: event.reason
        }
      });
    });
  }

  private setupOfflineHandling() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  captureError(error: Error, context?: Partial<ErrorReport['context']>) {
    const errorReport: ErrorReport = {
      error,
      context: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      },
      level: 'error'
    };

    this.processError(errorReport);
  }

  captureWarning(message: string, context?: Partial<ErrorReport['context']>) {
    const errorReport: ErrorReport = {
      error: new Error(message),
      context: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      },
      level: 'warning'
    };

    this.processError(errorReport);
  }

  captureInfo(message: string, context?: Partial<ErrorReport['context']>) {
    const errorReport: ErrorReport = {
      error: new Error(message),
      context: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      },
      level: 'info'
    };

    this.processError(errorReport);
  }

  private processError(errorReport: ErrorReport) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`[${errorReport.level.toUpperCase()}] ${errorReport.error.message}`);
      console.error(errorReport.error);
      console.log('Context:', errorReport.context);
      console.groupEnd();
    }

    // Add to queue for offline storage
    this.addToQueue(errorReport);

    // Send to monitoring service if online
    if (this.isOnline) {
      this.sendToMonitoringService(errorReport);
    }
  }

  private addToQueue(errorReport: ErrorReport) {
    this.errorQueue.push(errorReport);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('errorQueue', JSON.stringify(this.errorQueue));
    } catch (e) {
      console.warn('Failed to store error queue in localStorage:', e);
    }
  }

  private async sendToMonitoringService(errorReport: ErrorReport) {
    try {
      // In production, send to your monitoring service (Sentry, LogRocket, etc.)
      // For now, we'll just log it
      console.log('Error sent to monitoring service:', errorReport);
      
      // Example: Send to custom endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
    } catch (error) {
      console.warn('Failed to send error to monitoring service:', error);
    }
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    for (const errorReport of errorsToSend) {
      await this.sendToMonitoringService(errorReport);
    }

    // Clear localStorage
    try {
      localStorage.removeItem('errorQueue');
    } catch (e) {
      console.warn('Failed to clear error queue from localStorage:', e);
    }
  }

  // Load queued errors from localStorage on startup
  loadQueuedErrors() {
    try {
      const stored = localStorage.getItem('errorQueue');
      if (stored) {
        this.errorQueue = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load error queue from localStorage:', e);
    }
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byLevel: {} as Record<string, number>,
      byComponent: {} as Record<string, number>
    };

    this.errorQueue.forEach(report => {
      stats.byLevel[report.level] = (stats.byLevel[report.level] || 0) + 1;
      
      if (report.context?.component) {
        stats.byComponent[report.context.component] = 
          (stats.byComponent[report.context.component] || 0) + 1;
      }
    });

    return stats;
  }

  // Clear all errors
  clearErrors() {
    this.errorQueue = [];
    try {
      localStorage.removeItem('errorQueue');
    } catch (e) {
      console.warn('Failed to clear error queue from localStorage:', e);
    }
  }
}

export default ErrorMonitoringService.getInstance();
