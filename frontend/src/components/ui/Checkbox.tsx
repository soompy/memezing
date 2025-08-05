'use client';

import React from 'react';

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  error?: boolean;
}

export default function Checkbox({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'primary',
  error = false
}: CheckboxProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const variantClasses = {
    primary: {
      checked: 'bg-primary-500 border-none',
      unchecked: 'border-gray-300 bg-white group-hover:border-primary-300'
    },
    secondary: {
      checked: 'bg-secondary-500 border-secondary-500',
      unchecked: 'border-gray-300 bg-white group-hover:border-secondary-300'
    },
    accent: {
      checked: 'bg-accent-500 border-accent-500',
      unchecked: 'border-gray-300 bg-white group-hover:border-accent-300'
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <label 
      className={`flex items-center group cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
      htmlFor={id}
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div 
          className={`
            ${sizeClasses[size]} 
            rounded-md border-2 transition-all duration-300 flex items-center justify-center
            ${error ? 'border-red-400' : ''}
            ${checked 
              ? variantClasses[variant].checked
              : variantClasses[variant].unchecked
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${!disabled && !checked ? 'hover:shadow-sm' : ''}
          `}
        >
          {checked && (
            <svg 
              className={`${iconSizeClasses[size]} text-white`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </div>
      </div>
      {label && (
        <span className={`ml-3 text-sm transition-colors font-medium ${
          disabled ? 'text-gray-400' : 
          error ? 'text-red-600' :
          'text-gray-700 group-hover:text-gray-900'
        }`}>
          {label}
        </span>
      )}
    </label>
  );
}