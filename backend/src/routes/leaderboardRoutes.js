import express from 'express';
import {
  getLeaderboard,
  getUserRank,
  getLeaderboardStats
} from '../controllers/leaderboardController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional auth for user context)
router.get('/', optionalAuth, getLeaderboard);
router.get('/stats', optionalAuth, getLeaderboardStats);

// Protected routes
router.get('/me', authenticate, getUserRank);

export default router;