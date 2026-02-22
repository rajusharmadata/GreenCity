import express from 'express';
import passport from 'passport';
import {
    signupOrganization, 
    loginOrganization, 
    getOrganizationProfile,
    verifyOrganizationEmail,
    resendOrganizationVerification
} from '../controllers/organization.js';

const router = express.Router();

router.post('/signup', signupOrganization);
router.post('/login', loginOrganization);

// Email verification endpoints
router.post('/verify-email', verifyOrganizationEmail);
router.post('/resend-verification', resendOrganizationVerification);

// Profile endpoint (protected)
router.get('/profile', passport.authenticate('jwt', { session: false }), getOrganizationProfile);

export default router;