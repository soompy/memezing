import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { X } from 'lucide-react';

interface TagProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export default function Tag({
  children,
  variant = 'primary',
  size = 'md',
  removable = false,
  onRemove,
  className = ''
}: TagProps) {
  return (
    <StyledTag variant={variant} size={size} className={className}>
      <TagContent>{children}</TagContent>
      {removable && onRemove && (
        <RemoveButton onClick={onRemove} type="button">
          <X size={size === 'sm' ? 12 : 14} />
        </RemoveButton>
      )}
    </StyledTag>
  );
}

const StyledTag = styled.span<{ variant: string; size: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 16px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 200ms ease;

  /* Size variants */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: 4px 8px;
          font-size: 11px;
          height: 24px;
        `;
      case 'lg':
        return `
          padding: 8px 12px;
          font-size: 14px;
          height: 36px;
        `;
      default:
        return `
          padding: 6px 10px;
          font-size: 12px;
          height: 28px;
        `;
    }
  }}

  /* Color variants */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: var(--accent-light, rgba(255, 217, 61, 0.15));
          color: var(--accent-dark, #b8860b);
          border: 1px solid var(--accent-light, rgba(255, 217, 61, 0.3));
        `;
      case 'secondary':
        return `
          background: var(--brand-secondary-light, rgba(78, 205, 196, 0.15));
          color: var(--brand-secondary-dark, #2d7a73);
          border: 1px solid var(--brand-secondary-light, rgba(78, 205, 196, 0.3));
        `;
      case 'accent':
        return `
          background: var(--accent-light, rgba(255, 217, 61, 0.15));
          color: var(--accent-dark, #b8860b);
          border: 1px solid var(--accent-light, rgba(255, 217, 61, 0.3));
        `;
      case 'neutral':
        return `
          background: var(--surface-secondary, #f8f9fa);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
        `;
      default:
        return `
          background: var(--accent-light, rgba(255, 217, 61, 0.15));
          color: var(--accent-dark, #b8860b);
          border: 1px solid var(--accent-light, rgba(255, 217, 61, 0.3));
        `;
    }
  }}

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-xs);
  }
`;

const TagContent = styled.span`
  flex: 1;
  line-height: 1;
`;

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  padding: 2px;
  border-radius: 50%;
  transition: all 200ms ease;

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.9);
  }
`;