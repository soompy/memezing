'use client';

import { Moon, Sun } from 'lucide-react';
import styled from '@emotion/styled';
import { useTheme } from '@/context/ThemeContext';
import { transitions } from '@/styles/theme';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform ${transitions.normal} ease;
`;

const ToggleButton = styled.button<{ size: 'sm' | 'md' | 'lg' }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ size }) => {
    switch (size) {
      case 'sm': return '6px';
      case 'md': return '8px';
      case 'lg': return '10px';
      default: return '8px';
    }
  }};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all ${transitions.normal} ease;
  
  background-color: var(--surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  
  &:hover {
    background-color: var(--surface-hover);
    color: var(--text-primary);
    transform: scale(1.05);
    
    ${IconWrapper} {
      transform: rotate(15deg);
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export default function ThemeToggle({ size = 'md', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  }[size];

  return (
    <ToggleButton
      onClick={toggleTheme}
      size={size}
      className={className}
      title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
    >
      <IconWrapper>
        {theme === 'light' ? (
          <Moon size={iconSize} />
        ) : (
          <Sun size={iconSize} />
        )}
      </IconWrapper>
    </ToggleButton>
  );
}