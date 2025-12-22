interface PerformanceMetrics {
  pageLoad: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  navigation: {
    type: string;
    redirectCount: number;
    transferSize: number;
  };
  resources: PerformanceResourceTiming[];
  vitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private observers: PerformanceObserver[] = [];
  private metrics: Partial<PerformanceMetrics> = {};
  private vitalsCallbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined' || !window.performance) return;

    this.measurePageLoad();
    this.measureNavigation();
    this.observeWebVitals();
    this.observeResources();
    this.measureMemory();
  }

  private measurePageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      this.metrics.pageLoad = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: 0,
        firstContentfulPaint: 0
      };

      // Measure paint timing
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          this.metrics.pageLoad!.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.pageLoad!.firstContentfulPaint = entry.startTime;
        }
      });
    }
  }

  private measureNavigation() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      this.metrics.navigation = {
        type: this.getNavigationType(navigation.type),
        redirectCount: navigation.redirectCount,
        transferSize: navigation.transferSize
      };
    }
  }

  private getNavigationType(type: string): string {
    switch (type) {
      case 'navigate': return 'Normal Navigation';
      case 'reload': return 'Reload';
      case 'back_forward': return 'Back/Forward';
      case 'prerender': return 'Prerender';
      default: return 'Unknown';
    }
  }

  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.metrics.vitals = { ...this.metrics.vitals, lcp: lastEntry.startTime };
      this.checkVitalsComplete();
    });

    // First Input Delay (FID)
    this.observePerformanceEntry('first-input', (entries) => {
      const firstEntry = entries[0];
      this.metrics.vitals = { ...this.metrics.vitals, fid: firstEntry.processingStart - firstEntry.startTime };
      this.checkVitalsComplete();
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entries) => {
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      this.metrics.vitals = { ...this.metrics.vitals, cls: clsValue };
      this.checkVitalsComplete();
    });
  }

  private observePerformanceEntry(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported:`, error);
    }
  }

  private observeResources() {
    try {
      const observer = new PerformanceObserver((list) => {
        const resourceEntries = list.getEntries() as PerformanceResourceTiming[];
        this.metrics.resources = [...(this.metrics.resources || []), ...resourceEntries];
      });
      observer.observe({ type: 'resource', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource performance observer not supported:', error);
    }
  }

  private measureMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
  }

  private checkVitalsComplete() {
    const vitals = this.metrics.vitals;
    if (vitals && 'lcp' in vitals && 'fid' in vitals && 'cls' in vitals) {
      this.notifyVitalsComplete();
    }
  }

  private notifyVitalsComplete() {
    if (this.isMetricsComplete()) {
      const completeMetrics = this.metrics as PerformanceMetrics;
      this.vitalsCallbacks.forEach(callback => callback(completeMetrics));
    }
  }

  private isMetricsComplete(): boolean {
    return !!(
      this.metrics.pageLoad &&
      this.metrics.navigation &&
      this.metrics.vitals &&
      this.metrics.vitals.lcp &&
      this.metrics.vitals.fid &&
      this.metrics.vitals.cls
    );
  }

  // Public API
  onVitalsComplete(callback: (metrics: PerformanceMetrics) => void) {
    this.vitalsCallbacks.push(callback);
    
    // If metrics are already complete, call immediately
    if (this.isMetricsComplete()) {
      callback(this.metrics as PerformanceMetrics);
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Component-specific performance measurement
  measureComponentRender(componentName: string) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
        
        // Store component performance data
        const componentMetrics = {
          name: componentName,
          renderTime,
          timestamp: new Date().toISOString()
        };
        
        this.storeComponentMetrics(componentMetrics);
        return renderTime;
      }
    };
  }

  private storeComponentMetrics(metrics: { name: string; renderTime: number; timestamp: string }) {
    try {
      const existing = localStorage.getItem('componentMetrics');
      const componentMetrics = existing ? JSON.parse(existing) : [];
      
      componentMetrics.push(metrics);
      
      // Keep only last 100 entries
      if (componentMetrics.length > 100) {
        componentMetrics.shift();
      }
      
      localStorage.setItem('componentMetrics', JSON.stringify(componentMetrics));
    } catch (error) {
      console.warn('Failed to store component metrics:', error);
    }
  }

  getComponentMetrics() {
    try {
      const stored = localStorage.getItem('componentMetrics');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to retrieve component metrics:', error);
      return [];
    }
  }

  // Network performance monitoring
  measureNetworkRequest(url: string, method: string) {
    const startTime = performance.now();
    
    return {
      end: (status: number, responseSize?: number) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const networkMetrics = {
          url,
          method,
          status,
          duration,
          responseSize,
          timestamp: new Date().toISOString()
        };
        
        this.storeNetworkMetrics(networkMetrics);
        return duration;
      }
    };
  }

  private storeNetworkMetrics(metrics: any) {
    try {
      const existing = localStorage.getItem('networkMetrics');
      const networkMetrics = existing ? JSON.parse(existing) : [];
      
      networkMetrics.push(metrics);
      
      // Keep only last 200 entries
      if (networkMetrics.length > 200) {
        networkMetrics.shift();
      }
      
      localStorage.setItem('networkMetrics', JSON.stringify(networkMetrics));
    } catch (error) {
      console.warn('Failed to store network metrics:', error);
    }
  }

  getNetworkMetrics() {
    try {
      const stored = localStorage.getItem('networkMetrics');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to retrieve network metrics:', error);
      return [];
    }
  }

  // Performance score calculation
  calculatePerformanceScore(): number {
    const metrics = this.metrics;
    if (!metrics.vitals) return 0;

    let score = 100;
    
    // LCP scoring (0-2500ms is good)
    if (metrics.vitals.lcp > 4000) score -= 25;
    else if (metrics.vitals.lcp > 2500) score -= 15;
    
    // FID scoring (0-100ms is good)
    if (metrics.vitals.fid > 300) score -= 25;
    else if (metrics.vitals.fid > 100) score -= 15;
    
    // CLS scoring (0-0.1 is good)
    if (metrics.vitals.cls > 0.25) score -= 25;
    else if (metrics.vitals.cls > 0.1) score -= 15;
    
    return Math.max(0, score);
  }

  // Cleanup
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export default PerformanceMonitoringService.getInstance();
