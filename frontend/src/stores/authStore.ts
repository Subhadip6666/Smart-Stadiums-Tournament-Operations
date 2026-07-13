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
  initDemoAuth: () => void;
}

// Generate a mock JWT for demo purposes (not cryptographically signed)
function generateDemoToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 'noc-operator-001',
      role: 'operator',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24h
    })
  );
  const signature = btoa('demo-signature');
  return `${header}.${payload}.${signature}`;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setToken: (token) => set({ token, isAuthenticated: true }),

  setUser: (user) => set({ user }),

  logout: () => set({ token: null, user: null, isAuthenticated: false }),

  initDemoAuth: () => {
    const token = generateDemoToken();
    set({
      token,
      user: { user_id: 'noc-operator-001', role: 'operator' },
      isAuthenticated: true,
    });
  },
}));