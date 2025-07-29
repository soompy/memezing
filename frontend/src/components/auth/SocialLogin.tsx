'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface SocialLoginProps {
  mode?: 'login' | 'register';
  className?: string;
}

export default function SocialLogin({ mode = 'login', className = '' }: SocialLoginProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    setLoadingProvider(provider);
    
    // 백엔드 OAuth 엔드포인트로 리다이렉트
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  const buttonText = mode === 'login' ? '로그인' : '회원가입';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">또는</span>
        </div>
      </div>

      {/* Google 로그인 */}
      <Button
        variant="outline"
        onClick={() => handleSocialLogin('google')}
        disabled={loadingProvider !== null}
        isLoading={loadingProvider === 'google'}
        className="w-full flex items-center justify-center space-x-3 border-gray-300 hover:bg-gray-50"
      >
        {loadingProvider !== 'google' && (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span>Google로 {buttonText}</span>
      </Button>

      {/* Kakao 로그인 */}
      <Button
        onClick={() => handleSocialLogin('kakao')}
        disabled={loadingProvider !== null}
        isLoading={loadingProvider === 'kakao'}
        className="w-full flex items-center justify-center space-x-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-0"
      >
        {loadingProvider !== 'kakao' && (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
          </svg>
        )}
        <span>카카오로 {buttonText}</span>
      </Button>

      {/* 안내 텍스트 */}
      <p className="text-xs text-gray-500 text-center mt-4">
        소셜 {buttonText} 시 밈징어의{' '}
        <a href="/terms" className="text-blue-600 hover:underline">
          이용약관
        </a>
        {' '}및{' '}
        <a href="/privacy" className="text-blue-600 hover:underline">
          개인정보처리방침
        </a>
        에 동의한 것으로 간주됩니다.
      </p>
    </div>
  );
}