import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signIn, signOut, useSession } from 'next-auth/react';
import { AuthState, User, LoginRequest, RegisterRequest } from '@/types/auth';
import { apiClient, ApiError } from '@/lib/api';

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  socialLogin: (provider: 'google' | 'kakao' | 'naver') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  updateInterests: (interests: string[]) => Promise<boolean>;
  clearError: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const result = await apiClient.login(credentials);

          if (result.success && result.data) {
            // 토큰을 로컬 스토리지에 저장
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', result.data.token);
            }
            
            set({
              user: result.data.user,
              token: result.data.token,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: result.message || '로그인에 실패했습니다.',
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : '네트워크 오류가 발생했습니다.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const result = await apiClient.register(data);

          if (result.success && result.data) {
            // 토큰을 로컬 스토리지에 저장
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', result.data.token);
            }
            
            set({
              user: result.data.user,
              token: result.data.token,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: result.message || '회원가입에 실패했습니다.',
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : '네트워크 오류가 발생했습니다.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      socialLogin: async (provider: 'google' | 'kakao' | 'naver') => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await signIn(provider, {
            redirect: false,
            callbackUrl: '/dashboard'
          });
          
          if (result?.error) {
            set({
              isLoading: false,
              error: '소셜 로그인에 실패했습니다.',
            });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({
            isLoading: false,
            error: '네트워크 오류가 발생했습니다.',
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          // API를 통해 로그아웃 (서버의 토큰 무효화)
          try {
            await apiClient.logout();
          } catch (error) {
            // 로그아웃 API 실패해도 로컬 상태는 클리어
            console.warn('Server logout failed:', error);
          }
          
          // 로컬 토큰 제거 (SSR 안전)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
          }
          
          // 소셜 로그인 세션도 정리
          await signOut({ redirect: false });
          
          set({
            user: null,
            token: null,
            error: null,
            isLoading: false,
          });
        } catch {
          set({
            isLoading: false,
            error: '로그아웃 중 오류가 발생했습니다.',
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token });
      },

      updateInterests: async (interests: string[]) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await apiClient.updateInterests(interests);
          
          if (result.success) {
            set((state) => ({
              user: state.user ? { ...state.user, interests } : null,
              isLoading: false,
            }));
            return true;
          } else {
            set({
              isLoading: false,
              error: '관심사 업데이트에 실패했습니다.',
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : '네트워크 오류가 발생했습니다.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);