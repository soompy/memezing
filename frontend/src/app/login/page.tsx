'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button, Input, Checkbox } from '@/components/ui';
import SocialLogin from '@/components/auth/SocialLogin';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const [isFormFocused, setIsFormFocused] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 실시간 유효성 검사 - 에러 클리어
    if (name === 'email' && formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
    if (name === 'password' && formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }

    // 이메일 실시간 유효성 검사
    if (name === 'email' && value && value.length > 0) {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        setFormErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다.' }));
      }
    }
  };

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
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
    
    const success = await login(formData);
    if (success) {
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      router.push('/');
    }
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
        {/* 로고 및 제목 */}
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
              whileHover={{ scale: 1.05 }}
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

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && !formErrors.email && !formErrors.password && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
              <div className="flex items-center">
                <div className="text-red-500 mr-2">⚠️</div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <motion.div 
            className="space-y-2"
            initial={isMounted ? { opacity: 0, x: -20 } : false}
            animate={isMounted ? { opacity: 1, x: 0 } : false}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Input
              label="이메일"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setIsFormFocused(true)}
              onBlur={() => setIsFormFocused(false)}
              placeholder="your@email.com"
              required
              error={formErrors.email}
            />
          </motion.div>

          <motion.div 
            className="space-y-2"
            initial={isMounted ? { opacity: 0, x: -20 } : false}
            animate={isMounted ? { opacity: 1, x: 0 } : false}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="relative">
              <Input
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setIsFormFocused(true)}
                onBlur={() => setIsFormFocused(false)}
                placeholder="비밀번호를 입력하세요"
                required
                error={formErrors.password}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          {/* 기억하기 체크박스 */}
          <motion.div 
            className="flex items-center justify-between py-2"
            initial={isMounted ? { opacity: 0 } : false}
            animate={isMounted ? { opacity: 1 } : false}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Checkbox
              checked={rememberMe}
              onChange={setRememberMe}
              label="로그인 상태 유지"
            />
            <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-all duration-300 hover:underline">
              비밀번호 찾기
            </Link>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-400 hover:from-primary-600 hover:to-secondary-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:transform-none disabled:hover:shadow-lg"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                <div className="flex items-center justify-center group">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  <span>로그인하기</span>
                </div>
              )}
            </Button>
          </motion.div>
        </form>

        {/* 소셜 로그인 */}
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">간편 로그인</span>
            </div>
          </div>
          
          <div className="mt-6">
            <SocialLogin />
          </div>
        </motion.div>

        {/* 회원가입 링크 */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-3">
              아직 밈징의 회원이 아니신가요?
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-500 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <span>회원가입하고 시작하기</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}