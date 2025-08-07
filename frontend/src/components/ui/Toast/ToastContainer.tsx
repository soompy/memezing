'use client';

import React from 'react';
import styled from '@emotion/styled';
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast
}) => {
  if (toasts.length === 0) return null;

  return (
    <Container>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </Container>
  );
};

export default ToastContainer;

const Container = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    top: 70px;
    right: 16px;
    left: 16px;
  }
`;