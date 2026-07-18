/**
 * Error Handling Utilities
 * Centralized error handling for server errors, network errors, and app errors
 */

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: Date;
}

export interface ApiError extends AppError {
  status: number;
  endpoint?: string;
}

export interface ValidationError extends AppError {
  field?: string;
  value?: any;
}

export class ErrorType {
  static NETWORK_ERROR = 'NETWORK_ERROR';
  static SERVER_ERROR = 'SERVER_ERROR';
  static VALIDATION_ERROR = 'VALIDATION_ERROR';
  static AUTH_ERROR = 'AUTH_ERROR';
  static PERMISSION_ERROR = 'PERMISSION_ERROR';
  static NOT_FOUND_ERROR = 'NOT_FOUND_ERROR';
  static RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR';
  static UNKNOWN_ERROR = 'UNKNOWN_ERROR';
}

/**
 * Parse API error response
 */
export const parseApiError = (error: any): ApiError => {
  const timestamp = new Date();

  // Network error
  if (!error.response) {
    return {
      message: error.message || 'Network error. Please check your connection.',
      code: ErrorType.NETWORK_ERROR,
      status: 0,
      timestamp,
    };
  }

  const { response } = error;
  const status = response.status;
  const data = response.data;

  // Handle different error response formats
  let message = 'An error occurred';
  let code = ErrorType.UNKNOWN_ERROR;
  let details = data;

  if (data?.message) {
    message = data.message;
  } else if (data?.error) {
    message = data.error;
  } else if (data?.msg) {
    message = data.msg;
  }

  // Determine error type based on status code
  if (status === 400) {
    code = ErrorType.VALIDATION_ERROR;
    message = message || 'Invalid request data';
  } else if (status === 401) {
    code = ErrorType.AUTH_ERROR;
    message = message || 'Authentication required. Please login.';
  } else if (status === 403) {
    code = ErrorType.PERMISSION_ERROR;
    message = message || 'You do not have permission to perform this action.';
  } else if (status === 404) {
    code = ErrorType.NOT_FOUND_ERROR;
    message = message || 'Resource not found.';
  } else if (status === 429) {
    code = ErrorType.RATE_LIMIT_ERROR;
    message = message || 'Too many requests. Please try again later.';
  } else if (status >= 500) {
    code = ErrorType.SERVER_ERROR;
    message = message || 'Server error. Please try again later.';
  }

  return {
    message,
    code,
    status,
    details,
    timestamp,
  };
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.code) {
    case ErrorType.NETWORK_ERROR:
      return 'Unable to connect. Please check your internet connection.';
    case ErrorType.SERVER_ERROR:
      return 'Server error. Our team has been notified.';
    case ErrorType.VALIDATION_ERROR:
      return error.message || 'Please check your input and try again.';
    case ErrorType.AUTH_ERROR:
      return 'Please login to continue.';
    case ErrorType.PERMISSION_ERROR:
      return 'You do not have permission to access this resource.';
    case ErrorType.NOT_FOUND_ERROR:
      return 'The requested resource was not found.';
    case ErrorType.RATE_LIMIT_ERROR:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
};

/**
 * Check if error is recoverable
 */
export const isRecoverableError = (error: AppError): boolean => {
  const recoverableErrors = [
    ErrorType.NETWORK_ERROR,
    ErrorType.SERVER_ERROR,
    ErrorType.RATE_LIMIT_ERROR,
  ];
  return recoverableErrors.includes(error.code!);
};

/**
 * Check if error requires authentication
 */
export const isAuthError = (error: AppError): boolean => {
  return error.code === ErrorType.AUTH_ERROR;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: Record<string, string[]>): string[] => {
  return Object.entries(errors).map(([field, messages]) => {
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
    return `${fieldName}: ${messages.join(', ')}`;
  });
};

/**
 * Create error object from error
 */
export const createError = (
  message: string,
  code: string = ErrorType.UNKNOWN_ERROR,
  status?: number,
  details?: any
): AppError => {
  return {
    message,
    code,
    status,
    details,
    timestamp: new Date(),
  };
};

/**
 * Log error for debugging
 */
export const logError = (error: AppError, context?: string) => {
  const logData = {
    timestamp: error.timestamp,
    code: error.code,
    message: error.message,
    status: error.status,
    details: error.details,
    context,
  };

  console.error('Error logged:', logData);

  // In production, you would send this to your error tracking service
  // like Sentry, LogRocket, etc.
};

/**
 * Get error severity level
 */
export const getErrorSeverity = (error: AppError): 'low' | 'medium' | 'high' => {
  if (error.code === ErrorType.VALIDATION_ERROR) return 'low';
  if (error.code === ErrorType.AUTH_ERROR || error.code === ErrorType.PERMISSION_ERROR) return 'medium';
  if (error.code === ErrorType.SERVER_ERROR || error.code === ErrorType.NETWORK_ERROR) return 'high';
  return 'medium';
};
