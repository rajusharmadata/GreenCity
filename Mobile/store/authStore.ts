import { create } from 'zustand';

interface User {
  _id: string;
  name: string;
  email: string;
  points: number;
  reportsCount: number;
  badges: string[];
  avatar?: string;
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
