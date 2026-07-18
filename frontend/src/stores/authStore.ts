import { create } from 'zustand';

interface User {
  user_id: string;
  role: 'operator' | 'admin' | 'fan';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setToken: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      set({ 
        token, 
        isAuthenticated: true,
        user: { user_id: payload.sub, role: payload.role || 'operator' }
      });
    } catch {
      set({ token, isAuthenticated: true });
    }
  },

  setUser: (user) => set({ user }),

  logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));