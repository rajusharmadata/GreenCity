import Issue from '../models/issue.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';

// Create a new issue
export const createIssue = async (req, res) => {
  try {
    const { title, category, description, address, coords } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!title || !category || !description || !address || !coords) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!coords.lat || !coords.lng) {
      return res.status(400).json({ error: 'Coordinates are required' });
    }

    // Validate category
    const validCategories = ['Waste', 'Infrastructure', 'Road Hazard', 'Vandalism', 'Air Quality', 'Water', 'Noise', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    let imageUrl = '';
    
    // Handle image upload
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create issue
    const issue = new Issue({
      title: title.trim(),
      category,
      description: description.trim(),
      address: address.trim(),
      coords: {
        lat: parseFloat(coords.lat),
        lng: parseFloat(coords.lng)
      },
      image: imageUrl,
      userId
    });

    await issue.save();

    // Update user's report count
    await User.findByIdAndUpdate(userId, { $inc: { reportsCount: 1 } });

    // Populate user data for response
    await issue.populate('userId', 'name email avatar');

    res.status(201).json({
      message: 'Issue reported successfully',
      issue: {
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
      }
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all issues with filtering and pagination
export const getIssues = async (req, res) => {
  try {
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

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const issues = await Issue.find(filter)
      .populate('userId', 'name email avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Issue.countDocuments(filter);

    res.json({
      issues,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single issue
export const getIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id)
      .populate('userId', 'name email avatar')
      .exec();

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ issue });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update issue status (admin only)
export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const issue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({
      message: 'Issue status updated successfully',
      issue
    });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upvote issue
export const upvoteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if user already upvoted
    const alreadyUpvoted = issue.upvotedBy.includes(userId);
    
    if (alreadyUpvoted) {
      // Remove upvote
      issue.upvotedBy.pull(userId);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      // Add upvote
      issue.upvotedBy.push(userId);
      issue.upvotes += 1;
    }

    await issue.save();

    // Update user's points (5 points per upvote, -5 for removing upvote)
    const pointChange = alreadyUpvoted ? -5 : 5;
    await User.findByIdAndUpdate(issue.userId, { $inc: { points: pointChange } });

    res.json({
      message: alreadyUpvoted ? 'Upvote removed' : 'Issue upvoted successfully',
      upvotes: issue.upvotes,
      upvoted: !alreadyUpvoted
    });
  } catch (error) {
    console.error('Upvote issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete issue (user can delete their own issues, admin can delete any)
export const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if user owns the issue or is admin
    if (issue.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this issue' });
    }

    // Delete associated image file
    if (issue.image) {
      const imagePath = path.join(process.cwd(), 'src', issue.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Issue.findByIdAndDelete(id);

    // Update user's report count
    await User.findByIdAndUpdate(issue.userId, { $inc: { reportsCount: -1 } });

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  createIssue,
  getIssues,
  getIssue,
  updateIssueStatus,
  upvoteIssue,
  deleteIssue
};