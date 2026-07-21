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

// Route imports - Feature-based architecture
import authRoutes from './features/auth/routes/authRoutes.js';
import oauthRoutes from './features/auth/routes/oauthRoutes.js';
import issueRoutes from './features/issues/routes/issueRoutes.js';
import issueSolvedRoutes from './features/issues/routes/issueSolvedRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import leaderboardRoutes from './features/gamification/routes/leaderboardRoutes.js';
import routeRoutes from './features/transport/routes/routeRoutes.js';
import transportRoutes from './features/transport/routes/transportRoutes.js';
import transportEntryRoutes from './features/transport/routes/transportEntryRoutes.js';
import transportQueryRoutes from './features/transport/routes/transportQueryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import communityRoutes from './features/community/routes/communityRoutes.js';
import organizationRoutes from './features/organizations/routes/organizationRoutes.js';
import organizationRankRoutes from './features/organizations/routes/organizationRankRoutes.js';
import userRankRoutes from './features/gamification/routes/userRankRoutes.js';
import pointsRoutes from './features/gamification/routes/pointsRoutes.js';

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
