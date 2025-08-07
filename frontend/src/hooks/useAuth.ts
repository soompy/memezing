import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useToastContext } from '@/context/ToastContext';

interface UseAuthReturn {
  // 세션 관련
  session: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  
  // 인증 함수들
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // 사용자 정보 관리
  updateProfile: (data: { name?: string; image?: string }) => Promise<boolean>;
  getUserInfo: () => Promise<any>;
  
  // 상태
  isRefreshing: boolean;
  isUpdating: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useToastContext();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAuthenticated = !!session;
  const isLoading = status === 'loading';
  const user = session?.user;

  // 이메일/비밀번호 로그인
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // NextAuth credentials 로그인 사용
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        showError(result.error);
        return false;
      }

      if (result?.ok) {
        showSuccess('로그인되었습니다!');
        // 세션 업데이트를 위해 잠시 대기
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      showError('로그인 중 오류가 발생했습니다.');
      return false;
    }
  }, [showSuccess, showError, router]);

  // 로그아웃
  const logout = useCallback(async (): Promise<void> => {
    try {
      // 먼저 API 로그아웃 호출 (서버 쿠키 정리)
      try {
        await apiClient.logout();
      } catch (apiError) {
        console.warn('API logout failed, continuing with NextAuth logout:', apiError);
      }

      // NextAuth 로그아웃
      await signOut({
        redirect: false,
      });

      // 로컬 저장소 정리
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');

      showInfo('로그아웃되었습니다.');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      showError('로그아웃 중 오류가 발생했습니다.');
    }
  }, [showInfo, showError, router]);

  // 토큰 갱신
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!session || isRefreshing) return false;

    setIsRefreshing(true);
    try {
      const result = await apiClient.refreshToken();
      
      if (result.success) {
        // NextAuth 세션도 업데이트
        await update();
        showSuccess('인증 정보가 갱신되었습니다.');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      showError('인증 정보 갱신에 실패했습니다. 다시 로그인해주세요.');
      
      // 토큰 갱신 실패 시 로그아웃 처리
      await logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [session, isRefreshing, update, showSuccess, showError, logout]);

  // 사용자 정보 조회
  const getUserInfo = useCallback(async () => {
    if (!session) return null;

    try {
      const result = await apiClient.getMe();
      if (result.success) {
        return result.data.user;
      }
      return null;
    } catch (error) {
      console.error('Get user info error:', error);
      return null;
    }
  }, [session]);

  // 프로필 업데이트
  const updateProfile = useCallback(async (data: { name?: string; image?: string }): Promise<boolean> => {
    if (!session || isUpdating) return false;

    setIsUpdating(true);
    try {
      const result = await apiClient.updateMe(data);
      
      if (result.success) {
        // NextAuth 세션 업데이트
        await update({
          ...session,
          user: {
            ...session.user,
            ...data,
          },
        });
        
        showSuccess('프로필이 업데이트되었습니다!');
        return true;
      }
      
      showError('프로필 업데이트에 실패했습니다.');
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      showError('프로필 업데이트 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [session, isUpdating, update, showSuccess, showError]);

  return {
    // 세션 관련
    session,
    isAuthenticated,
    isLoading,
    user,
    
    // 인증 함수들
    login,
    logout,
    refreshToken,
    
    // 사용자 정보 관리
    updateProfile,
    getUserInfo,
    
    // 상태
    isRefreshing,
    isUpdating,
  };
};