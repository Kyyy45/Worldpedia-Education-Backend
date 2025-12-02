import fs from "fs";
import path from "path";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export class Logger {
  private logDir = path.join(process.cwd(), "logs");
  // Matikan file logging secara default di environment serverless/production
  private isFileLoggingEnabled = process.env.NODE_ENV !== "production";

  constructor() {
    // Hanya buat direktori jika logging file aktif
    if (this.isFileLoggingEnabled) {
      this.ensureLogDirectory();
    }
  }

  private ensureLogDirectory(): void {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.warn(
        "⚠️ Logger: Cannot create logs directory. File logging disabled."
      );
      this.isFileLoggingEnabled = false;
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : "";
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  private write(level: LogLevel, message: string, data?: any): void {
    const formattedMessage = this.formatMessage(level, message, data);

    // 1. Console output (Wajib untuk Vercel Logs)
    const consoleMethod = this.getConsoleMethod(level);
    consoleMethod(formattedMessage);

    // 2. File output (Hanya di local development)
    if (this.isFileLoggingEnabled) {
      this.writeToFile(level, formattedMessage);
    }
  }

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

  private writeToFile(level: LogLevel, message: string): void {
    try {
      const date = new Date().toISOString().split("T")[0];
      const filename = path.join(
        this.logDir,
        `${level.toLowerCase()}-${date}.log`
      );
      fs.appendFileSync(filename, message + "\n");
    } catch (error) {
      // Silent fail agar tidak crash aplikasi
    }
  }

  // ... (Sisa method debug, info, warn, error, logRequest, dll tetap sama)
  debug(message: string, data?: any): void {
    this.write(LogLevel.DEBUG, message, data);
  }
  info(message: string, data?: any): void {
    this.write(LogLevel.INFO, message, data);
  }
  warn(message: string, data?: any): void {
    this.write(LogLevel.WARN, message, data);
  }
  error(message: string, error?: Error | any): void {
    const errorData =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;
    this.write(LogLevel.ERROR, message, errorData);
  }
  logRequest(method: string, path: string, statusCode?: number): void {
    this.info(`${method} ${path}${statusCode ? ` - ${statusCode}` : ""}`);
  }
  logAuth(
    action: string,
    userId: string,
    success: boolean,
    details?: any
  ): void {
    this.info(
      `Auth: ${action} for user ${userId} - ${success ? "SUCCESS" : "FAILED"}`,
      details
    );
  }
  logDatabase(operation: string, collection: string, details?: any): void {
    this.debug(`Database: ${operation} on ${collection}`, details);
  }
  logPayment(
    action: string,
    amount: number,
    status: string,
    details?: any
  ): void {
    this.info(
      `Payment: ${action} - Amount: ${amount}, Status: ${status}`,
      details
    );
  }
  logEmail(recipient: string, subject: string, success: boolean): void {
    this.info(
      `Email: Sent to ${recipient} - Subject: ${subject} - ${
        success ? "SUCCESS" : "FAILED"
      }`
    );
  }
}

export const logger = new Logger();
export default logger;