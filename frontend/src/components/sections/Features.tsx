'use client';

import { MousePointer, Image, Share2 } from 'lucide-react';
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


// 테마에서 컬러 가져오기
const colorStyles = componentColors.features;

export default function Features() {
  // 각 feature를 렌더링하는 함수
  const renderFeatureCard = (feature: typeof features[0], index: number) => {
    const Icon = feature.icon;
    const colors = colorStyles[feature.color as keyof typeof colorStyles];
    
    return (
      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
      >
        <motion.div 
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg h-full relative overflow-hidden"
          whileHover={{ 
            y: -8,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="relative z-10">
            <motion.div 
              className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl mb-4 sm:mb-6"
              style={{ backgroundColor: colors.bg }}
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                backgroundColor: colors.icon
              }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: colors.icon }} />
            </motion.div>

            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: brandColors.gray[800] }}>
              {feature.title}
            </h3>

            <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.gray[500] }}>
              {feature.description}
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // 섹션별 콘텐츠 배열
  const sections = [
    // 1. 섹션 헤더
    <ContentSlide key="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 
          className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-6 sm:mb-9" 
          style={{ color: brandColors.gray[800] }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          왜 밈징을 선택해야 할까요?
        </motion.h2>
        <motion.p 
          className="text-lg sm:text-xl lg:text-3xl max-w-3xl mx-auto" 
          style={{ color: brandColors.gray[500] }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          밈징과 함께 누구나 5분 만에 바이럴 밈을 만들어보세요.
        </motion.p>
      </div>
    </ContentSlide>,

    // 2. 데스크탑용 그리드 레이아웃 (md 이상에서만 보이기)
    <ContentSlide key="features-desktop">
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div key={index}>
              {renderFeatureCard(feature, index)}
            </div>
          ))}
        </div>
      </div>
    </ContentSlide>,

    // 3-5. 모바일용 개별 슬라이드 (md 미만에서만 보이기)
    ...features.map((feature, index) => (
      <ContentSlide key={`feature-mobile-${index}`}>
        <div className="block md:hidden max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-8">
          {renderFeatureCard(feature, 0)}
        </div>
      </ContentSlide>
    ))
  ];

  return (
    <UnifiedScrollSection totalHeight="500vh">
      {sections}
    </UnifiedScrollSection>
  );
}