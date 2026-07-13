/**
 * Application Constants and Configuration
 * Centralized place for all constants used throughout the application
 */

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

// Server Configuration
export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  API_VERSION: 'v1'
};

// Database Configuration
export const DB_CONFIG = {
  POOL_SIZE: 100,
  SERVER_SELECTION_TIMEOUT: 5000,
  SOCKET_TIMEOUT: 45000
};

// JWT Configuration
export const JWT_CONFIG = {
  EXPIRY: process.env.JWT_EXPIRY || '7d',
  ALGORITHM: 'HS256'
};

// Rate Limiting
export const RATE_LIMIT = {
  GENERAL_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  GENERAL_MAX_REQUESTS: 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX_REQUESTS: 20
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  UPLOAD_DIR: 'uploads'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Issue Categories
export const ISSUE_CATEGORIES = [
  'Waste',
  'Infrastructure',
  'Road Hazard',
  'Vandalism',
  'Air Quality',
  'Water',
  'Noise',
  'Other'
];

export const ISSUE_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

// Points Configuration
export const POINTS = {
  REPORT_CREATION: 50,
  REPORT_VERIFICATION: 25,
  ISSUE_RESOLVED: 100,
  COMMUNITY_POST: 10,
  STREAK_BONUS: 5
};

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  UNAUTHORIZED: 'Unauthorized access',
  NO_TOKEN: 'No token provided',
  
  // Validation
  INVALID_EMAIL: 'Invalid email address',
  WEAK_PASSWORD: 'Password must be at least 6 characters',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_INPUT: 'Invalid input provided',
  
  // Resource
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_ALREADY_EXISTS: 'Resource already exists',
  
  // Server
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database error',
  EXTERNAL_SERVICE_ERROR: 'External service error',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  FORBIDDEN: 'Access forbidden'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  REGISTRATION_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  OTP_SENT: 'OTP sent to email',
  PASSWORD_RESET: 'Password reset successfully',
  
  // Resources
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  FETCHED: 'Resource fetched successfully'
};

// Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Cache Configuration
export const CACHE_CONFIG = {
  TTL_LEADERBOARD: 3600, // 1 hour
  TTL_USER_PROFILE: 1800, // 30 minutes
  TTL_ISSUES_LIST: 300 // 5 minutes
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  ISSUE_FOLDER: process.env.CLOUDINARY_ISSUE_FOLDER || 'greencity_issues',
  PROFILE_FOLDER: process.env.CLOUDINARY_PROFILE_FOLDER || 'greencity_profiles'
};

// Email Configuration
export const EMAIL_CONFIG = {
  OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
  OTP_LENGTH: 6,
  FROM_EMAIL: process.env.EMAIL_FROM || 'noreply@greencity.com',
  FROM_NAME: 'GreenCity'
};

// Logging Configuration
export const LOGGER_CONFIG = {
  LOG_LEVEL: IS_PRODUCTION ? 'error' : 'debug',
  LOG_FORMAT: IS_PRODUCTION ? 'json' : 'colorized'
};

// API Response Configuration
export const RESPONSE_CONFIG = {
  INCLUDE_TIMESTAMP: true,
  INCLUDE_VERSION: true,
  INCLUDE_PATH: !IS_PRODUCTION
};
