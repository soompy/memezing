'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Palette, Type, AlignLeft, AlignCenter, AlignRight, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { CanvasSpeechBubble, SpeechBubble } from '@/types/sticker';

interface SpeechBubbleEditorProps {
  selectedBubble: CanvasSpeechBubble | null;
  onUpdate: (properties: Partial<SpeechBubbleProperties>) => void;
  onClose: () => void;
  className?: string;
}

interface SpeechBubbleProperties {
  text: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  fontSize: number;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  tailPosition: SpeechBubble['tailPosition'];
  bubbleStyle: SpeechBubble['bubbleStyle'];
}

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#ffc0cb', '#a52a2a', '#808080', '#90ee90', '#87ceeb'
];

const BUBBLE_STYLES: { value: SpeechBubble['bubbleStyle']; label: string; icon: string }[] = [
  { value: 'speech', label: '말풍선', icon: '💬' },
  { value: 'thought', label: '생각 구름', icon: '💭' },
  { value: 'scream', label: '외침', icon: '💥' },
  { value: 'whisper', label: '속삭임', icon: '🤫' }
];

const TAIL_POSITIONS: { value: SpeechBubble['tailPosition']; label: string }[] = [
  { value: 'bottom-left', label: '왼쪽 아래' },
  { value: 'bottom-center', label: '중앙 아래' },
  { value: 'bottom-right', label: '오른쪽 아래' },
  { value: 'top-left', label: '왼쪽 위' },
  { value: 'top-center', label: '중앙 위' },
  { value: 'top-right', label: '오른쪽 위' },
  { value: 'left', label: '왼쪽' },
  { value: 'right', label: '오른쪽' }
];

