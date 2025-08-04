'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import styled from '@emotion/styled';

interface UnifiedScrollSectionProps {
  children: React.ReactNode[];
  className?: string;
  id?: string;
  totalHeight?: string;
}

const SectionContainer = styled.div<{ totalHeight: string }>`
  height: ${props => props.totalHeight};
  position: relative;
`;

const StickyContent = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
`;

const StyledContentSlide = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

// 개별 콘텐츠 슬라이드 래퍼 컴포넌트
interface ContentSlideWrapperProps {
  children: React.ReactNode;
  index: number;
  totalSections: number;
  smoothProgress: MotionValue<number>;
  isActive: boolean;
}

function ContentSlideWrapper({ 
  children, 
  index, 
  totalSections, 
  smoothProgress, 
  isActive 
}: ContentSlideWrapperProps) {
  const sectionStart = index / totalSections;
  const sectionEnd = (index + 1) / totalSections;
  
  const opacity = useTransform(
    smoothProgress,
    [
      Math.max(0, sectionStart - 0.05),
      sectionStart + 0.02,
      sectionEnd - 0.02,
      Math.min(1, sectionEnd + 0.05)
    ],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    smoothProgress,
    [sectionStart, sectionEnd],
    [10, -10]
  );

  const scale = useTransform(
    smoothProgress,
    [
      Math.max(0, sectionStart - 0.02),
      sectionStart + 0.01,
      sectionEnd - 0.01,
      Math.min(1, sectionEnd + 0.02)
    ],
    [0.98, 1, 1, 0.98]
  );

  return (
    <StyledContentSlide
      style={{ 
        opacity,
        y,
        scale,
        zIndex: isActive ? 10 : 1
      }}
    >
      {children}
    </StyledContentSlide>
  );
}

export default function UnifiedScrollSection({ 
  children, 
  className = '', 
  id,
  totalHeight = '400vh'
}: UnifiedScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });
  
  // 부드러운 스프링 애니메이션 - 더 빠르고 반응성 있게 조정
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.0001
  });

  // 섹션 진행도 계산
  const sectionProgress = useTransform(
    smoothProgress, 
    [0, 1], 
    [0, children.length - 1]
  );

  useEffect(() => {
    const unsubscribe = sectionProgress.onChange((latest) => {
      const newSection = Math.round(latest);
      if (newSection !== currentSection && newSection >= 0 && newSection < children.length) {
        setCurrentSection(newSection);
      }
    });

    return unsubscribe;
  }, [sectionProgress, currentSection, children.length]);

  return (
    <SectionContainer ref={ref} totalHeight={totalHeight} className={className} id={id}>
      <StickyContent>
        {children.map((child, index) => (
          <ContentSlideWrapper
            key={index}
            index={index}
            totalSections={children.length}
            smoothProgress={smoothProgress}
            isActive={currentSection === index}
          >
            {child}
          </ContentSlideWrapper>
        ))}
      </StickyContent>
      
      {/* 진행도 인디케이터 */}
      <motion.div 
        className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex flex-col space-y-2">
          {children.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-8 rounded-full bg-white/30"
              style={{
                backgroundColor: currentSection === index ? 'var(--text-inverse)' : 'rgba(255,255,255,0.3)'
              }}
              animate={{
                backgroundColor: currentSection === index ? 'var(--text-inverse)' : 'rgba(255,255,255,0.3)',
                scale: currentSection === index ? 1.2 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </motion.div>
    </SectionContainer>
  );
}

// 개별 콘텐츠 슬라이드 컴포넌트
interface ContentSlideProps {
  children: React.ReactNode;
  background?: string;
  className?: string;
}

export function ContentSlide({ children, background, className = '' }: ContentSlideProps) {
  return (
    <div 
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ background }}
    >
      {children}
    </div>
  );
}