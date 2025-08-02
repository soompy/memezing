'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import styled from '@emotion/styled';

interface ScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  height?: string;
  background?: string;
  sticky?: boolean;
}

const SectionContainer = styled.div<{ height: string; background?: string }>`
  min-height: ${props => props.height};
  background: ${props => props.background || 'transparent'};
  position: relative;
  overflow: hidden;
`;

const StickyContent = styled(motion.div)`
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export default function ScrollSection({ 
  children, 
  className = '', 
  id,
  height = '100vh',
  background,
  sticky = false
}: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  
  // 부드러운 스프링 애니메이션
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 다양한 변환 값들
  const y = useTransform(smoothProgress, [0, 1], [50, -50]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  if (sticky) {
    return (
      <SectionContainer ref={ref} height={height} background={background} className={className} id={id}>
        <StickyContent
          style={{ 
            opacity: isInView ? 1 : 0,
            scale: isInView ? 1 : 0.9
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {children}
        </StickyContent>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer ref={ref} height={height} background={background} className={className} id={id}>
      <motion.div
        style={{
          y,
          opacity,
          scale
        }}
        className="h-full flex items-center justify-center"
      >
        {children}
      </motion.div>
    </SectionContainer>
  );
}

// 스크롤에 따라 텍스트가 순차적으로 나타나는 컴포넌트
interface ScrollRevealTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollRevealText({ children, className = '', delay = 0 }: ScrollRevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.2"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [30, 0]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ opacity, y }}
      transition={{ delay, duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

// 스크롤에 따라 카드들이 순차적으로 나타나는 컴포넌트
interface ScrollRevealCardsProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function ScrollRevealCards({ children, className = '', staggerDelay = 0.1 }: ScrollRevealCardsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"]
  });

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => {
        const cardProgress = useTransform(
          scrollYProgress,
          [index / children.length, (index + 1) / children.length],
          [0, 1]
        );
        const opacity = useTransform(cardProgress, [0, 1], [0, 1]);
        const y = useTransform(cardProgress, [0, 1], [50, 0]);
        const scale = useTransform(cardProgress, [0, 1], [0.8, 1]);

        return (
          <motion.div
            key={index}
            style={{ opacity, y, scale }}
            transition={{ duration: 0.6, delay: index * staggerDelay }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}

// 배경 패럴랙스 효과
interface ParallaxBackgroundProps {
  children?: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxBackground({ children, speed = 0.5, className = '' }: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);

  return (
    <motion.div
      ref={ref}
      className={`absolute inset-0 ${className}`}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
}