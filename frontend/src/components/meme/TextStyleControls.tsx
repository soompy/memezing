'use client';

import { useState } from 'react';
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, Minus, Plus, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select, { SelectGroup } from '@/components/ui/Select';
import TabGroup from '@/components/ui/TabGroup';
import RangeSlider from '@/components/ui/RangeSlider';

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

interface TextStyleControlsProps {
  style: TextStyle;
  onChange: (style: TextStyle) => void;
  onReset: () => void;
}

const fontGroups: SelectGroup[] = [
  {
    label: '밈 전용',
    options: [
      { value: 'Impact, Arial Black, sans-serif', label: 'Impact (밈 기본)' },
    ]
  },
  {
    label: '한글 폰트',
    options: [
      { value: '"Black Han Sans", sans-serif', label: '블랙한산스' },
      { value: '"Nanum Myeongjo", serif', label: '나눔명조' },
      { value: '"Gamja Flower", cursive', label: '감자꽃' },
      { value: '"Do Hyeon", sans-serif', label: '도현' },
      { value: '"Jua", sans-serif', label: '주아' },
      { value: '"Gothic A1", sans-serif', label: '고딕 A1' },
      { value: '"Noto Sans KR", sans-serif', label: '노토 산스' },
      { value: '"Nanum Gothic", sans-serif', label: '나눔고딕' },
      { value: '"Malgun Gothic", sans-serif', label: '맑은 고딕' },
    ]
  },
  {
    label: '산세리프',
    options: [
      { value: 'Arial, sans-serif', label: 'Arial' },
      { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
      { value: 'Verdana, sans-serif', label: 'Verdana' },
      { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
    ]
  },
  {
    label: '세리프',
    options: [
      { value: '"Times New Roman", serif', label: 'Times New Roman' },
      { value: 'Georgia, serif', label: 'Georgia' },
    ]
  },
  {
    label: '기타',
    options: [
      { value: '"Comic Sans MS", cursive', label: 'Comic Sans MS' },
      { value: '"Courier New", monospace', label: '쿠리어 뉴' },
    ]
  }
];

const colors = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
  '#808080', '#ADD8E6', '#90EE90', '#FFB6C1', '#DDA0DD', '#F0E68C'
];

export default function TextStyleControls({ style, onChange, onReset }: TextStyleControlsProps) {
  const [activeTab, setActiveTab] = useState<'font' | 'color' | 'align'>('font');

  const updateStyle = (updates: Partial<TextStyle>) => {
    onChange({ ...style, ...updates });
  };

  const ColorPicker = ({ value, onChange: onColorChange, label }: { 
    value: string; 
    onChange: (color: string) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-8 h-8 rounded border-2 transition-all ${
              value === color ? 'border-primary scale-110' : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onColorChange(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-primary-500"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">텍스트 스타일</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          초기화
        </Button>
      </div>

      {/* 탭 메뉴 */}
      <TabGroup
        items={[
          { key: 'font', label: '폰트', icon: Type },
          { key: 'color', label: '색상', icon: Palette },
          { key: 'align', label: '정렬', icon: AlignCenter },
        ]}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'font' | 'color' | 'align')}
      />

      {/* 폰트 설정 */}
      {activeTab === 'font' && (
        <div className="space-y-4">
          {/* 폰트 패밀리 */}
          <Select
            label="폰트"
            groups={fontGroups}
            value={style.fontFamily}
            onChange={(value) => updateStyle({ fontFamily: value })}
            placeholder="폰트를 선택하세요"
          />

          {/* 폰트 크기 */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStyle({ fontSize: Math.max(12, style.fontSize - 2) })}
              disabled={style.fontSize <= 12}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <RangeSlider
                min={12}
                max={72}
                step={2}
                value={style.fontSize}
                onChange={(value) => updateStyle({ fontSize: value })}
                label="크기"
                unit="px"
                variant="primary"
                showValueOnHover
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStyle({ fontSize: Math.min(72, style.fontSize + 2) })}
              disabled={style.fontSize >= 72}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* 폰트 스타일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">스타일</label>
            <div className="flex space-x-2">
              <Button
                variant={style.fontWeight === 'bold' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => updateStyle({ 
                  fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' 
                })}
                className="flex-1"
              >
                <Bold className="w-4 h-4 mr-1" />
                굵게
              </Button>
              <Button
                variant={style.fontStyle === 'italic' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => updateStyle({ 
                  fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' 
                })}
                className="flex-1"
              >
                <Italic className="w-4 h-4 mr-1" />
                기울임
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 색상 설정 */}
      {activeTab === 'color' && (
        <div className="space-y-4">
          <ColorPicker
            value={style.color}
            onChange={(color) => updateStyle({ color })}
            label="텍스트 색상"
          />
          
          <ColorPicker
            value={style.strokeColor}
            onChange={(strokeColor) => updateStyle({ strokeColor })}
            label="테두리 색상"
          />

          <RangeSlider
            min={0}
            max={8}
            step={1}
            value={style.strokeWidth}
            onChange={(value) => updateStyle({ strokeWidth: value })}
            label="테두리 두께"
            unit="px"
            variant="secondary"
            showValueOnHover
          />
        </div>
      )}

      {/* 정렬 설정 */}
      {activeTab === 'align' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">텍스트 정렬</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'left', icon: AlignLeft, label: '왼쪽' },
                { value: 'center', icon: AlignCenter, label: '가운데' },
                { value: 'right', icon: AlignRight, label: '오른쪽' },
              ].map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant={style.textAlign === value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => updateStyle({ textAlign: value as 'left' | 'center' | 'right' })}
                  className="flex flex-col items-center space-y-1 py-3"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 미리보기 */}
      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">미리보기</label>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <span
            style={{
              fontFamily: style.fontFamily,
              fontSize: `${Math.min(style.fontSize, 24)}px`,
              fontWeight: style.fontWeight,
              fontStyle: style.fontStyle,
              color: style.color,
              textAlign: style.textAlign,
              textShadow: `
                -${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.strokeColor},
                ${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.strokeColor},
                -${style.strokeWidth}px ${style.strokeWidth}px 0 ${style.strokeColor},
                ${style.strokeWidth}px ${style.strokeWidth}px 0 ${style.strokeColor}
              `,
            }}
          >
            샘플 텍스트
          </span>
        </div>
      </div>
    </div>
  );
}