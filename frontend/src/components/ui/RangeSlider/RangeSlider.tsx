'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './RangeSlider.module.scss';
import { cn } from '@/utils/cn';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  showValueOnHover?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
  disabled?: boolean;
}

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  unit = '',
  variant = 'primary',
  size = 'medium',
  showValue = false,
  showValueOnHover = true,
  formatValue = (val) => `${val}${unit}`,
  className,
  disabled = false
}: RangeSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showValueDisplay, setShowValueDisplay] = useState(showValue);
  const sliderRef = useRef<HTMLInputElement>(null);
  
  // 진행률 계산 (0-100%)
  const progress = ((value - min) / (max - min)) * 100;
  
  // 썸네일 위치 계산
  const thumbPosition = progress;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
    if (showValueOnHover) {
      setShowValueDisplay(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (showValueOnHover && !showValue) {
      setTimeout(() => setShowValueDisplay(false), 500);
    }
  };

  const handleMouseEnter = () => {
    if (showValueOnHover) {
      setShowValueDisplay(true);
    }
  };

  const handleMouseLeave = () => {
    if (showValueOnHover && !isDragging) {
      setShowValueDisplay(false);
    }
  };

  const handleFocus = () => {
    if (showValueOnHover) {
      setShowValueDisplay(true);
    }
  };

  const handleBlur = () => {
    if (showValueOnHover && !showValue) {
      setShowValueDisplay(false);
    }
  };

  // CSS 변수 설정
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--range-progress', `${progress}%`);
      sliderRef.current.style.setProperty('--thumb-position', `${thumbPosition}%`);
    }
  }, [progress, thumbPosition]);

  return (
    <div className={cn(styles.rangeContainer, className)}>
      {label && (
        <label className="text-xs font-medium text-gray-600 mb-2 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            styles.rangeSlider,
            variant !== 'primary' && styles[variant],
            size !== 'medium' && styles[size]
          )}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue(value)}
        />
        
        {(showValue || showValueDisplay) && (
          <div 
            className={cn(
              styles.valueDisplay,
              (showValue || showValueDisplay) && styles.show
            )}
            style={{ '--thumb-position': `${thumbPosition}%` } as React.CSSProperties}
          >
            {formatValue(value)}
          </div>
        )}
      </div>
      
      {/* 최소/최대 값 표시 */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}