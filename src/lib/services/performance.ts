/**
 * Performance Monitoring Service
 * Tracks app launch time, render performance, and user interactions
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private appStartTime: number;

  constructor() {
    this.appStartTime = Date.now();
    this.trackAppLaunch();
  }

  private trackAppLaunch() {
    // Track app launch time
    this.startTimer('app_launch');
    
    // Set a timeout to measure when the app is "ready"
    setTimeout(() => {
      this.endTimer('app_launch');
      const launchTime = this.getMetric('app_launch')?.duration;
      
      if (launchTime) {
        logger.info(`App launch completed in ${launchTime}ms`, { launchTime });
        
        // Log warning if launch time exceeds 2 seconds
        if (launchTime > 2000) {
          logger.warn(`App launch time exceeded 2s target: ${launchTime}ms`, { launchTime });
        }
      }
    }, 100); // Small delay to ensure app is fully rendered
  }

  startTimer(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
    };
    
    this.metrics.set(name, metric);
    logger.debug(`Performance timer started: ${name}`, metadata);
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Performance timer not found: ${name}`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    
    logger.debug(`Performance timer ended: ${name} (${duration}ms)`, {
      duration,
      ...metric.metadata,
    });

    return duration;
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // Track specific operations
  trackDataOperation(operation: string, callback: () => Promise<any>): Promise<any> {
    return this.trackAsyncOperation(`data_${operation}`, callback);
  }

  trackNavigation(screenName: string, callback: () => void): void {
    this.startTimer(`nav_${screenName}`);
    callback();
    // End timer after a small delay to account for render time
    setTimeout(() => {
      this.endTimer(`nav_${screenName}`);
    }, 16); // One frame at 60fps
  }

  trackAsyncOperation<T>(name: string, callback: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    
    return callback()
      .then((result) => {
        this.endTimer(name);
        return result;
      })
      .catch((error) => {
        this.endTimer(name);
        logger.error(`Performance tracked operation failed: ${name}`, error);
        throw error;
      });
  }

  // Memory and performance warnings
  checkMemoryUsage(): void {
    if (__DEV__) {
      // In development, we can check for memory leaks
      const metricsCount = this.metrics.size;
      if (metricsCount > 100) {
        logger.warn(`High number of performance metrics stored: ${metricsCount}`, {
          metricsCount,
        });
      }
    }
  }

  // Clean up old metrics to prevent memory leaks
  cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    for (const [name, metric] of this.metrics.entries()) {
      if (metric.startTime < oneHourAgo) {
        this.metrics.delete(name);
      }
    }
    
    logger.debug(`Performance metrics cleanup completed. Remaining: ${this.metrics.size}`);
  }

  // Get performance summary
  getSummary(): {
    appLaunchTime: number | null;
    totalMetrics: number;
    slowOperations: PerformanceMetric[];
  } {
    const appLaunchMetric = this.getMetric('app_launch');
    const allMetrics = this.getAllMetrics();
    
    // Find operations that took longer than 1 second
    const slowOperations = allMetrics.filter(
      metric => metric.duration && metric.duration > 1000
    );

    return {
      appLaunchTime: appLaunchMetric?.duration || null,
      totalMetrics: allMetrics.length,
      slowOperations,
    };
  }

  // Report performance issues
  reportPerformanceIssues(): void {
    const summary = this.getSummary();
    
    if (summary.appLaunchTime && summary.appLaunchTime > 2000) {
      logger.warn('App launch time performance issue', {
        launchTime: summary.appLaunchTime,
        target: 2000,
      });
    }

    if (summary.slowOperations.length > 0) {
      logger.warn('Slow operations detected', {
        count: summary.slowOperations.length,
        operations: summary.slowOperations.map(op => ({
          name: op.name,
          duration: op.duration,
        })),
      });
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const trackPerformance = {
  start: (name: string, metadata?: Record<string, any>) => 
    performanceMonitor.startTimer(name, metadata),
  
  end: (name: string) => 
    performanceMonitor.endTimer(name),
  
  async: <T>(name: string, callback: () => Promise<T>) => 
    performanceMonitor.trackAsyncOperation(name, callback),
  
  navigation: (screenName: string, callback: () => void) => 
    performanceMonitor.trackNavigation(screenName, callback),
  
  data: (operation: string, callback: () => Promise<any>) => 
    performanceMonitor.trackDataOperation(operation, callback),
}; 