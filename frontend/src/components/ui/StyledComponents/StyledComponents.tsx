'use client';

import styled from '@emotion/styled';
import { brandColors } from '@/styles/theme';

// 텍스트 컴포넌트들
export const PrimaryText = styled.h1<{ size?: 'sm' | 'md' | 'lg' | 'xl' }>`
  color: ${brandColors.gray[800]};
  font-weight: bold;
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return '1.25rem';
      case 'md': return '1.5rem';
      case 'lg': return '2rem';
      case 'xl': return '3rem';
      default: return '1.5rem';
    }
  }};
  margin-bottom: 1rem;
`;

export const SecondaryText = styled.p<{ size?: 'sm' | 'md' | 'lg' }>`
  color: ${brandColors.gray[500]};
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return '0.875rem';
      case 'md': return '1rem';
      case 'lg': return '1.25rem';
      default: return '1rem';
    }
  }};
  line-height: 1.6;
`;

export const MutedText = styled.span<{ size?: 'sm' | 'md' }>`
  color: ${brandColors.gray[400]};
  font-size: ${props => props.size === 'sm' ? '0.75rem' : '0.875rem'};
`;

// 컨테이너 컴포넌트들
export const BrandContainer = styled.div<{ variant?: 'primary' | 'secondary' | 'accent' }>`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return brandColors.primary[50];
      case 'secondary': return brandColors.secondary[50];
      case 'accent': return brandColors.accent[50];
      default: return brandColors.gray[50];
    }
  }};
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

export const GradientBackground = styled.div<{ variant?: 'primary' | 'secondary' | 'accent' | 'purple' }>`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return brandColors.special.gradient.primary;
      case 'secondary': return brandColors.special.gradient.secondary;
      case 'accent': return brandColors.special.gradient.accent;
      case 'purple': return brandColors.special.gradient.purple;
      default: return brandColors.special.gradient.primary;
    }
  }};
  color: white;
  border-radius: 1rem;
  padding: 2rem;
`;

// 버튼 컴포넌트들
export const BrandButton = styled.button<{ 
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}>`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return brandColors.primary[500];
      case 'secondary': return brandColors.secondary[400];
      case 'accent': return brandColors.accent[300];
      default: return brandColors.primary[500];
    }
  }};
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  padding: ${props => {
    switch (props.size) {
      case 'sm': return '0.5rem 1rem';
      case 'md': return '0.75rem 1.5rem';
      case 'lg': return '1rem 2rem';
      default: return '0.75rem 1.5rem';
    }
  }};
  
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return '0.875rem';
      case 'md': return '1rem';
      case 'lg': return '1.125rem';
      default: return '1rem';
    }
  }};

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'primary': return brandColors.primary[600];
        case 'secondary': return brandColors.secondary[500];
        case 'accent': return brandColors.accent[400];
        default: return brandColors.primary[600];
      }
    }};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

// 아이콘 컨테이너
export const IconContainer = styled.div<{ 
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  
  background: ${props => {
    switch (props.variant) {
      case 'primary': return brandColors.primary[50];
      case 'secondary': return brandColors.secondary[50];
      case 'accent': return brandColors.accent[50];
      default: return brandColors.primary[50];
    }
  }};
  
  width: ${props => {
    switch (props.size) {
      case 'sm': return '2rem';
      case 'md': return '3rem';
      case 'lg': return '4rem';
      default: return '3rem';
    }
  }};
  
  height: ${props => {
    switch (props.size) {
      case 'sm': return '2rem';
      case 'md': return '3rem';
      case 'lg': return '4rem';
      default: return '3rem';
    }
  }};

  svg {
    color: ${props => {
      switch (props.variant) {
        case 'primary': return brandColors.primary[500];
        case 'secondary': return brandColors.secondary[400];
        case 'accent': return brandColors.accent[300];
        default: return brandColors.primary[500];
      }
    }};
    
    width: ${props => {
      switch (props.size) {
        case 'sm': return '1rem';
        case 'md': return '1.5rem';
        case 'lg': return '2rem';
        default: return '1.5rem';
      }
    }};
    
    height: ${props => {
      switch (props.size) {
        case 'sm': return '1rem';
        case 'md': return '1.5rem';
        case 'lg': return '2rem';
        default: return '1.5rem';
      }
    }};
  }
`;

// 카드 컴포넌트
export const BrandCard = styled.div<{ hover?: boolean }>`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid ${brandColors.gray[200]};
  transition: all 0.2s ease;
  
  ${props => props.hover && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      border-color: ${brandColors.primary[200]};
    }
  `}
`;

// CSS 변수를 사용하는 컴포넌트 예시
export const CSSVariableText = styled.h2`
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

export const CSSVariableButton = styled.button`
  background: var(--color-primary-500);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: var(--color-primary-600);
  }
`;