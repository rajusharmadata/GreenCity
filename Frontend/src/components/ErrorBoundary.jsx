import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Mail, Bug, ChevronDown } from 'lucide-react';

const ErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundaryClass>
      {children}
    </ErrorBoundaryClass>
  );
};

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Generate unique error ID for tracking
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      errorId 
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Safely set state with error info
    try {
      this.setState({
        error: error,
        errorInfo: errorInfo || null
      });
    } catch (e) {
      console.error('Error setting error state:', e);
      this.setState({
        error: error,
        errorInfo: null
      });
    }

    // Log error to service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with error reporting services like Sentry, LogRocket, etc.
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Example: Send error to logging service
    try {
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Send to your error logging service
      // fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorData) });
      console.log('Error logged:', errorData);
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const subject = `Error Report - ${this.state.errorId}`;
    const body = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
URL: ${window.location.href}
Time: ${new Date().toISOString}

Please describe what you were doing when this error occurred:
`;
    window.location.href = `mailto:support@greencity.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex items-center justify-center mb-4"
                >
                  <AlertTriangle className="w-16 h-16" />
                </motion.div>
                <h1 className="text-3xl font-bold text-center mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-center text-red-100">
                  We're sorry for the inconvenience. An unexpected error occurred.
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <span className="text-2xl font-bold text-orange-600">
                      {this.state.errorId?.substring(4, 10)?.toUpperCase() || 'ERROR'}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Error Code: {this.state.errorId}
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    This error has been logged and our team will investigate. 
                    You can try refreshing the page or go back to the homepage.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={this.handleRefresh}
                    className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Refresh Page
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={this.handleReportError}
                    className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Report Issue
                  </motion.button>
                </div>

                {/* Help Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">What can you do?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Try refreshing the page to see if the issue resolves
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Clear your browser cache and cookies
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Check your internet connection
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Report the issue with the error code above
                    </li>
                  </ul>
                </div>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <motion.details
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6"
                  >
                    <summary className="cursor-pointer flex items-center justify-between p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <span className="flex items-center font-medium text-gray-700">
                        <Bug className="w-4 h-4 mr-2" />
                        Error Details (Development Only)
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </summary>
                    <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto max-h-96">
                      <div className="mb-4">
                        <strong>Error Message:</strong>
                        <pre className="mt-1 text-xs">
                          {this.state.error?.message || 'Unknown error'}
                        </pre>
                      </div>
                      
                      <div className="mb-4">
                        <strong>Error Stack:</strong>
                        <pre className="mt-1 text-xs overflow-auto">
                          {this.state.error?.stack || 'No stack trace available'}
                        </pre>
                      </div>

                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 text-xs overflow-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.details>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-gray-600 text-sm">
              <p>If this problem persists, please contact our support team.</p>
              <p className="mt-1">Error ID: <code className="bg-gray-200 px-2 py-1 rounded">{this.state.errorId}</code></p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
