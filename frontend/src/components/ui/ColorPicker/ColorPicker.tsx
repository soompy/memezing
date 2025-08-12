'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onPreviewChange?: (color: string) => void; // 실시간 미리보기용
  disabled?: boolean;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  onPreviewChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 48 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panelX: 0, panelY: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const [hsv, setHsv] = useState({ h: 0, s: 100, v: 100 });
  const [tempHsv, setTempHsv] = useState({ h: 0, s: 100, v: 100 });

  // Hex to HSV 변환
  const hexToHsv = useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : Math.round((diff / max) * 100);
    const v = Math.round(max * 100);

    return { h, s, v };
  }, []);

  // HSV to Hex 변환
  const hsvToHex = useCallback((h: number, s: number, v: number) => {
    const c = (v / 100) * (s / 100);
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = (v / 100) - c;

    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, []);

  // 컬러 팔레트 그리기
  const drawColorPalette = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 선택된 hue로 그라디언트 생성
    const hueColor = hsvToHex(tempHsv.h, 100, 100);
    
    // 수평 그라디언트 (saturation)
    const gradientH = ctx.createLinearGradient(0, 0, width, 0);
    gradientH.addColorStop(0, '#ffffff');
    gradientH.addColorStop(1, hueColor);
    
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, width, height);
    
    // 수직 그라디언트 (value)
    const gradientV = ctx.createLinearGradient(0, 0, 0, height);
    gradientV.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradientV.addColorStop(1, 'rgba(0, 0, 0, 1)');
    
    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, width, height);
  }, [tempHsv.h, hsvToHex]);

  // Hue 바 그리기
  const drawHueBar = useCallback(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1/6, '#ffff00');
    gradient.addColorStop(2/6, '#00ff00');
    gradient.addColorStop(3/6, '#00ffff');
    gradient.addColorStop(4/6, '#0000ff');
    gradient.addColorStop(5/6, '#ff00ff');
    gradient.addColorStop(1, '#ff0000');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  // 값이 변경될 때 HSV 업데이트
  useEffect(() => {
    if (value && value !== 'transparent') {
      const newHsv = hexToHsv(value);
      setHsv(newHsv);
      setTempHsv(newHsv);
    }
  }, [value, hexToHsv]);

  // 패널이 열릴 때 임시 색상을 현재 색상으로 초기화
  useEffect(() => {
    if (isOpen && value && value !== 'transparent') {
      const newHsv = hexToHsv(value);
      setTempHsv(newHsv);
    }
  }, [isOpen, value, hexToHsv]);

  // 캔버스 그리기
  useEffect(() => {
    if (isOpen) {
      drawColorPalette();
      drawHueBar();
    }
  }, [isOpen, tempHsv.h, drawColorPalette, drawHueBar]);

  // 팔레트에서 색상 선택
  const handlePaletteClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = Math.round((x / canvas.width) * 100);
    const v = Math.round(100 - (y / canvas.height) * 100);

    const newHsv = { ...tempHsv, s, v };
    setTempHsv(newHsv);
    
    // 실시간 미리보기
    if (onPreviewChange) {
      onPreviewChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    }
  }, [tempHsv, onPreviewChange, hsvToHex]);

  // Hue 바에서 색상 선택
  const handleHueClick = useCallback((e: React.MouseEvent) => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = Math.round((y / canvas.height) * 360);

    const newHsv = { ...tempHsv, h };
    setTempHsv(newHsv);
    
    // 실시간 미리보기
    if (onPreviewChange) {
      onPreviewChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    }
  }, [tempHsv, onPreviewChange, hsvToHex]);

  // 패널 드래그 시작
  const handlePanelDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPanel(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      panelX: panelPosition.x,
      panelY: panelPosition.y
    });
  }, [panelPosition]);

  // 컬러 선택 드래그 이벤트 처리
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const target = e.target as HTMLElement;
    if (target === canvasRef.current) {
      handlePaletteClick(e);
    } else if (target === hueCanvasRef.current) {
      handleHueClick(e);
    }
  }, [handlePaletteClick, handleHueClick]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 패널 드래그 처리
    if (isDraggingPanel) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPanelPosition({
        x: dragStart.panelX + deltaX,
        y: dragStart.panelY + deltaY
      });
      return;
    }

    // 컬러 선택 드래그 처리
    if (!isDragging) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target === canvasRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const s = Math.max(0, Math.min(100, Math.round((x / canvas.width) * 100)));
      const v = Math.max(0, Math.min(100, Math.round(100 - (y / canvas.height) * 100)));

      const newHsv = { ...tempHsv, s, v };
      setTempHsv(newHsv);
      
      // 실시간 미리보기
      if (onPreviewChange) {
        onPreviewChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
      }
    } else if (target === hueCanvasRef.current) {
      const canvas = hueCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const h = Math.max(0, Math.min(360, Math.round((y / canvas.height) * 360)));

      const newHsv = { ...tempHsv, h };
      setTempHsv(newHsv);
      
      // 실시간 미리보기
      if (onPreviewChange) {
        onPreviewChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
      }
    }
  }, [isDragging, isDraggingPanel, tempHsv, dragStart, onPreviewChange, hsvToHex]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsDraggingPanel(false);
  }, []);

  // 전역 마우스 이벤트 등록
  useEffect(() => {
    if (isDragging || isDraggingPanel) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isDraggingPanel, handleMouseMove, handleMouseUp]);

  // 외부 클릭으로 닫기 (드래그 중이 아닐 때만)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isDragging || isDraggingPanel) return; // 드래그 중에는 닫지 않음
      
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isDragging, isDraggingPanel]);

  // 패널이 열릴 때 위치 초기화
  useEffect(() => {
    if (isOpen) {
      setPanelPosition({ x: 0, y: 48 });
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className="w-10 h-10 border border-gray-300 rounded cursor-pointer flex-shrink-0 overflow-hidden"
        disabled={disabled}
        title="고급 컬러 피커"
        style={{ backgroundColor: value === 'transparent' ? '#ffffff' : value }}
      >
        {value === 'transparent' && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
          </div>
        )}
      </button>

      {isOpen && (
        <div 
          ref={panelRef}
          className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl min-w-[280px] select-none"
          style={{ 
            left: `${panelPosition.x}px`, 
            top: `${panelPosition.y}px`,
            cursor: isDraggingPanel ? 'grabbing' : 'default'
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 드래그 가능한 헤더 */}
          <div 
            className="px-4 py-2 bg-gray-50 rounded-t-lg border-b border-gray-200 cursor-grab active:cursor-grabbing flex items-center justify-between"
            onMouseDown={handlePanelDragStart}
          >
            <span className="text-sm font-medium text-gray-700">색상 선택</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex space-x-3">
            {/* 메인 컬러 팔레트 */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={200}
                height={150}
                className="border border-gray-200 rounded cursor-crosshair"
                onMouseDown={handleMouseDown}
              />
              {/* 선택된 위치 표시 */}
              <div
                className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none"
                style={{
                  left: `${(tempHsv.s / 100) * 200 - 6}px`,
                  top: `${((100 - tempHsv.v) / 100) * 150 - 6}px`,
                }}
              />
            </div>

            {/* Hue 바 */}
            <div className="relative">
              <canvas
                ref={hueCanvasRef}
                width={20}
                height={150}
                className="border border-gray-200 rounded cursor-pointer"
                onMouseDown={handleMouseDown}
              />
              {/* Hue 선택 표시 */}
              <div
                className="absolute w-6 h-1 border border-white bg-black shadow-md pointer-events-none"
                style={{
                  left: '-3px',
                  top: `${(tempHsv.h / 360) * 150 - 2}px`,
                }}
              />
            </div>
          </div>

          {/* 빠른 색상 선택 */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-600 mb-2">빠른 선택:</div>
            <div className="grid grid-cols-8 gap-1">
              {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                '#808080', '#C0C0C0', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'].map((color) => (
                <button
                  key={color}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newHsv = hexToHsv(color);
                    setTempHsv(newHsv);
                    // 실시간 미리보기
                    if (onPreviewChange) {
                      onPreviewChange(color);
                    }
                  }}
                  className={`w-6 h-6 border border-gray-300 rounded hover:scale-110 transition-transform ${
                    value === color ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* 색상 정보 및 입력 */}
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 border border-gray-300 rounded flex-shrink-0"
                style={{ backgroundColor: hsvToHex(tempHsv.h, tempHsv.s, tempHsv.v) }}
              />
              <input
                type="text"
                value={hsvToHex(tempHsv.h, tempHsv.s, tempHsv.v)}
                onChange={(e) => {
                  const hex = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                    setTempHsv(hexToHsv(hex));
                    // 실시간 미리보기
                    if (onPreviewChange) {
                      onPreviewChange(hex);
                    }
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="#FFFFFF"
              />
            </div>
            
            {/* HSV 값 표시 */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-500">H</div>
                <div className="font-mono">{tempHsv.h}°</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">S</div>
                <div className="font-mono">{tempHsv.s}%</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">V</div>
                <div className="font-mono">{tempHsv.v}%</div>
              </div>
            </div>
            
            {/* 완료 버튼 */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(hsvToHex(tempHsv.h, tempHsv.s, tempHsv.v));
                  setIsOpen(false);
                }}
                className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;