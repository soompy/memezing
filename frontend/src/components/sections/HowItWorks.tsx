'use client';

import { useState } from 'react';
import { Upload, Edit3, Share2, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import UnifiedScrollSection, { ContentSlide } from '@/components/ui/UnifiedScrollSection/UnifiedScrollSection';
import { brandColors, componentColors } from '@/styles/theme';

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
  background: white;
  border-radius: 32px;
  padding: 3rem 4rem;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  border: 4px solid ${props => props.isActive ? props.color : 'transparent'};
  transform: ${props => props.isActive ? 'scale(1.02)' : 'scale(1)'};
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  max-width: none;
  
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
  width: 120px;
  height: 120px;
  border-radius: 30px;
  background: ${props => props.isActive ? props.color : props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  transform: ${props => props.isActive ? 'rotate(5deg)' : 'rotate(0deg)'};
`;


export default function HowItWorks() {

  // 섹션별 콘텐츠 배열
  const sections = [
      // 1. 제목 섹션
      <ContentSlide key="title">
          <div className="w-full px-8 sm:px-12 lg:px-16 h-screen flex items-center justify-center">
              <motion.h2
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold text-center text-gray-900 w-full"
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
          <div className="w-full px-8 sm:px-12 lg:px-16 h-screen flex items-center justify-center">
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
                                      className="w-20 h-20"
                                      style={{ color: "white" }}
                                  />
                              </IconWrapper>

                              <div className="space-y-4">
                                  <div className="flex items-center justify-center space-x-3 mb-4">
                                      <span
                                          className="inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold text-white"
                                          style={{
                                              backgroundColor: steps[0].color,
                                          }}
                                      >
                                          1
                                      </span>
                                      <h3 className="text-4xl lg:text-5xl font-bold text-gray-900">
                                          {steps[0].title}
                                      </h3>
                                  </div>

                                  <p className="text-2xl lg:text-3xl text-gray-600 mb-8 leading-relaxed">
                                      {steps[0].description}
                                  </p>

                                  <motion.div
                                      className="p-6 rounded-lg"
                                      style={{
                                          backgroundColor: steps[0].bgColor,
                                      }}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      transition={{ duration: 0.3, delay: 0.3 }}
                                  >
                                      <p
                                          className="text-xl lg:text-2xl font-medium"
                                          style={{ color: steps[0].color }}
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
          <div className="w-full px-8 sm:px-12 lg:px-16 h-screen flex items-center justify-center">
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
                                      className="w-20 h-20"
                                      style={{ color: "white" }}
                                  />
                              </IconWrapper>

                              <div className="space-y-4">
                                  <div className="flex items-center justify-center space-x-3 mb-4">
                                      <span
                                          className="inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold text-white"
                                          style={{
                                              backgroundColor: steps[1].color,
                                          }}
                                      >
                                          2
                                      </span>
                                      <h3 className="text-4xl lg:text-5xl font-bold text-gray-900">
                                          {steps[1].title}
                                      </h3>
                                  </div>

                                  <p className="text-2xl lg:text-3xl text-gray-600 mb-8 leading-relaxed">
                                      {steps[1].description}
                                  </p>

                                  <motion.div
                                      className="p-6 rounded-lg"
                                      style={{
                                          backgroundColor: steps[1].bgColor,
                                      }}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      transition={{ duration: 0.3, delay: 0.3 }}
                                  >
                                      <p
                                          className="text-xl lg:text-2xl font-medium"
                                          style={{ color: steps[1].color }}
                                      >
                                          💡 {steps[1].detail}
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
          <div className="w-full px-8 sm:px-12 lg:px-16 h-screen flex items-center justify-center">
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
                                      className="w-20 h-20"
                                      style={{ color: "white" }}
                                  />
                              </IconWrapper>

                              <div className="space-y-4">
                                  <div className="flex items-center justify-center space-x-3 mb-4">
                                      <span
                                          className="inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold text-white"
                                          style={{
                                              backgroundColor: steps[2].color,
                                          }}
                                      >
                                          3
                                      </span>
                                      <h3 className="text-4xl lg:text-5xl font-bold text-gray-900">
                                          {steps[2].title}
                                      </h3>
                                  </div>

                                  <p className="text-2xl lg:text-3xl text-gray-600 mb-8 leading-relaxed">
                                      {steps[2].description}
                                  </p>

                                  <motion.div
                                      className="p-6 rounded-lg"
                                      style={{
                                          backgroundColor: steps[2].bgColor,
                                      }}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      transition={{ duration: 0.3, delay: 0.3 }}
                                  >
                                      <p
                                          className="text-xl lg:text-2xl font-medium"
                                          style={{ color: steps[2].color }}
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

      // 5. CTA
      <ContentSlide key="cta">
          <div className="w-full px-8 sm:px-12 lg:px-16 text-center h-screen flex items-center justify-center">
              <motion.div
                  className="flex flex-col items-center space-y-8 p-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
              >
                  <div className="text-center">
                      <p className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4 leading-relaxed">
                          지금 바로 시작해보세요!
                      </p>
                      <p className="text-2xl lg:text-4xl text-gray-600">
                          회원가입 없이도 바로 사용 가능해요
                      </p>
                  </div>
                  <Button
                      variant="primary"
                      size="lg"
                      onClick={() => (window.location.href = "/meme-generator")}
                      className="text-xl px-12 py-6 rounded-2xl font-bold"
                  >
                      밈 만들기 시작하기
                  </Button>
              </motion.div>
          </div>
      </ContentSlide>,
  ];

  return (
    <UnifiedScrollSection totalHeight="600vh">
      {sections}
    </UnifiedScrollSection>
  );
}