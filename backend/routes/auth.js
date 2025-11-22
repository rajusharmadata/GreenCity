import express from 'express';
import passport from 'passport';
import {signup, login, signupUser, loginUser, signupAdmin, loginAdmin, loginOrganization, refreshAuth, getUserProfile, verifyEmail, resendVerificationEmail} from '../controllers/auth.js';

const router = express.Router();

// Legacy endpoints
router.post('/signup', signup);
router.post('/login', login);

// User endpoints
router.post('/signup-user', signupUser);
router.post('/login-user', loginUser);

// Admin endpoints  
router.post('/signup-admin', signupAdmin);
router.post('/login-admin', loginAdmin);

// Organization endpoints
router.post('/login-org', loginOrganization);

// Profile endpoint (protected)
router.get('/profile', passport.authenticate('jwt', { session: false }), getUserProfile);

// Email verification endpoints
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Refresh endpoint
router.get('/refresh', refreshAuth);

export default router;