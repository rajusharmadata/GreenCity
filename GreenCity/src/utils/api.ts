import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: "https://greencity-7lnb.onrender.com/api",
  timeout: 60000, // 60 seconds
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Axios Error:", error.message);
    console.log("Code:", error.code);

    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
    }

    return Promise.reject(error);
  }
);

export default api;
