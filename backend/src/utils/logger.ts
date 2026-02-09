/**
 * Logger Utility
 * Production-ready logger with different log levels
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, data?: any): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(logLevel as LogLevel);
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      const log = this.formatMessage('info', message, data);
      console.log(JSON.stringify(log));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      const log = this.formatMessage('warn', message, data);
      console.warn(JSON.stringify(log));
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      const log = this.formatMessage('error', message, data);
      console.error(JSON.stringify(log));
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      const log = this.formatMessage('debug', message, data);
      console.debug(JSON.stringify(log));
    }
  }
}

export const logger = new Logger();