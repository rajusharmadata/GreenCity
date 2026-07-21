import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/app';
import { storeToken, removeToken, storeUserData, removeUserData, clearAuthData } from '../utils/auth';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  tier: string;
  points: number;
  rank: number;
  badges: string[];
  reportsCount: number;
  resolvedCount: number;
  isEmailVerified: boolean;
  createdAt?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string | null) => void;
  updatePoints: (points: number) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  setUser: async (user, token) => {
    if (token) {
      await storeToken(token);
    }
    if (user) {
      await storeUserData(user);
    }
    set((state) => ({ 
      user, 
      token: token || state.token 
    }));
  },
  updatePoints: (points) => set((state) => ({ 
    user: state.user ? { ...state.user, points } : null 
  })),
  logout: async () => {
    await clearAuthData();
    set({ user: null, token: null });
  },
  initializeAuth: async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);
      
      if (token && userData) {
        const user = JSON.parse(userData);
        set({ user, token });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  },
}));
