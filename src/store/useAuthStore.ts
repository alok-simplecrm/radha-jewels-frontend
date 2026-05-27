import { create } from 'zustand';
import apiClient from '../lib/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'user';
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; pass: string }) => Promise<void>;
  register: (data: { email: string; pass: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.pass,
      });
      
      // If tokens are returned directly in response body
      const { accessToken, refreshToken } = response.data;
      
      // Now fetch user details since we have token
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      const meResponse = await apiClient.get('/auth/me');
      const user = meResponse.data;
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token: accessToken, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Login failed. Please try again.',
        loading: false,
      });
      throw err;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const { pass, ...rest } = data;
      const response = await apiClient.post('/auth/register', {
        ...rest,
        password: pass,
      });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token: accessToken, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Registration failed.',
        loading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Even if network fails, clear local credentials
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    }
  },

  checkSession: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          if (parsedUser) {
            set({ token, user: parsedUser });
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('refresh_token');
          }
        } catch (e) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('refresh_token');
        }
      }
    }
  },
}));
