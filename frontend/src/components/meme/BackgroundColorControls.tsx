'use client';

import React, { useState, useCallback } from 'react';
import Select from '@/components/ui/Select';
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
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 색상 옵션 선택 처리
  const handleColorSelect = useCallback((value: string) => {
    if (value === 'custom-color') {
      setShowCustomInput(true);
      return;
    }
    
    // 프리셋 색상 또는 그라데이션 처리
    onColorChange(value);
    if (!value.startsWith('gradient-')) {
      setCustomColor(value);
    }
    setShowCustomInput(false);
  }, [onColorChange]);

  // 커스텀 색상 적용
  const handleCustomColorChange = useCallback((color: string) => {
    setCustomColor(color);
    onColorChange(color);
  }, [onColorChange]);

  
  // Select 컴포넌트용 그룹 생성 (커스텀을 맨 위로)
  const colorGroups = [
    {
      label: '커스텀',
      options: [{
        value: 'custom-color',
        label: '커스텀 색상'
      }]
    },
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
    }
  ];
  
  // 현재 선택된 값
  const currentValue = showCustomInput ? 'custom-color' : currentColor;

  return (
    <div className="space-y-3">
      {/* Select 컴포넌트 사용 */}
      <Select
        label="배경색"
        groups={colorGroups}
        value={currentValue}
        onChange={handleColorSelect}
        placeholder="배경색을 선택하세요"
        disabled={disabled}
      />

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