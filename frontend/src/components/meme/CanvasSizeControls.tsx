'use client';

import React, { useState, useCallback } from 'react';
import { Monitor, Smartphone, Square, Maximize2 } from 'lucide-react';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export interface CanvasSize {
  width: number;
  height: number;
  name: string;
}

export interface CanvasSizeControlsProps {
  currentSize: CanvasSize;
  onSizeChange: (size: CanvasSize) => void;
  disabled?: boolean;
}

// 미리 정의된 캔버스 사이즈들
export const PRESET_CANVAS_SIZES: CanvasSize[] = [
  { width: 800, height: 600, name: '기본 (4:3)' },
  { width: 1200, height: 900, name: '큰 화면 (4:3)' },
  { width: 1080, height: 1080, name: '정사각형 (1:1)' },
  { width: 1920, height: 1080, name: 'HD 가로 (16:9)' },
  { width: 1080, height: 1920, name: 'HD 세로 (9:16)' },
  { width: 1080, height: 1350, name: '인스타그램 (4:5)' },
  { width: 1200, height: 628, name: '페이스북 커버' },
  { width: 1024, height: 512, name: '트위터 헤더' },
];

const CanvasSizeControls: React.FC<CanvasSizeControlsProps> = ({
  currentSize,
  onSizeChange,
  disabled = false
}) => {
  const [customWidth, setCustomWidth] = useState(currentSize.width.toString());
  const [customHeight, setCustomHeight] = useState(currentSize.height.toString());
  const [showCustom, setShowCustom] = useState(false);

  // 프리셋 사이즈 선택
  const handlePresetSelect = useCallback((value: string) => {
    if (value === 'custom') {
      setShowCustom(true);
      return;
    }
    
    const selectedSize = PRESET_CANVAS_SIZES.find(size => 
      `${size.width}x${size.height}` === value
    );
    
    if (selectedSize) {
      onSizeChange(selectedSize);
      setCustomWidth(selectedSize.width.toString());
      setCustomHeight(selectedSize.height.toString());
      setShowCustom(false);
    }
  }, [onSizeChange]);

  // 커스텀 사이즈 적용
  const handleCustomSizeApply = useCallback(() => {
    const width = parseInt(customWidth, 10);
    const height = parseInt(customHeight, 10);
    
    if (isNaN(width) || isNaN(height) || width < 100 || height < 100 || width > 3000 || height > 3000) {
      alert('캔버스 크기는 100px에서 3000px 사이여야 합니다.');
      return;
    }

    const customSize: CanvasSize = {
      width,
      height,
      name: `커스텀 (${width}×${height})`
    };

    onSizeChange(customSize);
    setShowCustom(false);
  }, [customWidth, customHeight, onSizeChange]);

  // 현재 사이즈가 프리셋 중 하나인지 확인
  const currentPreset = PRESET_CANVAS_SIZES.find(
    preset => preset.width === currentSize.width && preset.height === currentSize.height
  );
  
  // Select 컴포넌트용 옵션 생성
  const sizeOptions = [
    ...PRESET_CANVAS_SIZES.map(size => ({
      value: `${size.width}x${size.height}`,
      label: `${size.name} (${size.width}×${size.height})`
    })),
    {
      value: 'custom',
      label: '커스텀 크기'
    }
  ];
  
  // 현재 선택된 값
  const currentValue = currentPreset 
    ? `${currentPreset.width}x${currentPreset.height}`
    : showCustom 
      ? 'custom'
      : `${currentSize.width}x${currentSize.height}`;

  return (
    <div className="space-y-3">
      {/* Select 컴포넌트 사용 */}
      <Select
        label="캔버스 크기"
        options={sizeOptions}
        value={currentValue}
        onChange={handlePresetSelect}
        placeholder="크기를 선택하세요"
        disabled={disabled}
      />

      {/* 커스텀 사이즈 입력 */}
      {showCustom && (
        <div className="space-y-3 p-4 border border-orange-200 rounded-lg bg-orange-50/30">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">커스텀 크기 설정</h5>
            <button
              onClick={() => setShowCustom(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">폭 (px)</label>
              <input
                type="number"
                min="100"
                max="3000"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 disabled:opacity-50 transition-colors"
                placeholder="800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">높이 (px)</label>
              <input
                type="number"
                min="100"
                max="3000"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 disabled:opacity-50 transition-colors"
                placeholder="600"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleCustomSizeApply}
              disabled={disabled}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              적용
            </Button>
            <Button
              onClick={() => setShowCustom(false)}
              disabled={disabled}
              variant="outline"
              size="sm"
            >
              취소
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            크기 범위: 100px ~ 3000px
          </p>
        </div>
      )}
    </div>
  );
};

export default CanvasSizeControls;