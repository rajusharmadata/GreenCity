import express from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationOTP,
  getMe,
  updateProfile,
  deleteAccount,
  googleMobile
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

import { validate, authSchemas } from '../validations/authValidation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(authSchemas.register), registerUser);
router.post('/login', validate(authSchemas.login), loginUser);           // Mobile uses /login
router.post('/login-user', validate(authSchemas.login), loginUser);      // Web uses /login-user (keep for compatibility)

router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationOTP);
router.post('/google/mobile', googleMobile); // Mobile Google OAuth token exchange

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.patch('/profile', authenticate, updateProfile);   // Mobile uses PATCH
router.post('/profile/avatar', authenticate, uploadSingle('avatar'), updateProfile); // Avatar upload handled in updateProfile
router.delete('/account', authenticate, deleteAccount);  // Delete account

export default router;