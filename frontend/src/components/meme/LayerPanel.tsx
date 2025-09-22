'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, ArrowUp, ArrowDown, Copy, MoreVertical } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface LayerItem {
  id: string;
  name: string;
  type: 'text' | 'image' | 'sticker' | 'speech-bubble' | 'background';
  visible: boolean;
  locked: boolean;
  order: number;
  thumbnail?: string;
  opacity?: number;
}

interface LayerPanelProps {
  layers: LayerItem[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerLockToggle: (layerId: string) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerReorder: (layerId: string, direction: 'up' | 'down') => void;
  onLayerRename: (layerId: string, newName: string) => void;
  className?: string;
}

export default function LayerPanel({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  onLayerDelete,
  onLayerDuplicate,
  onLayerReorder,
  onLayerRename,
  className = ''
}: LayerPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // 레이어를 order 기준으로 정렬 (높은 order가 위쪽)
  const sortedLayers = [...layers].sort((a, b) => b.order - a.order);

  // 레이어 타입별 아이콘
  const getLayerIcon = (type: LayerItem['type']) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'sticker':
        return '🎭';
      case 'speech-bubble':
        return '💬';
      case 'background':
        return '🎨';
      default:
        return '📄';
    }
  };

  // 레이어 이름 편집 시작
  const startEditing = (layer: LayerItem) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  // 레이어 이름 편집 완료
  const finishEditing = () => {
    if (editingLayerId && editingName.trim()) {
      onLayerRename(editingLayerId, editingName.trim());
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  // 레이어 이름 편집 취소
  const cancelEditing = () => {
    setEditingLayerId(null);
    setEditingName('');
  };

  // Enter 키로 편집 완료, Escape 키로 취소
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className={`${className}`}>
      {/* 컴팩트 헤더 */}
      <div className="mb-3">
        <h3 className="text-md font-semibold text-gray-900 flex items-center justify-between">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            레이어 관리
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {layers.length}개
          </span>
        </h3>
      </div>

      {/* 레이어 목록 */}
      <div className="bg-white border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
        {sortedLayers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <div className="mb-2">
              <svg className="w-8 h-8 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <p>아직 레이어가 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">텍스트나 이미지를 추가해보세요</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sortedLayers.map((layer, index) => (
              <div
                key={layer.id}
                className={`
                  group relative flex items-center p-2 rounded-md cursor-pointer transition-colors
                  ${selectedLayerId === layer.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                  }
                `}
                onClick={() => onLayerSelect(layer.id)}
              >
                {/* 레이어 아이콘 */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded mr-3">
                  <span className="text-xs">{getLayerIcon(layer.type)}</span>
                </div>

                {/* 레이어 정보 */}
                <div className="flex-1 min-w-0">
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={handleKeyDown}
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="text-sm font-medium text-gray-900 truncate"
                      onDoubleClick={() => startEditing(layer)}
                    >
                      {layer.name}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-0.5">
                    {layer.type} • Order: {layer.order}
                    {layer.opacity !== undefined && ` • ${Math.round(layer.opacity * 100)}%`}
                  </div>
                </div>

                {/* 레이어 컨트롤 */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* 가시성 토글 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerVisibilityToggle(layer.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200"
                    title={layer.visible ? '숨기기' : '보이기'}
                  >
                    {layer.visible ? (
                      <Eye size={14} className="text-blue-600" />
                    ) : (
                      <EyeOff size={14} className="text-gray-400" />
                    )}
                  </button>

                  {/* 잠금 토글 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerLockToggle(layer.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200"
                    title={layer.locked ? '잠금 해제' : '잠금'}
                  >
                    {layer.locked ? (
                      <Lock size={14} className="text-red-600" />
                    ) : (
                      <Unlock size={14} className="text-gray-400" />
                    )}
                  </button>

                  {/* 순서 조정 */}
                  <div className="flex flex-col">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerReorder(layer.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="위로 이동"
                    >
                      <ArrowUp size={10} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerReorder(layer.id, 'down');
                      }}
                      disabled={index === sortedLayers.length - 1}
                      className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="아래로 이동"
                    >
                      <ArrowDown size={10} />
                    </button>
                  </div>

                  {/* 복사 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDuplicate(layer.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200"
                    title="복사"
                  >
                    <Copy size={14} className="text-gray-600" />
                  </button>

                  {/* 삭제 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDelete(layer.id);
                    }}
                    className="p-1 rounded hover:bg-red-100"
                    title="삭제"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 도움말 */}
      {sortedLayers.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <p className="font-medium mb-1">💡 사용 팁</p>
          <ul className="space-y-0.5 text-blue-600">
            <li>• 더블클릭으로 레이어 이름 편집</li>
            <li>• 👁️ 아이콘으로 표시/숨김 전환</li>
            <li>• 🔒 아이콘으로 편집 잠금</li>
          </ul>
        </div>
      )}
    </div>
  );
}