import express from 'express';

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

dotenv.config({
  path: ".env"
});

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

// ... (keep existing imports)

const app = express();

// Apply security middleware
app.use(securityHeaders);
app.use(mongoSanitizeMiddleware);
app.use(sanitizeInput);
app.use(cors(corsOptions));
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRateLimiter, userRoute);
app.use('/api/auth', authRateLimiter, oauthRoute);
app.use('/api/issue', issueRoute);
app.use('/api/organization', organizationRoute);
app.use('/api/issuesolved', issueSolvedRoute);
app.use('/api/userrank', rankingRoute);
app.use('/api/organizationrank', organizationRankRoute);
app.use('/api/entry', TransportEntryRouter);
app.use('/api/query', TransportQuery);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Export the Express app for Vercel

// Start server - listen on all interfaces (0.0.0.0) for mobile device access
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Server is accessible at http://localhost:${PORT}`);
  console.log(`For mobile devices, use your computer's IP address: http://YOUR_IP:${PORT}`);
});
dbconnection();

export default app;
