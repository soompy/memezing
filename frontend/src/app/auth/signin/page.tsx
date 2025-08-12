'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToastContext } from '@/context/ToastContext';

interface SignInForm {
  email: string;
  password: string;
}

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToastContext();
  
  const [form, setForm] = useState<SignInForm>({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 뒤로가기
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 폼 검증
  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!form.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (form.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // 로그인 처리
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          showError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else {
          showError('로그인 중 오류가 발생했습니다.');
        }
      } else {
        showSuccess('로그인되었습니다!');
        
        // 세션 새로고침
        await getSession();
        
        // callbackUrl이 있으면 해당 페이지로, 없으면 홈으로
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [form, validateForm, searchParams, showSuccess, showError, router]);

  // 회원가입 페이지로 이동
  const goToSignUp = useCallback(() => {
    router.push('/auth/signup');
  }, [router]);

  // 테스트 계정으로 로그인
  const handleTestLogin = useCallback(async () => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'test@memezing.com',
        password: 'test123',
        redirect: false
      });

      if (result?.error) {
        showError('테스트 계정 로그인에 실패했습니다.');
      } else {
        showSuccess('테스트 계정으로 로그인되었습니다!');
        await getSession();
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Test login error:', error);
      showError('테스트 계정 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, showSuccess, showError, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="secondary" size="sm" onClick={handleBack}>
              <ArrowLeft size={16} className="mr-2" />
              뒤로가기
            </Button>
            <h1 className="text-gray-900 leading-tight" style={{fontFamily: "'Black Han Sans', sans-serif", fontSize: '1.7rem', fontWeight: 'light'}}>
              로그인
            </h1>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">밈징에 로그인</h2>
              <p className="text-gray-600">계정에 로그인하여 밈을 만들고 공유해보세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이메일 입력 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="이메일을 입력하세요"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </Button>
            </form>

            {/* 구분선 */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>
            </div>

            {/* 테스트 계정 로그인 */}
            <Button
              variant="secondary"
              size="lg"
              className="w-full mb-4"
              onClick={handleTestLogin}
              disabled={loading}
            >
              테스트 계정으로 체험하기
            </Button>

            {/* 회원가입 링크 */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={goToSignUp}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  회원가입
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <SignInPageContent />
    </Suspense>
  );
}