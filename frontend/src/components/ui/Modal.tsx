'use client';

import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  className = '',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}: ModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // 모달이 열렸을 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div 
        className="absolute inset-0 bg-black backdrop-blur-sm transition-opacity"
        style={{ opacity: 0.5 }}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* 모달 콘텐츠 */}
      <div className={`
        relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} 
        transform transition-all duration-300 ease-out scale-100
        ${className}
      `}>
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* 콘텐츠 */}
        <div className={title || showCloseButton ? 'p-6' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );

  // 포털을 사용하여 body에 렌더링
  return createPortal(modalContent, document.body);
}

// 확인 다이얼로그 전용 컴포넌트
interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  icon?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  type = 'info',
  icon
}: ConfirmDialogProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmButton: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={false}
      className="max-w-sm"
    >
      <div className="text-center">
        {/* 아이콘 */}
        {icon && (
          <div className={`mx-auto w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
            <div className={styles.iconColor}>
              {icon}
            </div>
          </div>
        )}
        
        {/* 제목 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        {/* 메시지 */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* 버튼들 */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 text-white ${styles.confirmButton}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// 알럿 다이얼로그 전용 컴포넌트
interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  icon?: ReactNode;
}

export function AlertDialog({
  isOpen,
  onClose,
  title = '알림',
  message,
  buttonText = '확인',
  type = 'info',
  icon
}: AlertDialogProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          button: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className="max-w-sm"
    >
      <div className="text-center">
        {/* 아이콘 */}
        {icon && (
          <div className={`mx-auto w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
            <div className={styles.iconColor}>
              {icon}
            </div>
          </div>
        )}
        
        {/* 제목 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        {/* 메시지 */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* 버튼 */}
        <Button
          onClick={onClose}
          className={`w-full text-white ${styles.button}`}
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}