'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const validateEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setEmailError('');
    
    try {
      // TODO: 실제 비밀번호 재설정 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 임시 딜레이
      setIsEmailSent(true);
    } catch (error) {
      setError('이메일 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (error) setError('');
  };

  if (isEmailSent) {
    return (
      <div className="h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              이메일을 전송했습니다
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              <span className="font-medium text-primary-600">{email}</span>로<br />
              비밀번호 재설정 링크를 전송했습니다.<br />
              이메일을 확인해주세요.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-400 hover:from-primary-600 hover:to-secondary-500 text-white"
              >
                로그인 페이지로 돌아가기
              </Button>
              
              <button
                onClick={() => setIsEmailSent(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                다른 이메일로 재전송
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center p-5 relative overflow-hidden">
      <motion.div 
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 제목 */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            비밀번호 찾기
          </h1>
          <p className="text-gray-600">
            가입하신 이메일 주소를 입력해주세요
          </p>
        </motion.div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && !emailError && (
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
            <Input
              label="이메일 주소"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              error={emailError}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
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
                  전송 중...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>재설정 링크 전송</span>
                </div>
              )}
            </Button>
          </motion.div>
        </form>

        {/* 추가 정보 */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              이메일이 오지 않는다면 스팸함을 확인하거나<br />
              <Link href="/register" className="text-primary-600 hover:underline font-medium">
                새로운 계정을 만들어보세요
              </Link>
            </p>
          </div>
        </motion.div>

        {/* 뒤로가기 버튼 */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link 
            href="/login"
            className="flex items-center justify-center p-5 text-gray-600 hover:text-primary-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            로그인으로 돌아가기
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}