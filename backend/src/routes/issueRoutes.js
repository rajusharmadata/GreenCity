import express from 'express';
import {
  createIssue,
  getIssues,
  getIssue,
  updateIssueStatus,
  upvoteIssue,
  deleteIssue
} from '../controllers/issueController.js';
import { authenticate, optionalAuth, isAdmin } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// Public routes (with optional auth for user context)
router.get('/', optionalAuth, getIssues);
router.get('/:id', optionalAuth, getIssue);

// Protected routes
router.post('/', authenticate, uploadSingle('image'), createIssue);
router.patch('/:id/status', authenticate, isAdmin, updateIssueStatus);  // Mobile uses PATCH
router.put('/:id/status', authenticate, isAdmin, updateIssueStatus);    // Keep PUT for web
router.patch('/:id/upvote', authenticate, upvoteIssue);                 // Mobile uses PATCH
router.post('/:id/upvote', authenticate, upvoteIssue);                  // Keep POST for web
router.delete('/:id', authenticate, deleteIssue);

export default router;