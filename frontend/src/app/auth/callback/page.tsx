'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallback() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">로그인 처리 중</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-xl font-bold text-green-600 mb-2">로그인 성공!</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-4">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>페이지를 이동하고 있습니다...</span>
              </div>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">로그인 실패</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span>로그인 페이지로 이동 중...</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}