import User from '../models/User.js';
import Issue from '../models/issue.js';
import jwt from 'jsonwebtoken';
import { sendOTPEmail } from '../utils/emailService.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Service to handle all Authentication business logic.
 * Decoupled from HTTP controllers for scalability and testability.
 */

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// Helper to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (userData) => {
  const { name, email, password, username } = userData;

  if (!email || !password || !name) {
    throw new ApiError(400, 'Missing required fields');
  }

  const normalizedEmail = email.trim().toLowerCase();
  // Your Mongo collection has a unique index on `username`; default it to email
  // to avoid inserting `username: null` (E11000 duplicate key).
  const normalizedUsername = (username && username.trim().length > 0)
    ? username.trim().toLowerCase()
    : normalizedEmail;

  const existingEmailUser = await User.findOne({ email: normalizedEmail });
  if (existingEmailUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  const existingUsernameUser = await User.findOne({ username: normalizedUsername });
  if (existingUsernameUser) {
    throw new ApiError(400, 'User already exists with this username');
  }

  const otp = generateOTP();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

  const user = new User({
    username: normalizedUsername,
    name: name.trim(),
    email: normalizedEmail,
    password,
    emailVerificationOTP: otp,
    emailVerificationOTPExpiry: otpExpiry,
    isEmailVerified: false
  });

  await user.save();

  try {
    await sendOTPEmail(email, otp, name);
  } catch (error) {
    console.error('Email sending failed in service:', error);
  }

  return { user, otp };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(401, 'Please verify your email before logging in', { requiresVerification: true, email: user.email });
  }

  if (!user.password) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user._id);
  await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

  const resolvedCount = await Issue.countDocuments({
    userId: user._id,
    status: 'Resolved'
  });

  return { token, user, resolvedCount };
};

export const verifyEmail = async (email, otp) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isEmailVerified) throw new ApiError(400, 'Email already verified');
  if (user.emailVerificationOTPExpiry && new Date() > user.emailVerificationOTPExpiry) {
    throw new ApiError(400, 'OTP has expired');
  }
  if (user.emailVerificationOTP !== otp) throw new ApiError(400, 'Invalid OTP');

  user.isEmailVerified = true;
  user.emailVerificationOTP = null;
  user.emailVerificationOTPExpiry = null;
  await user.save();

  const token = generateToken(user._id);
  return { token, user };
};

export const resendOtp = async (email) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isEmailVerified) throw new ApiError(400, 'Email already verified');

  const otp = generateOTP();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

  user.emailVerificationOTP = otp;
  user.emailVerificationOTPExpiry = otpExpiry;
  await user.save();

  try {
    await sendOTPEmail(email, otp, user.name);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw new ApiError(500, 'Failed to send verification email');
    }
  }

  return { otp };
};

export const socialAuth = async (googleUser) => {
  const normalizedEmail = googleUser.email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });
  
  if (!user) {
    user = new User({
      name: googleUser.name || 'Google User',
      email: normalizedEmail,
      username: normalizedEmail, // keep Mongo unique index satisfied
      googleId: googleUser.sub,
      avatar: googleUser.picture || '',
      isEmailVerified: true
    });
    await user.save();
  } else if (!user.googleId) {
    user.googleId = googleUser.sub;
    if (!user.username) user.username = normalizedEmail;
    if (!user.avatar && googleUser.picture) user.avatar = googleUser.picture;
    user.isEmailVerified = true;
    await user.save();
  }

  const token = generateToken(user._id);
  return { token, user };
};

export const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  await User.findByIdAndDelete(userId);
};

export default {
  register,
  login,
  verifyEmail,
  resendOtp,
  socialAuth,
  deleteAccount,
  generateToken
};
