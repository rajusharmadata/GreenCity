/**
 * Global error handling middleware for Express.
 * Standardizes error responses across the API.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log error for developers
  console.error(`[Error] ${req.method} ${req.url}:`, err.stack || err.message);

  const response = {
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, details: err.details })
  };

  res.status(statusCode).json(response);
};

/**
 * Custom Error class for API-related errors.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
