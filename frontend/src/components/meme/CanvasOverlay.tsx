'use client';

import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Move, Copy, RotateCw } from 'lucide-react';
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

        // 실제 화면 좌표로 변환
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

  // 버튼 툴팁 위치 계산 (객체 우측 상단에 표시)
  const tooltipTop = objectBounds.top - 8; // 객체 상단에서 약간 위
  const tooltipLeft = objectBounds.left + objectBounds.width + 8; // 객체 우측에서 8px 간격

  // 화면 경계 확인 및 조정
  const adjustedTop = Math.max(10, tooltipTop);
  // 우측으로 나가면 좌측으로 이동
  const adjustedLeft = tooltipLeft + 240 > window.innerWidth 
    ? objectBounds.left - 248 // 객체 좌측으로 이동
    : Math.max(10, tooltipLeft);

  return (
    <div
      className="fixed pointer-events-none z-50"
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
            title="회전 (45도)"
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

        {/* 전체 초기화 버튼 */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onClear}
          disabled={isLoading}
          className="h-8 px-2 min-w-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
          title="전체 초기화"
        >
          <RefreshCw size={14} />
        </Button>
      </div>

      {/* 연결선 (옵션) */}
      <div 
        className="absolute w-0.5 h-4 bg-gray-300 left-1/2 transform -translate-x-1/2"
        style={{ top: '100%' }}
      />
    </div>
  );
};

export default CanvasOverlay;