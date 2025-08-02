import { ButtonHTMLAttributes, ReactNode } from 'react';
import styled from '@emotion/styled';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </Spinner>
          로딩 중...
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
}

// Styled Components
const StyledButton = styled.button<{ variant: string; size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 300ms ease;
  border: none;
  text-decoration: none;
  white-space: nowrap;

  /* Size variants */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: 8px 12px;
          font-size: 14px;
          min-height: 32px;
        `;
      case 'lg':
        return `
          padding: 12px 24px;
          font-size: 16px;
          min-height: 48px;
        `;
      default:
        return `
          padding: 10px 16px;
          font-size: 14px;
          min-height: 40px;
        `;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: var(--brand-primary);
          color: white;
          
          &:hover:not(:disabled) {
            background: #ff4a1f;
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
        
      case 'secondary':
        return `
          background: var(--brand-secondary);
          color: white;
          
          &:hover:not(:disabled) {
            background: #3db8b8;
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;

      case 'outline':
        return `
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-medium);
          
          &:hover:not(:disabled) {
            background: var(--surface-hover);
            border-color: var(--brand-primary);
            color: var(--brand-primary);
          }
        `;

      case 'ghost':
        return `
          background: transparent;
          color: var(--text-secondary);
          
          &:hover:not(:disabled) {
            background: var(--surface-hover);
            color: var(--text-primary);
          }
        `;

      case 'white':
        return `
          background: white;
          color: var(--text-primary);
          border: 1px solid var(--border-light);
          
          &:hover:not(:disabled) {
            background: var(--surface);
            box-shadow: var(--shadow-sm);
          }
        `;

      case 'gradient':
        return `
          background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
          color: white;
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #ff4a1f 0%, #3db8b8 100%);
            transform: translateY(-1px);
            box-shadow: var(--shadow-lg);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;

      default:
        return '';
    }
  }}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none !important;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const Spinner = styled.svg`
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;