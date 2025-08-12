'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import * as fabric from 'fabric';

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  color: string;
  strokeColor: string;
  strokeWidth: number;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor?: string;
  opacity: number;
}

export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  textBoxes: {
    x: number;
    y: number;
    width: number;
    height: number;
    defaultText: string;
  }[];
}

export interface MobileFabricCanvasRef {
  exportAsImage: () => string | null;
  addText: (text: string, options?: any) => void;
  updateTextStyle: (style: Partial<TextStyle>) => void;
  loadTemplate: (template: MemeTemplate) => Promise<void>;
  addImageFromUrl: (url: string) => Promise<void>;
  addImageFromFile: (file: File) => Promise<void>;
  deleteSelectedObject: () => void;
  duplicateSelectedObject: () => void;
  rotateSelectedObject: () => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  getCanvas: () => fabric.Canvas | null;
  getCanvasContainer: () => HTMLDivElement | null;
  getAllTexts: () => string[];
}

interface MobileFabricCanvasProps {
  width?: number;
  height?: number;
  onSelectionChange?: (object: any) => void;
  onTextChange?: (text: string) => void;
  className?: string;
}

const MobileFabricCanvas = forwardRef<MobileFabricCanvasRef, MobileFabricCanvasProps>(({
  width = 350,
  height = 350,
  onSelectionChange,
  onTextChange,
  className = ''
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const activeTextRef = useRef<fabric.IText | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  
  // Undo/Redo 히스토리 관리
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUndoRedo = useRef(false);

  // 터치 관련 상태
  const [isZooming, setIsZooming] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [isPinching, setIsPinching] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // 캔버스 상태 저장
  const saveCanvasState = useCallback(() => {
    if (!fabricCanvasRef.current || isUndoRedo.current) return;
    
    const currentState = JSON.stringify(fabricCanvasRef.current.toJSON(['name']));
    
    if (undoStack.current.length > 0 && undoStack.current[undoStack.current.length - 1] === currentState) {
      return;
    }
    
    undoStack.current.push(currentState);
    
    if (undoStack.current.length > 50) {
      undoStack.current.shift();
    }
    
    redoStack.current = [];
  }, []);

  // Undo 기능
  const undo = useCallback(() => {
    if (!fabricCanvasRef.current || undoStack.current.length <= 1) return;
    
    isUndoRedo.current = true;
    
    const currentState = JSON.stringify(fabricCanvasRef.current.toJSON(['name']));
    redoStack.current.push(currentState);
    
    const previousState = undoStack.current.pop();
    if (previousState && undoStack.current.length > 0) {
      const stateToRestore = undoStack.current[undoStack.current.length - 1];
      fabricCanvasRef.current.loadFromJSON(stateToRestore, () => {
        fabricCanvasRef.current?.renderAll();
        isUndoRedo.current = false;
      });
    } else {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = '#ffffff';
      fabricCanvasRef.current.renderAll();
      isUndoRedo.current = false;
    }
  }, []);

  // Redo 기능
  const redo = useCallback(() => {
    if (!fabricCanvasRef.current || redoStack.current.length === 0) return;
    
    isUndoRedo.current = true;
    
    const stateToRestore = redoStack.current.pop();
    if (stateToRestore) {
      const currentState = JSON.stringify(fabricCanvasRef.current.toJSON(['name']));
      undoStack.current.push(currentState);
      
      fabricCanvasRef.current.loadFromJSON(stateToRestore, () => {
        fabricCanvasRef.current?.renderAll();
        isUndoRedo.current = false;
      });
    }
  }, []);

  // 터치 거리 계산
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Fabric.js 캔버스 초기화
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      // 모바일 최적화 설정
      selection: true,
      targetFindTolerance: 15, // 터치 타겟 확대
      perPixelTargetFind: true,
    });

    fabricCanvasRef.current = canvas;

    // 선택 이벤트 핸들러
    canvas.on('selection:created', (e: any) => {
      const activeObject = e.selected?.[0] || null;
      if (activeObject && activeObject.type === 'i-text') {
        activeTextRef.current = activeObject as fabric.IText;
      }
      onSelectionChange?.(activeObject);
    });

    canvas.on('selection:updated', (e: any) => {
      const activeObject = e.selected?.[0] || null;
      if (activeObject && activeObject.type === 'i-text') {
        activeTextRef.current = activeObject as fabric.IText;
      }
      onSelectionChange?.(activeObject);
    });

    canvas.on('selection:cleared', () => {
      activeTextRef.current = null;
      onSelectionChange?.(null);
    });

    // 텍스트 변경 이벤트
    canvas.on('text:changed', (e: any) => {
      const textObj = e.target as fabric.IText;
      onTextChange?.(textObj.text || '');
      setTimeout(saveCanvasState, 100);
    });

    // 캔버스 상태 변경 이벤트들에 히스토리 저장 추가
    const saveStateAfterChange = () => {
      setTimeout(saveCanvasState, 100);
    };

    canvas.on('object:added', saveStateAfterChange);
    canvas.on('object:removed', saveStateAfterChange);
    canvas.on('object:modified', saveStateAfterChange);

    // 모바일 터치 이벤트 처리
    const canvasElement = canvas.getElement();
    
    // 터치 시작
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // 단일 터치 - 드래그 시작 시간 기록
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now()
        };
      } else if (e.touches.length === 2) {
        // 멀티 터치 - 핀치 줌
        setIsPinching(true);
        setIsZooming(true);
        setLastTouchDistance(getTouchDistance(e.touches));
        e.preventDefault();
      }
    };

    // 터치 이동 - 핀치 줌 및 드래그
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinching) {
        e.preventDefault();
        
        const currentDistance = getTouchDistance(e.touches);
        const scale = currentDistance / lastTouchDistance;
        
        if (Math.abs(scale - 1) > 0.01) { // 민감도 조절
          const zoom = canvas.getZoom() * scale;
          const newZoom = Math.min(Math.max(zoom, 0.5), 3); // 줌 제한
          
          canvas.setZoom(newZoom);
          canvas.renderAll();
          
          setLastTouchDistance(currentDistance);
        }
      }
    };

    // 터치 종료
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        setIsPinching(false);
        setIsZooming(false);
        setLastTouchDistance(0);
      }
      
      // 단일 터치 종료 시 더블탭 검사
      if (e.touches.length === 0 && touchStartRef.current) {
        const touchEnd = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY,
          time: Date.now()
        };
        
        const distance = Math.sqrt(
          Math.pow(touchEnd.x - touchStartRef.current.x, 2) + 
          Math.pow(touchEnd.y - touchStartRef.current.y, 2)
        );
        
        const duration = touchEnd.time - touchStartRef.current.time;
        
        // 짧은 탭이고 거리가 짧으면 텍스트 편집 모드
        if (duration < 300 && distance < 10) {
          const pointer = canvas.getPointer(e.changedTouches[0]);
          const target = canvas.findTarget(e.changedTouches[0] as any, false);
          
          if (target && target.type === 'i-text') {
            target.enterEditing();
            target.selectAll();
            canvas.renderAll();
          }
        }
        
        touchStartRef.current = null;
      }
    };

    // 이벤트 리스너 등록
    canvasElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvasElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvasElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    // 초기 상태 저장
    setTimeout(() => {
      saveCanvasState();
    }, 100);

    return () => {
      canvasElement.removeEventListener('touchstart', handleTouchStart);
      canvasElement.removeEventListener('touchmove', handleTouchMove);
      canvasElement.removeEventListener('touchend', handleTouchEnd);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [canvasSize.width, canvasSize.height, onSelectionChange, onTextChange, saveCanvasState, isZooming, lastTouchDistance, isPinching]);

  // 반응형 크기 조정
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !fabricCanvasRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // 모바일에서 더 큰 여백 적용
      const padding = 40;
      const maxWidth = Math.min(containerWidth - padding, width);
      const maxHeight = Math.min(containerHeight - padding, height);

      const scaleX = maxWidth / width;
      const scaleY = maxHeight / height;
      const newScale = Math.min(scaleX, scaleY, 1);

      const newWidth = width * newScale;
      const newHeight = height * newScale;

      setCanvasSize({ width: newWidth, height: newHeight });

      fabricCanvasRef.current.setDimensions({ 
        width: newWidth, 
        height: newHeight 
      });

      if (canvasRef.current) {
        canvasRef.current.style.width = `${newWidth}px`;
        canvasRef.current.style.height = `${newHeight}px`;
      }

      fabricCanvasRef.current.renderAll();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  // 이미지를 캔버스에 추가하는 함수
  const addImageFromUrl = useCallback(async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!fabricCanvasRef.current) {
        reject(new Error('Canvas not initialized'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const fabricImg = new fabric.Image(img);
          
          if (!fabricCanvasRef.current) {
            reject(new Error('Canvas not initialized'));
            return;
          }

          const canvas = fabricCanvasRef.current;
          const scaleX = canvas.width! / fabricImg.width!;
          const scaleY = canvas.height! / fabricImg.height!;
          const scale = Math.min(scaleX, scaleY);

          fabricImg.set({
            scaleX: scale,
            scaleY: scale,
            left: (canvas.width! - fabricImg.width! * scale) / 2,
            top: (canvas.height! - fabricImg.height! * scale) / 2,
            selectable: true,
            evented: true,
            name: 'background-image'
          });

          canvas.add(fabricImg);
          canvas.sendObjectToBack(fabricImg);
          canvas.renderAll();
          
          setTimeout(saveCanvasState, 100);
          resolve();
        } catch (error) {
          console.error('Error creating fabric image:', error);
          reject(new Error('Failed to create fabric image'));
        }
      };

      img.onerror = (error) => {
        console.error('Image loading error:', error);
        const fallbackImg = new Image();
        
        fallbackImg.onload = () => {
          try {
            const fabricImg = new fabric.Image(fallbackImg);
            
            if (!fabricCanvasRef.current) {
              reject(new Error('Canvas not initialized'));
              return;
            }

            const canvas = fabricCanvasRef.current;
            const scaleX = canvas.width! / fabricImg.width!;
            const scaleY = canvas.height! / fabricImg.height!;
            const scale = Math.min(scaleX, scaleY);

            fabricImg.set({
              scaleX: scale,
              scaleY: scale,
              left: (canvas.width! - fabricImg.width! * scale) / 2,
              top: (canvas.height! - fabricImg.height! * scale) / 2,
              selectable: true,
              evented: true,
              name: 'background-image'
            });

            canvas.add(fabricImg);
            canvas.sendObjectToBack(fabricImg);
            canvas.renderAll();
            
            setTimeout(saveCanvasState, 100);
            resolve();
          } catch (fallbackError) {
            console.error('Fallback image creation error:', fallbackError);
            reject(new Error('Failed to load image (CORS policy)'));
          }
        };

        fallbackImg.onerror = () => {
          reject(new Error('Failed to load image - Network or CORS error'));
        };

        fallbackImg.src = url;
      };

      img.src = url;
    });
  }, [saveCanvasState]);

  // 파일에서 이미지 추가
  const addImageFromFile = useCallback(async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = e.target?.result as string;
        addImageFromUrl(dataURL).then(resolve).catch(reject);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, [addImageFromUrl]);

  // 텍스트 추가 함수 (모바일 최적화)
  const addText = useCallback((text: string, options: any = {}) => {
    if (!fabricCanvasRef.current) return;

    const defaultOptions: any = {
      left: fabricCanvasRef.current.width! / 2,
      top: fabricCanvasRef.current.height! / 2,
      fontSize: 32, // 모바일에서 조금 더 작게
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontWeight: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      editable: true,
      ...options
    };

    const textObj = new fabric.IText(text, defaultOptions);
    
    fabricCanvasRef.current.add(textObj);
    fabricCanvasRef.current.setActiveObject(textObj);
    fabricCanvasRef.current.renderAll();
    
    activeTextRef.current = textObj;
    
    setTimeout(saveCanvasState, 100);
  }, [saveCanvasState]);

  // 나머지 함수들은 원본과 동일하게 구현
  const updateTextStyle = useCallback((style: Partial<TextStyle>) => {
    if (!activeTextRef.current || !fabricCanvasRef.current) return;

    const textObj = activeTextRef.current;
    
    if (style.fontSize !== undefined) textObj.set('fontSize', style.fontSize);
    if (style.fontFamily !== undefined) textObj.set('fontFamily', style.fontFamily);
    if (style.fontWeight !== undefined) textObj.set('fontWeight', style.fontWeight);
    if (style.color !== undefined) textObj.set('fill', style.color);
    if (style.strokeColor !== undefined) {
      if (style.strokeColor === 'transparent') {
        textObj.set('stroke', '');
        textObj.set('strokeWidth', 0);
      } else {
        textObj.set('stroke', style.strokeColor);
      }
    }
    if (style.strokeWidth !== undefined && style.strokeColor !== 'transparent') {
      textObj.set('strokeWidth', style.strokeWidth);
    }
    if (style.textAlign !== undefined) textObj.set('textAlign', style.textAlign);
    if (style.backgroundColor !== undefined) textObj.set('backgroundColor', style.backgroundColor);
    if (style.opacity !== undefined) textObj.set('opacity', style.opacity);

    fabricCanvasRef.current.renderAll();
    setTimeout(saveCanvasState, 100);
  }, [saveCanvasState]);

  // 템플릿 로드
  const loadTemplate = useCallback(async (template: MemeTemplate): Promise<void> => {
    if (!fabricCanvasRef.current) return;

    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#ffffff';
    fabricCanvasRef.current.renderAll();

    try {
      const loadImageWithTimeout = () => {
        return Promise.race([
          addImageFromUrl(template.url),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Image loading timeout')), 10000)
          )
        ]);
      };

      await loadImageWithTimeout();

      setTimeout(() => {
        template.textBoxes.forEach((textBox) => {
          addText(textBox.defaultText, {
            left: textBox.x + textBox.width / 2,
            top: textBox.y + textBox.height / 2,
            fontSize: Math.max(20, textBox.height * 0.4),
          });
        });
        
        setTimeout(saveCanvasState, 200);
      }, 100);

    } catch (error) {
      console.error('Template loading failed:', error);
      
      try {
        template.textBoxes.forEach((textBox) => {
          addText(textBox.defaultText, {
            left: textBox.x + textBox.width / 2,
            top: textBox.y + textBox.height / 2,
            fontSize: Math.max(20, textBox.height * 0.4),
          });
        });
        console.log('Text boxes added despite image loading failure');
      } catch (textError) {
        console.error('Failed to add text boxes:', textError);
      }
      
      throw error;
    }
  }, [addImageFromUrl, addText, saveCanvasState]);

  // 이미지로 내보내기
  const exportAsImage = useCallback((): string | null => {
    if (!fabricCanvasRef.current) return null;
    
    return fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2
    });
  }, []);

  // 선택된 객체 삭제
  const deleteSelectedObject = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
      onSelectionChange?.(null);
      
      setTimeout(saveCanvasState, 100);
    }
  }, [onSelectionChange, saveCanvasState]);

  // 캔버스 완전 클리어
  const clearCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#ffffff';
    fabricCanvasRef.current.renderAll();
    onSelectionChange?.(null);
    
    setTimeout(saveCanvasState, 100);
  }, [onSelectionChange, saveCanvasState]);

  // 선택된 객체 복사
  const duplicateSelectedObject = useCallback(async () => {
    if (!fabricCanvasRef.current) return;
    
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      try {
        const cloned = await activeObject.clone();
        cloned.set({
          left: cloned.left + 10,
          top: cloned.top + 10,
        });
        fabricCanvasRef.current.add(cloned);
        fabricCanvasRef.current.setActiveObject(cloned);
        fabricCanvasRef.current.renderAll();
        
        setTimeout(saveCanvasState, 100);
      } catch (error) {
        console.error('Failed to duplicate object:', error);
      }
    }
  }, [saveCanvasState]);

  // 선택된 객체 회전
  const rotateSelectedObject = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      const newAngle = (currentAngle + 45) % 360;
      activeObject.set('angle', newAngle);
      fabricCanvasRef.current.renderAll();
      
      setTimeout(saveCanvasState, 100);
    }
  }, [saveCanvasState]);

  // 캔버스 컨테이너 반환
  const getCanvasContainer = useCallback(() => containerRef.current, []);
  const getCanvas = useCallback(() => fabricCanvasRef.current, []);

  // 캔버스의 모든 텍스트 추출
  const getAllTexts = useCallback(() => {
    if (!fabricCanvasRef.current) return [];
    
    const objects = fabricCanvasRef.current.getObjects();
    const texts: string[] = [];
    
    objects.forEach(obj => {
      if (obj.type === 'i-text' || obj.type === 'text') {
        const textObj = obj as fabric.IText;
        if (textObj.text && textObj.text.trim()) {
          texts.push(textObj.text.trim());
        }
      }
    });
    
    return texts;
  }, []);

  // ref 메서드들 노출
  useImperativeHandle(ref, () => ({
    exportAsImage,
    addText,
    updateTextStyle,
    loadTemplate,
    addImageFromUrl,
    addImageFromFile,
    deleteSelectedObject,
    duplicateSelectedObject,
    rotateSelectedObject,
    clearCanvas,
    undo,
    redo,
    getCanvas,
    getCanvasContainer,
    getAllTexts
  }), [exportAsImage, addText, updateTextStyle, loadTemplate, addImageFromUrl, addImageFromFile, deleteSelectedObject, duplicateSelectedObject, rotateSelectedObject, clearCanvas, undo, redo, getCanvas, getCanvasContainer, getAllTexts]);

  return (
    <div 
      ref={containerRef}
      className={`fabric-canvas-container w-full h-full flex items-center justify-center ${className}`}
    >
      <canvas 
        ref={canvasRef}
        className="border border-gray-200 rounded-lg shadow-lg max-w-full max-h-full touch-action-none"
        style={{ touchAction: 'none' }} // 브라우저 기본 터치 동작 방지
      />
    </div>
  );
});

MobileFabricCanvas.displayName = 'MobileFabricCanvas';

export default MobileFabricCanvas;