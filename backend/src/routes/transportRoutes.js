import express from 'express';
import {
  createTransport,
  getTransports,
  getNearbyTransports,
  getTransport,
  updateTransport,
  deleteTransport,
  getTransportStats
} from '../controllers/transportController.js';
import { authenticate, optionalAuth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional auth for user context)
router.get('/', optionalAuth, getTransports);
router.get('/nearby', optionalAuth, getNearbyTransports);
router.get('/stats', optionalAuth, getTransportStats);
router.get('/:id', optionalAuth, getTransport);

// Protected admin routes
router.post('/', authenticate, isAdmin, createTransport);
router.put('/:id', authenticate, isAdmin, updateTransport);
router.delete('/:id', authenticate, isAdmin, deleteTransport);

export default router;