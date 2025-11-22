import express from 'express';
import passport from 'passport';
import { reportIssue } from '../controllers/issue.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Report an issue with file upload
router.post('/issue', upload.single('image'), reportIssue);

// Get all issues
router.get('/issues', async (req, res) => {
  try {
    const Issue = (await import('../models/issue.js')).default;
    const issues = await Issue.find().populate('username', 'username firstName lastName email').sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching issues', details: error.message });
  }
});

// Get issues by user ID (parameter)
router.get('/issues/user/:userId', async (req, res) => {
  try {
    const Issue = (await import('../models/issue.js')).default;
    const issues = await Issue.find({ username: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user issues', details: error.message });
  }
});

// Get issues for authenticated user (from token) - protected route
router.get('/issues/user', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const Issue = (await import('../models/issue.js')).default;
    // req.user is set by passport JWT strategy
    const userId = req.user._id || req.user.userId;
    const issues = await Issue.find({ username: userId }).sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user issues', details: error.message });
  }
});

export default router;