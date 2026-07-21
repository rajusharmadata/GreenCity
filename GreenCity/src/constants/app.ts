export const API_BASE_URL =  'http://172.28.84.164:8080/api';

export const SCREEN_NAMES = {
  AUTH: {
    LOGIN: 'login',
    REGISTER: 'register',
    VERIFY_EMAIL: 'verify-email',
  },
  TABS: {
    HOME: '(tabs)',
    DASHBOARD: 'dashboard',
    REPORT: 'report',
    ECO_ROUTES: 'eco-routes',
    COMMUNITY: 'community',
    PROFILE: 'profile',
  },
  MODAL: {
    REPORT_DETAIL: 'report-detail',
    LEADERBOARD: 'leaderboard',
    BADGES: 'badges',
    ECO_ROUTE_MAP: 'eco-route-map',
  },
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  PERMISSIONS_GRANTED: 'permissions_granted',
};

export const POINTS = {
  REPORT_ISSUE: 10,
  SOLVE_ISSUE: 25,
  ECO_ROUTE: 15,
  DAILY_LOGIN: 5,
  REFERRAL: 50,
};

export const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 100,
  GOLD: 500,
  PLATINUM: 1000,
  DIAMOND: 5000,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number.',
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Logged out successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  REPORT_SUBMITTED: 'Report submitted successfully!',
  ISSUE_SOLVED: 'Issue marked as solved!',
};
