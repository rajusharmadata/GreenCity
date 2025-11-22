import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import { useNotification } from './NotificationContext';

// Authentication context with enhanced features
const AuthContext = createContext();

// Role definitions
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin', 
  ORGANIZATION: 'organization',
  GUEST: 'guest'
};

// Permission definitions
export const PERMISSIONS = {
  // User permissions
  VIEW_DASHBOARD: 'view_dashboard',
  REPORT_ISSUE: 'report_issue',
  VIEW_GAMIFICATION: 'view_gamification',
  
  // Admin permissions
  MANAGE_TRANSPORT: 'manage_transport',
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
  MANAGE_USERS: 'manage_users',
  
  // Organization permissions
  MANAGE_ORG_ISSUES: 'manage_org_issues',
  VIEW_ORG_STATS: 'view_org_stats',
  
  // Common permissions
  VIEW_PROFILE: 'view_profile',
  EDIT_PROFILE: 'edit_profile'
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.REPORT_ISSUE,
    PERMISSIONS.VIEW_GAMIFICATION,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_TRANSPORT,
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE
  ],
  [ROLES.ORGANIZATION]: [
    PERMISSIONS.MANAGE_ORG_ISSUES,
    PERMISSIONS.VIEW_ORG_STATS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE
  ]
};

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { success: notifySuccess, error: notifyError } = useNotification();

  const cacheUserSnapshot = (payload, userTypeValue) => {
    if (!payload) return;
    const safeRole =
      payload.role ||
      (userTypeValue === 'admin'
        ? ROLES.ADMIN
        : userTypeValue === 'organization'
        ? ROLES.ORGANIZATION
        : ROLES.USER);
    const snapshot = {
      ...payload,
      role: safeRole,
      cachedAt: Date.now(),
      userType: userTypeValue
    };
    localStorage.setItem('userData', JSON.stringify(snapshot));
  };

  const readCachedUser = () => {
    const raw = localStorage.getItem('userData');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  // Get current authenticated user and role
  const getCurrentUser = () => {
    if (user) {
      return { ...user, role: user.role || ROLES.USER };
    }
    if (organization) {
      return { ...organization, role: ROLES.ORGANIZATION };
    }
    return null;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    const current = getCurrentUser();
    if (!current) return false;
    
    const userPermissions = ROLE_PERMISSIONS[current.role] || [];
    return userPermissions.includes(permission);
  };

  // Check if user has any of the specified roles
  const hasRole = (...roles) => {
    const current = getCurrentUser();
    if (!current) return false;
    return roles.includes(current.role);
  };

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
    setOrganization(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setError('');
  };

  // Enhanced authentication check
  const checkAuthStatus = async () => {
    const cachedSnapshot = readCachedUser();
    try {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      
      if (token && userType) {
        // Set default auth header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token and fetch user data
        try {
          if (userType === 'user' || userType === 'admin') {
            const response = await axiosInstance.get(`${API_ENDPOINTS.USER_PROFILE}`);
            const userData = response.data;
            
            // Check if email is verified
            if (!userData.isEmailVerified && userData.role === 'user') {
              // Don't clear auth, but show warning
              console.warn('Email not verified');
            }
            
            setUser(userData);
            setCurrentUser({ ...userData, role: userData.role || ROLES.USER });
            cacheUserSnapshot(userData, userType);
          } else if (userType === 'organization') {
            const response = await axiosInstance.get(`${API_ENDPOINTS.ORG_PROFILE}`);
            setOrganization(response.data);
            setCurrentUser({ ...response.data, role: ROLES.ORGANIZATION });
            cacheUserSnapshot(response.data, 'organization');
          }
          setIsAuthenticated(true);
        } catch (tokenError) {
          console.error('Token verification failed:', tokenError);
          const status = tokenError.response?.status;
          if (status === 401 || status === 403) {
          clearAuth();
          } else if (cachedSnapshot && cachedSnapshot.userType === userType) {
            if (userType === 'organization') {
              setOrganization(cachedSnapshot);
            } else {
              setUser(cachedSnapshot);
            }
            setCurrentUser({ ...cachedSnapshot, role: cachedSnapshot.role });
            setIsAuthenticated(true);
          }
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Enhanced login function
  // OAuth login method
  const loginWithOAuth = async (userData, token) => {
    // Prevent duplicate processing if already authenticated
    const existingToken = localStorage.getItem('token');
    if (existingToken === token && isAuthenticated) {
      return userData;
    }

    setError('');
    setLoading(true);
    
    try {
      const normalizedRole = userData.role === 'admin' ? ROLES.ADMIN : ROLES.USER;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', normalizedRole === ROLES.ADMIN ? 'admin' : 'user');
      cacheUserSnapshot(userData, normalizedRole === ROLES.ADMIN ? 'admin' : 'user');
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setCurrentUser({ ...userData, role: normalizedRole });
      setOrganization(null);
      setIsAuthenticated(true);
      
      // Don't show notification here - let the callback component handle it
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'OAuth login failed';
      setError(errorMessage);
      notifyError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, userType) => {
    setError('');
    setLoading(true);
    try {
      let endpoint;
      
      if (userType === 'user') {
        endpoint = API_ENDPOINTS.USER_LOGIN;
      } else if (userType === 'organization') {
        endpoint = API_ENDPOINTS.ORG_LOGIN;
      } else if (userType === 'admin') {
        endpoint = API_ENDPOINTS.ADMIN_LOGIN;
      } else {
        throw new Error('Invalid user type');
      }

      const response = await axiosInstance.post(endpoint, { email, password });
      
      // Check if email verification is required
      if (response.data.requiresVerification) {
        const errorMessage = 'Please verify your email before logging in.';
        setError(errorMessage);
        notifyError(errorMessage);
        throw new Error(errorMessage);
      }
      
      const { token, user: userData, organization: orgData } = response.data;

      // Store token and user type
      localStorage.setItem('token', token);
      localStorage.setItem('userType', userType);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data based on type
      if (userType === 'user' || userType === 'admin') {
        setUser(userData);
        setCurrentUser({ ...userData, role: userData.role || ROLES.USER });
        cacheUserSnapshot(userData, userType);
      } else if (userType === 'organization') {
        setOrganization(orgData);
        setCurrentUser({ ...orgData, role: ROLES.ORGANIZATION });
        cacheUserSnapshot(orgData, 'organization');
      }

      setIsAuthenticated(true);
      notifySuccess('Login successful!');
      return { user: userData || orgData, token };
    } catch (err) {
      // Handle email verification requirement
      if (err.response?.data?.requiresVerification) {
        const errorMessage = 'Please verify your email before logging in.';
        setError(errorMessage);
        notifyError(errorMessage);
        throw { ...err, requiresVerification: true, email: err.response?.data?.email };
      }
      
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      notifyError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced signup function
  const signup = async (userData, userType) => {
    setError('');
    setLoading(true);
    try {
      let endpoint;
      if (userType === 'user') {
        endpoint = API_ENDPOINTS.USER_SIGNUP;
      } else if (userType === 'admin') {
        endpoint = API_ENDPOINTS.ADMIN_SIGNUP;
      } else if (userType === 'organization') {
        endpoint = API_ENDPOINTS.ORG_SIGNUP;
      } else {
        throw new Error('Invalid user type');
      }

      const response = await axiosInstance.post(endpoint, userData);
      
      // If email verification is required, show appropriate message
      if (response.data.requiresVerification || 
          (userType === 'user' && !response.data.user?.isEmailVerified) ||
          (userType === 'organization' && !response.data.organization?.isEmailVerified)) {
        notifySuccess('Registration successful! Please check your email for the OTP to verify your account.');
        return { ...response.data, requiresVerification: true };
      }
      
      notifySuccess('Registration successful! Please login.');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      notifyError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify email (supports both user and organization, with OTP or token)
  const verifyEmail = async (tokenOrOtp, email, userType = 'user') => {
    setError('');
    setLoading(true);
    try {
      let endpoint;
      let payload;
      
      if (userType === 'organization') {
        endpoint = API_ENDPOINTS.ORG_VERIFY_EMAIL;
        // Determine if it's OTP (6 digits) or token (longer string)
        if (tokenOrOtp && tokenOrOtp.length === 6 && /^\d+$/.test(tokenOrOtp)) {
          payload = { otp: tokenOrOtp, email };
        } else {
          payload = { token: tokenOrOtp, email };
        }
      } else {
        endpoint = API_ENDPOINTS.VERIFY_EMAIL;
        // Determine if it's OTP (6 digits) or token (longer string)
        if (tokenOrOtp && tokenOrOtp.length === 6 && /^\d+$/.test(tokenOrOtp)) {
          payload = { otp: tokenOrOtp, email };
        } else {
          payload = { token: tokenOrOtp, email };
        }
      }
      
      const response = await axiosInstance.post(endpoint, payload);
      notifySuccess('Email verified successfully! You can now login.');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Email verification failed.';
      setError(errorMessage);
      notifyError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email (supports both user and organization)
  const resendVerificationEmail = async (email, userType = 'user') => {
    setError('');
    setLoading(true);
    try {
      const endpoint = userType === 'organization' 
        ? API_ENDPOINTS.ORG_RESEND_VERIFICATION 
        : API_ENDPOINTS.RESEND_VERIFICATION;
      
      const response = await axiosInstance.post(endpoint, { email });
      notifySuccess('Verification email sent! Please check your inbox.');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to resend verification email.';
      setError(errorMessage);
      notifyError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
    notifySuccess('Logged out successfully');
    navigate('/');
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!isAuthenticated) return;
    
    try {
      const userType = localStorage.getItem('userType');
      if (userType === 'user' || userType === 'admin') {
        const response = await axiosInstance.get(`${API_ENDPOINTS.USER_PROFILE}`);
        setUser(response.data);
        setCurrentUser({ ...response.data, role: response.data.role || ROLES.USER });
      } else if (userType === 'organization') {
        const response = await axiosInstance.get(`${API_ENDPOINTS.ORG_PROFILE}`);
        setOrganization(response.data);
        setCurrentUser({ ...response.data, role: ROLES.ORGANIZATION });
        cacheUserSnapshot(response.data, 'organization');
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      // If refresh fails, token might be expired
      clearAuth();
      navigate('/');
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh token periodically
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshUserData();
      }, 15 * 60 * 1000); // Refresh every 15 minutes

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const value = {
    // State
    user,
    organization,
    currentUser,
    isAuthenticated,
    loading,
    error,
    
    // Methods
    login,
    loginWithOAuth,
    signup,
    logout,
    verifyEmail,
    resendVerificationEmail,
    refreshUserData,
    clearAuth,
    clearError: () => setError(''),
    
    // Permission helpers
    hasPermission,
    hasRole,
    getCurrentUser,
    
    // Role constants
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;