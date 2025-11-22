import React from 'react';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  SERVER: 'server',
  NOT_FOUND: 'not_found',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

// Error messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network connection error. Please check your internet connection.',
  [ERROR_TYPES.AUTHENTICATION]: 'Authentication failed. Please login again.',
  [ERROR_TYPES.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.VALIDATION]: 'Invalid input. Please check your data and try again.',
  [ERROR_TYPES.SERVER]: 'Server error. Please try again later.',
  [ERROR_TYPES.NOT_FOUND]: 'Resource not found.',
  [ERROR_TYPES.TIMEOUT]: 'Request timed out. Please try again.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// Error handler class
export class ErrorHandler {
  static handle(error, customMessage = null) {
    console.error('Error occurred:', error);
    
    const errorType = this.getErrorType(error);
    const message = customMessage || ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];
    
    console.warn(message);
    
    return {
      type: errorType,
      message,
      originalError: error
    };
  }
  
  static getErrorType(error) {
    if (!error) return ERROR_TYPES.UNKNOWN;
    
    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
      return ERROR_TYPES.NETWORK;
    }
    
    // HTTP status codes
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) return ERROR_TYPES.AUTHENTICATION;
      if (status === 403) return ERROR_TYPES.AUTHORIZATION;
      if (status === 404) return ERROR_TYPES.NOT_FOUND;
      if (status === 422) return ERROR_TYPES.VALIDATION;
      if (status >= 500) return ERROR_TYPES.SERVER;
    }
    
    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return ERROR_TYPES.TIMEOUT;
    }
    
    // Validation errors
    if (error.name === 'ValidationError' || error.message?.includes('validation')) {
      return ERROR_TYPES.VALIDATION;
    }
    
    return ERROR_TYPES.UNKNOWN;
  }
  
  static isAuthError(error) {
    const errorType = this.getErrorType(error);
    return errorType === ERROR_TYPES.AUTHENTICATION || errorType === ERROR_TYPES.AUTHORIZATION;
  }
  
  static shouldRedirectToLogin(error) {
    return this.getErrorType(error) === ERROR_TYPES.AUTHENTICATION;
  }
}

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send error to logging service
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="block mx-auto text-emerald-600 hover:text-emerald-700"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling API errors
export const useErrorHandler = () => {
  const handleError = (error, customMessage = null) => {
    return ErrorHandler.handle(error, customMessage);
  };
  
  const handleAsyncError = async (asyncFn, customMessage = null) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, customMessage);
      throw error;
    }
  };
  
  return {
    handleError,
    handleAsyncError,
    isAuthError: ErrorHandler.isAuthError,
    shouldRedirectToLogin: ErrorHandler.shouldRedirectToLogin
  };
};

export default ErrorHandler;
