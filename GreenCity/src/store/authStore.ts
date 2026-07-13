import { create } from 'zustand';

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
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => set((state) => ({ 
    user, 
    token: token || state.token 
  })),
  updatePoints: (points) => set((state) => ({ 
    user: state.user ? { ...state.user, points } : null 
  })),
  logout: () => set({ user: null, token: null }),
}));
