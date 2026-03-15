import Post from '../models/Post.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';

export const fetchPosts = async (filter, page = 1, limit = 20, lat, lng, radiusKm) => {
  const mongoFilter = {};
  if (['eco-tips', 'reports', 'events', 'tips', 'news'].includes(filter)) {
    mongoFilter.filterTag = filter;
  }

  if (filter === 'near' && lat && lng) {
    const deg = (radiusKm || 5) / 111;
    mongoFilter['location.lat'] = { $gte: lat - deg, $lte: lat + deg };
    mongoFilter['location.lng'] = { $gte: lng - deg, $lte: lng + deg };
  }

  const posts = await Post.find(mongoFilter)
    .populate('userId', 'name avatar tier points')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Post.countDocuments(mongoFilter);

  return { posts, total };
};

export const createNewPost = async (userId, postData, filePath) => {
  let imageUrl = '';
  if (filePath) {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'greencity_community',
      resource_type: 'image'
    });
    imageUrl = result.secure_url;
    await fs.unlink(filePath).catch(() => {});
  }

  const { text, filterTag, lat, lng, address, tags } = postData;
  
  const post = await Post.create({
    userId,
    text: text.trim(),
    imageUrl,
    filterTag: filterTag || 'all',
    tags: tags || [],
    location: { lat, lng, address }
  });

  return Post.findById(post._id).populate('userId', 'name avatar tier points').lean();
};

export const addPostComment = async (postId, userId, text) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Post not found');
  post.comments.push({ userId, text: text.trim() });
  await post.save();
  return post.comments.length;
};

export const togglePostLike = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Post not found');
  const index = post.likes.indexOf(userId);
  if (index === -1) post.likes.push(userId);
  else post.likes.splice(index, 1);
  await post.save();
  return { liked: index === -1, count: post.likes.length };
};

export const communityLeaderboard = async (limit = 10) => {
  const { default: Leaderboard } = await import('../models/Leaderboard.js');
  return Leaderboard.find({})
    .sort({ points: -1 })
    .limit(limit)
    .select('userId username avatar tier points reportsCount rank badges')
    .lean();
};

