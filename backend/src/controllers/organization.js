import Organization from '../models/organization.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { sendOTPEmail } from '../utils/emailService.js';

const OTP_EXPIRY_MINUTES = 10;
const TOKEN_EXPIRY_HOURS = 24;
const OTP_COOLDOWN_MS = 60_000; // 1 minute
const OTP_MAX_ATTEMPTS = 5;
const VALID_TRANSPORT_TYPES = ['Bus', 'Train', 'Metro', 'SharedCab', 'Car', 'Bike', 'Other'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

const buildOtpFields = () => {
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);
  const verificationToken = generateVerificationToken();
  const verificationTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 3_600_000);

  return {
    emailVerificationOTP: otp,
    emailVerificationOTPExpiry: otpExpiry,
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpiry: verificationTokenExpiry,
    otp // returned separately so callers can send it via email
  };
};

const toPublicOrg = (org, extra = {}) => ({
  _id: org._id,
  organizationName: org.organizationName,
  organizationId: org.organizationId,
  email: org.email,
  phone: org.phone,
  transportTypes: org.transportTypes || [],
  role: org.role,
  ...extra
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/organizations/signup
// ─────────────────────────────────────────────────────────────────────────────
export const signupOrganization = asyncHandler(async (req, res) => {
  const { organizationName, address, organizationId, email, phone, transportTypes, password } = req.body;

  if (!organizationName?.trim()) throw new ApiError(400, 'Organization name is required');
  if (!address?.trim()) throw new ApiError(400, 'Address is required');
  if (!organizationId?.trim()) throw new ApiError(400, 'Organization ID is required');
  if (!email?.trim()) throw new ApiError(400, 'Email is required');
  if (!EMAIL_REGEX.test(email.trim())) throw new ApiError(400, 'Please enter a valid email address');
  if (!phone) throw new ApiError(400, 'Phone number is required');

  const phoneNumber = typeof phone === 'string' ? parseInt(phone.replace(/\D/g, ''), 10) : phone;
  if (isNaN(phoneNumber) || phoneNumber.toString().length < 10) {
    throw new ApiError(400, 'Please enter a valid phone number (minimum 10 digits)');
  }

  if (!password) throw new ApiError(400, 'Password is required');
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters long');

  const finalTransportTypes = Array.isArray(transportTypes) ? transportTypes : [];
  if (finalTransportTypes.length > 0) {
    const invalidTypes = finalTransportTypes.filter((t) => !VALID_TRANSPORT_TYPES.includes(t));
    if (invalidTypes.length > 0) {
      throw new ApiError(400, `Invalid transport types: ${invalidTypes.join(', ')}`);
    }
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOrgId = organizationId.trim();

  const existingOrganization = await Organization.findOne({
    $or: [{ email: normalizedEmail }, { phone: phoneNumber }, { organizationId: normalizedOrgId }]
  });

  if (existingOrganization) {
    if (existingOrganization.email === normalizedEmail) {
      throw new ApiError(400, 'An organization with this email already exists');
    }
    if (existingOrganization.organizationId === normalizedOrgId) {
      throw new ApiError(400, 'An organization with this ID already exists');
    }
    if (existingOrganization.phone === phoneNumber) {
      throw new ApiError(400, 'An organization with this phone number already exists');
    }
    throw new ApiError(400, 'Organization already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { otp, ...otpFields } = buildOtpFields();

  const newOrganization = await Organization.create({
    organizationName: organizationName.trim(),
    address: address.trim(),
    organizationId: normalizedOrgId,
    email: normalizedEmail,
    phone: phoneNumber,
    transportTypes: finalTransportTypes,
    password: hashedPassword,
    isEmailVerified: false,
    otpAttempts: 0,
    ...otpFields
  });

  // Don't fail registration if the email provider hiccups — log and move on.
  await sendOTPEmail(normalizedEmail, otp, organizationName.trim()).catch((emailError) => {
    console.error('Error sending OTP email:', emailError);
  });

  res.status(201).json({
    success: true,
    message:
      'Transport organization registered successfully. Please verify your email with the OTP sent to your email address.',
    data: {
      organization: toPublicOrg(newOrganization, { isEmailVerified: false }),
      requiresVerification: true
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/organizations/login
// ─────────────────────────────────────────────────────────────────────────────
export const loginOrganization = asyncHandler(async (req, res) => {
  const { email, organizationId, password } = req.body;

  if (!password) throw new ApiError(400, 'Password is required');
  if (!email && !organizationId) throw new ApiError(400, 'Email or Organization ID is required');

  const normalizedEmail = email ? email.trim().toLowerCase() : null;
  const query = normalizedEmail ? { email: normalizedEmail } : { organizationId: organizationId.trim() };

  const organization = await Organization.findOne(query);
  if (!organization) throw new ApiError(401, 'Invalid email or password');

  const isPasswordValid = await bcrypt.compare(password, organization.password);
  if (!isPasswordValid) throw new ApiError(401, 'Invalid email or password');

  if (!organization.isEmailVerified) {
    // Returned directly (not thrown as ApiError) because the response needs
    // extra fields — requiresVerification/email — that a generic error
    // middleware likely wouldn't forward.
    return res.status(403).json({
      success: false,
      error: 'Please verify your email before logging in.',
      requiresVerification: true,
      email: organization.email
    });
  }

  const token = jwt.sign(
    { orgId: organization._id, email: organization.email, role: 'organization' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { token, organization: toPublicOrg(organization) }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/organizations/me
// ─────────────────────────────────────────────────────────────────────────────
export const getOrganizationProfile = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.user._id || req.user.orgId).select('-password');
  if (!organization) throw new ApiError(404, 'Organization not found');

  res.status(200).json({ success: true, data: { organization } });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/organizations/verify-email — supports both OTP and legacy token
// ─────────────────────────────────────────────────────────────────────────────
export const verifyOrganizationEmail = asyncHandler(async (req, res) => {
  const { otp, token, email } = req.body;

  if (!email) throw new ApiError(400, 'Email is required');
  if (!otp && !token) throw new ApiError(400, 'Either OTP or token is required');

  const organization = await Organization.findOne({ email: email.trim().toLowerCase() });
  if (!organization) throw new ApiError(404, 'Organization not found');

  if (organization.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: 'Email already verified',
      data: { organization: toPublicOrg(organization, { isEmailVerified: true }) }
    });
  }

  if (otp) {
    const now = new Date();
    const withinCooldown =
      organization.otpLastAttempt && now - organization.otpLastAttempt < OTP_COOLDOWN_MS;

    if (withinCooldown && organization.otpAttempts >= OTP_MAX_ATTEMPTS) {
      throw new ApiError(429, 'Too many attempts. Please wait 1 minute before trying again.');
    }
    if (!withinCooldown) {
      organization.otpAttempts = 0;
    }

    if (organization.emailVerificationOTP !== otp) {
      organization.otpAttempts = (organization.otpAttempts || 0) + 1;
      organization.otpLastAttempt = now;
      await organization.save();
      throw new ApiError(400, 'Invalid OTP');
    }

    if (!organization.emailVerificationOTPExpiry || organization.emailVerificationOTPExpiry < new Date()) {
      throw new ApiError(400, 'OTP has expired. Please request a new one.');
    }

    Object.assign(organization, {
      isEmailVerified: true,
      emailVerificationOTP: null,
      emailVerificationOTPExpiry: null,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
      otpAttempts: 0,
      otpLastAttempt: null
    });
    await organization.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: { organization: toPublicOrg(organization, { isEmailVerified: true }) }
    });
  }

  // Legacy token verification path
  if (organization.emailVerificationToken !== token) {
    throw new ApiError(400, 'Invalid verification token');
  }
  if (!organization.emailVerificationTokenExpiry || organization.emailVerificationTokenExpiry < new Date()) {
    throw new ApiError(400, 'Verification token has expired. Please request a new one.');
  }

  Object.assign(organization, {
    isEmailVerified: true,
    emailVerificationOTP: null,
    emailVerificationOTPExpiry: null,
    emailVerificationToken: null,
    emailVerificationTokenExpiry: null
  });
  await organization.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: { organization: toPublicOrg(organization, { isEmailVerified: true }) }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/organizations/resend-verification
// ─────────────────────────────────────────────────────────────────────────────
export const resendOrganizationVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');

  const organization = await Organization.findOne({ email: email.trim().toLowerCase() });
  if (!organization) throw new ApiError(404, 'Organization not found');
  if (organization.isEmailVerified) throw new ApiError(400, 'Email already verified');

  const now = new Date();
  const stillFresh =
    organization.emailVerificationOTPExpiry &&
    organization.emailVerificationOTPExpiry.getTime() - now.getTime() > 540_000; // >9 min left

  if (stillFresh) {
    throw new ApiError(
      429,
      'Please wait before requesting a new OTP. You can request a new OTP after the current one expires.'
    );
  }

  const { otp, ...otpFields } = buildOtpFields();
  Object.assign(organization, otpFields, { otpAttempts: 0, otpLastAttempt: null });
  await organization.save();

  try {
    await sendOTPEmail(organization.email, otp, organization.organizationName);
  } catch (emailError) {
    console.error('Error sending OTP email:', emailError);
    throw new ApiError(500, 'Failed to send verification email. Please try again later.');
  }

  res.status(200).json({
    success: true,
    message: 'Verification email sent successfully',
    data: { email: organization.email }
  });
});

export default {
  signupOrganization,
  loginOrganization,
  getOrganizationProfile,
  verifyOrganizationEmail,
  resendOrganizationVerification
};