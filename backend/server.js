import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import session from 'express-session';
import passport from './config/passport.js';
import {
  rateLimiter,
  authRateLimiter,
  securityHeaders,
  sanitizeInput,
  mongoSanitizeMiddleware,
  corsOptions,
  validateEnvironment
} from './config/security.js';
import userRoute from './routes/auth.js';
import issueRoute from './routes/issue.js';
import organizationRoute from './routes/organization.js';
import issueSolvedRoute from './routes/issuesolved.js';
import rankingRoute from './routes/userrank.js';
import organizationRankRoute from './routes/organizationrank.js';
import TransportEntryRouter from './routes/TransportEntry.js';
import TransportQuery from './routes/TransportQuery.js';
import oauthRoute from './routes/oauth.js';
import dbconnection from './db/db.js';

dotenv.config();

// // Validate environment variables (with defaults for development)
// try {
//   validateEnvironment();
// } catch (error) {
//   console.error('Environment validation error:', error.message);
//   // In development, continue with warnings
//   if (process.env.NODE_ENV === 'production') {
//     process.exit(1);
//   }
// }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

const app = express();

// Apply security middleware
app.use(securityHeaders);
app.use(mongoSanitizeMiddleware);
app.use(sanitizeInput);

// CORS configuration
app.use(cors(corsOptions));

// Apply rate limiting
app.use(rateLimiter);

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const PORT = process.env.PORT || 5000;

  dbconnection()

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`📥 ${req.method} ${req.path}`, req.body ? 'with body' : '');
  }
  next();
});

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes with auth rate limiting
// Mount auth routes (signup, login, verification) at /api/auth
app.use('/api/auth', authRateLimiter, userRoute);
// Mount OAuth routes at /api/auth (they use different paths like /google, /github)
app.use('/api/auth', authRateLimiter, oauthRoute);

// Other API routes
app.use('/api/issue', issueRoute);
app.use('/api/organization', organizationRoute);
app.use('/api/issuesolved', issueSolvedRoute);
app.use('/api/userrank', rankingRoute);
app.use('/api/organizationrank', organizationRankRoute);
app.use('/api/entry', TransportEntryRouter);
app.use('/api/query', TransportQuery);

// Debug: Log all registered routes
console.log('\n📋 Registered API Routes:');
console.log('  POST /api/auth/signup-user');
console.log('  POST /api/auth/login-user');
console.log('  POST /api/auth/signup-admin');
console.log('  POST /api/auth/login-admin');
console.log('  POST /api/auth/login-org (legacy)');
console.log('  POST /api/auth/verify-email');
console.log('  POST /api/auth/resend-verification');
console.log('  GET  /api/auth/profile');
console.log('  GET  /api/auth/google');
console.log('  GET  /api/auth/github');
console.log('  POST /api/organization/signup');
console.log('  POST /api/organization/login');
console.log('  POST /api/organization/verify-email');
console.log('  POST /api/organization/resend-verification');
console.log('  GET  /api/organization/profile');
console.log('');

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});
app.use("/",(req,res)=>{
  res.send(`<H1> Backend is running </H1>`)
})

app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
});
