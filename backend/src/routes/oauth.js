import express from "express";
import passport, { oauthProvidersStatus } from "../config/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const stripTrailingSlash = (url = "") => url.replace(/\/$/, "");

// Resolve Base URLs dynamically
const resolveBackendUrl = (req) => {
  if (process.env.BACKEND_URL) return stripTrailingSlash(process.env.BACKEND_URL);
  if (process.env.API_BASE_URL) return stripTrailingSlash(process.env.API_BASE_URL);

  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

const frontendBaseUrl = stripTrailingSlash(
  process.env.FRONTEND_URL || "http://localhost:5173"
);

const mobileRedirectScheme = stripTrailingSlash(
  process.env.MOBILE_APP_SCHEME || "greencity"
);

const buildFrontendUrl = (path) => `${frontendBaseUrl}${path}`;

const buildMobileRedirectUrl = (path, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return `${mobileRedirectScheme}://${path}${qs ? '?' + qs : ''}`;
};

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
router.get("/google", (req, res, next) => {
  if (!oauthProvidersStatus.google) {
    return redirectToLoginWithError(res, "google_oauth_disabled");
  }
  req.session = req.session || {};
  req.session.oauthClient = req.query.client || "web";
  return passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: buildFrontendUrl("/login/user?error=google_auth_failed"),
    session: false
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        const isMobile = req.session?.oauthClient === "expo";
        if (isMobile) {
          return res.redirect(buildMobileRedirectUrl("auth/callback", { error: "authentication_failed" }));
        }
        return res.redirect(
          buildFrontendUrl("/login/user?error=authentication_failed")
        );
      }

      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
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
        isEmailVerified: req.user.isEmailVerified || true
      };

      const isMobile = req.session?.oauthClient === "expo";
      const redirectUrl = isMobile
        ? buildMobileRedirectUrl("auth/callback", { token, user: JSON.stringify(userData) })
        : buildFrontendUrl(
            `/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`
          );
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google auth callback error:", error);
      const isMobile = req.session?.oauthClient === "expo";
      if (isMobile) {
        return res.redirect(buildMobileRedirectUrl("auth/callback", { error: "token_generation_failed" }));
      }
      res.redirect(
        buildFrontendUrl("/login/user?error=token_generation_failed")
      );
    }
  }
);

// GitHub OAuth Routes
router.get(
  "/github",
  authenticateIfEnabled("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: buildFrontendUrl("/login/user?error=github_auth_failed"),
    session: false
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(
          buildFrontendUrl("/login/user?error=authentication_failed")
        );
      }

      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
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
        isEmailVerified: req.user.isEmailVerified || true
      };

      const redirectUrl = buildFrontendUrl(
        `/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`
      );
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("GitHub auth callback error:", error);
      res.redirect(
        buildFrontendUrl("/login/user?error=token_generation_failed")
      );
    }
  }
);

// Link/Unlink routes remain same, but cleaning up status endpoint
router.get("/providers/status", (req, res) => {
  const backendBaseUrl = resolveBackendUrl(req);
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

// ... (existing link/unlink routes)
export default router;
