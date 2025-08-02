'use client';

import { useState } from 'react';
import { Upload, Edit3, Share2, ArrowRight, Play, Pause } from 'lucide-react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import UnifiedScrollSection, { ContentSlide } from '@/components/ui/UnifiedScrollSection/UnifiedScrollSection';

const steps = [
  {
    id: 1,
    icon: Upload,
    title: '템플릿 선택 또는 업로드',
    description: '인기 K-드라마 템플릿을 선택하거나 직접 이미지를 업로드하세요',
    detail: '1000+ 개의 트렌디한 템플릿이 준비되어 있어요. 드래그 앤 드롭으로 간단하게!',
    color: '#FF6B47',
    bgColor: '#FFF5F3',
    demo: '/demo-step1.gif'
  },
  {
    id: 2,
    icon: Edit3,
    title: '텍스트 추가 & 편집',
    description: '재미있는 텍스트를 추가하고 폰트, 색상, 크기를 자유롭게 조정하세요',
    detail: '실시간 미리보기로 바로바로 확인하면서 편집할 수 있어요. AI 텍스트 제안 기능도 있답니다!',
    color: '#4ECDC4',
    bgColor: '#F0FDFC',
    demo: '/demo-step2.gif'
  },
  {
    id: 3,
    icon: Share2,
    title: '저장 & 공유',
    description: '완성된 밈을 고화질로 다운로드하거나 SNS에 바로 공유하세요',
    detail: 'Instagram, Twitter, Facebook 등 각 플랫폼에 최적화된 사이즈로 자동 변환!',
    color: '#FFD93D',
    bgColor: '#FFFBEB',
    demo: '/demo-step3.gif'
  }
];

const StepContainer = styled.div<{ isActive: boolean; color: string; bgColor: string }>`
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 3px solid ${props => props.isActive ? props.color : 'transparent'};
  transform: ${props => props.isActive ? 'scale(1.02)' : 'scale(1)'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: ${props => props.isActive ? 'scale(1.02)' : 'scale(1.01)'};
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${props => `linear-gradient(135deg, ${props.color}, ${props.color}80)`};
    border-radius: 26px;
    opacity: ${props => props.isActive ? 1 : 0};
    transition: opacity 0.3s ease;
    z-index: -1;
  }
`;

const IconWrapper = styled.div<{ color: string; bgColor: string; isActive: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${props => props.isActive ? props.color : props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  transform: ${props => props.isActive ? 'rotate(5deg)' : 'rotate(0deg)'};
`;

const DemoArea = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
`;

const PlayButton = styled.button<{ isPlaying: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 10;

  &:hover {
    background: white;
    transform: translate(-50%, -50%) scale(1.1);
  }

  svg {
    color: #667eea;
    width: 32px;
    height: 32px;
    margin-left: ${props => props.isPlaying ? '0' : '4px'};
  }
`;

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
    setIsPlaying(false);
  };

  const toggleDemo = () => {
    setIsPlaying(!isPlaying);
  };

  const currentStep = steps.find(step => step.id === activeStep) || steps[0];

  // 섹션별 콘텐츠 배열
  const sections = [
    // 1. 섹션 헤더
    <ContentSlide key="header" background="linear-gradient(to bottom right, #F9FAFB, #EBF8FF)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 
          className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          밈 제작이 이렇게 쉬울 줄 몰랐죠?
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          복잡한 편집 프로그램은 이제 안녕! 단 3단계로 바이럴 밈을 완성하세요.
        </motion.p>
      </div>
    </ContentSlide>,

    // 2. 3단계 가이드
    <ContentSlide key="steps" background="linear-gradient(to bottom right, #F9FAFB, #EBF8FF)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 왼쪽: 단계별 가이드 */}
          <div className="space-y-6">
            <motion.h3 
              className="text-2xl font-bold text-gray-900 mb-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              📋 따라하기 쉬운 3단계
            </motion.h3>
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              
              return (
                <motion.div 
                  key={step.id} 
                  className="relative"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <StepContainer
                    isActive={isActive}
                    color={step.color}
                    bgColor={step.bgColor}
                    onClick={() => handleStepClick(step.id)}
                    onMouseEnter={() => setHoveredStep(step.id)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <div className="flex items-start space-x-4">
                      <IconWrapper
                        color={step.color}
                        bgColor={step.bgColor}
                        isActive={isActive}
                      >
                        <Icon 
                          className="w-10 h-10" 
                          style={{ color: isActive ? 'white' : step.color }}
                        />
                      </IconWrapper>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span 
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: step.color }}
                          >
                            {step.id}
                          </span>
                          <h4 className="text-xl font-bold text-gray-900">
                            {step.title}
                          </h4>
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          {step.description}
                        </p>
                        
                        {isActive && (
                          <motion.div 
                            className="p-4 rounded-lg" 
                            style={{ backgroundColor: step.bgColor }}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="text-sm font-medium" style={{ color: step.color }}>
                              💡 {step.detail}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </StepContainer>
                </motion.div>
              );
            })}
          </div>

          {/* 오른쪽: 데모 영역 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <DemoArea>
              <div className="text-center relative z-10">
                <div className="mb-6">
                  <h4 className="text-2xl font-bold mb-2 text-white">
                    {currentStep.title} 데모
                  </h4>
                  <p className="text-blue-100">
                    실제 사용 화면을 확인해보세요
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                  <div className="aspect-video bg-white/20 rounded-lg flex items-center justify-center relative">
                    <PlayButton isPlaying={isPlaying} onClick={toggleDemo}>
                      {isPlaying ? <Pause /> : <Play />}
                    </PlayButton>
                  </div>
                </div>
                
                <div className="text-sm text-blue-100">
                  🎯 평균 완성 시간: <span className="font-bold text-white">5분</span>
                </div>
              </div>
            </DemoArea>
          </motion.div>
        </div>
      </div>
    </ContentSlide>,

    // 3. CTA
    <ContentSlide key="cta" background="linear-gradient(to bottom right, #F9FAFB, #EBF8FF)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          className="inline-flex items-center space-x-4 p-6 bg-white rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-4xl">🚀</div>
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              지금 바로 시작해보세요!
            </p>
            <p className="text-gray-600">
              회원가입 없이도 바로 사용 가능해요
            </p>
          </div>
          <motion.button 
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/meme-generator'}
          >
            밈 만들기 →
          </motion.button>
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