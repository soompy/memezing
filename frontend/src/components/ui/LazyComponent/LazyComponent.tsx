'use client';

import { Suspense, ReactNode } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

// 기본 로딩 컴포넌트
const DefaultFallback = () => (
  <LoadingContainer>
    <Spinner />
    <LoadingText>로딩 중...</LoadingText>
  </LoadingContainer>
);

export default function LazyComponent({ 
  children, 
  fallback = <DefaultFallback />,
  className 
}: LazyComponentProps) {
  return (
    <Suspense fallback={fallback}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  );
}

// Styled Components
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--brand-primary);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const LoadingText = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
`;