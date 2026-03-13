import Post from '../models/Post.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';
import { getSanitizedQuery } from '../config/security.js';
import { addPoints } from './leaderboardController.js';

const requireNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const parseNumber = (v) => {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
};

const buildNearFilter = (lat, lng, radiusKm) => {
  // simple bounding box filter since we don't store as GeoJSON index here
  const deg = radiusKm / 111; // approximate
  return {
    'location.lat': { $gte: lat - deg, $lte: lat + deg },
    'location.lng': { $gte: lng - deg, $lte: lng + deg }
  };
};

/**
 * GET /api/community/posts?page=1&limit=20&filter=all
 * filters: all | near | eco-tips | reports | events
 * if filter=near, expects lat/lng (+ optional radiusKm)
 */
export const getPosts = async (req, res) => {
  try {
    const q = getSanitizedQuery(req);
    const page = Math.max(parseInt(q.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(q.limit) || 20, 1), 50);
    const filter = String(q.filter || 'all');

    const mongoFilter = {};
    if (['eco-tips', 'reports', 'events'].includes(filter)) {
      mongoFilter.filterTag = filter;
    }

    if (filter === 'near') {
      const lat = parseNumber(q.lat);
      const lng = parseNumber(q.lng);
      const radiusKm = Math.min(Math.max(parseNumber(q.radiusKm) ?? 5, 1), 50);
      if (lat === null || lng === null) {
        return res.status(400).json({ error: 'lat and lng are required for near filter' });
      }
      Object.assign(mongoFilter, buildNearFilter(lat, lng, radiusKm));
    }

    const [posts, total] = await Promise.all([
      Post.find(mongoFilter)
        .populate('userId', 'name avatar tier points')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(mongoFilter)
    ]);

    return res.json({
      posts,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('getPosts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/community/posts
 * Multipart optional: image
 * Body: text, filterTag?, lat?, lng?, address?
 * Awards 5 points.
 */
export const createPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { text, filterTag } = req.body || {};

    if (!requireNonEmptyString(text)) {
      return res.status(400).json({ error: 'text is required' });
    }

    const allowedTags = ['all', 'near', 'eco-tips', 'reports', 'events'];
    const tag = allowedTags.includes(filterTag) ? filterTag : 'all';

    const lat = parseNumber(req.body?.lat);
    const lng = parseNumber(req.body?.lng);
    const address = String(req.body?.address || '').trim();

    // Optional image upload to Cloudinary
    let imageUrl = '';
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: process.env.CLOUDINARY_COMMUNITY_FOLDER || 'greencity_community',
          resource_type: 'image'
        });
        imageUrl = result.secure_url;
      } finally {
        if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
      }
    }

    const post = await Post.create({
      userId,
      text: text.trim(),
      imageUrl,
      filterTag: tag,
      location: {
        lat,
        lng,
        address
      }
    });

    const pointsEarned = 5;
    const pointsResult = await addPoints(userId, pointsEarned, 'Community post');

    const hydrated = await Post.findById(post._id).populate('userId', 'name avatar tier points').lean();

    return res.status(201).json({
      message: 'Post created',
      post: hydrated,
      pointsEarned,
      totalPoints: pointsResult?.newPoints ?? undefined
    });
  } catch (error) {
    console.error('createPost error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * POST /api/community/posts/:id/like
 * Toggles like.
 */
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user.userId;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);
    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();

    return res.json({
      message: alreadyLiked ? 'Like removed' : 'Liked',
      liked: !alreadyLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('toggleLike error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/community/posts/:id/comment
 * Body: { text }
 */
export const addComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { text } = req.body || {};
    if (!requireNonEmptyString(text)) {
      return res.status(400).json({ error: 'text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ userId, text: text.trim() });
    await post.save();

    return res.status(201).json({ message: 'Comment added', commentsCount: post.comments.length });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/community/leaderboard
 * Uses existing leaderboard collection; returns top N users by points.
 */
export const communityLeaderboard = async (req, res) => {
  try {
    const q = getSanitizedQuery(req);
    const limit = Math.min(parseInt(q.limit) || 10, 50);
    const { default: Leaderboard } = await import('../models/Leaderboard.js');

    const top = await Leaderboard.find({})
      .sort({ points: -1 })
      .limit(limit)
      .select('userId username avatar tier points reportsCount rank badges')
      .lean();

    return res.json({ leaderboard: top });
  } catch (error) {
    console.error('communityLeaderboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default { getPosts, createPost, toggleLike, addComment, communityLeaderboard };

