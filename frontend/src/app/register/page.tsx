'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Button, Input, Checkbox } from '@/components/ui';
import SocialLogin from '@/components/auth/SocialLogin';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';

interface PasswordStrength {
  hasLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // 컴포넌트 마운트 상태 관리
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (isMounted && user) {
      router.push('/');
    }
  }, [user, router, isMounted]);

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
    
    // 실시간 유효성 검사 - 에러 클리어
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // 실시간 필드별 validation
    if (name === 'email' && value && value.length > 0) {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        setFormErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다.' }));
      }
    }

    if (name === 'username' && value && value.length > 0) {
      if (value.length < 2 || value.length > 20) {
        setFormErrors(prev => ({ ...prev, username: '사용자명은 2-20자 사이여야 합니다.' }));
      } else if (!/^[가-힣a-zA-Z0-9_]+$/.test(value)) {
        setFormErrors(prev => ({ ...prev, username: '한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다.' }));
      }
    }

    if (name === 'confirmPassword' && value && formData.password) {
      if (value !== formData.password) {
        setFormErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
      }
    }
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};
    
    // 이메일 검증
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    // 사용자명 검증
    if (!formData.username) {
      errors.username = '사용자명을 입력해주세요.';
    } else if (formData.username.length < 2 || formData.username.length > 20) {
      errors.username = '사용자명은 2-20자 사이여야 합니다.';
    } else if (!/^[가-힣a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = '한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다.';
    }
    
    // 비밀번호 검증
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (!passwordStrength.hasLength || !passwordStrength.hasLetter || !passwordStrength.hasNumber) {
      errors.password = '비밀번호 조건을 만족해주세요.';
    }
    
    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    // 이용약관 동의 검증
    if (!agreedToTerms) {
      errors.terms = '이용약관에 동의해주세요.';
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
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

  // 하이드레이션 완료 전까지는 로딩 상태
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center p-5 relative">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 로그인된 사용자는 아무것도 보여주지 않음 (리다이렉트 처리됨)
  if (user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-5 relative">
      <div className="w-full max-w-md relative">
        {/* 로고 섹션 */}
        <motion.div 
          className="text-center mb-6"
          initial={isMounted ? { opacity: 0, scale: 0.9 } : false}
          animate={isMounted ? { opacity: 1, scale: 1 } : false}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="mb-4">
            <motion.div 
              className="text-5xl mb-4"
              style={{fontFamily: "'Black Han Sans', sans-serif"}}
              whileHover={isMounted ? { scale: 1.05 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.h2
                animate={isMounted ? { rotate: [0, 10, -10, 0] } : false}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}>
                밈징
              </motion.h2>
            </motion.div>
          </div>
          <p className="text-base text-gray-600 leading-relaxed">
            밈으로 세상을 더 재미있게 만들어보세요!
          </p>
        </motion.div>

        {/* 회원가입 폼 */}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && !Object.values(formErrors).some(Boolean) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
              <div className="flex items-center">
                <div className="text-red-500 mr-2">⚠️</div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {formErrors.terms && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{formErrors.terms}</p>
            </div>
          )}

          {/* 이메일 입력 */}
          <Input
            label="이메일"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            required
            error={formErrors.email}
          />

          {/* 사용자명 입력 */}
          <Input
            label="사용자명"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="사용자명을 입력하세요 (2-20자)"
            required
            error={formErrors.username}
            helperText={!formErrors.username ? "한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다" : undefined}
          />

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
              error={formErrors.password}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
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
              className="pr-12"
              error={formErrors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
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
            <Checkbox
              checked={agreedToTerms}
              onChange={setAgreedToTerms}
              label={
                <span className="text-sm text-gray-600">
                  <Link href="/terms" className="text-gray-600 hover:text-gray-800 hover:underline transition-colors">
                    이용약관
                  </Link>
                  {' '}및{' '}
                  <Link href="/privacy" className="text-gray-600 hover:text-gray-800 hover:underline transition-colors">
                    개인정보처리방침
                  </Link>
                  에 동의합니다. (필수)
                </span>
              }
            />
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
              className="font-medium text-gray-600 hover:text-gray-800 hover:underline transition-colors"
            >
              로그인
            </Link>
          </p>
        </div>
        

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500">
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-500 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <span>홈으로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}