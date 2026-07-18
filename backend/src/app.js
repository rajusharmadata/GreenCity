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
  corsOptions
} from './config/security.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import transportRoutes from './routes/transportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import issueSolvedRoutes from './routes/issueSolvedRoutes.js';
import userRankRoutes from './routes/userRankRoutes.js';
import organizationRankRoutes from './routes/organizationRankRoutes.js';
import pointsRoutes from './routes/pointsRoutes.js';
import transportEntryRoutes from './routes/transportEntryRoutes.js';
import transportQueryRoutes from './routes/transportQueryRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';

import { errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Apply security middleware
app.use(securityHeaders);
app.use(mongoSanitizeMiddleware);
app.use(sanitizeInput);

// CORS (handles OPTIONS preflight automatically)
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/auth', authRateLimiter, oauthRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/issuesolved', issueSolvedRoutes);
app.use('/api/userrank', userRankRoutes);
app.use('/api/organizationrank', organizationRankRoutes);
app.use('/api/entry', transportEntryRoutes);
app.use('/api/query', transportQueryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Use modular error handler
app.use(errorHandler);

export default app;
