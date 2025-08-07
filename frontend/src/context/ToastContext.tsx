'use client';

import React, { createContext, useContext } from 'react';
import { useToast, UseToastReturn } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

const ToastContext = createContext<UseToastReturn | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer 
        toasts={toast.toasts} 
        onRemoveToast={toast.removeToast}
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = (): UseToastReturn => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  
  return context;
};