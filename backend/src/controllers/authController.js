import User from '../models/User.js';
import Issue from '../models/issue.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendOTPEmail } from '../utils/emailService.js';
import passport from 'passport';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// User registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password, // Will be hashed by pre-save hook
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: otpExpiry,
      isEmailVerified: false
    });

    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'Failed to send verification email' });
      }
    }

    res.status(201).json({
      message: 'User created successfully. Please verify your email with the OTP sent to your email.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: false
      },
      // Return OTP in development for testing
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// User login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        error: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last active
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    // Count resolved issues
    const resolvedCount = await Issue.countDocuments({
      userId: user._id,
      status: 'Resolved'
    });

    res.json({
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
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify email with OTP
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Check OTP expiry
    if (user.emailVerificationOTPExpiry && new Date() > user.emailVerificationOTPExpiry) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Verify OTP
    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpiry = null;
    await user.save();

    // Generate token for immediate login
    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully',
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
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Resend verification OTP
export const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'Failed to send verification email' });
      }
    }

    res.json({
      message: 'Verification OTP sent successfully',
      // Return OTP in development for testing
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });
  } catch (error) {
    console.error('Resend verification OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user - returns flat user object (mobile expects res.data directly)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Count resolved issues
    const resolvedCount = await Issue.countDocuments({
      userId: user._id,
      status: 'Resolved'
    });

    // Return flat user object (not nested under 'user')
    res.json({
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
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const body = req.body || {};
    const { name, bio, location } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (location !== undefined) updateData.location = location.trim();

    // Handle avatar upload via req.file (upload to Cloudinary)
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: process.env.CLOUDINARY_AVATAR_FOLDER || 'greencity_avatars',
          resource_type: 'image'
        });
        // Clean up local temp file
        await fs.unlink(req.file.path).catch(() => {});
        updateData.avatar = result.secure_url;
      } catch (e) {
        // Best-effort cleanup
        if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
        return res.status(500).json({ error: 'Failed to upload avatar' });
      }
    } else if (body.avatar !== undefined) {
      updateData.avatar = body.avatar.trim();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If this was an avatar upload request, return a minimal payload mobile expects
    if (req.file) {
      return res.json({
        message: 'Avatar updated successfully',
        avatar: user.avatar
      });
    }

    return res.json({
      message: 'Profile updated successfully',
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
        reportsCount: user.reportsCount
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Google Mobile OAuth - exchange accessToken for app JWT
export const googleMobile = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Fetch user info from Google
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    if (!googleRes.ok) {
      return res.status(401).json({ error: 'Invalid Google access token' });
    }
    const googleUser = await googleRes.json();

    // Find or create user
    let user = await User.findOne({ email: googleUser.email.toLowerCase() });
    if (!user) {
      user = new User({
        name: googleUser.name || googleUser.given_name || 'Google User',
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.sub,
        avatar: googleUser.picture || '',
        isEmailVerified: true
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleUser.sub;
      if (!user.avatar && googleUser.picture) user.avatar = googleUser.picture;
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);
    return res.json({
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
    });
  } catch (error) {
    console.error('Google mobile OAuth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Google OAuth callback
export const googleCallback = (req, res) => {
  // This will be handled by passport
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=${encodeURIComponent(err.message)}`);
    }
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=${encodeURIComponent('Authentication failed')}`);
    }

    const token = generateToken(user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  })(req, res);
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
