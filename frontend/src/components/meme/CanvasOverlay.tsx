'use client';

import { useState, useEffect } from 'react';
import { Trash2, Move, Copy, RotateCw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CanvasOverlayProps {
  selectedObject: any;
  canvasContainer: HTMLDivElement | null;
  onDelete: () => void;
  onClear: () => void;
  onDuplicate?: () => void;
  onRotate?: () => void;
  isLoading?: boolean;
}

interface ObjectBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  selectedObject,
  canvasContainer,
  onDelete,
  onClear,
  onDuplicate,
  onRotate,
  isLoading = false
}) => {
  const [objectBounds, setObjectBounds] = useState<ObjectBounds | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 선택된 객체의 위치 계산
  useEffect(() => {
    if (!selectedObject || !canvasContainer) {
      setIsVisible(false);
      setObjectBounds(null);
      return;
    }

    const updatePosition = () => {
      try {
        const canvas = selectedObject.canvas;
        if (!canvas) return;

        // 캔버스 DOM 요소 찾기
        const canvasElement = canvasContainer.querySelector('canvas');
        if (!canvasElement) return;

        const canvasRect = canvasElement.getBoundingClientRect();
        const containerRect = canvasContainer.getBoundingClientRect();

        // 객체의 바운딩 박스 계산
        const objBounds = selectedObject.getBoundingRect();
        
        // 캔버스 스케일 비율 계산
        const scaleX = canvasRect.width / canvas.width;
        const scaleY = canvasRect.height / canvas.height;

        // 캔버스 컨테이너 내 상대 좌표로 변환 (absolute 포지셔닝용)
        const left = canvasRect.left - containerRect.left + (objBounds.left * scaleX);
        const top = canvasRect.top - containerRect.top + (objBounds.top * scaleY);
        const width = objBounds.width * scaleX;
        const height = objBounds.height * scaleY;

        setObjectBounds({ left, top, width, height });
        setIsVisible(true);
      } catch (error) {
        console.error('Error calculating object position:', error);
        setIsVisible(false);
      }
    };

    // 초기 위치 계산
    updatePosition();

    // 객체 이동 시 위치 업데이트
    const handleObjectMoving = () => updatePosition();
    const handleObjectScaling = () => updatePosition();
    const handleCanvasChange = () => updatePosition();

    if (selectedObject.canvas) {
      selectedObject.canvas.on('object:moving', handleObjectMoving);
      selectedObject.canvas.on('object:scaling', handleObjectScaling);
      selectedObject.canvas.on('object:rotating', handleObjectMoving);
      selectedObject.canvas.on('path:created', handleCanvasChange);
    }

    // 윈도우 리사이즈 시 위치 재계산
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      if (selectedObject.canvas) {
        selectedObject.canvas.off('object:moving', handleObjectMoving);
        selectedObject.canvas.off('object:scaling', handleObjectScaling);
        selectedObject.canvas.off('object:rotating', handleObjectMoving);
        selectedObject.canvas.off('path:created', handleCanvasChange);
      }
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [selectedObject, canvasContainer]);

  if (!isVisible || !objectBounds) {
    return null;
  }

  // 버튼 툴팁 위치 계산 (객체로부터 10px 위, 0px right에 배치)
  const tooltipHeight = 44; // 툴팁의 실제 높이
  const tooltipWidth = 240; // 툴팁의 예상 너비
  const gap = 10; // 객체와 툴팁 사이의 간격 (10px)
  
  // 기본 위치: 객체의 오른쪽 상단 모서리를 기준으로 10px 위에 배치
  let tooltipTop = objectBounds.top - tooltipHeight - gap;
  let tooltipLeft = objectBounds.left + objectBounds.width - tooltipWidth; // 0px right (오른쪽 끝 맞춤)
  
  // 컨테이너 내 경계 확인 및 조정
  const containerWidth = canvasContainer?.clientWidth || 800;
  const containerHeight = canvasContainer?.clientHeight || 600;
  
  if (tooltipTop < 10) {
    // 위쪽 공간이 부족하면 객체 바로 아래쪽에 배치
    tooltipTop = objectBounds.top + objectBounds.height + gap;
  }
  
  // 컨테이너 좌우 경계 확인 및 조정
  if (tooltipLeft < 10) {
    // 왼쪽 공간이 부족하면 객체 왼쪽 가장자리에 맞춤
    tooltipLeft = objectBounds.left;
  } else if (tooltipLeft + tooltipWidth > containerWidth - 10) {
    // 오른쪽 공간이 부족하면 컨테이너 경계에서 10px 여백
    tooltipLeft = containerWidth - tooltipWidth - 10;
  }

  const adjustedTop = tooltipTop;
  const adjustedLeft = tooltipLeft;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        top: adjustedTop,
        left: adjustedLeft,
      }}
    >
      {/* 액션 버튼 툴팁 */}
      <div className="flex items-center space-x-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 pointer-events-auto animate-in fade-in-0 slide-in-from-top-2 duration-200">
        {/* 객체 유형 표시 */}
        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
          <Move size={12} />
          <span>
            {selectedObject?.type === 'i-text' ? '텍스트' : 
             selectedObject?.type === 'image' ? '이미지' : '객체'}
          </span>
        </div>

        {/* 구분선 */}
        <div className="w-px h-6 bg-gray-200"></div>

        {/* 복사 버튼 */}
        {onDuplicate && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onDuplicate}
            disabled={isLoading}
            className="h-8 px-2 min-w-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            title="복사"
          >
            <Copy size={14} />
          </Button>
        )}

        {/* 회전 버튼 */}
        {onRotate && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onRotate}
            disabled={isLoading}
            className="h-8 px-2 min-w-0 text-gray-600 hover:text-green-600 hover:bg-green-50"
            title="회전 (90도)"
          >
            <RotateCw size={14} />
          </Button>
        )}

        {/* 삭제 버튼 */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onDelete}
          disabled={isLoading}
          className="h-8 px-2 min-w-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
          title="삭제"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* 연결선 (툴팁에서 객체로) */}
      <div 
        className="absolute w-0.5 h-1 bg-gray-300"
        style={{ 
          top: tooltipTop < objectBounds.top ? '100%' : '-4px',
          left: Math.min(tooltipWidth - 20, Math.max(20, tooltipWidth - 40)) // 툴팁 오른쪽 부분에 포인터 배치
        }}
      />
    </div>
  );
};

export default CanvasOverlay;