const SpeechBubbleEditor: React.FC<SpeechBubbleEditorProps> = ({
  selectedBubble,
  onUpdate,
  onClose,
  className = ''
}) => {
  const [properties, setProperties] = useState<SpeechBubbleProperties>({
    text: '',
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
    fontSize: 16,
    textColor: '#000000',
    textAlign: 'center',
    tailPosition: 'bottom-left',
    bubbleStyle: 'speech'
  });

  // 선택된 말풍선이 변경될 때 속성 업데이트
  useEffect(() => {
    if (selectedBubble?.bubbleData) {
      const { bubbleData } = selectedBubble;
      const textObject = bubbleData.textObject;
      
      setProperties({
        text: textObject?.text || '',
        backgroundColor: bubbleData.backgroundColor,
        borderColor: bubbleData.borderColor,
        borderWidth: bubbleData.borderWidth,
        fontSize: textObject?.fontSize || 16,
        textColor: textObject?.fill || '#000000',
        textAlign: (textObject?.textAlign as 'left' | 'center' | 'right') || 'center',
        tailPosition: bubbleData.tailPosition,
        bubbleStyle: bubbleData.bubbleStyle
      });
    }
  }, [selectedBubble]);

  // 속성 변경 핸들러
  const handlePropertyChange = useCallback((key: keyof SpeechBubbleProperties, value: any) => {
    const newProperties = { ...properties, [key]: value };
    setProperties(newProperties);
    onUpdate({ [key]: value });
  }, [properties, onUpdate]);

  // 텍스트 변경 핸들러
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    handlePropertyChange('text', text);
  }, [handlePropertyChange]);

  // 색상 변경 핸들러
  const handleColorChange = useCallback((type: 'backgroundColor' | 'borderColor' | 'textColor', color: string) => {
    handlePropertyChange(type, color);
  }, [handlePropertyChange]);

  // 기본값 리셋
  const handleReset = useCallback(() => {
    const defaultProperties: SpeechBubbleProperties = {
      text: '여기에 텍스트를 입력하세요',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2,
      fontSize: 16,
      textColor: '#000000',
      textAlign: 'center',
      tailPosition: 'bottom-left',
      bubbleStyle: 'speech'
    };
    
    setProperties(defaultProperties);
    Object.entries(defaultProperties).forEach(([key, value]) => {
      onUpdate({ [key]: value });
    });
  }, [onUpdate]);

  if (!selectedBubble) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-sm text-gray-500 text-center">
          말풍선을 선택하면 편집할 수 있습니다
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">말풍선 편집</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleReset}>
            <RotateCcw size={14} />
            초기화
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>

      {/* 텍스트 편집 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Type size={16} />
          텍스트
        </label>
        <textarea
          value={properties.text}
          onChange={handleTextChange}
          className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="말풍선에 표시할 텍스트를 입력하세요"
        />
      </div>

      {/* 텍스트 스타일 */}
      <div className="space-y-3">
        <label className="text-sm font-medium">텍스트 스타일</label>
        
        {/* 폰트 크기 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 min-w-[60px]">크기</span>
          <input
            type="range"
            min="10"
            max="32"
            value={properties.fontSize}
            onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 min-w-[30px]">{properties.fontSize}px</span>
        </div>

        {/* 텍스트 정렬 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 min-w-[60px]">정렬</span>
          <div className="flex gap-1">
            {[
              { value: 'left' as const, icon: AlignLeft },
              { value: 'center' as const, icon: AlignCenter },
              { value: 'right' as const, icon: AlignRight }
            ].map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handlePropertyChange('textAlign', value)}
                className={`p-2 rounded ${
                  properties.textAlign === value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* 텍스트 색상 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 min-w-[60px]">색상</span>
          <div className="flex gap-1 flex-wrap">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange('textColor', color)}
                className={`w-6 h-6 rounded border-2 ${
                  properties.textColor === color ? 'border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <input
              type="color"
              value={properties.textColor}
              onChange={(e) => handleColorChange('textColor', e.target.value)}
              className="w-6 h-6 rounded border border-gray-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 말풍선 스타일 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">말풍선 스타일</label>
        <div className="grid grid-cols-2 gap-2">
          {BUBBLE_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => handlePropertyChange('bubbleStyle', style.value)}
              className={`p-3 text-sm rounded-lg border transition-all ${
                properties.bubbleStyle === style.value
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{style.icon}</span>
                <span>{style.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 꼬리 위치 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">꼬리 위치</label>
        <select
          value={properties.tailPosition}
          onChange={(e) => handlePropertyChange('tailPosition', e.target.value as SpeechBubble['tailPosition'])}
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {TAIL_POSITIONS.map((position) => (
            <option key={position.value} value={position.value}>
              {position.label}
            </option>
          ))}
        </select>
      </div>

      {/* 배경 및 테두리 */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Palette size={16} />
          배경 및 테두리
        </label>
        
        {/* 배경 색상 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 min-w-[60px]">배경</span>
          <div className="flex gap-1 flex-wrap">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange('backgroundColor', color)}
                className={`w-6 h-6 rounded border-2 ${
                  properties.backgroundColor === color ? 'border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <input
              type="color"
              value={properties.backgroundColor}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              className="w-6 h-6 rounded border border-gray-200 cursor-pointer"
            />
          </div>
        </div>

        {/* 테두리 색상 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 min-w-[60px]">테두리</span>
          <div className="flex gap-1 flex-wrap">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange('borderColor', color)}
                className={`w-6 h-6 rounded border-2 ${
                  properties.borderColor === color ? 'border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <input
              type="color"
              value={properties.borderColor}
              onChange={(e) => handleColorChange('borderColor', e.target.value)}
              className="w-6 h-6 rounded border border-gray-200 cursor-pointer"
            />
          </div>
        </div>

        {/* 테두리 두께 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 min-w-[60px]">두께</span>
          <input
            type="range"
            min="0"
            max="10"
            value={properties.borderWidth}
            onChange={(e) => handlePropertyChange('borderWidth', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 min-w-[30px]">{properties.borderWidth}px</span>
        </div>
      </div>
    </div>
  );
};

export default SpeechBubbleEditor;