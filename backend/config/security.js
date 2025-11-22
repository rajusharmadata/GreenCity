import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss';
import jwt from 'jsonwebtoken';

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://api.github.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware - XSS protection
export const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  
  // Sanitize query parameters (use sanitized query if available from mongoSanitizeMiddleware)
  const queryToSanitize = req.sanitizedQuery || req.query;
  if (queryToSanitize) {
    Object.keys(queryToSanitize).forEach(key => {
      if (typeof queryToSanitize[key] === 'string') {
        queryToSanitize[key] = xss(queryToSanitize[key]);
      }
    });
    // Store sanitized query for use in routes
    req.sanitizedQuery = queryToSanitize;
  }
  
  next();
};

// MongoDB injection protection - Custom implementation for Express 5 compatibility
// This replaces express-mongo-sanitize which is not compatible with Express 5
// Express 5 makes req.query read-only, so we need a different approach

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  const dangerousPatterns = /\$|\.|prototype|__proto__|constructor/;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Check for dangerous MongoDB operators and prototype pollution
      if (dangerousPatterns.test(key)) {
        // Skip dangerous keys to prevent NoSQL injection
        continue;
      }
      
      const value = obj[key];
      
      // Recursively sanitize nested objects
      if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
        sanitized[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'object' && item !== null && !Array.isArray(item) ? sanitizeObject(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

export const mongoSanitizeMiddleware = (req, res, next) => {
  try {
    // Sanitize request body (can be modified in Express 5)
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    // In Express 5, req.query is read-only, so we create a sanitized copy
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = sanitizeObject(req.query);
      // Store sanitized query for use in route handlers
      req.sanitizedQuery = sanitizedQuery;
    }
    
    // Sanitize params (can be modified)
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('MongoDB sanitization error:', error);
    // Continue even if sanitization fails to avoid breaking the app
    next();
  }
};

// CORS configuration for production
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://yourdomain.com', // Add your production domain
      'https://www.yourdomain.com'
    ];
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// Input validation middleware
export const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// JWT token validation middleware
export const validateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Session security configuration
export const sessionSecurity = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  name: 'sessionId' // Avoid default session name for security
};

// Environment validation
export const validateEnvironment = () => {
  // Set defaults for development if not provided
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-secret-key-change-in-production';
    console.warn('⚠️  JWT_SECRET not set, using default (NOT SECURE FOR PRODUCTION)');
  }
  
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = 'your-session-secret-change-in-production';
    console.warn('⚠️  SESSION_SECRET not set, using default (NOT SECURE FOR PRODUCTION)');
  }
  
  if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/greencity_project';
    console.warn('⚠️  MONGO_URI not set, using default local MongoDB');
  }
  
  // Only throw errors in production
  if (process.env.NODE_ENV === 'production') {
    const requiredEnvVars = [
      'JWT_SECRET',
      'SESSION_SECRET',
      'MONGO_URI'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    const productionVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET'
    ];
    
    const missingProductionVars = productionVars.filter(varName => !process.env[varName]);
    
    if (missingProductionVars.length > 0) {
      console.warn(`Warning: Missing production environment variables: ${missingProductionVars.join(', ')}`);
    }
  }
};

// Helper function to get sanitized query parameters in route handlers
// Use this instead of req.query when you need sanitized values
export const getSanitizedQuery = (req) => {
  return req.sanitizedQuery || req.query;
};

export default {
  rateLimiter,
  authRateLimiter,
  securityHeaders,
  sanitizeInput,
  mongoSanitizeMiddleware,
  getSanitizedQuery,
  corsOptions,
  validateInput,
  validateJWT,
  validatePasswordStrength,
  sessionSecurity,
  validateEnvironment
};
