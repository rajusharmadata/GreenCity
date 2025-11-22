import axios from 'axios';
import { API_BASE_URL } from './api';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if you need to send cookies
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const responseMessage = (
        error.response?.data?.error ||
        error.response?.data?.message ||
        ''
      ).toLowerCase();

      const shouldForceLogout =
        requestUrl.includes('/auth') ||
        requestUrl.includes('/organization/profile') ||
        responseMessage.includes('token');

      if (shouldForceLogout) {
        const storedUserType = localStorage.getItem('userType');

        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        delete axiosInstance.defaults.headers.common['Authorization'];

        const redirectMap = {
          user: '/login/user',
          admin: '/login/admin',
          organization: '/login/org'
        };

        const fallbackPath = '/login/user';
        const redirectPath = redirectMap[storedUserType] || fallbackPath;

        if (window.location.pathname !== redirectPath) {
          window.location.href = redirectPath;
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

