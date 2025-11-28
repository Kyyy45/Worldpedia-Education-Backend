import fs from 'fs';
import path from 'path';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Logger class
 */
export class Logger {
  private logDir = path.join(process.cwd(), 'logs');

  constructor() {
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  /**
   * Write to console and file
   */
  private write(level: LogLevel, message: string, data?: any): void {
    const formattedMessage = this.formatMessage(level, message, data);

    // Console output
    const consoleMethod = this.getConsoleMethod(level);
    consoleMethod(formattedMessage);

    // File output (only in production or for errors)
    if (process.env.NODE_ENV === 'production' || level === LogLevel.ERROR) {
      this.writeToFile(level, formattedMessage);
    }
  }

  /**
   * Get appropriate console method
   */
  private getConsoleMethod(level: LogLevel): Function {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Write log to file
   */
  private writeToFile(level: LogLevel, message: string): void {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = path.join(this.logDir, `${level.toLowerCase()}-${date}.log`);
      fs.appendFileSync(filename, message + '\n');
    } catch (error) {
      console.error('Failed to write log file:', error);
    }
  }

  /**
   * Debug log
   */
  debug(message: string, data?: any): void {
    this.write(LogLevel.DEBUG, message, data);
  }

  /**
   * Info log
   */
  info(message: string, data?: any): void {
    this.write(LogLevel.INFO, message, data);
  }

  /**
   * Warn log
   */
  warn(message: string, data?: any): void {
    this.write(LogLevel.WARN, message, data);
  }

  /**
   * Error log
   */
  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error 
      ? {
          name: error.name,
          errorMessage: error.message,
          stack: error.stack
        }
      : error;
    this.write(LogLevel.ERROR, message, errorData);
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, statusCode?: number): void {
    const msg = `${method} ${path}${statusCode ? ` - ${statusCode}` : ''}`;
    this.info(msg);
  }

  /**
   * Log authentication event
   */
  logAuth(action: string, userId: string, success: boolean, details?: any): void {
    const message = `Auth: ${action} for user ${userId} - ${success ? 'SUCCESS' : 'FAILED'}`;
    this.info(message, details);
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, collection: string, details?: any): void {
    const message = `Database: ${operation} on ${collection}`;
    this.debug(message, details);
  }

  /**
   * Log payment operation
   */
  logPayment(action: string, amount: number, status: string, details?: any): void {
    const message = `Payment: ${action} - Amount: ${amount}, Status: ${status}`;
    this.info(message, details);
  }

  /**
   * Log email operation
   */
  logEmail(recipient: string, subject: string, success: boolean): void {
    const message = `Email: Sent to ${recipient} - Subject: ${subject} - ${success ? 'SUCCESS' : 'FAILED'}`;
    this.info(message);
  }
}

/**
 * Create logger instance
 */
export const logger = new Logger();

export default logger;