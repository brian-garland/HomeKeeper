/**
 * Production-Ready Logging Service
 * Handles development vs production logging appropriately
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment = __DEV__;
  private logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${levelStr} ${contextStr} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private logToConsole(level: LogLevel, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message);
    
    switch (level) {
      case LogLevel.DEBUG:
        console.log(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
    }
  }

  private logToService(entry: LogEntry) {
    // In production, send to crash reporting service
    if (!this.isDevelopment && entry.level >= LogLevel.ERROR) {
      // Example: Sentry.addBreadcrumb({ message: entry.message, level: 'error', data: entry.data });
      // Example: Crashlytics.log(entry.message);
    }
  }

  debug(message: string, data?: any, context?: string) {
    const entry: LogEntry = {
      level: LogLevel.DEBUG,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };
    
    this.logToConsole(LogLevel.DEBUG, message, data);
    this.logToService(entry);
  }

  info(message: string, data?: any, context?: string) {
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };
    
    this.logToConsole(LogLevel.INFO, message, data);
    this.logToService(entry);
  }

  warn(message: string, data?: any, context?: string) {
    const entry: LogEntry = {
      level: LogLevel.WARN,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };
    
    this.logToConsole(LogLevel.WARN, message, data);
    this.logToService(entry);
  }

  error(message: string, error?: Error | any, context?: string) {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      data: error,
      timestamp: new Date().toISOString(),
      context,
    };
    
    this.logToConsole(LogLevel.ERROR, message, error);
    this.logToService(entry);
  }

  // Convenience methods for common contexts
  task = {
    debug: (message: string, data?: any) => this.debug(message, data, 'TASK'),
    info: (message: string, data?: any) => this.info(message, data, 'TASK'),
    warn: (message: string, data?: any) => this.warn(message, data, 'TASK'),
    error: (message: string, error?: any) => this.error(message, error, 'TASK'),
  };

  equipment = {
    debug: (message: string, data?: any) => this.debug(message, data, 'EQUIPMENT'),
    info: (message: string, data?: any) => this.info(message, data, 'EQUIPMENT'),
    warn: (message: string, data?: any) => this.warn(message, data, 'EQUIPMENT'),
    error: (message: string, error?: any) => this.error(message, error, 'EQUIPMENT'),
  };

  weather = {
    debug: (message: string, data?: any) => this.debug(message, data, 'WEATHER'),
    info: (message: string, data?: any) => this.info(message, data, 'WEATHER'),
    warn: (message: string, data?: any) => this.warn(message, data, 'WEATHER'),
    error: (message: string, error?: any) => this.error(message, error, 'WEATHER'),
  };

  data = {
    debug: (message: string, data?: any) => this.debug(message, data, 'DATA'),
    info: (message: string, data?: any) => this.info(message, data, 'DATA'),
    warn: (message: string, data?: any) => this.warn(message, data, 'DATA'),
    error: (message: string, error?: any) => this.error(message, error, 'DATA'),
  };

  navigation = {
    debug: (message: string, data?: any) => this.debug(message, data, 'NAV'),
    info: (message: string, data?: any) => this.info(message, data, 'NAV'),
    warn: (message: string, data?: any) => this.warn(message, data, 'NAV'),
    error: (message: string, error?: any) => this.error(message, error, 'NAV'),
  };
}

// Export singleton instance
export const logger = new Logger();

// Export convenience function for quick logging
export const log = logger; 