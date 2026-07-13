/**
 * Centralized Logging Utility
 * Provides consistent logging across the application
 */

import { LOGGER_CONFIG, IS_PRODUCTION } from '../config/constants.js';

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const LOG_COLORS = {
  ERROR: '\x1b[31m',   // Red
  WARN: '\x1b[33m',    // Yellow
  INFO: '\x1b[36m',    // Cyan
  DEBUG: '\x1b[35m',   // Magenta
  RESET: '\x1b[0m'     // Reset
};

class Logger {
  constructor(moduleName) {
    this.moduleName = moduleName;
  }

  /**
   * Format log message with timestamp and module name
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      module: this.moduleName,
      message
    };

    if (data) {
      logEntry.data = data;
    }

    return logEntry;
  }

  /**
   * Output log to console
   */
  output(level, message, data = null) {
    const logEntry = this.formatMessage(level, message, data);

    if (IS_PRODUCTION) {
      // In production, output as JSON
      console.log(JSON.stringify(logEntry));
    } else {
      // In development, use colored output
      const color = LOG_COLORS[level];
      const reset = LOG_COLORS.RESET;
      console.log(
        `${color}[${logEntry.timestamp}] [${level}] [${this.moduleName}]${reset} ${message}`,
        data ? data : ''
      );
    }
  }

  /**
   * Log error
   */
  error(message, error = null) {
    this.output(LOG_LEVELS.ERROR, message, error);
  }

  /**
   * Log warning
   */
  warn(message, data = null) {
    this.output(LOG_LEVELS.WARN, message, data);
  }

  /**
   * Log info
   */
  info(message, data = null) {
    this.output(LOG_LEVELS.INFO, message, data);
  }

  /**
   * Log debug information
   */
  debug(message, data = null) {
    if (!IS_PRODUCTION) {
      this.output(LOG_LEVELS.DEBUG, message, data);
    }
  }
}

/**
 * Create logger instance for a module
 */
export const createLogger = (moduleName) => new Logger(moduleName);

export default createLogger;
