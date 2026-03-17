import authService from '../services/authService.js';
import User from '../models/User.js';
import Issue from '../models/issue.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Controller to handle HTTP requests for Authentication.
 * Thin layer that delegates business logic to authService.
 * Standardizes response format: { success: true, data: { ... } }
 */

export const registerUser = asyncHandler(async (req, res) => {
  const { user, otp } = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'User created successfully. Please verify your email.',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: false
      },
      ...(process.env.NODE_ENV !== 'production' && { otp })
    }
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user, resolvedCount } = await authService.login(email, password);

  res.json({
    success: true,
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        tier: user.tier,
        points: user.points,
        rank: user.rank,
        badges: user.badges,
        reportsCount: user.reportsCount,
        resolvedCount,
        isEmailVerified: user.isEmailVerified
      }
    }
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { token, user } = await authService.verifyEmail(email, otp);

  res.json({
    success: true,
    message: 'Email verified successfully',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        tier: user.tier,
        points: user.points,
        rank: user.rank,
        badges: user.badges,
        reportsCount: user.reportsCount,
        isEmailVerified: true
      }
    }
  });
});

export const resendVerificationOTP = asyncHandler(async (req, res) => {
  const { otp } = await authService.resendOtp(req.body.email);
  res.json({
    success: true,
    message: 'Verification OTP sent successfully',
    data: {
      ...(process.env.NODE_ENV !== 'production' && { otp })
    }
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  if (!user) throw new ApiError(404, 'User not found');

  const resolvedCount = await Issue.countDocuments({
    userId: user._id,
    status: 'Resolved'
  });

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        tier: user.tier,
        points: user.points,
        rank: user.rank,
        badges: user.badges,
        reportsCount: user.reportsCount,
        resolvedCount,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const updateData = { ...req.body };

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'greencity_avatars'
    });
    await fs.unlink(req.file.path).catch(() => { });
    updateData.avatar = result.secure_url;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

export const googleMobile = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) throw new ApiError(400, 'Access token is required');

  const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
  if (!googleRes.ok) throw new ApiError(401, 'Invalid Google access token');

  const googleUser = await googleRes.json();
  const { token, user } = await authService.socialAuth(googleUser);

  res.json({
    success: true,
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        tier: user.tier,
        points: user.points,
        rank: user.rank,
        badges: user.badges,
        reportsCount: user.reportsCount,
        isEmailVerified: user.isEmailVerified
      }
    }
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.user.userId);
  res.json({ success: true, message: 'Account deleted successfully' });
});

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=${encodeURIComponent(err.message)}`);
    }
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=${encodeURIComponent('Authentication failed')}`);
    }

    const token = authService.generateToken(user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  })(req, res, next);
};

export default {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationOTP,
  getMe,
  updateProfile,
  deleteAccount,
  googleMobile,
  googleCallback
};

