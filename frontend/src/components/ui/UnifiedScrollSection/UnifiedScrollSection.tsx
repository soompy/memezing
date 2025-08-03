'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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
  
  // 부드러운 스프링 애니메이션
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 섹션 진행도 계산
  const sectionProgress = useTransform(
    smoothProgress, 
    [0, 1], 
    [0, children.length - 1]
  );

  useEffect(() => {
    const unsubscribe = sectionProgress.onChange((latest) => {
      const newSection = Math.floor(latest);
      if (newSection !== currentSection && newSection >= 0 && newSection < children.length) {
        setCurrentSection(newSection);
      }
    });

    return unsubscribe;
  }, [sectionProgress, currentSection, children.length]);

  return (
    <SectionContainer ref={ref} totalHeight={totalHeight} className={className} id={id}>
      <StickyContent>
        {children.map((child, index) => {
          // 각 섹션의 투명도와 위치 계산
          const sectionStart = index / children.length;
          const sectionEnd = (index + 1) / children.length;
          
          const opacity = useTransform(
            smoothProgress,
            [
              Math.max(0, sectionStart - 0.1),
              sectionStart,
              sectionEnd,
              Math.min(1, sectionEnd + 0.1)
            ],
            [0, 1, 1, 0]
          );

          const y = useTransform(
            smoothProgress,
            [sectionStart, sectionEnd],
            [20, -20]
          );

          const scale = useTransform(
            smoothProgress,
            [
              Math.max(0, sectionStart - 0.05),
              sectionStart,
              sectionEnd,
              Math.min(1, sectionEnd + 0.05)
            ],
            [0.95, 1, 1, 0.95]
          );

          return (
            <StyledContentSlide
              key={index}
              style={{ 
                opacity,
                y,
                scale,
                zIndex: currentSection === index ? 10 : 1
              }}
            >
              {child}
            </StyledContentSlide>
          );
        })}
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