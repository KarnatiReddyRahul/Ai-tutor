import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import type { TokenResponse, UserResponse } from '@/types/backend';
import api from '@/services/apiClient';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
  updateStats: (totalAssessments: number, averageScore: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      token: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Call real backend — uses email as username
          const { data } = await api.post<TokenResponse>('/auth/login', {
            username: email,
            password,
          });

          const user: User = {
            id: data.user_id,           // Real UUID from backend
            email: data.username,        // Username stored as email
            name: data.username.split('@')[0],
            profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
            bio: '',
            joinedDate: new Date().toISOString(),
            totalAssessments: 0,
            averageScore: 0,
          };

          set({
            user,
            isLoggedIn: true,
            token: data.access_token,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          const message = error?.response?.data?.detail || 'Login failed. Please check your credentials.';
          throw new Error(message);
        }
      },

      signup: async (email: string, name: string, password: string) => {
        set({ isLoading: true });
        try {
          // Call real backend — uses email as username
          const { data } = await api.post<UserResponse>('/auth/signup', {
            username: email,
            password,
          });

          const user: User = {
            id: data.id,                // Real UUID from backend
            email: data.username,
            name: name || data.username.split('@')[0],
            profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
            bio: '',
            joinedDate: new Date().toISOString(),
            totalAssessments: 0,
            averageScore: 0,
          };

          // Auto-login after signup by calling login
          const { data: tokenData } = await api.post<TokenResponse>('/auth/login', {
            username: email,
            password,
          });

          set({
            user,
            isLoggedIn: true,
            token: tokenData.access_token,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          const message = error?.response?.data?.detail || 'Signup failed. Please try again.';
          throw new Error(message);
        }
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          token: null,
        });
      },

      updateProfile: (updatedData) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updatedData,
              }
            : null,
        }));
      },

      updateStats: (totalAssessments, averageScore) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                totalAssessments,
                averageScore,
              }
            : null,
        }));
      },
    }),
    {
      name: 'ai-reverse-tutor-auth',
    }
  )
);
