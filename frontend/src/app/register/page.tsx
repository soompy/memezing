'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, XCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import SocialLogin from '@/components/auth/SocialLogin';
import { useAuthStore } from '@/store/authStore';

interface PasswordStrength {
  hasLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // 에러 클리어
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // 비밀번호 강도 체크
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      hasLength: password.length >= 6,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (!agreedToTerms) {
      return;
    }

    const success = await register({
      email: formData.email,
      name: formData.username,
      password: formData.password,
    });

    if (success) {
      router.push('/onboarding');
    }
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.username &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      passwordStrength.hasLength &&
      passwordStrength.hasLetter &&
      passwordStrength.hasNumber &&
      agreedToTerms
    );
  };

  if (user) {
    return null; // 로딩 중에는 아무것도 보여주지 않음
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      {/* 배경 데코레이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* 로고 섹션 */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              🎭 밈징
            </span>
          </div>
          <h1 className="text-2xl font-bold text-900 mb-2">회원가입</h1>
          <p className="text-600">밈징에서 창의적인 여정을 시작하세요!</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 이메일 입력 */}
            <div className="relative">
              <Input
                label="이메일"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
                required
                className="pl-10"
              />
              <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            </div>

            {/* 사용자명 입력 */}
            <div className="relative">
              <Input
                label="사용자명"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="사용자명을 입력하세요 (2-20자)"
                required
                className="pl-10"
                helperText="한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다"
              />
              <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            </div>

            {/* 비밀번호 입력 */}
            <div className="relative">
              <Input
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                required
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* 비밀번호 강도 표시 */}
            {formData.password && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">비밀번호 조건</p>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    {passwordStrength.hasLength ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300 mr-2" />
                    )}
                    <span className={passwordStrength.hasLength ? 'text-green-600' : 'text-gray-500'}>
                      최소 6자 이상
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    {passwordStrength.hasLetter ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300 mr-2" />
                    )}
                    <span className={passwordStrength.hasLetter ? 'text-green-600' : 'text-gray-500'}>
                      영문 포함
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    {passwordStrength.hasNumber ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300 mr-2" />
                    )}
                    <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                      숫자 포함
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 비밀번호 확인 */}
            <div className="relative">
              <Input
                label="비밀번호 확인"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                required
                className="pl-10 pr-10"
                error={
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? '비밀번호가 일치하지 않습니다'
                    : undefined
                }
              />
              <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* 이용약관 동의 */}
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  required
                />
                <span className="ml-3 text-sm text-gray-600">
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline">
                    이용약관
                  </Link>
                  {' '}및{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의합니다. (필수)
                </span>
              </label>
            </div>

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading || !isFormValid()}
            >
              회원가입
            </Button>
          </form>

          {/* 소셜 로그인 */}
          <SocialLogin mode="register" className="mt-6" />

          {/* 로그인 링크 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}