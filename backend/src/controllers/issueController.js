import Issue from '../models/Issue.js';
import User from '../models/User.js';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { addPoints } from './leaderboardController.js';

const VALID_CATEGORIES = [
  'Waste',
  'Infrastructure',
  'Road Hazard',
  'Vandalism',
  'Air Quality',
  'Water',
  'Noise',
  'Other'
];

const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved'];

const POINTS_PER_ISSUE = 50;
const POINTS_PER_UPVOTE = 5;

const shapeIssue = (issue) => ({
  _id: issue._id,
  title: issue.title,
  category: issue.category,
  description: issue.description,
  address: issue.address,
  coords: issue.coords,
  image: issue.image,
  status: issue.status,
  integrity: issue.integrity,
  upvotes: issue.upvotes,
  userId: issue.userId,
  createdAt: issue.createdAt
});

// Best-effort local file cleanup after a Cloudinary upload attempt.
const cleanupLocalFile = (filePath) => {
  if (!filePath) return;
  fs.existsSync(filePath) && fs.unlink(filePath, () => {});
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/issues
// ─────────────────────────────────────────────────────────────────────────────
export const createIssue = asyncHandler(async (req, res) => {
  const { title, category, description, address } = req.body;
  const userId = req.user.userId;

  if (!title || !category || !description || !address) {
    throw new ApiError(400, 'All fields are required');
  }

  if (!VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, 'Invalid category');
  }

  // Frontend FormData sends flat lat/lng rather than a nested coords object.
  const lat = req.body.lat ?? req.body['coords[lat]'];
  const lng = req.body.lng ?? req.body['coords[lng]'];
  const coords = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

  let imageUrl = '';
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: process.env.CLOUDINARY_ISSUE_FOLDER || 'greencity_issues',
        resource_type: 'image'
      });
      imageUrl = result.secure_url;
    } finally {
      cleanupLocalFile(req.file.path);
    }
  }

  const issue = await Issue.create({
    title: title.trim(),
    category,
    description: description.trim(),
    address: address.trim(),
    ...(coords && { coords }),
    image: imageUrl,
    userId
  });

  // Fire these together — neither depends on the other's result.
  await Promise.all([
    User.findByIdAndUpdate(userId, { $inc: { reportsCount: 1 } }),
    addPoints(userId, POINTS_PER_ISSUE, 'Issue report')
  ]);

  await issue.populate('userId', 'name email avatar tier');

  res.status(201).json({
    success: true,
    message: 'Issue reported successfully',
    data: { issue: shapeIssue(issue) }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/issues
// ─────────────────────────────────────────────────────────────────────────────
export const getIssues = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    status,
    userId,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (userId) filter.userId = userId;

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Number(limit) || 10, 100);

  const [issues, total] = await Promise.all([
    Issue.find(filter)
      .populate('userId', 'name email avatar tier')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean(),
    Issue.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      issues,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/issues/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
    .populate('userId', 'name email avatar tier')
    .lean();

  if (!issue) throw new ApiError(404, 'Issue not found');

  res.json({ success: true, data: { issue } });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/issues/:id/status
// ─────────────────────────────────────────────────────────────────────────────
export const updateIssueStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) throw new ApiError(400, 'Status is required');
  if (!VALID_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status');

  const issue = await Issue.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('userId', 'name email avatar');

  if (!issue) throw new ApiError(404, 'Issue not found');

  res.json({ success: true, message: 'Status updated', data: { issue } });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/issues/:id/upvote
// ─────────────────────────────────────────────────────────────────────────────
export const upvoteIssue = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const issue = await Issue.findById(req.params.id);

  if (!issue) throw new ApiError(404, 'Issue not found');

  const alreadyUpvoted = issue.upvotedBy.includes(userId);

  if (alreadyUpvoted) {
    issue.upvotedBy.pull(userId);
    issue.upvotes = Math.max(0, issue.upvotes - 1);
  } else {
    issue.upvotedBy.push(userId);
    issue.upvotes += 1;
  }

  await issue.save();
  await addPoints(issue.userId, alreadyUpvoted ? -POINTS_PER_UPVOTE : POINTS_PER_UPVOTE, 'Issue upvote');

  res.json({
    success: true,
    message: alreadyUpvoted ? 'Upvote removed' : 'Upvoted successfully',
    data: { upvotes: issue.upvotes, upvoted: !alreadyUpvoted }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/issues/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteIssue = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const issue = await Issue.findById(req.params.id);

  if (!issue) throw new ApiError(404, 'Issue not found');

  if (issue.userId.toString() !== userId && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  // NOTE: issue.image is a Cloudinary secure_url, not a local path — this
  // fs check will never match. Local cleanup only makes sense if you switch
  // back to disk storage for issue images; safe to remove if not needed.
  if (issue.image && fs.existsSync(issue.image)) {
    fs.unlinkSync(issue.image);
  }

  await Promise.all([
    Issue.findByIdAndDelete(req.params.id),
    User.findByIdAndUpdate(issue.userId, { $inc: { reportsCount: -1 } })
  ]);

  res.json({ success: true, message: 'Issue deleted successfully' });
});

export default {
  createIssue,
  getIssues,
  getIssue,
  updateIssueStatus,
  upvoteIssue,
  deleteIssue
};