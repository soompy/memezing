'use client';

import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';

export default function Hero() {
  const handleGetStarted = () => {
    // 밈 생성기 페이지로 이동
    window.location.href = '/meme-generator';
  };

  const handleDemo = () => {
    // 데모 섹션으로 스크롤
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen">
      {/* 배경 데코레이션 - sticky */}
      <div className="fixed inset-0 overflow-hidden -z-10"
           style={{ 
             background: 'linear-gradient(135deg, #FFF5F3 0%, #ffffff 50%, #F0FDFC 100%)' 
           }}>
        <div 
          className="absolute -top-40 -right-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{ backgroundColor: '#87E8DF' }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{ backgroundColor: '#FFB3A3' }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{ backgroundColor: '#FFD93D' }}
        ></div>
      </div>

      <div className="relative min-h-screen flex items-center px-8 sm:px-12 lg:px-16 pt-20">
        <div className="w-full max-w-none">
          {/* 메인 헤드라인 - 화면 꽉 차게, 좌측 정렬, 세 문단으로 */}
          <motion.h1 
            className="text-5xl xl:text-9xl leading-tight text-center w-full" 
            style={{ fontFamily: "'Black Han Sans', sans-serif", fontWeight: 'light' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="block">
              누구나 쉽게 밈을 만드는
            </span>
            <span className="relative inline-block">
              가장 쉬운 방법
              <motion.div 
                className="absolute -bottom-2 left-0 h-3 -skew-y-1"
                style={{ backgroundColor: '#FFE888', width: '100%' }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 1.5 }}
              />
            </span>
          </motion.h1>
        </div>
      </div>
    </section>
  );
}