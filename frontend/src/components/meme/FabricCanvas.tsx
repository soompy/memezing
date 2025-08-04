'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import * as fabric from 'fabric';

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
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

export interface FabricCanvasRef {
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
}

interface FabricCanvasProps {
  width?: number;
  height?: number;
  onSelectionChange?: (object: any) => void;
  onTextChange?: (text: string) => void;
  className?: string;
}

const FabricCanvas = forwardRef<FabricCanvasRef, FabricCanvasProps>(({
  width = 800,
  height = 600,
  onSelectionChange,
  onTextChange,
  className = ''
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const activeTextRef = useRef<fabric.IText | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const [, setScale] = useState(1);
  
  // Undo/Redo 히스토리 관리
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUndoRedo = useRef(false);

  // 캔버스 상태 저장
  const saveCanvasState = useCallback(() => {
    if (!fabricCanvasRef.current || isUndoRedo.current) return;
    
    const currentState = JSON.stringify(fabricCanvasRef.current.toJSON(['name']));
    
    // 마지막 상태와 같으면 저장하지 않음
    if (undoStack.current.length > 0 && undoStack.current[undoStack.current.length - 1] === currentState) {
      return;
    }
    
    undoStack.current.push(currentState);
    
    // 최대 50개의 히스토리만 유지
    if (undoStack.current.length > 50) {
      undoStack.current.shift();
    }
    
    // 새로운 액션이 일어나면 redo 스택 초기화
    redoStack.current = [];
  }, []);

  // Undo 기능
  const undo = useCallback(() => {
    if (!fabricCanvasRef.current || undoStack.current.length <= 1) return;
    
    isUndoRedo.current = true;
    
    // 현재 상태를 redo 스택에 저장
    const currentState = JSON.stringify(fabricCanvasRef.current.toJSON(['name']));
    redoStack.current.push(currentState);
    
    // 이전 상태로 복원
    const previousState = undoStack.current.pop();
    if (previousState && undoStack.current.length > 0) {
      const stateToRestore = undoStack.current[undoStack.current.length - 1];
      fabricCanvasRef.current.loadFromJSON(stateToRestore, () => {
        fabricCanvasRef.current?.renderAll();
        isUndoRedo.current = false;
      });
    } else {
      // 처음 상태로 복원
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
      // 현재 상태를 undo 스택에 저장
      const currentState = JSON.stringify(fabricCanvasRef.current.toJSON(['name']));
      undoStack.current.push(currentState);
      
      fabricCanvasRef.current.loadFromJSON(stateToRestore, () => {
        fabricCanvasRef.current?.renderAll();
        isUndoRedo.current = false;
      });
    }
  }, []);

  // Fabric.js 캔버스 초기화
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true
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
      // 텍스트 변경 시 히스토리 저장 (약간의 딜레이 후)
      setTimeout(saveCanvasState, 100);
    });

    // 캔버스 상태 변경 이벤트들에 히스토리 저장 추가
    const saveStateAfterChange = () => {
      setTimeout(saveCanvasState, 100);
    };

    canvas.on('object:added', saveStateAfterChange);
    canvas.on('object:removed', saveStateAfterChange);
    canvas.on('object:modified', saveStateAfterChange);
    canvas.on('object:moved', saveStateAfterChange);
    canvas.on('object:scaled', saveStateAfterChange);
    canvas.on('object:rotated', saveStateAfterChange);

    // 초기 상태 저장
    setTimeout(() => {
      saveCanvasState();
    }, 100);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [canvasSize.width, canvasSize.height, onSelectionChange, onTextChange]);

  // 반응형 크기 조정
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !fabricCanvasRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // 최대 크기 제한
      const maxWidth = Math.min(containerWidth - 32, width); // 여백 32px
      const maxHeight = Math.min(containerHeight - 32, height);

      // 비율 계산
      const scaleX = maxWidth / width;
      const scaleY = maxHeight / height;
      const newScale = Math.min(scaleX, scaleY, 1); // 1을 넘지 않도록

      const newWidth = width * newScale;
      const newHeight = height * newScale;

      setCanvasSize({ width: newWidth, height: newHeight });
      setScale(newScale);

      // Fabric.js 캔버스 크기 업데이트
      fabricCanvasRef.current.setDimensions({ 
        width: newWidth, 
        height: newHeight 
      });

      // CSS 스타일도 업데이트
      if (canvasRef.current) {
        canvasRef.current.style.width = `${newWidth}px`;
        canvasRef.current.style.height = `${newHeight}px`;
      }

      fabricCanvasRef.current.renderAll();
    };

    // 초기 크기 설정
    handleResize();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  // 크기 변경 시 캔버스 크기 업데이트
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({ width, height });
      fabricCanvasRef.current.renderAll();
    }
  }, [width, height]);

  // 이미지를 캔버스에 추가하는 함수
  const addImageFromUrl = useCallback(async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!fabricCanvasRef.current) {
        reject(new Error('Canvas not initialized'));
        return;
      }

      // CORS 우회를 위해 프록시 이미지 생성
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // 이미지가 로드되면 Fabric.js 이미지 객체 생성
          const fabricImg = new fabric.Image(img);
          
          if (!fabricCanvasRef.current) {
            reject(new Error('Canvas not initialized'));
            return;
          }

          // 이미지 크기를 캔버스에 맞게 조정
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
          
          // 히스토리 저장
          setTimeout(saveCanvasState, 100);
          resolve();
        } catch (error) {
          console.error('Error creating fabric image:', error);
          reject(new Error('Failed to create fabric image'));
        }
      };

      img.onerror = (error) => {
        console.error('Image loading error:', error);
        // CORS 오류 시 다시 시도 (crossOrigin 없이)
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
            
            // 히스토리 저장
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

      // 처음 시도는 crossOrigin과 함께
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

  // 텍스트 추가 함수
  const addText = useCallback((text: string, options: any = {}) => {
    if (!fabricCanvasRef.current) return;

    const defaultOptions: any = {
      left: 100,
      top: 100,
      fontSize: 40,
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontWeight: 'bold',
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
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
    
    // 히스토리 저장
    setTimeout(saveCanvasState, 100);
  }, [saveCanvasState]);

  // 텍스트 스타일 업데이트
  const updateTextStyle = useCallback((style: Partial<TextStyle>) => {
    if (!activeTextRef.current || !fabricCanvasRef.current) return;

    const textObj = activeTextRef.current;
    
    if (style.fontSize !== undefined) textObj.set('fontSize', style.fontSize);
    if (style.fontFamily !== undefined) textObj.set('fontFamily', style.fontFamily);
    if (style.fontWeight !== undefined) textObj.set('fontWeight', style.fontWeight);
    if (style.fontStyle !== undefined) textObj.set('fontStyle', style.fontStyle);
    if (style.color !== undefined) textObj.set('fill', style.color);
    if (style.strokeColor !== undefined) textObj.set('stroke', style.strokeColor);
    if (style.strokeWidth !== undefined) textObj.set('strokeWidth', style.strokeWidth);
    if (style.textAlign !== undefined) textObj.set('textAlign', style.textAlign);
    if (style.backgroundColor !== undefined) textObj.set('backgroundColor', style.backgroundColor);
    if (style.opacity !== undefined) textObj.set('opacity', style.opacity);

    fabricCanvasRef.current.renderAll();
    
    // 히스토리 저장
    setTimeout(saveCanvasState, 100);
  }, [saveCanvasState]);

  // 템플릿 로드
  const loadTemplate = useCallback(async (template: MemeTemplate): Promise<void> => {
    if (!fabricCanvasRef.current) return;

    // 캔버스 클리어
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#ffffff';
    fabricCanvasRef.current.renderAll();

    try {
      // 타임아웃 설정 (10초)
      const loadImageWithTimeout = () => {
        return Promise.race([
          addImageFromUrl(template.url),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Image loading timeout')), 10000)
          )
        ]);
      };

      // 배경 이미지 로드 (타임아웃 포함)
      await loadImageWithTimeout();

      // 텍스트 박스들 추가 (이미지 로딩과 독립적으로)
      setTimeout(() => {
        template.textBoxes.forEach((textBox) => {
          addText(textBox.defaultText, {
            left: textBox.x + textBox.width / 2,
            top: textBox.y + textBox.height / 2,
            fontSize: Math.max(20, textBox.height * 0.4),
          });
        });
        
        // 템플릿 로딩 완료 후 히스토리 저장
        setTimeout(saveCanvasState, 200);
      }, 100); // 이미지 로딩 후 약간의 딜레이

    } catch (error) {
      console.error('Template loading failed:', error);
      
      // 이미지 로딩에 실패해도 텍스트는 추가
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
      multiplier: 2 // 고해상도 내보내기
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
      
      // 히스토리 저장
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
    
    // 히스토리 저장
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
        
        // 히스토리 저장
        setTimeout(saveCanvasState, 100);
      } catch (error) {
        console.error('Failed to duplicate object:', error);
      }
    }
  }, [saveCanvasState]);

  // 선택된 객체 회전 (90도씩 시계방향)
  const rotateSelectedObject = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      const newAngle = (currentAngle + 90) % 360;
      activeObject.set('angle', newAngle);
      
      // 이미지 객체의 경우 중심점 재조정
      if (activeObject.type === 'image') {
        activeObject.set({
          originX: 'center',
          originY: 'center'
        });
      }
      
      fabricCanvasRef.current.renderAll();
      
      // 히스토리 저장
      setTimeout(saveCanvasState, 100);
    }
  }, [saveCanvasState]);

  // 캔버스 컨테이너 반환
  const getCanvasContainer = useCallback(() => containerRef.current, []);

  // 캔버스 인스턴스 반환
  const getCanvas = useCallback(() => fabricCanvasRef.current, []);

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
    getCanvasContainer
  }), [exportAsImage, addText, updateTextStyle, loadTemplate, addImageFromUrl, addImageFromFile, deleteSelectedObject, duplicateSelectedObject, rotateSelectedObject, clearCanvas, undo, redo, getCanvas, getCanvasContainer]);

  return (
    <div 
      ref={containerRef}
      className={`fabric-canvas-container w-full h-full flex items-center justify-center ${className}`}
    >
      <canvas 
        ref={canvasRef}
        className="border border-gray-200 rounded-lg shadow-lg max-w-full max-h-full"
      />
    </div>
  );
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;