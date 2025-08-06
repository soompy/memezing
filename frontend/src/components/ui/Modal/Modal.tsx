'use client';

import { ReactNode, useEffect } from 'react';
import styled from '@emotion/styled';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  overlayClassName
}: ModalProps) {
  
  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // 스크롤 방지
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { maxWidth: '24rem' };
      case 'md': return { maxWidth: '28rem' };
      case 'lg': return { maxWidth: '32rem' };
      case 'xl': return { maxWidth: '36rem' };
      case 'full': return { maxWidth: '100%', margin: '0 1rem' };
      default: return { maxWidth: '28rem' };
    }
  };

  return (
    <ModalContainer>
      <Overlay 
        onClick={handleOverlayClick}
        className={overlayClassName}
      />
      
      <ModalWrapper>
        <ModalContent 
          style={getSizeStyles()}
          className={className}
        >
          {(title || showCloseButton) && (
            <Header>
              {title && (
                <Title>{title}</Title>
              )}
              {showCloseButton && (
                <CloseButton onClick={onClose}>
                  <X size={24} />
                </CloseButton>
              )}
            </Header>
          )}
          
          <Content hasHeader={!!(title || showCloseButton)}>
            {children}
          </Content>
        </ModalContent>
      </ModalWrapper>
    </ModalContainer>
  );
}

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.3s ease;
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  pointer-events: none;
  overflow-y: auto;
  
  @media (max-width: 640px) {
    align-items: flex-start;
    padding: 1rem;
    padding-top: max(1rem, env(safe-area-inset-top));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
`;

const ModalContent = styled.div`
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-xl);
  width: 100%;
  transform: scale(1);
  transition: all 0.3s ease;
  pointer-events: auto;
  max-height: 100%;
  
  @media (max-width: 640px) {
    max-height: calc(100vh - 2rem);
    margin-top: 0;
    display: flex;
    flex-direction: column;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 0.25rem;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--text-primary);
    background: var(--surface-hover);
  }
`;

const Content = styled.div<{ hasHeader: boolean }>`
  padding: 1.5rem;
  padding-top: ${props => props.hasHeader ? '1.5rem' : '1.5rem'};
  color: var(--text-primary);
  
  @media (max-width: 640px) {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
`;