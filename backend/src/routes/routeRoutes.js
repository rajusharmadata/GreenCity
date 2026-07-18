import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { findRoutes, completeRoute } from '../controllers/routeController.js';

const router = express.Router();

router.post('/find', authenticate, findRoutes);
router.post('/complete', authenticate, completeRoute);

export default router;

