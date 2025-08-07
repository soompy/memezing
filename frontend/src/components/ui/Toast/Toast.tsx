'use client';

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // 등장 애니메이션
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // 자동 제거
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // 애니메이션 시간과 동일
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <ToastContainer
      type={type}
      isVisible={isVisible}
      isRemoving={isRemoving}
    >
      <ToastIcon type={type}>
        {getIcon()}
      </ToastIcon>
      
      <ToastMessage>{message}</ToastMessage>
      
      <CloseButton onClick={handleClose}>
        <X size={16} />
      </CloseButton>
    </ToastContainer>
  );
};

export default Toast;

// Styled Components
const ToastContainer = styled.div<{
  type: ToastProps['type'];
  isVisible: boolean;
  isRemoving: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  max-width: 480px;
  padding: 16px 20px;
  margin-bottom: 8px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid;
  
  transform: translateX(${props => props.isVisible ? '0' : '100%'});
  opacity: ${props => props.isRemoving ? '0' : '1'};
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.2);
          color: #059669;
        `;
      case 'error':
        return `
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
          color: #dc2626;
        `;
      case 'warning':
        return `
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.2);
          color: #d97706;
        `;
      case 'info':
      default:
        return `
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
          color: #2563eb;
        `;
    }
  }}
`;

const ToastIcon = styled.div<{ type: ToastProps['type'] }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `color: #059669;`;
      case 'error':
        return `color: #dc2626;`;
      case 'warning':
        return `color: #d97706;`;
      case 'info':
      default:
        return `color: #2563eb;`;
    }
  }}
`;

const ToastMessage = styled.p`
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 200ms ease;
  
  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
  }
`;