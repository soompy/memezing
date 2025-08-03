'use client';

import { MousePointer, Image, Share2, Palette, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import UnifiedScrollSection, { ContentSlide } from '@/components/ui/UnifiedScrollSection/UnifiedScrollSection';
import { brandColors, componentColors } from '@/styles/theme';

const features = [
  {
    icon: MousePointer,
    title: '드래그 앤 드롭',
    description: '복잡한 과정 없이 이미지를 끌어다 놓기만 하면 밈 제작 시작!',
    color: 'blue',
  },
  {
    icon: Image,
    title: '한국 트렌드 템플릿',
    description: '인기 드라마, K-POP, 유행어까지! 한국인이 좋아하는 밈 템플릿 제공',
    color: 'purple',
  },
  {
    icon: Share2,
    title: '즉시 공유',
    description: 'SNS 최적화 포맷으로 바로 공유하거나 고화질 다운로드',
    color: 'green',
  },
];

const stats = [
  {
    icon: Clock,
    value: '5분',
    label: '평균 제작 시간',
    description: '아이디어부터 완성까지',
  },
  {
    icon: Palette,
    value: '1,000+',
    label: '다양한 템플릿',
    description: '매주 새로운 템플릿 추가',
  },
  {
    icon: TrendingUp,
    value: '98%',
    label: '만족도',
    description: '사용자들의 높은 평가',
  },
];

// 테마에서 컬러 가져오기
const colorStyles = componentColors.features;

export default function Features() {
  // 섹션별 콘텐츠 배열
  const sections = [
    // 1. 섹션 헤더
    <ContentSlide key="header" background={brandColors.gray[50]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold mb-4" 
          style={{ color: brandColors.gray[800] }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          왜 밈징어를 선택해야 할까요?
        </motion.h2>
        <motion.p 
          className="text-xl max-w-3xl mx-auto" 
          style={{ color: brandColors.gray[500] }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          복잡한 편집 프로그램은 이제 그만! 밈징어와 함께 누구나 5분 만에 바이럴 밈을 만들어보세요.
        </motion.p>
      </div>
    </ContentSlide>,

    // 2. 주요 특징들
    <ContentSlide key="features" background={brandColors.gray[50]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorStyles[feature.color as keyof typeof colorStyles];
            
            return (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <motion.div 
                  className="bg-white rounded-2xl p-8 shadow-lg h-full relative overflow-hidden"
                  whileHover={{ 
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="relative z-10">
                    <motion.div 
                      className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6"
                      style={{ backgroundColor: colors.bg }}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5,
                        backgroundColor: colors.icon
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-8 h-8" style={{ color: colors.icon }} />
                    </motion.div>

                    <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.gray[800] }}>
                      {feature.title}
                    </h3>

                    <p className="leading-relaxed" style={{ color: brandColors.gray[500] }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ContentSlide>,

    // 3. 통계 섹션
    <ContentSlide key="stats" background={brandColors.gray[50]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: brandColors.gray[800] }}>
                숫자로 보는 밈징어
              </h3>
              <p className="text-lg" style={{ color: brandColors.gray[500] }}>
                많은 사용자들이 밈징어와 함께 창의적인 콘텐츠를 만들고 있습니다
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                
                return (
                  <motion.div
                    key={index}
                    className="text-center group"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <motion.div 
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                      style={{ background: brandColors.special.gradient.primary }}
                      whileHover={{ 
                        scale: 1.2,
                        rotate: 10
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: brandColors.gray[800] }}>
                      {stat.value}
                    </div>
                    
                    <div className="text-lg font-semibold mb-1" style={{ color: brandColors.gray[700] }}>
                      {stat.label}
                    </div>
                    
                    <div className="text-sm" style={{ color: brandColors.gray[500] }}>
                      {stat.description}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </ContentSlide>
  ];

  return (
    <UnifiedScrollSection totalHeight="400vh">
      {sections}
    </UnifiedScrollSection>
  );
}