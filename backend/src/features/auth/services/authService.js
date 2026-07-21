import User from '../../../models/User.js';
import Issue from '../../../models/Issue.js';
import jwt from 'jsonwebtoken';
import { sendOTPEmail } from '../../../services/emailService.js';
import { ApiError } from '../../../middleware/errorMiddleware.js';
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
  const { name, email, password ,username} = userData;

  if (!email || !password || !name) {
    throw new ApiError(400, 'Missing required fields');
  }

  const normalizedEmail = email.trim().toLowerCase();

  console.time('register:lookupEmail');
  const existingEmailUser = await User.findOne({ email: normalizedEmail });
  console.timeEnd('register:lookupEmail');
  if (existingEmailUser) {
    throw new ApiError(400, 'User already exists with this email');
  }
  const otp = generateOTP();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    username:username,
    password,
    emailVerificationOTP: otp,
    emailVerificationOTPExpiry: otpExpiry,
    isEmailVerified: false
  });

  console.time('register:userSave');
  await user.save();
  console.timeEnd('register:userSave');

  // Fire-and-forget: the client only needs confirmation the account was
  // created, not confirmation the email left the building. Awaiting this
  // ties the HTTP response to SMTP latency, which is exactly what was
  // causing ERR_NETWORK on the client when the mail provider was slow.
  sendOTPEmail(email, otp, name).catch((error) => {
    console.error('Email sending failed in service:', error);
  });

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

  // Same reasoning as register(): don't block the response on SMTP latency.
  // resendOtp's production behavior previously threw a 500 if the email
  // failed — that's now impossible to know synchronously, so we log instead.
  // If you need the client to know delivery failed, track it via a status
  // field on the user or a delivery webhook instead of blocking the request.
  sendOTPEmail(email, otp, user.name).catch((error) => {
    console.error('Resend OTP email failed:', error);
  });

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