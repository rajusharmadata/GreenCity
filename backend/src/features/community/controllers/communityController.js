import { getSanitizedQuery } from '../../../config/security.js';
import { addPoints } from '../../gamification/controllers/leaderboardController.js';
import {
  fetchPosts,
  createNewPost,
  togglePostLike,
  addPostComment,
  communityLeaderboard as fetchLeaderboard
} from '../services/communityService.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../middleware/errorMiddleware.js';

const parseNumber = (v) => {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
};

export const getPosts = asyncHandler(async (req, res) => {
  const q = getSanitizedQuery(req);
  const { posts, total } = await fetchPosts(
    q.filter,
    Math.max(parseInt(q.page) || 1, 1),
    Math.min(Math.max(parseInt(q.limit) || 20, 1), 50),
    parseNumber(q.lat),
    parseNumber(q.lng),
    Math.min(Math.max(parseNumber(q.radiusKm) ?? 5, 1), 50)
  );

  return res.json({ 
    success: true,
    data: { posts, total, currentPage: parseInt(q.page) || 1, totalPages: Math.ceil(total / 20) }
  });
});

export const createPost = async (req, res) => {
  try {
    const post = await createNewPost(req.user.userId, req.body, req.file?.path);
    const pointsResult = await addPoints(req.user.userId, 5, 'Community post');

    return res.status(201).json({
      message: 'Post created',
      post,
      pointsEarned: 5,
      totalPoints: pointsResult?.newPoints
    });
  } catch (error) {
    console.error('createPost error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleLike = asyncHandler(async (req, res) => {
  const result = await togglePostLike(req.params.id, req.user.userId);
  return res.json({ 
    success: true,
    message: result.liked ? 'Liked' : 'Like removed',
    data: result
  });
});

export const addComment = async (req, res) => {
  try {
    const count = await addPostComment(req.params.id, req.user.userId, req.body.text);
    return res.status(201).json({ message: 'Comment added', commentsCount: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const communityLeaderboard = asyncHandler(async (req, res) => {
  const q = getSanitizedQuery(req);
  const limit = Math.min(parseInt(q.limit) || 10, 50);
  const top = await fetchLeaderboard(limit);
  return res.json({ 
    success: true,
    data: { leaderboard: top }
  });
});

export default { getPosts, createPost, toggleLike, addComment, communityLeaderboard };
