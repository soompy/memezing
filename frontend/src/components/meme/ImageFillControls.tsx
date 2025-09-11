'use client';

import React, { useCallback } from 'react';
import Select from '@/components/ui/Select';
import { ImageFillOption } from './FabricCanvas';

export interface ImageFillControlsProps {
  currentFillOption: ImageFillOption;
  onFillOptionChange: (fillOption: ImageFillOption) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

// 이미지 채우기 옵션들
const FILL_OPTIONS = [
  { 
    value: 'fill' as ImageFillOption, 
    label: '캔버스에 꽉 채우기', 
    description: '이미지를 캔버스 크기에 맞춰 자름 (비율 유지)',
    icon: '🎯'
  },
  { 
    value: 'fit' as ImageFillOption, 
    label: '비율 유지해서 맞추기', 
    description: '이미지 전체가 보이도록 비율 유지',
    icon: '📐'
  },
  { 
    value: 'stretch' as ImageFillOption, 
    label: '늘려서 채우기', 
    description: '이미지를 캔버스 크기에 맞춰 늘림 (비율 무시)',
    icon: '⬄'
  },
  { 
    value: 'center' as ImageFillOption, 
    label: '가운데 정렬', 
    description: '원본 크기로 가운데 배치',
    icon: '🎪'
  }
];

const ImageFillControls: React.FC<ImageFillControlsProps> = ({
  currentFillOption,
  onFillOptionChange,
  disabled = false,
  showLabel = true
}) => {
  
  // 채우기 옵션 변경 처리
  const handleFillOptionChange = useCallback((value: string) => {
    onFillOptionChange(value as ImageFillOption);
  }, [onFillOptionChange]);

  // Select 컴포넌트용 옵션 생성
  const fillOptionGroups = [
    {
      label: '이미지 채우기 방식',
      options: FILL_OPTIONS.map(option => ({
        value: option.value,
        label: `${option.icon} ${option.label}`,
        description: option.description
      }))
    }
  ];

  return (
    <div className="space-y-3">
      <Select
        label={showLabel ? "이미지 채우기 옵션" : undefined}
        groups={fillOptionGroups}
        value={currentFillOption}
        onChange={handleFillOptionChange}
        placeholder="채우기 방식을 선택하세요"
        disabled={disabled}
      />
      
      {/* 현재 선택된 옵션 설명 */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <div className="font-medium text-gray-700 mb-1">
          {FILL_OPTIONS.find(opt => opt.value === currentFillOption)?.icon} {' '}
          {FILL_OPTIONS.find(opt => opt.value === currentFillOption)?.label}
        </div>
        <div>
          {FILL_OPTIONS.find(opt => opt.value === currentFillOption)?.description}
        </div>
      </div>
    </div>
  );
};

export default ImageFillControls;