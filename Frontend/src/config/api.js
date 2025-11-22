const isDevelopment = import.meta.env.DEV;

const stripTrailingSlash = (url = '') => url.replace(/\/+$/, '');

const envBaseUrl = [
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.VITE_API_URL,
  import.meta.env.VITE_BACKEND_URL
].map(stripTrailingSlash).find(Boolean);

/**
 * API_BASE_URL represents the host where the backend is served.
 * In development we leverage Vite's proxy so an empty base keeps requests relative.
 */
export const API_BASE_URL = envBaseUrl ?? (isDevelopment ? '' : 'http://localhost:5000');

/**
 * API_ROOT always includes the /api prefix exactly once, regardless of how API_BASE_URL is defined.
 */
const ensureApiPrefix = (base) => {
  if (!base) return '/api';
  return base.endsWith('/api') ? base : `${base}/api`;
};

export const API_ROOT = ensureApiPrefix(API_BASE_URL);

export const API_ENDPOINTS = {
  // Authentication endpoints
  USER_SIGNUP: `${API_ROOT}/auth/signup-user`,
  USER_LOGIN: `${API_ROOT}/auth/login-user`,
  ADMIN_SIGNUP: `${API_ROOT}/auth/signup-admin`,
  ADMIN_LOGIN: `${API_ROOT}/auth/login-admin`,
  ORG_SIGNUP: `${API_ROOT}/organization/signup`,
  ORG_LOGIN: `${API_ROOT}/organization/login`,
  
  // Profile endpoints
  USER_PROFILE: `${API_ROOT}/auth/profile`,
  ORG_PROFILE: `${API_ROOT}/organization/profile`,
  
  // Email verification endpoints
  VERIFY_EMAIL: `${API_ROOT}/auth/verify-email`,
  RESEND_VERIFICATION: `${API_ROOT}/auth/resend-verification`,
  ORG_VERIFY_EMAIL: `${API_ROOT}/organization/verify-email`,
  ORG_RESEND_VERIFICATION: `${API_ROOT}/organization/resend-verification`,
  
  // Issue endpoints
  REPORT_ISSUE: `${API_ROOT}/issue/issue`,
  GET_ALL_ISSUES: `${API_ROOT}/issue/issues`,
  GET_USER_ISSUES: `${API_ROOT}/issue/issues/user`,
  
  // Transport endpoints
  TRANSPORT_ENTRY: `${API_ROOT}/entry/submit`,
  GET_ALL_TRANSPORTS: `${API_ROOT}/entry/all`,
  GET_ORG_TRANSPORTS: `${API_ROOT}/entry/organization`,
  TRANSPORT_QUERY: `${API_ROOT}/query/transport`,
  
  // Dashboard endpoints
  USER_RANK: `${API_ROOT}/userrank/rankings`,
  ORG_RANK: `${API_ROOT}/organizationrank/rankings`,
  MARK_ISSUE_SOLVED: `${API_ROOT}/issuesolved/solve`,
  USER_RESOLVED_ISSUES: `${API_ROOT}/issuesolved/user`,
  ORG_RESOLVED_ISSUES: `${API_ROOT}/issuesolved/organization`,
};

export default API_BASE_URL;
