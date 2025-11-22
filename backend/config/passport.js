import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import https from 'https';
import User from '../models/auth.js';
import Organization from '../models/organization.js';

dotenv.config();

const stripTrailingSlash = (url = '') => url.replace(/\/$/, '');

const resolveBackendBaseUrl = () => {
  // Priority: BACKEND_URL > API_BASE_URL > VERCEL_URL > localhost
  const explicitBase =
    process.env.BACKEND_URL ||
    process.env.API_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

  if (explicitBase) {
    return stripTrailingSlash(explicitBase);
  }

  // Default to localhost for development
  const port = process.env.PORT || 5000;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://localhost:${port}`;
};

const backendBaseUrl = resolveBackendBaseUrl();

// Define OAuth providers status BEFORE using it
export const oauthProvidersStatus = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
};

// Log OAuth callback URLs for debugging
if (oauthProvidersStatus.google) {
  console.log(`🔐 Google OAuth callback URL: ${backendBaseUrl}/api/auth/google/callback`);
}
if (oauthProvidersStatus.github) {
  console.log(`🔐 GitHub OAuth callback URL: ${backendBaseUrl}/api/auth/github/callback`);
}

const mergeAuthProviders = (currentProvider = 'local', providerToAdd) => {
  const normalized = currentProvider
    .split(',')
    .map((provider) => provider.trim())
    .filter(Boolean)
    .filter((provider) => provider !== 'local');

  if (!normalized.includes(providerToAdd)) {
    normalized.push(providerToAdd);
  }

  return normalized.length ? normalized.sort().join(',') : providerToAdd;
};

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    let user;
    
    if (jwt_payload.role === 'organization') {
      user = await Organization.findById(jwt_payload.orgId);
    } else {
      user = await User.findById(jwt_payload.userId);
    }
    
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy (only configure if credentials are available)
if (oauthProvidersStatus.google) {
  passport.use(
    new GoogleStrategy(
      {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${backendBaseUrl}/api/auth/google/callback`,
    scope: ['profile', 'email']
      },
      async (_accessToken, _refreshToken, profile, done) => {
    try {
          const email = profile.emails?.[0]?.value;
      
          if (!email) {
            return done(new Error('Google profile did not include an email address'), null);
          }
          
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create new user from Google profile
        user = new User({
          googleId: profile.id,
              email,
              firstName: profile.name?.givenName || profile.displayName || email.split('@')[0],
              lastName: profile.name?.familyName || '',
          username: profile.displayName || email.split('@')[0],
              profilePicture: profile.photos?.[0]?.value,
          role: 'user',
          isEmailVerified: true,
          authProvider: 'google'
        });
          } else {
            user.googleId = user.googleId || profile.id;
            user.profilePicture = user.profilePicture || profile.photos?.[0]?.value;
            user.authProvider = mergeAuthProviders(user.authProvider, 'google');
          }
        
        await user.save();
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
      }
    )
  );
}

const fetchGithubPrimaryEmail = async (accessToken) => {
  return new Promise((resolve) => {
    const request = https.request(
      {
        hostname: 'api.github.com',
        path: '/user/emails',
        method: 'GET',
        headers: {
          Authorization: `token ${accessToken}`,
          'User-Agent': 'GreenCity-App',
          Accept: 'application/vnd.github+json'
        }
      },
      (response) => {
        let body = '';

        response.on('data', (chunk) => {
          body += chunk;
        });

        response.on('end', () => {
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            try {
              const emails = JSON.parse(body);
              const primary = emails.find((item) => item.primary && item.verified);
              resolve((primary || emails[0])?.email || null);
              return;
            } catch (error) {
              console.error('Failed to parse GitHub email response:', error);
            }
          } else {
            console.error('GitHub email API responded with status:', response.statusCode, body);
          }

          resolve(null);
        });
      }
    );

    request.on('error', (error) => {
      console.error('GitHub email fetch failed:', error);
      resolve(null);
    });

    request.end();
  });
};

// GitHub OAuth Strategy (only configure if credentials are available)
if (oauthProvidersStatus.github) {
  passport.use(
    new GitHubStrategy(
      {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${backendBaseUrl}/api/auth/github/callback`,
    scope: ['user:email']
      },
      async (accessToken, _refreshToken, profile, done) => {
    try {
          let email = profile.emails?.[0]?.value;
          
          if (!email) {
            email = await fetchGithubPrimaryEmail(accessToken);
          }
      
      if (!email) {
            return done(new Error('Unable to retrieve GitHub email. Please ensure your email is accessible.'), null);
      }
      
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create new user from GitHub profile
        user = new User({
          githubId: profile.id,
              email,
              firstName: profile.displayName || profile.username || email.split('@')[0],
          lastName: '',
              username: profile.username || email.split('@')[0],
              profilePicture: profile.photos?.[0]?.value,
          role: 'user',
          isEmailVerified: true,
          authProvider: 'github'
        });
          } else {
            user.githubId = user.githubId || profile.id;
            user.profilePicture = user.profilePicture || profile.photos?.[0]?.value;
            user.authProvider = mergeAuthProviders(user.authProvider, 'github');
          }
        
        await user.save();
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
      }
    )
  );
}

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
