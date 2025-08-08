import { InputHTMLAttributes, ReactNode } from 'react';
import styled from '@emotion/styled';
import { Check } from 'lucide-react';

interface RadioBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  icon?: ReactNode;
  variant?: 'default' | 'card';
}

export default function RadioBox({
  label,
  description,
  icon,
  variant = 'default',
  className = '',
  ...props
}: RadioBoxProps) {
  return (
    <RadioContainer variant={variant} className={className}>
      <HiddenInput type="radio" {...props} />
      <RadioLabel variant={variant}>
        <MainContent>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <TextWrapper>
            <LabelText>{label}</LabelText>
            {description && <DescriptionText>{description}</DescriptionText>}
          </TextWrapper>
        </MainContent>
        <CheckIndicator>
          <Check size={16} strokeWidth={3} />
        </CheckIndicator>
      </RadioLabel>
    </RadioContainer>
  );
}

// styled-components를 먼저 모두 정의합니다
const RadioContainer = styled.div<{ variant: string }>`
  position: relative;
  width: 100%;
`;

const CheckIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--surface-secondary, #f1f5f9);
  border: 2px solid var(--border-medium, #cbd5e1);
  color: var(--text-secondary, #94a3b8);
  opacity: 0.6;
  transform: scale(0.8);
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--surface-secondary, #f8fafc);
  border-radius: 10px;
  color: var(--text-secondary, #64748b);
  transition: all 200ms ease;
  flex-shrink: 0;
  border: 1px solid var(--border-light, #e2e8f0);
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + label {
    background: linear-gradient(135deg, 
      rgba(255, 107, 71, 0.08) 0%, 
      rgba(255, 107, 71, 0.12) 100%
    );
    border-color: var(--brand-primary);
    border-width: 2px;
    box-shadow: 0 0 0 3px rgba(255, 107, 71, 0.1);
    
    ${CheckIndicator} {
      background: var(--brand-primary);
      color: white;
      opacity: 1;
      transform: scale(1);
    }
    
    ${IconWrapper} {
      color: var(--brand-primary);
    }
  }
  
  &:focus-visible + label {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 217, 61, 0.4);
  }
  
  &:disabled + label {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--surface-disabled, #f5f5f5);
  }
`;

const RadioLabel = styled.label<{ variant: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ variant }) => variant === 'card' ? '20px' : '16px'};
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: ${({ variant }) => variant === 'card' ? '12px' : '8px'};
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  position: relative;
  min-height: ${({ variant }) => variant === 'card' ? '80px' : '60px'};
  
  &:hover {
    border-color: var(--brand-primary, #ff6b47);
    background: rgba(255, 107, 71, 0.02);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 107, 71, 0.03) 100%);
    opacity: 0;
    transition: opacity 200ms ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const MainContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
`;

const TextWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const LabelText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  line-height: 1.3;
  margin-bottom: 4px;
`;

const DescriptionText = styled.div`
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  line-height: 1.4;
`;