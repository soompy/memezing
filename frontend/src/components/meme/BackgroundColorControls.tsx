'use client';

import React, { useState, useCallback } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import Select, { SelectGroup } from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export interface BackgroundColorControlsProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

// 미리 정의된 배경색들
const PRESET_COLORS = [
  { color: '#ffffff', name: '화이트' },
  { color: '#f8f9fa', name: '연한 회색' },
  { color: '#e9ecef', name: '회색' },
  { color: '#000000', name: '블랙' },
  { color: '#343a40', name: '다크 그레이' },
  { color: '#dc3545', name: '빨강' },
  { color: '#fd7e14', name: '주황' },
  { color: '#ffc107', name: '노랑' },
  { color: '#28a745', name: '초록' },
  { color: '#20c997', name: '청록' },
  { color: '#007bff', name: '파랑' },
  { color: '#6f42c1', name: '보라' },
  { color: '#e83e8c', name: '핑크' },
  { color: '#6c757d', name: '그레이' },
  { color: '#17a2b8', name: '인포' },
  { color: '#f8f9fa', name: '라이트' },
];

// 그라데이션 배경 옵션들
const GRADIENT_BACKGROUNDS = [
  {
    gradient: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    name: '블루-퍼플',
    value: 'gradient-blue-purple'
  },
  {
    gradient: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
    name: '핑크-레드',
    value: 'gradient-pink-red'
  },
  {
    gradient: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
    name: '블루-시안',
    value: 'gradient-blue-cyan'
  },
  {
    gradient: 'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)',
    name: '그린-시안',
    value: 'gradient-green-cyan'
  },
  {
    gradient: 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
    name: '핑크-옐로',
    value: 'gradient-pink-yellow'
  },
  {
    gradient: 'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)',
    name: '민트-핑크',
    value: 'gradient-mint-pink'
  },
];

const BackgroundColorControls: React.FC<BackgroundColorControlsProps> = ({
  currentColor,
  onColorChange,
  disabled = false
}) => {
  const [customColor, setCustomColor] = useState(currentColor);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 색상 옵션 선택 처리
  const handleColorSelect = useCallback((value: string) => {
    if (value === 'custom-color') {
      setShowCustomInput(true);
      setShowColorPicker(false);
      return;
    }
    
    // 프리셋 색상 또는 그라데이션 처리
    onColorChange(value);
    if (!value.startsWith('gradient-')) {
      setCustomColor(value);
    }
    setShowColorPicker(false);
    setShowCustomInput(false);
  }, [onColorChange]);

  // 커스텀 색상 적용
  const handleCustomColorChange = useCallback((color: string) => {
    setCustomColor(color);
    onColorChange(color);
  }, [onColorChange]);

  // 색상이 그라데이션인지 확인
  const isGradient = currentColor.startsWith('gradient-') || currentColor.startsWith('linear-gradient');

  // 현재 색상 표시를 위한 스타일
  const getCurrentColorStyle = () => {
    if (isGradient) {
      const gradient = GRADIENT_BACKGROUNDS.find(g => g.value === currentColor);
      return gradient ? { background: gradient.gradient } : { backgroundColor: '#ffffff' };
    }
    return { backgroundColor: currentColor };
  };

  // 현재 색상 이름
  const getCurrentColorName = () => {
    if (isGradient) {
      const gradient = GRADIENT_BACKGROUNDS.find(g => g.value === currentColor);
      return gradient?.name || '그라데이션';
    }
    const preset = PRESET_COLORS.find(p => p.color === currentColor);
    return preset?.name || '커스텀';
  };
  
  // Select 컴포넌트용 그룹 생성 (색상 미리보기 포함)
  const colorGroups = [
    {
      label: '단색',
      options: PRESET_COLORS.map(preset => ({
        value: preset.color,
        label: preset.name,
        colorPreview: preset.color
      }))
    },
    {
      label: '그라데이션',
      options: GRADIENT_BACKGROUNDS.map(gradient => ({
        value: gradient.value,
        label: gradient.name,
        gradientPreview: gradient.gradient
      }))
    },
    {
      label: '커스텀',
      options: [{
        value: 'custom-color',
        label: '커스텀 색상'
      }]
    }
  ];
  
  // 현재 선택된 값
  const currentValue = showCustomInput ? 'custom-color' : currentColor;

  return (
    <div className="space-y-3">
      {/* 커스텀 색상 선택기 (색상 미리보기를 위해 커스텀 구현) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">배경색</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowColorPicker(!showColorPicker)}
            disabled={disabled}
            className={`
              w-full px-3 py-2 text-sm text-left bg-white border rounded-lg
              flex items-center justify-between gap-2 transition-all duration-200
              ${disabled 
                ? 'opacity-50 cursor-not-allowed border-gray-200' 
                : showColorPicker 
                  ? 'border-orange-400 ring-2 ring-orange-100 shadow-sm' 
                  : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
              }
            `}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-5 h-5 rounded border border-gray-300 flex-shrink-0"
                style={getCurrentColorStyle()}
              />
              <span className="font-medium text-gray-900 truncate">
                {getCurrentColorName()}
              </span>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform duration-200 ${
                showColorPicker ? 'transform rotate-180' : ''
              }`} 
            />
          </button>

          {/* 드롭다운 메뉴 */}
          {showColorPicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div 
                className="max-h-80 overflow-y-auto" 
                style={{ maxHeight: '20rem' }}
              >
                {colorGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                      {group.label}
                    </div>
                    {group.options.map((option, optionIndex) => {
                      const isSelected = currentValue === option.value;
                      
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleColorSelect(option.value)}
                          className={`
                            w-full px-3 py-2.5 text-left flex items-center justify-between gap-2
                            hover:bg-orange-50 transition-colors duration-150
                            ${isSelected ? 'bg-orange-100 text-orange-800 font-medium' : 'text-gray-700'}
                          `}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* 색상 미리보기 */}
                            {option.colorPreview && (
                              <div
                                className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: option.colorPreview }}
                              />
                            )}
                            {option.gradientPreview && (
                              <div
                                className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                                style={{ background: option.gradientPreview }}
                              />
                            )}
                            {!option.colorPreview && !option.gradientPreview && (
                              <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                                <Palette size={10} className="text-gray-500" />
                              </div>
                            )}
                            <span className="font-medium truncate">{option.label}</span>
                          </div>
                          {isSelected && (
                            <Check size={16} className="text-orange-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 클릭 외부 영역 감지용 오버레이 */}
          {showColorPicker && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowColorPicker(false)}
            />
          )}
        </div>
      </div>

      {/* 커스텀 색상 선택기 */}
      {showCustomInput && (
        <div className="space-y-3 p-4 border border-orange-200 rounded-lg bg-orange-50/30">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">커스텀 색상 설정</h5>
            <button
              onClick={() => setShowCustomInput(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              disabled={disabled}
              className="w-12 h-12 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              disabled={disabled}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-400 disabled:opacity-50"
              placeholder="#ffffff"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onColorChange(customColor);
                setShowCustomInput(false);
              }}
              disabled={disabled}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              적용
            </Button>
            <Button
              onClick={() => setShowCustomInput(false)}
              disabled={disabled}
              variant="outline"
              size="sm"
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundColorControls;