import express from 'express';
import passport from 'passport';
import { markIssueAsSolved } from '../controllers/issuesolved.js';
import IssueSolved from '../models/issuesolved.js';

const router = express.Router();

router.post('/solve', markIssueAsSolved);

router.get(
  '/user',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (!req.user || req.user.role === 'organization') {
        return res.status(403).json({ message: 'Only authenticated users can access resolved issues' });
      }

      const entries = await IssueSolved.find({ username: req.user._id })
        .sort({ solvedAt: -1 })
        .lean();
      res.json(entries);
    } catch (error) {
      console.error('Resolved issues fetch failed:', error);
      res.status(500).json({ message: 'Failed to load resolved issues', error: error.message });
    }
  }
);

router.get(
  '/organization',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'organization') {
        return res.status(403).json({ message: 'Only organization accounts can access this resource' });
      }

      const entries = await IssueSolved.find({ solvedBy: req.user.organizationId })
        .sort({ solvedAt: -1 })
        .lean();
      res.json(entries);
    } catch (error) {
      console.error('Organization resolved issues fetch failed:', error);
      res.status(500).json({ message: 'Failed to load organization resolved issues', error: error.message });
    }
  }
);

export default router;