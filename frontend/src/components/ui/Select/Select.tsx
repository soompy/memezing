'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  category?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps {
  options?: SelectOption[];
  groups?: SelectGroup[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function Select({
  options = [],
  groups = [],
  value,
  onChange,
  placeholder = '선택하세요',
  label,
  error,
  disabled = false,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 모든 옵션을 평탄화
  const allOptions = groups.length > 0
    ? groups.flatMap(group => group.options)
    : options;

  // 선택된 옵션 찾기
  const selectedOption = allOptions.find(option => option.value === value);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < allOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : allOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            onChange(allOptions[highlightedIndex].value);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, allOptions, onChange]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const getOptionClasses = (index: number, optionValue: string) => {
    const classes = [styles.option];
    if (highlightedIndex === index) classes.push(styles.highlighted);
    if (value === optionValue) classes.push(styles.selected);
    return classes.join(' ');
  };

  const getTriggerClasses = () => {
    const classes = [styles.trigger];
    if (error) classes.push(styles.error);
    if (isOpen) classes.push(styles.open);
    return classes.join(' ');
  };

  const renderOptions = () => {
    if (groups.length > 0) {
      let optionIndex = 0;
      return groups.map((group, groupIndex) => (
        <div key={groupIndex}>
          <div className={styles.groupLabel}>
            {group.label}
          </div>
          {group.options.map((option) => {
            const currentIndex = optionIndex++;
            return (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={getOptionClasses(currentIndex, option.value)}
                onMouseEnter={() => setHighlightedIndex(currentIndex)}
                onMouseLeave={() => setHighlightedIndex(-1)}
              >
                <div className={styles.optionContent}>
                  <div className={styles.optionInfo}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionPreview}>
                      가나다 ABC 123
                    </span>
                  </div>
                  {value === option.value && (
                    <Check className={styles.checkIcon} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ));
    } else {
      return options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => handleOptionClick(option.value)}
          className={getOptionClasses(index, option.value)}
          onMouseEnter={() => setHighlightedIndex(index)}
          onMouseLeave={() => setHighlightedIndex(-1)}
        >
          <div className={styles.optionContent}>
            <div className={styles.optionInfo}>
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionPreview}>
                가나다 ABC 123
              </span>
            </div>
            {value === option.value && (
              <Check className={styles.checkIcon} />
            )}
          </div>
        </button>
      ));
    }
  };

  const selectClasses = [styles.select, className].filter(Boolean).join(' ');

  return (
    <div className={selectClasses}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      
      <div ref={selectRef}>
        {/* 트리거 버튼 */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={getTriggerClasses()}
        >
          <div className={styles.triggerContent}>
            <span className={`${styles.triggerText} ${!selectedOption ? styles.placeholder : ''}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown 
              className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
            />
          </div>
        </button>

        {/* 드롭다운 메뉴 */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={styles.dropdown}
          >
            {allOptions.length === 0 ? (
              <div className={styles.emptyMessage}>
                옵션이 없습니다
              </div>
            ) : (
              renderOptions()
            )}
          </div>
        )}
      </div>

      {error && (
        <p className={styles.errorMessage}>{error}</p>
      )}
    </div>
  );
}