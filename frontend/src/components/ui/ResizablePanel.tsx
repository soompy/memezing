'use client';

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizablePanelProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}

export default function ResizablePanel({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 320,
  minLeftWidth = 280,
  maxLeftWidth = 600,
  className = ''
}: ResizablePanelProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = e.clientX - containerRect.left;
    
    // 최소/최대 너비 제한
    const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
    setLeftWidth(clampedWidth);
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 더블 클릭으로 기본 너비로 리셋
  const handleDoubleClick = useCallback(() => {
    setLeftWidth(defaultLeftWidth);
  }, [defaultLeftWidth]);

  return (
    <div 
      ref={containerRef}
      className={`flex h-full relative ${className}`}
    >
      {/* 왼쪽 패널 */}
      <div 
        style={{ width: leftWidth, flexShrink: 0 }}
        className="h-full bg-white border-r border-gray-200 flex flex-col"
      >
        {leftPanel}
      </div>

      {/* 리사이저 */}
      <div
        ref={resizerRef}
        className={`
          relative w-1 bg-gray-200 hover:bg-blue-400 transition-colors duration-200 cursor-ew-resize group
          ${isDragging ? 'bg-blue-500' : ''}
        `}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title="드래그하여 패널 크기 조절 (더블클릭: 기본 크기로 리셋)"
      >
        {/* 그립 아이콘 */}
        <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded p-1">
            <GripVertical className="w-3 h-3 text-gray-500" />
          </div>
        </div>
        
        {/* 드래그 중일 때 표시되는 인디케이터 */}
        {isDragging && (
          <div className="absolute top-4 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg">
            {leftWidth}px
          </div>
        )}
      </div>

      {/* 오른쪽 패널 */}
      <div className="flex-1 h-full min-w-0">
        {rightPanel}
      </div>
    </div>
  );
}