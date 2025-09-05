'use client';

import { useState } from 'react';
import { Upload, Edit3, Share2, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import UnifiedScrollSection, { ContentSlide } from '@/components/ui/UnifiedScrollSection/UnifiedScrollSection';
import { brandColors, componentColors } from '@/styles/theme';
import { keyframes, css } from '@emotion/react';

const steps = [
  {
    id: 1,
    icon: Upload,
    title: '템플릿 선택 또는 업로드',
    description: '인기 K-드라마 템플릿을 선택하거나 직접 이미지를 업로드하세요',
    detail: '1000+ 개의 트렌디한 템플릿이 준비되어 있어요. 드래그 앤 드롭으로 간단하게!',
    ...componentColors.steps[0],
    demo: '/demo-step1.gif'
  },
  {
    id: 2,
    icon: Edit3,
    title: '텍스트 추가 & 편집',
    description: '재미있는 텍스트를 추가하고 폰트, 색상, 크기를 자유롭게 조정하세요',
    detail: '실시간 미리보기로 바로바로 확인하면서 편집할 수 있어요. AI 텍스트 제안 기능도 있답니다!',
    ...componentColors.steps[1],
    demo: '/demo-step2.gif'
  },
  {
    id: 3,
    icon: Share2,
    title: '저장 & 공유',
    description: '완성된 밈을 고화질로 다운로드하거나 SNS에 바로 공유하세요',
    detail: 'Instagram, Twitter, Facebook 등 각 플랫폼에 최적화된 사이즈로 자동 변환!',
    ...componentColors.steps[2],
    demo: '/demo-step3.gif'
  }
];

const StepContainer = styled.div<{ isActive: boolean; color: string; bgColor: string }>`
  position: relative;
  border-radius: 24px;
  padding: 1.5rem 2rem;
  transform: ${props => props.isActive ? 'scale(1.02)' : 'scale(1)'};
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  max-width: none;
  
  @media (min-width: 768px) {
    border-radius: 32px;
    padding: 2.5rem 3rem;
  }
  
  @media (min-width: 1024px) {
    padding: 3rem 4rem;
  }
`;

// flicker keyframe 정의
const flicker = keyframes`
  0%   { opacity: 1; }
  10%  { opacity: 0.4; }
  20%  { opacity: 1; }
  30%  { opacity: 0.3; }
  40%  { opacity: 1; }
  50%  { opacity: 0.6; }
  60%  { opacity: 1; }
  70%  { opacity: 0.5; }
  80%  { opacity: 1; }
  90%  { opacity: 0.7; }
  100% { opacity: 1; }
`;

// pulse ring keyframe 정의 (펄스링 가시성을 위한 애니메이션)
const pulseRing = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(144, 105, 235, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(144, 105, 235, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(144, 105, 235, 0);
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
  animation: ${props => props.isActive ? css`${pulseRing} 2s infinite, ${flicker} 8s infinite` : css`${flicker} 8s infinite`};
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  transform: ${props => props.isActive ? 'rotate(5deg)' : 'rotate(0deg)'};
  position: relative;
  
  @media (min-width: 768px) {
    width: 100px;
    height: 100px;
    border-radius: 25px;
    margin-bottom: 1.75rem;
  }
  
  @media (min-width: 1024px) {
    width: 120px;
    height: 120px;
    border-radius: 30px;
    margin-bottom: 2rem;
  }
  
  /* 진행 중인 스텝에만 펄스링 보더 추가 */
  ${props => props.isActive && css`
    border: 3px solid ${props.color};
    box-shadow: 0 0 0 0 ${props.color}33;
  `}
`;

export default function HowItWorks() {

  // 섹션별 콘텐츠 배열
  const sections = [
      // 1. 제목 섹션
      <ContentSlide key="title">
          <div className="w-full px-4 sm:px-8 lg:px-16 h-screen flex items-center justify-center">
              <motion.h2
                  className="text-2xl sm:text-4xl lg:text-7xl font-bold text-center w-full"
                  style={{ color: 'var(--text-primary)' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
              >
                  따라하기 쉬운 3단계
              </motion.h2>
          </div>
      </ContentSlide>,

      // 2. 1단계
      <ContentSlide key="step1">
          <div className="w-full px-4 sm:px-8 lg:px-16 h-screen flex items-center justify-center">
              <div className="w-full max-w-6xl text-center">
                  <motion.div
                      className="relative"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                  >
                      <StepContainer
                          isActive={true}
                          color={steps[0].color}
                          bgColor={steps[0].bgColor}
                          onClick={() => {}}
                      >
                          <div className="flex flex-col items-center text-center">
                              <IconWrapper
                                  color={steps[0].color}
                                  bgColor={steps[0].bgColor}
                                  isActive={true}
                              >
                                  <Upload
                                      className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                                      style={{ color: "white" }}
                                  />
                              </IconWrapper>

                              <div className="space-y-3 sm:space-y-4">
                                  <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-3 mb-3 sm:mb-4">
                                      <span
                                          className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-lg font-bold mb-2 sm:mb-0"
                                          style={{
                                              backgroundColor: steps[0].color,
                                              color: 'white',
                                              border: `2px solid ${steps[0].color}`,
                                              boxShadow: `0 0 0 4px ${steps[0].color}22`
                                          }}
                                      >
                                          1
                                      </span>
                                      <h3 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                          {steps[0].title}
                                      </h3>
                                  </div>

                                  <p className="text-sm sm:text-lg lg:text-2xl xl:text-3xl mb-4 sm:mb-6 lg:mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                      {steps[0].description}
                                  </p>

                                  <motion.div
                                      className="p-4 sm:p-6 rounded-lg"
                                      style={{
                                          backgroundColor: steps[0].bgColor,
                                      }}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      transition={{ duration: 0.3, delay: 0.3 }}
                                  >
                                      <p
                                          className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-medium"
                                          style={{ color: 'var(--text-primary)' }}
                                      >
                                          💡 {steps[0].detail}
                                      </p>
                                  </motion.div>
                              </div>
                          </div>
                      </StepContainer>
                  </motion.div>
              </div>
          </div>
      </ContentSlide>,

      // 3. 2단계
      <ContentSlide key="step2">
          <div className="w-full px-4 sm:px-8 lg:px-16 h-screen flex items-center justify-center">
              <div className="w-full max-w-6xl text-center">
                  <motion.div
                      className="relative"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                  >
                      <StepContainer
                          isActive={true}
                          color={steps[1].color}
                          bgColor={steps[1].bgColor}
                          onClick={() => {}}
                      >
                          <div className="flex flex-col items-center text-center">
                              <IconWrapper
                                  color={steps[1].color}
                                  bgColor={steps[1].bgColor}
                                  isActive={true}
                              >
                                  <Edit3
                                      className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                                      style={{ color: "white" }}
                                  />
                              </IconWrapper>

                              <div className="space-y-3 sm:space-y-4">
                                  <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-3 mb-3 sm:mb-4">
                                      <span
                                          className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-lg font-bold mb-2 sm:mb-0"
                                          style={{
                                              backgroundColor: steps[1].color,
                                              color: 'white',
                                              border: `2px solid ${steps[1].color}`,
                                              boxShadow: `0 0 0 4px ${steps[1].color}22`
                                          }}
                                      >
                                          2
                                      </span>
                                      <h3 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                          {steps[1].title}
                                      </h3>
                                  </div>

                                  <p className="text-sm sm:text-lg lg:text-2xl xl:text-3xl mb-4 sm:mb-6 lg:mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                      {steps[1].description}
                                  </p>

                                  <motion.div
                                      className="p-4 sm:p-6 rounded-lg"
                                      style={{
                                          backgroundColor: steps[1].bgColor,
                                      }}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      transition={{ duration: 0.3, delay: 0.3 }}
                                  >
                                      <p
                                          className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-medium"
                                          style={{ color: 'var(--text-primary)' }}
                                      >
                                          ⭐️ {steps[1].detail}
                                      </p>
                                  </motion.div>
                              </div>
                          </div>
                      </StepContainer>
                  </motion.div>
              </div>
          </div>
      </ContentSlide>,

      // 4. 3단계
      <ContentSlide key="step3">
          <div className="w-full px-4 sm:px-8 lg:px-16 h-screen flex items-center justify-center">
              <div className="w-full max-w-6xl text-center">
                  <motion.div
                      className="relative"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                  >
                      <StepContainer
                          isActive={true}
                          color={steps[2].color}
                          bgColor={steps[2].bgColor}
                          onClick={() => {}}
                      >
                          <div className="flex flex-col items-center text-center">
                              <IconWrapper
                                  color={steps[2].color}
                                  bgColor={steps[2].bgColor}
                                  isActive={true}
                              >
                                  <Share2
                                      className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                                      style={{ color: "white" }}
                                  />
                              </IconWrapper>

                              <div className="space-y-3 sm:space-y-4">
                                  <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-3 mb-3 sm:mb-4">
                                      <span
                                          className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-lg font-bold mb-2 sm:mb-0"
                                          style={{
                                              backgroundColor: steps[2].color,
                                              color: 'white',
                                              border: `2px solid ${steps[2].color}`,
                                              boxShadow: `0 0 0 4px ${steps[2].color}22`
                                          }}
                                      >
                                          3
                                      </span>
                                      <h3 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                          {steps[2].title}
                                      </h3>
                                  </div>

                                  <p className="text-sm sm:text-lg lg:text-2xl xl:text-3xl mb-4 sm:mb-6 lg:mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                      {steps[2].description}
                                  </p>

                                  <motion.div
                                      className="p-4 sm:p-6 rounded-lg"
                                      style={{
                                          backgroundColor: steps[2].bgColor,
                                      }}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      transition={{ duration: 0.3, delay: 0.3 }}
                                  >
                                      <p
                                          className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-medium"
                                          style={{ color: 'var(--text-primary)' }}
                                      >
                                          💡 {steps[2].detail}
                                      </p>
                                  </motion.div>
                              </div>
                          </div>
                      </StepContainer>
                  </motion.div>
              </div>
          </div>
      </ContentSlide>,
  ];

  return (
    <UnifiedScrollSection totalHeight="600vh">
      {sections}
    </UnifiedScrollSection>
  );
}