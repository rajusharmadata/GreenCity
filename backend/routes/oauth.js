import express from 'express';
import passport, { oauthProvidersStatus } from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const stripTrailingSlash = (url = '') => url.replace(/\/$/, '');
const frontendBaseUrl = stripTrailingSlash(process.env.FRONTEND_URL || 'http://localhost:5173');
const backendBaseUrl = stripTrailingSlash(
  process.env.BACKEND_URL ||
    process.env.API_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 5000}`)
);

const buildFrontendUrl = (path) => `${frontendBaseUrl}${path}`;

const redirectToLoginWithError = (res, errorCode) => {
  return res.redirect(buildFrontendUrl(`/login/user?error=${errorCode}`));
};

const authenticateIfEnabled = (provider, options) => {
  return (req, res, next) => {
    if (!oauthProvidersStatus[provider]) {
      return redirectToLoginWithError(res, `${provider}_oauth_disabled`);
    }
    return passport.authenticate(provider, options)(req, res, next);
  };
};

// Google OAuth Routes
router.get('/google', (req, res, next) => {
  if (!oauthProvidersStatus.google) {
    return redirectToLoginWithError(res, 'google_oauth_disabled');
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { 
        failureRedirect: buildFrontendUrl('/login/user?error=google_auth_failed'),
    session: false 
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(buildFrontendUrl('/login/user?error=authentication_failed'));
      }

      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      const userData = {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
        authProvider: req.user.authProvider,
        isEmailVerified: req.user.isEmailVerified || true // OAuth emails are pre-verified
      };

      // Redirect to frontend with token
      const redirectUrl = buildFrontendUrl(`/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(buildFrontendUrl('/login/user?error=token_generation_failed'));
    }
  }
);

// GitHub OAuth Routes
router.get('/github', authenticateIfEnabled('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { 
        failureRedirect: buildFrontendUrl('/login/user?error=github_auth_failed'),
    session: false 
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(buildFrontendUrl('/login/user?error=authentication_failed'));
      }

      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      const userData = {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
        authProvider: req.user.authProvider,
        isEmailVerified: req.user.isEmailVerified || true // OAuth emails are pre-verified
      };

      // Redirect to frontend with token
      const redirectUrl = buildFrontendUrl(`/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub auth callback error:', error);
      res.redirect(buildFrontendUrl('/login/user?error=token_generation_failed'));
    }
  }
);

// Link OAuth accounts
router.post('/link/google', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = req.user;
    if (user.googleId) {
      return res.status(400).json({ error: 'Google account already linked' });
    }
    
    // This would be handled by the OAuth flow
    res.json({ message: 'Please complete Google OAuth to link account' });
  } catch (error) {
    console.error('Link Google error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/link/github', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = req.user;
    if (user.githubId) {
      return res.status(400).json({ error: 'GitHub account already linked' });
    }
    
    // This would be handled by the OAuth flow
    res.json({ message: 'Please complete GitHub OAuth to link account' });
  } catch (error) {
    console.error('Link GitHub error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlink OAuth accounts
router.post('/unlink/google', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = req.user;
    if (!user.googleId) {
      return res.status(400).json({ error: 'Google account not linked' });
    }
    
    user.googleId = undefined;
    user.authProvider = user.authProvider.replace(',google', '').replace('google,', '').replace('google', '');
    await user.save();
    
    res.json({ message: 'Google account unlinked successfully' });
  } catch (error) {
    console.error('Unlink Google error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/unlink/github', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = req.user;
    if (!user.githubId) {
      return res.status(400).json({ error: 'GitHub account not linked' });
    }
    
    user.githubId = undefined;
    user.authProvider = user.authProvider.replace(',github', '').replace('github,', '').replace('github', '');
    await user.save();
    
    res.json({ message: 'GitHub account unlinked successfully' });
  } catch (error) {
    console.error('Unlink GitHub error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OAuth provider status endpoint
router.get('/providers/status', (req, res) => {
  res.json({
    google: {
      enabled: oauthProvidersStatus.google,
      callbackURL: `${backendBaseUrl}/api/auth/google/callback`
    },
    github: {
      enabled: oauthProvidersStatus.github,
      callbackURL: `${backendBaseUrl}/api/auth/github/callback`
    }
  });
});

export default router;
