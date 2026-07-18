import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  communityLeaderboard
} from '../controllers/communityController.js';

const router = express.Router();

router.get('/posts', optionalAuth, getPosts);
router.post('/posts', authenticate, uploadSingle('image'), createPost);
router.post('/posts/:id/like', authenticate, toggleLike);
router.post('/posts/:id/comment', authenticate, addComment);
router.get('/leaderboard', optionalAuth, communityLeaderboard);

export default router;

