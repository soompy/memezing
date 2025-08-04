'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SocialLogin from '@/components/auth/SocialLogin';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const [isFormFocused, setIsFormFocused] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 실시간 유효성 검사
    if (name === 'email' && formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
    if (name === 'password' && formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
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

  if (user) {
    return null; // 로딩 중에는 아무것도 보여주지 않음
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 데코레이션 */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        
        {/* 추가 장식 요소 */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-primary-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-40 w-6 h-6 bg-secondary-400 rounded-full animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-accent-400 rounded-full animate-pulse animation-delay-2000"></div>
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={`bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 transition-all duration-500 ${isFormFocused ? 'shadow-3xl scale-[1.02]' : 'hover:shadow-3xl'}`}>
          {/* 로고 및 제목 */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="mb-6">
              <motion.div 
                className="text-5xl font-bold mb-4"
                style={{fontFamily: "'Black Han Sans', sans-serif"}}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-secondary-400 to-accent-400">
                  밈징
                </span>
              </motion.div>
              <div className="flex justify-center space-x-2 mb-4">
                <motion.div 
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >🎭</motion.div>
                <motion.div 
                  className="text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >✨</motion.div>
                <motion.div 
                  className="text-2xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >🚀</motion.div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              다시 만나서 반가워요!
            </h1>
            <p className="text-base text-gray-600 leading-relaxed">
              밈으로 세상을 더 재미있게 만들어보세요! 🎉
            </p>
          </motion.div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
              <motion.div 
                className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 text-red-700 px-5 py-4 rounded-r-lg text-sm shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="text-lg mr-2">⚠️</div>
                  <div>{error}</div>
                </div>
              </motion.div>
            )}

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                📧 이메일
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setIsFormFocused(true)}
                  onBlur={() => setIsFormFocused(false)}
                  placeholder="your@email.com"
                  required
                  className="pl-12 pr-4 py-4 w-full border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300 group-hover:border-gray-300 text-gray-800 placeholder-gray-400"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                🔒 비밀번호
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setIsFormFocused(true)}
                  onBlur={() => setIsFormFocused(false)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="pl-12 pr-14 py-4 w-full border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300 group-hover:border-gray-300 text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>
            </motion.div>

            {/* 기억하기 체크박스 */}
            <motion.div 
              className="flex items-center justify-between py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="flex items-center group cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 ${
                    rememberMe 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-400 border-primary-500' 
                      : 'border-gray-300 bg-white group-hover:border-primary-300'
                  }`}>
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">로그인 상태 유지</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-all duration-300 hover:underline">
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
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                )}
              </Button>
            </motion.div>
          </form>

          {/* 소셜 로그인 */}
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">✨ 간편 로그인 ✨</span>
              </div>
            </div>
            
            <div className="mt-8">
              <SocialLogin />
            </div>
          </motion.div>

          {/* 회원가입 링크 */}
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-3">
                아직 밈징의 회원이 아니신가요? 🤔
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-400 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-500 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg group"
              >
                <span>🎉 회원가입하고 시작하기</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}