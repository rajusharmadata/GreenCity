import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Auto-detect backend URL: localhost for web/simulators, host IP for physical devices in DEV
// Uses EXPO_PUBLIC_API_URL for production
const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // Manually verified IP for this environment
  const MANUAL_IP = '10.229.68.164';
  return `http://10.229.68.164:5000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
});

// Request Interceptor: Attach Token
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('API Request Error:', error);
  }
  return config;
});

// Response Interceptor: Handle Global Errors (like 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
    }
    return Promise.reject(error);
  }
);

export default api;
