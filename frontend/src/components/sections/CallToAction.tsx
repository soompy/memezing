'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Users, TrendingUp, Heart } from 'lucide-react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import UnifiedScrollSection, { ContentSlide } from '@/components/ui/UnifiedScrollSection/UnifiedScrollSection';
import { brandColors, componentColors } from '@/styles/theme';

const FloatingElement = styled.div<{ delay: number }>`
  position: absolute;
  animation: float 6s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
  }
`;

const GradientButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  padding: 20px 40px;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const StatCard = styled.div<{ delay: number }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  animation: slideUp 0.8s ease-out;
  animation-delay: ${props => props.delay}s;
  animation-fill-mode: both;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const testimonials = [
  {
    text: "밈징어 덕분에 드디어 바이럴 밈을 만들었어요! 조회수가 10만을 넘었답니다 🔥",
    author: "김밈러",
    role: "인플루언서"
  },
  {
    text: "디자인 경험이 전혀 없어도 5분 만에 퀄리티 높은 밈을 만들 수 있어서 놀랐어요",
    author: "박재미",
    role: "대학생"
  },
  {
    text: "우리 브랜드 마케팅에 밈징어로 만든 콘텐츠를 활용하니까 참여율이 300% 올랐어요!",
    author: "이마케터",
    role: "마케팅 매니저"
  }
];

const stats = [
  {
    icon: Users,
    number: "50,000+",
    label: "활성 사용자",
    ...componentColors.stats[0]
  },
  {
    icon: TrendingUp,
    number: "1M+",
    label: "제작된 밈",
    ...componentColors.stats[1]
  },
  {
    icon: Heart,
    number: "98%",
    label: "만족도",
    ...componentColors.stats[2]
  }
];

export default function CallToAction() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 섹션별 콘텐츠 배열
  const sections = [
    // 1. 메인 헤더
    <ContentSlide key="header" background={brandColors.special.gradient.purple}>
      <div className="relative w-full h-full overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* 플로팅 요소들 */}
        <FloatingElement delay={0} className="top-20 left-10 text-4xl">🎭</FloatingElement>
        <FloatingElement delay={1} className="top-32 right-20 text-3xl">😂</FloatingElement>
        <FloatingElement delay={2} className="bottom-32 left-20 text-5xl">🚀</FloatingElement>
        <FloatingElement delay={0.5} className="bottom-20 right-10 text-3xl">✨</FloatingElement>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center h-full flex items-center justify-center">
          <div>
            <motion.div 
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
              <span className="text-white font-medium">지금 가장 핫한 밈 제작 도구</span>
            </motion.div>
            
            <motion.h2 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              당신의 아이디어가
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                바이럴 밈
              </span>이 됩니다
            </motion.h2>
            
            <motion.p 
              className="text-xl text-white/80 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              복잡한 디자인 툴은 이제 그만! 밈징어와 함께 누구나 쉽게 밈을 만들고,
              <br />
              SNS에서 화제의 중심이 되어보세요.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <GradientButton
                onClick={() => window.location.href = '/meme-generator'}
                className="group mr-4 mb-4"
              >
                <span className="flex items-center">
                  지금 무료로 시작하기
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </GradientButton>
            </motion.div>
          </div>
        </div>
      </div>
    </ContentSlide>,

    // 2. 통계 섹션
    <ContentSlide key="stats" background={brandColors.special.gradient.purple}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <StatCard delay={index * 0.2}>
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                    style={{ backgroundColor: stat.color }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/70">
                    {stat.label}
                  </div>
                </StatCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ContentSlide>,

    // 3. 사용자 후기
    <ContentSlide key="testimonials" background={brandColors.special.gradient.purple}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            실제 사용자들의 이야기
          </h3>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 text-center">
                    <blockquote className="text-xl text-white/90 mb-6 italic">
                      "{testimonial.text}"
                    </blockquote>
                    <div className="text-white/70">
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-white' : 'bg-white/30'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </ContentSlide>,

    // 4. 최종 CTA
    <ContentSlide key="final-cta" background={brandColors.special.gradient.purple}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 inline-block"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h4 className="text-2xl font-bold text-white mb-4">
            아직도 고민하고 계신가요?
          </h4>
          <p className="text-white/80 mb-6 max-w-md">
            지금 시작하면 누구보다 빠르게 밈의 세계에 발을 들일 수 있어요!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GradientButton
                onClick={() => window.location.href = '/meme-generator'}
                className="group"
              >
                <span className="flex items-center">
                  무료로 밈 만들기
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </GradientButton>
            </motion.div>
            <div className="text-white/60 text-sm">
              👆 클릭 한 번으로 시작!
            </div>
          </div>
        </motion.div>
      </div>
    </ContentSlide>
  ];

  return (
    <UnifiedScrollSection totalHeight="500vh">
      {sections}
    </UnifiedScrollSection>
  );
}