'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface SecondaryTabItem {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SecondaryTabGroupProps {
  items: SecondaryTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SecondaryTabGroup: React.FC<SecondaryTabGroupProps> = ({
  items,
  activeKey,
  onChange,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'py-1.5 px-2 text-xs space-x-1',
    md: 'py-2 px-3 text-sm space-x-2',
    lg: 'py-3 px-4 text-base space-x-3'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getTabClasses = (isActive: boolean) => {
    const baseClasses = `
      flex items-center border-b-2 font-medium whitespace-nowrap 
      transition-all duration-200 cursor-pointer select-none
      ${sizeClasses[size]}
    `;

    return cn(baseClasses,
      isActive
        ? `
          border-[#4ECDC4] text-[#1F9B92] bg-[#F0FDFC]
          shadow-sm font-semibold
        `
        : `
          border-transparent text-gray-500 
          hover:text-[#4ECDC4] hover:border-[#B8F2ED] hover:bg-[#F0FDFC]
        `
    );
  };

  return (
    <div className={cn('border-b border-[#B8F2ED]', className)}>
      <nav 
        className="flex space-x-6" 
        aria-label="Tabs"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;
          
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={getTabClasses(isActive)}
              type="button"
            >
              {Icon && (
                <Icon 
                  className={cn(
                    iconSizes[size],
                    isActive ? 'text-[#1F9B92]' : 'text-current'
                  )} 
                />
              )}
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SecondaryTabGroup;