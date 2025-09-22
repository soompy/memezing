'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Trash2, 
  Copy, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  MoveUp, 
  MoveDown, 
  RotateCcw,
  Settings
} from 'lucide-react';
import Button from '@/components/ui/Button';
import type { CanvasSticker, CanvasSpeechBubble } from '@/types/sticker';
import { getObjectType } from '@/utils/stickerHelpers';
import * as fabric from 'fabric';

interface StickerManagerProps {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  onObjectSelect: (obj: fabric.Object | null) => void;
  onEditSpeechBubble?: (bubble: CanvasSpeechBubble) => void;
  className?: string;
}

interface CanvasObjectInfo {
  id: string;
  object: fabric.Object;
  type: 'sticker' | 'speech-bubble' | 'text' | 'image' | null;
  name: string;
  isVisible: boolean;
  isLocked: boolean;
  zIndex: number;
}

const StickerManager: React.FC<StickerManagerProps> = ({
  canvas,
  selectedObject,
  onObjectSelect,
  onEditSpeechBubble,
  className = ''
}) => {
  const [objects, setObjects] = useState<CanvasObjectInfo[]>([]);
  const [showControls, setShowControls] = useState(true);

  // 캔버스 객체 목록 업데이트
  const updateObjectList = useCallback(() => {
    if (!canvas) return;

    const canvasObjects = canvas.getObjects();
    const objectInfos: CanvasObjectInfo[] = canvasObjects.map((obj, index) => {
      const type = getObjectType(obj);
      let name = 'Unknown Object';

      if (type === 'sticker') {
        const stickerObj = obj as CanvasSticker;
        name = `스티커 ${index + 1}`;
        if (stickerObj.stickerData) {
          name = `스티커: ${stickerObj.stickerData.stickerId}`;
        }
      } else if (type === 'speech-bubble') {
        const bubbleObj = obj as CanvasSpeechBubble;
        name = `말풍선 ${index + 1}`;
        if (bubbleObj.bubbleData?.textObject?.text) {
          const text = bubbleObj.bubbleData.textObject.text.substring(0, 10);
          name = `말풍선: ${text}${text.length > 10 ? '...' : ''}`;
        }
      } else if (type === 'text') {
        const textObj = obj as fabric.Text;
        const text = textObj.text?.substring(0, 10) || '';
        name = `텍스트: ${text}${text.length > 10 ? '...' : ''}`;
      } else if (type === 'image') {
        name = `이미지 ${index + 1}`;
      }

      return {
        id: `object-${index}`,
        object: obj,
        type,
        name,
        isVisible: obj.visible !== false,
        isLocked: obj.selectable === false,
        zIndex: index
      };
    });

    setObjects(objectInfos);
  }, [canvas]);

  // 캔버스 이벤트 리스너 설정
  useEffect(() => {
    if (!canvas) return;

    const handleObjectAdded = () => updateObjectList();
    const handleObjectRemoved = () => updateObjectList();
    const handleObjectModified = () => updateObjectList();

    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);
    canvas.on('object:modified', handleObjectModified);

    updateObjectList();

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
      canvas.off('object:modified', handleObjectModified);
    };
  }, [canvas, updateObjectList]);

  // 객체 선택
  const handleObjectClick = useCallback((obj: fabric.Object) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    onObjectSelect(obj);
  }, [canvas, onObjectSelect]);

  // 객체 삭제
  const handleDeleteObject = useCallback((obj: fabric.Object) => {
    if (!canvas) return;
    canvas.remove(obj);
    if (selectedObject === obj) {
      onObjectSelect(null);
    }
    canvas.renderAll();
  }, [canvas, selectedObject, onObjectSelect]);

  // 객체 복제
  const handleDuplicateObject = useCallback((obj: fabric.Object) => {
    if (!canvas) return;
    
    obj.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      
      // 스티커 데이터 복사
      if (getObjectType(obj) === 'sticker') {
        const originalSticker = obj as CanvasSticker;
        const clonedSticker = cloned as CanvasSticker;
        if (originalSticker.stickerData) {
          clonedSticker.stickerData = { ...originalSticker.stickerData };
        }
      }
      
      // 말풍선 데이터 복사
      if (getObjectType(obj) === 'speech-bubble') {
        const originalBubble = obj as CanvasSpeechBubble;
        const clonedBubble = cloned as CanvasSpeechBubble;
        if (originalBubble.bubbleData) {
          clonedBubble.bubbleData = { ...originalBubble.bubbleData };
        }
      }
      
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      onObjectSelect(cloned);
    });
  }, [canvas, onObjectSelect]);

  // 객체 잠금/해제
  const handleToggleLock = useCallback((obj: fabric.Object) => {
    const isLocked = obj.selectable === false;
    obj.set({
      selectable: isLocked,
      evented: isLocked,
      hasControls: isLocked,
      hasBorders: isLocked
    });
    
    // 스티커 데이터 업데이트
    if (getObjectType(obj) === 'sticker') {
      const stickerObj = obj as CanvasSticker;
      if (stickerObj.stickerData) {
        stickerObj.stickerData.isLocked = !isLocked;
      }
    }
    
    canvas?.renderAll();
    updateObjectList();
  }, [canvas, updateObjectList]);

  // 객체 표시/숨김
  const handleToggleVisibility = useCallback((obj: fabric.Object) => {
    obj.set('visible', !obj.visible);
    canvas?.renderAll();
    updateObjectList();
  }, [canvas, updateObjectList]);

  // Z-index 이동
  const handleMoveUp = useCallback((obj: fabric.Object) => {
    canvas?.bringObjectForward(obj);
    canvas?.renderAll();
    updateObjectList();
  }, [canvas, updateObjectList]);

  const handleMoveDown = useCallback((obj: fabric.Object) => {
    canvas?.sendObjectBackwards(obj);
    canvas?.renderAll();
    updateObjectList();
  }, [canvas, updateObjectList]);

  // 객체 리셋
  const handleResetObject = useCallback((obj: fabric.Object) => {
    obj.set({
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      skewX: 0,
      skewY: 0
    });
    canvas?.renderAll();
  }, [canvas]);

  // 말풍선 편집
  const handleEditSpeechBubble = useCallback((obj: fabric.Object) => {
    if (getObjectType(obj) === 'speech-bubble' && onEditSpeechBubble) {
      onEditSpeechBubble(obj as CanvasSpeechBubble);
    }
  }, [onEditSpeechBubble]);

  if (!canvas) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-sm text-gray-500 text-center">
          캔버스가 로드되지 않았습니다
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">레이어 관리</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? '숨기기' : '보기'}
        </Button>
      </div>

      {/* 객체 목록 */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {objects.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            캔버스에 객체가 없습니다
          </div>
        ) : (
          objects.map((objectInfo) => (
            <div
              key={objectInfo.id}
              className={`p-3 border rounded-lg transition-all cursor-pointer ${
                selectedObject === objectInfo.object
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleObjectClick(objectInfo.object)}
            >
              {/* 객체 정보 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{objectInfo.name}</span>
                  <div className="flex gap-1">
                    {objectInfo.isLocked && (
                      <Lock size={12} className="text-gray-400" />
                    )}
                    {!objectInfo.isVisible && (
                      <EyeOff size={12} className="text-gray-400" />
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">#{objectInfo.zIndex + 1}</span>
              </div>

              {/* 컨트롤 버튼 */}
              {showControls && (
                <div className="flex flex-wrap gap-1">
                  {/* 기본 컨트롤 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateObject(objectInfo.object);
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="복제"
                  >
                    <Copy size={14} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLock(objectInfo.object);
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title={objectInfo.isLocked ? "잠금 해제" : "잠금"}
                  >
                    {objectInfo.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(objectInfo.object);
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title={objectInfo.isVisible ? "숨기기" : "보이기"}
                  >
                    {objectInfo.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  {/* Z-index 컨트롤 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(objectInfo.object);
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="앞으로"
                  >
                    <MoveUp size={14} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(objectInfo.object);
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="뒤로"
                  >
                    <MoveDown size={14} />
                  </button>

                  {/* 변형 리셋 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetObject(objectInfo.object);
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="변형 리셋"
                  >
                    <RotateCcw size={14} />
                  </button>

                  {/* 말풍선 편집 */}
                  {objectInfo.type === 'speech-bubble' && onEditSpeechBubble && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSpeechBubble(objectInfo.object);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="말풍선 편집"
                    >
                      <Settings size={14} />
                    </button>
                  )}

                  {/* 삭제 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteObject(objectInfo.object);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 전체 작업 버튼 */}
      {objects.length > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                canvas.clear();
                onObjectSelect(null);
              }}
              className="flex-1"
            >
              전체 삭제
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                objects.forEach(({ object }) => {
                  object.set({
                    scaleX: 1,
                    scaleY: 1,
                    angle: 0,
                    skewX: 0,
                    skewY: 0
                  });
                });
                canvas.renderAll();
              }}
              className="flex-1"
            >
              전체 리셋
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerManager;