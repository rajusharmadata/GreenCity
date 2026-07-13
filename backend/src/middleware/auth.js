import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const extractToken = (req) => req.header('Authorization')?.replace('Bearer ', '');

const toReqUser = (user) => ({
  userId: user._id.toString(),
  email: user.email,
  role: user.role || 'user'
});

// Verify JWT token — required for protected routes
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = toReqUser(user);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Require admin role — use after `authenticate` in the middleware chain
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Attaches req.user if a valid token is present, but never blocks the
// request — for public routes that can optionally use user context
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) req.user = toReqUser(user);
    }
    next();
  } catch (error) {
    // Silently continue unauthenticated — this route doesn't require a token
    next();
  }
};

export default {
  authenticate,
  isAdmin,
  optionalAuth
};