'use client';

import { ReactNode, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BottomPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  height?: 'auto' | 'half' | 'full';
  className?: string;
  overlayClassName?: string;
}

export default function BottomPopup({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  height = 'auto',
  className,
  overlayClassName
}: BottomPopupProps) {
  
  // ESC 키로 팝업 닫기
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

  const getHeightStyles = () => {
    switch (height) {
      case 'auto': return { maxHeight: '80vh' };
      case 'half': return { height: '50vh' };
      case 'full': return { height: '100vh' };
      default: return { maxHeight: '80vh' };
    }
  };

  return (
    <PopupContainer>
      <Overlay 
        onClick={handleOverlayClick}
        className={overlayClassName}
      />
      
      <PopupWrapper>
        <PopupContent 
          style={getHeightStyles()}
          className={className}
          isOpen={isOpen}
        >
          <DragHandle />
          
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
          
          <Content height={height}>
            {children}
          </Content>
        </PopupContent>
      </PopupWrapper>
    </PopupContainer>
  );
}

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
`;

const PopupContainer = styled.div`
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.3s ease;
`;

const PopupWrapper = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
`;

const PopupContent = styled.div<{ isOpen: boolean }>`
  position: relative;
  background: white;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: 0 -10px 25px -3px rgba(0, 0, 0, 0.1);
  width: 100%;
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(100%)'};
  animation: ${props => props.isOpen ? slideUp : slideDown} 0.3s ease-out;
  overflow: hidden;
`;

const DragHandle = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 0.75rem;
  padding-bottom: 0.5rem;
  
  &::after {
    content: '';
    width: 2.5rem;
    height: 0.25rem;
    background: #d1d5db;
    border-radius: 9999px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 0.25rem;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: #4b5563;
  }
`;

const Content = styled.div<{ height: 'auto' | 'half' | 'full' }>`
  padding: 1.5rem;
  overflow-y: auto;
  max-height: ${props => props.height === 'auto' ? 'calc(80vh - 120px)' : 'none'};
`;