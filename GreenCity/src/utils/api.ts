import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // Manually verified IP for this environment
return `http://10.126.95.164:8080/api`;
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
