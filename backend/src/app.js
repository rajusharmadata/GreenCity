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
import userRoute from './routes/auth.js';
import issuesRoute from './routes/issues.js';
import reportsRoute from './routes/reports.js';
import leaderboardRoute from './routes/leaderboard.js';
import ecoRoutesRoute from './routes/routes.js';
import transportRoute from './routes/transport.js';
import usersRoute from './routes/users.js';
import communityRoute from './routes/community.js';
import organizationRoute from './routes/organization.js';
import issueSolvedRoute from './routes/issuesolved.js';
import rankingRoute from './routes/userrank.js';
import organizationRankRoute from './routes/organizationrank.js';
import pointsRoute from './routes/points.js';
import TransportEntryRouter from './routes/TransportEntry.js';
import TransportQuery from './routes/TransportQuery.js';
import oauthRoute from './routes/oauth.js';

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
app.use('/api/auth', authRateLimiter, userRoute);
app.use('/api/auth', authRateLimiter, oauthRoute);
app.use('/api/issues', issuesRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/leaderboard', leaderboardRoute);
app.use('/api/routes', ecoRoutesRoute);
app.use('/api/transport', transportRoute);
app.use('/api/users', usersRoute);
app.use('/api/community', communityRoute);
app.use('/api/points', pointsRoute);
app.use('/api/organization', organizationRoute);
app.use('/api/issuesolved', issueSolvedRoute);
app.use('/api/userrank', rankingRoute);
app.use('/api/organizationrank', organizationRankRoute);
app.use('/api/entry', TransportEntryRouter);
app.use('/api/query', TransportQuery);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Use modular error handler
app.use(errorHandler);

export default app;
