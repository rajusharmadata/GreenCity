import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getHistory, getBadges } from '../controllers/pointsController.js';

const router = express.Router();

router.get('/history', authenticate, getHistory);
router.get('/badges', authenticate, getBadges);

export default router;

