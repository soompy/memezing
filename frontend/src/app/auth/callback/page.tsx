'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        if (!token) {
          setStatus('error');
          setMessage('인증 토큰을 받지 못했습니다.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        // 토큰을 저장하고 사용자 정보 가져오기
        setToken(token);
        
        // 사용자 정보 검증
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setStatus('success');
          setMessage(`${provider} 로그인이 완료되었습니다!`);
          
          // 성공 후 적절한 페이지로 리다이렉트
          setTimeout(() => {
            // 새 사용자라면 온보딩으로, 기존 사용자라면 홈으로
            const isNewUser = userData.data?.user?.createdAt && 
              new Date(userData.data.user.createdAt).getTime() > Date.now() - 5 * 60 * 1000; // 5분 이내 생성
            
            if (isNewUser) {
              router.push('/onboarding');
            } else {
              router.push('/');
            }
          }, 2000);
        } else {
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, setToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 데코레이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            {/* 로고 */}
            <div className="mb-6">
              <div className="text-3xl font-bold" style={{fontFamily: "'Black Han Sans', sans-serif"}}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-400">
                  밈징
                </span>
              </div>
            </div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-6"></div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>로그인 처리 중</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            {/* 성공 애니메이션 */}
            <div className="relative mb-6">
              <div className="text-6xl animate-bounce">🎉</div>
              <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
              <div className="absolute -bottom-2 -left-2 text-xl animate-pulse">🎆</div>
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-2 animate-pulse">로그인 성공!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="inline-flex items-center space-x-2 text-sm text-green-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span>페이지를 이동하고 있습니다...</span>
              </div>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-6xl mb-6 animate-bounce">😢</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">로그인 실패</h2>
            <p style={{ color: 'var(--text-secondary)' }} className="mb-4">{message}</p>
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="inline-flex items-center space-x-2 text-sm text-red-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                <span>로그인 페이지로 이동 중...</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>로그인 처리 중</h2>
          <p style={{ color: 'var(--text-secondary)' }}>잠시만 기다려주세요...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}