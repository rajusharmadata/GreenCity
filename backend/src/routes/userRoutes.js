import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user by ID (public)
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            '_id name email avatar bio location tier points rank badges reportsCount createdAt'
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
