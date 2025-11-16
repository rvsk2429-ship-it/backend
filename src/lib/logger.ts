import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

// Log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR"
};

const LOG_DIR = path.resolve("logs");

/**
 * Simple logger with file and console output
 */
class Logger {
  private logLevel: LogLevel;
  private initialized = false;

  constructor() {
    const levelMap: Record<string, LogLevel> = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR
    };

    this.logLevel = levelMap[env.logLevel] || LogLevel.INFO;
    this.initializeLogDir();
  }

  private initializeLogDir() {
    if (env.nodeEnv === "production") {
      if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
      }
      this.initialized = true;
    }
  }

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${levelName}: ${message}${metaStr}`;
  }

  private writeToFile(level: LogLevel, message: string, meta?: unknown) {
    if (env.nodeEnv !== "production" || !this.initialized) return;

    const formatted = this.formatMessage(level, message, meta);
    const filename = level === LogLevel.ERROR ? "error.log" : "combined.log";
    const filepath = path.join(LOG_DIR, filename);

    fs.appendFileSync(filepath, formatted + "\n", { encoding: "utf-8" });
  }

  private log(level: LogLevel, message: string, meta?: unknown) {
    if (level < this.logLevel) return;

    const formatted = this.formatMessage(level, message, meta);

    if (level === LogLevel.ERROR) {
      console.error(formatted);
    } else if (level === LogLevel.WARN) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }

    this.writeToFile(level, message, meta);
  }

  debug(message: string, meta?: unknown) {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: unknown) {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: unknown) {
    this.log(LogLevel.ERROR, message, meta);
  }

  // Security-specific logging
  logFailedLogin(ip: string, email: string, reason: string) {
    this.warn(`Failed login attempt`, {
      email,
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  logSuccessfulLogin(ip: string, email: string) {
    this.info(`Admin login successful`, {
      email,
      ip,
      timestamp: new Date().toISOString()
    });
  }

  logBookingCreated(bookingId: string, ip: string) {
    this.info(`New booking created`, {
      bookingId,
      ip,
      timestamp: new Date().toISOString()
    });
  }

  logBookingViewed(bookingId: string, adminId: string) {
    this.info(`Booking viewed by admin`, {
      bookingId,
      adminId,
      timestamp: new Date().toISOString()
    });
  }

  logSecurityEvent(eventType: string, details: Record<string, unknown>) {
    this.warn(`Security event`, {
      type: eventType,
      ...details,
      timestamp: new Date().toISOString()
    });
  }
}

export const logger = new Logger();
