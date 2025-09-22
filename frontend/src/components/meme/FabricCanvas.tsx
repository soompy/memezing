'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import * as fabric from 'fabric';
import type { Sticker, SpeechBubble, CanvasSticker, CanvasSpeechBubble } from '@/types/sticker';
import type { LayerItem } from './LayerPanel';
import { createStickerObject, createSpeechBubbleGroup, getObjectType } from '@/utils/stickerHelpers';

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
  source?: string; // 템플릿 출처 ('curated', 'imgflip', 'memecoin', etc.)
  width?: number; // 원본 이미지 너비
  height?: number; // 원본 이미지 높이
  popularity?: number; // 인기도 점수
  tags?: string[]; // 태그 목록
  category?: 'korean' | 'foreign' | 'animal' | 'general'; // 템플릿 카테고리
  region?: string; // 지역 정보 (예: 'ko', 'us', 'global')
}

export type ImageFillOption = 'fill' | 'fit' | 'stretch' | 'center';

export interface FabricCanvasRef {
  exportAsImage: () => string | null;
  addText: (text: string, options?: any) => void;
  updateTextStyle: (style: Partial<TextStyle>) => void;
  resetSelectedTextStyle: (defaultStyle: TextStyle) => boolean;
  loadTemplate: (template: MemeTemplate) => Promise<void>;
  addImageFromUrl: (url: string, fillOption?: ImageFillOption) => Promise<void>;
  addImageFromFile: (file: File, fillOption?: ImageFillOption) => Promise<void>;
  setBackgroundImageFromUrl: (url: string, fillOption?: ImageFillOption) => Promise<void>;
  setBackgroundImageFromFile: (file: File, fillOption?: ImageFillOption) => Promise<void>;
  updateSelectedImageFill: (fillOption: ImageFillOption) => void;
  deleteSelectedObject: () => void;
  duplicateSelectedObject: () => void;
  rotateSelectedObject: () => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  getCanvas: () => fabric.Canvas | null;
  getCanvasContainer: () => HTMLDivElement | null;
  getAllTexts: () => string[];
  changeCanvasSize: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
  getCanvasSize: () => { width: number; height: number };
  getBackgroundColor: () => string;
  // 스티커 관련 메서드
  addSticker: (sticker: Sticker) => Promise<void>;
  addSpeechBubble: (speechBubble: SpeechBubble, text?: string) => Promise<void>;
  updateSpeechBubbleText: (text: string) => void;
  updateSpeechBubbleStyle: (style: { backgroundColor?: string; borderColor?: string; borderWidth?: number }) => void;
  getSelectedStickerType: () => 'sticker' | 'speech-bubble' | 'text' | 'image' | null;
  lockSelectedObject: (locked: boolean) => void;
  // 레이어 관리 메서드
  getAllLayers: () => LayerItem[];
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  setLayerLock: (layerId: string, locked: boolean) => void;
  reorderLayer: (layerId: string, direction: 'up' | 'down') => void;
  selectLayerById: (layerId: string) => void;
  renameLayer: (layerId: string, newName: string) => void;
  deleteLayerById: (layerId: string) => void;
  duplicateLayerById: (layerId: string) => void;
}

interface FabricCanvasProps {
  width?: number;
  height?: number;
  onSelectionChange?: (object: any) => void;
  onTextChange?: (text: string) => void;
  onImageDrop?: (file: File) => void;
  className?: string;
}

const FabricCanvas = forwardRef<FabricCanvasRef, FabricCanvasProps>(({
  width = 800,
  height = 600,
  onSelectionChange,
  onTextChange,
  onImageDrop,
  className = ''
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const activeTextRef = useRef<fabric.IText | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const [, setScale] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  
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

  // Fabric.js 캔버스 초기화 (한 번만 실행)
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
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
  }, [onSelectionChange, onTextChange, saveCanvasState]); // canvasSize 의존성 제거

  // 반응형 크기 조정
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !fabricCanvasRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // 여백을 고려한 최대 사용 가능 공간 계산
      const padding = 64;
      const availableWidth = Math.max(containerWidth - padding, 200);
      const availableHeight = Math.max(containerHeight - padding, 150);

      // 캔버스 원본 비율 유지하면서 컨테이너에 맞게 스케일 계산
      const scaleX = availableWidth / width;
      const scaleY = availableHeight / height;
      const newScale = Math.min(scaleX, scaleY, 1);

      const scaledWidth = Math.floor(width * newScale);
      const scaledHeight = Math.floor(height * newScale);

      setCanvasSize({ width: scaledWidth, height: scaledHeight });
      setScale(newScale);

      // Fabric.js 캔버스 크기 설정 (실제 크기)
      fabricCanvasRef.current.setDimensions({
        width: width,
        height: height
      });

      // 캔버스 컨테이너와 모든 캔버스 엘리먼트에 동일한 스타일 적용
      const canvasContainer = fabricCanvasRef.current.getElement().parentElement;
      if (canvasContainer) {
        canvasContainer.style.width = `${scaledWidth}px`;
        canvasContainer.style.height = `${scaledHeight}px`;
        canvasContainer.style.position = 'relative';

        const canvasElements = canvasContainer.querySelectorAll('canvas');
        canvasElements.forEach((canvas, index) => {
          canvas.style.width = `${scaledWidth}px`;
          canvas.style.height = `${scaledHeight}px`;
          canvas.style.maxWidth = 'none';
          canvas.style.maxHeight = 'none';
          canvas.style.display = 'block';

          // 하위 캔버스(배경)에만 테두리와 그림자 적용
          if (index === 0) {
            canvas.style.border = '1px solid #e5e7eb';
            canvas.style.borderRadius = '8px';
            canvas.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }
        });
      }

      fabricCanvasRef.current.renderAll();
    };

    // 초기 크기 설정
    handleResize();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  // props가 변경되면 초기화 useEffect의 dependency에 의해 자동으로 handleResize가 호출됨

  // 이미지 크기 및 위치 계산 헬퍼 함수
  const calculateImageDimensions = useCallback((
    fabricImg: fabric.Image, 
    canvasWidth: number, 
    canvasHeight: number, 
    fillOption: ImageFillOption = 'fill'
  ) => {
    const imgWidth = fabricImg.width!;
    const imgHeight = fabricImg.height!;
    
    let scaleX, scaleY, left, top;
    
    switch (fillOption) {
      case 'fill': // 캔버스에 꽉 채우기 (비율 유지, 잘림 가능)
        scaleX = canvasWidth / imgWidth;
        scaleY = canvasHeight / imgHeight;
        const fillScale = Math.max(scaleX, scaleY);
        scaleX = scaleY = fillScale;
        left = (canvasWidth - imgWidth * fillScale) / 2;
        top = (canvasHeight - imgHeight * fillScale) / 2;
        break;
        
      case 'fit': // 비율 유지해서 맞추기 (전체 이미지 보임)
        scaleX = canvasWidth / imgWidth;
        scaleY = canvasHeight / imgHeight;
        const fitScale = Math.min(scaleX, scaleY);
        scaleX = scaleY = fitScale;
        left = (canvasWidth - imgWidth * fitScale) / 2;
        top = (canvasHeight - imgHeight * fitScale) / 2;
        break;
        
      case 'stretch': // 늘려서 채우기 (비율 무시)
        scaleX = canvasWidth / imgWidth;
        scaleY = canvasHeight / imgHeight;
        left = 0;
        top = 0;
        break;
        
      case 'center': // 가운데 정렬 (원본 크기)
      default:
        scaleX = scaleY = 1;
        left = (canvasWidth - imgWidth) / 2;
        top = (canvasHeight - imgHeight) / 2;
        break;
    }
    
    return { scaleX, scaleY, left, top };
  }, []);

  // 이미지를 캔버스에 추가하는 함수 (CORS 안전)
  const addImageFromUrl = useCallback(async (url: string, fillOption: ImageFillOption = 'fill', imageName: string = 'user-image'): Promise<void> => {
    if (!fabricCanvasRef.current) {
      throw new Error('Canvas not initialized');
    }

    // 개선된 이미지 로더 사용
    const { loadImageSafely } = await import('@/utils/imageLoader');
    
    try {
      const result = await loadImageSafely(url, {
        timeout: 15000,
        retryCount: 2,
        useProxy: true,
        onProgress: (loaded, total) => {
          // TODO: 로딩 프로그레스 UI 업데이트
          console.log(`Loading progress: ${Math.round((loaded / total) * 100)}%`);
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to load image');
      }

      // Fabric.js 이미지 객체 생성
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            const fabricImg = new fabric.Image(img);
            
            if (!fabricCanvasRef.current) {
              reject(new Error('Canvas not initialized'));
              return;
            }

            // 이미지 크기를 캔버스에 맞게 조정
            const canvas = fabricCanvasRef.current;
            const { scaleX, scaleY, left, top } = calculateImageDimensions(
              fabricImg, 
              canvas.width!, 
              canvas.height!, 
              fillOption
            );

            fabricImg.set({
              scaleX,
              scaleY,
              left,
              top,
              selectable: true,
              evented: true,
              name: imageName
            });

            canvas.add(fabricImg);

            // 템플릿 이미지는 뒤로 보냄
            if (imageName === 'template-background') {
              canvas.sendObjectToBack(fabricImg);
            }

            // 현재 배경색을 보존
            const currentBgColor = canvas.backgroundColor;
            
            canvas.renderAll();
            
            // 렌더링 후 배경색이 제대로 유지되는지 확인하고 재설정
            setTimeout(() => {
              if (canvas.backgroundColor !== currentBgColor) {
                canvas.backgroundColor = currentBgColor;
                canvas.renderAll();
              }
            }, 50);
            
            // 히스토리 저장
            setTimeout(saveCanvasState, 100);
            
            // Blob URL 정리 (메모리 누수 방지)
            if (result.fromProxy && result.url.startsWith('blob:')) {
              setTimeout(() => {
                URL.revokeObjectURL(result.url);
              }, 1000);
            }
            
            resolve();
          } catch (error) {
            console.error('Error creating fabric image:', error);
            reject(new Error('Failed to create fabric image'));
          }
        };

        img.onerror = (error) => {
          console.error('Final image loading failed:', error);
          reject(new Error('Failed to create image element'));
        };

        // 로드된 이미지 URL 사용
        img.src = result.url;
      });

    } catch (error) {
      console.error('Image loading failed:', error);
      
      // 에러 타입에 따른 구체적인 메시지
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('이미지 로딩 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
        } else if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
          throw new Error('이미지 접근 권한 문제가 발생했습니다. 프록시를 통해 재시도 중입니다.');
        } else if (error.message.includes('404') || error.message.includes('not found')) {
          throw new Error('이미지를 찾을 수 없습니다. URL을 확인해주세요.');
        }
      }
      
      throw new Error('이미지를 불러올 수 없습니다. URL을 확인하거나 다른 이미지를 시도해주세요.');
    }
  }, [saveCanvasState]);

  // 파일에서 이미지 추가
  const addImageFromFile = useCallback(async (file: File, fillOption: ImageFillOption = 'fill'): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = e.target?.result as string;
        addImageFromUrl(dataURL, fillOption).then(resolve).catch(reject);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, [addImageFromUrl]);

  // 배경 이미지를 URL에서 설정
  const setBackgroundImageFromUrl = useCallback(async (url: string, fillOption: ImageFillOption = 'fill'): Promise<void> => {
    if (!fabricCanvasRef.current) {
      throw new Error('Canvas not initialized');
    }

    // 개선된 이미지 로더 사용
    const { loadImageSafely } = await import('@/utils/imageLoader');

    try {
      const result = await loadImageSafely(url, {
        timeout: 15000,
        retryCount: 2,
        useProxy: true,
        onProgress: (loaded, total) => {
          console.log(`Loading background image: ${Math.round((loaded / total) * 100)}%`);
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to load background image');
      }

      // Fabric.js 이미지 객체 생성
      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          try {
            const fabricImg = new fabric.Image(img);

            if (!fabricCanvasRef.current) {
              reject(new Error('Canvas not initialized'));
              return;
            }

            // 이미지 크기를 캔버스에 맞게 조정
            const canvas = fabricCanvasRef.current;
            const { scaleX, scaleY, left, top } = calculateImageDimensions(
              fabricImg,
              canvas.width!,
              canvas.height!,
              fillOption
            );

            fabricImg.set({
              scaleX,
              scaleY,
              left,
              top,
              selectable: false, // 배경 이미지는 선택 불가
              evented: false,    // 배경 이미지는 이벤트 처리 안함
              name: 'canvas-background-image'
            });

            // 기존 배경 이미지 제거
            const objects = canvas.getObjects().filter(obj => obj.name === 'canvas-background-image');
            objects.forEach(obj => canvas.remove(obj));

            // 배경으로 추가 (가장 뒤로)
            canvas.add(fabricImg);
            canvas.sendObjectToBack(fabricImg);
            canvas.renderAll();

            // 히스토리 저장
            setTimeout(saveCanvasState, 100);

            // Blob URL 정리 (메모리 누수 방지)
            if (result.fromProxy && result.url.startsWith('blob:')) {
              setTimeout(() => {
                URL.revokeObjectURL(result.url);
              }, 1000);
            }

            resolve();
          } catch (error) {
            console.error('Error creating fabric background image:', error);
            reject(new Error('Failed to create background image'));
          }
        };

        img.onerror = (error) => {
          console.error('Background image loading failed:', error);
          reject(new Error('Failed to create background image element'));
        };

        img.src = result.url;
      });

    } catch (error) {
      console.error('Background image loading failed:', error);
      throw new Error('배경 이미지를 불러올 수 없습니다. URL을 확인하거나 다른 이미지를 시도해주세요.');
    }
  }, [calculateImageDimensions, saveCanvasState]);

  // 파일에서 배경 이미지 설정
  const setBackgroundImageFromFile = useCallback(async (file: File, fillOption: ImageFillOption = 'fill'): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = e.target?.result as string;
        setBackgroundImageFromUrl(dataURL, fillOption).then(resolve).catch(reject);
      };
      reader.onerror = () => reject(new Error('Failed to read background image file'));
      reader.readAsDataURL(file);
    });
  }, [setBackgroundImageFromUrl]);

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
    
    // 히스토리 저장
    setTimeout(saveCanvasState, 100);
  }, [saveCanvasState]);

  // 선택된 텍스트 스타일 초기화
  const resetSelectedTextStyle = useCallback((defaultStyle: TextStyle): boolean => {
    if (!fabricCanvasRef.current) return false;

    // 현재 선택된 객체를 확인
    const activeObject = fabricCanvasRef.current.getActiveObject();
    
    if (activeObject && activeObject.type === 'i-text') {
      // 선택된 객체가 텍스트인 경우
      const textObj = activeObject as fabric.IText;
      
      textObj.set('fontSize', defaultStyle.fontSize);
      textObj.set('fontFamily', defaultStyle.fontFamily);
      textObj.set('fontWeight', defaultStyle.fontWeight);
      textObj.set('fontStyle', defaultStyle.fontStyle);
      textObj.set('fill', defaultStyle.color);
      
      if (defaultStyle.strokeColor === 'transparent') {
        textObj.set('stroke', '');
        textObj.set('strokeWidth', 0);
      } else {
        textObj.set('stroke', defaultStyle.strokeColor);
        textObj.set('strokeWidth', defaultStyle.strokeWidth);
      }
      
      textObj.set('textAlign', defaultStyle.textAlign);
      textObj.set('opacity', defaultStyle.opacity);
      
      // activeTextRef도 업데이트
      activeTextRef.current = textObj;
      
      fabricCanvasRef.current.renderAll();
      
      // 히스토리 저장
      setTimeout(saveCanvasState, 100);
      
      return true;
    }
    
    return false;
  }, [saveCanvasState]);

  // 템플릿 로드
  const loadTemplate = useCallback(async (template: MemeTemplate): Promise<void> => {
    if (!fabricCanvasRef.current) return;

    // 현재 배경색 보존
    const currentBgColor = fabricCanvasRef.current.backgroundColor || '#ffffff';
    
    // 캔버스 클리어 (배경색은 유지)
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = currentBgColor;
    fabricCanvasRef.current.renderAll();

    try {
      // 타임아웃 설정 (10초)
      const loadImageWithTimeout = () => {
        return Promise.race([
          addImageFromUrl(template.url, 'fill', 'template-background'),
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

  // 선택된 이미지의 채우기 옵션 업데이트
  const updateSelectedImageFill = useCallback((fillOption: ImageFillOption) => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') return;

    // 배경 이미지와 템플릿 이미지는 제외
    const objectName = (activeObject as any).name;
    if (objectName === 'canvas-background-image' || objectName === 'template-background') return;

    const fabricImg = activeObject as fabric.Image;
    const canvas = fabricCanvasRef.current;
    
    // 원본 이미지 크기 가져오기 (스케일링 되기 전)
    const originalWidth = fabricImg.width! / (fabricImg.scaleX || 1);
    const originalHeight = fabricImg.height! / (fabricImg.scaleY || 1);
    
    // 새로운 크기 및 위치 계산
    const { scaleX, scaleY, left, top } = calculateImageDimensions(
      { width: originalWidth, height: originalHeight } as fabric.Image,
      canvas.width!,
      canvas.height!,
      fillOption
    );
    
    // 이미지 속성 업데이트
    fabricImg.set({
      scaleX,
      scaleY,
      left,
      top
    });
    
    canvas.renderAll();
    
    // 히스토리 저장
    setTimeout(saveCanvasState, 100);
  }, [calculateImageDimensions, saveCanvasState]);

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

  // 반응형 크기 조정을 위한 공통 함수
  const updateCanvasDisplaySize = useCallback((actualWidth: number, actualHeight: number) => {
    if (!containerRef.current || !fabricCanvasRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 여백을 고려한 최대 사용 가능 공간 계산
    const padding = 64;
    const availableWidth = Math.max(containerWidth - padding, 200);
    const availableHeight = Math.max(containerHeight - padding, 150);

    // 캔버스 원본 비율 유지하면서 컨테이너에 맞게 스케일 계산
    const scaleX = availableWidth / actualWidth;
    const scaleY = availableHeight / actualHeight;
    const newScale = Math.min(scaleX, scaleY, 1);

    const scaledWidth = Math.floor(actualWidth * newScale);
    const scaledHeight = Math.floor(actualHeight * newScale);

    setCanvasSize({ width: scaledWidth, height: scaledHeight });
    setScale(newScale);

    // 캔버스 컨테이너와 모든 캔버스 엘리먼트에 동일한 스타일 적용
    const canvasContainer = fabricCanvasRef.current.getElement().parentElement;
    if (canvasContainer) {
      canvasContainer.style.width = `${scaledWidth}px`;
      canvasContainer.style.height = `${scaledHeight}px`;
      canvasContainer.style.position = 'relative';

      const canvasElements = canvasContainer.querySelectorAll('canvas');
      canvasElements.forEach((canvas, index) => {
        canvas.style.width = `${scaledWidth}px`;
        canvas.style.height = `${scaledHeight}px`;
        canvas.style.maxWidth = 'none';
        canvas.style.maxHeight = 'none';
        canvas.style.display = 'block';

        // 하위 캔버스(배경)에만 테두리와 그림자 적용
        if (index === 0) {
          canvas.style.border = '1px solid #e5e7eb';
          canvas.style.borderRadius = '8px';
          canvas.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }
      });
    }

    fabricCanvasRef.current.renderAll();
  }, []);

  // 캔버스 사이즈 변경
  const changeCanvasSize = useCallback((newWidth: number, newHeight: number) => {
    if (!fabricCanvasRef.current) return;

    try {
      // 기존 객체들의 위치 비율 계산
      const currentWidth = fabricCanvasRef.current.width || 800;
      const currentHeight = fabricCanvasRef.current.height || 600;

      // 크기가 같으면 변경하지 않음
      if (currentWidth === newWidth && currentHeight === newHeight) {
        return;
      }

      const scaleX = newWidth / currentWidth;
      const scaleY = newHeight / currentHeight;

      // 모든 객체들의 크기와 위치를 비례적으로 조정
      const objects = fabricCanvasRef.current.getObjects();
      objects.forEach(obj => {
        if (obj.left !== undefined && obj.top !== undefined) {
          const scaleFactorX = obj.scaleX || 1;
          const scaleFactorY = obj.scaleY || 1;

          obj.set({
            left: obj.left * scaleX,
            top: obj.top * scaleY,
            scaleX: scaleFactorX * Math.min(scaleX, scaleY),
            scaleY: scaleFactorY * Math.min(scaleX, scaleY),
          });

          if (obj.setCoords) {
            obj.setCoords();
          }
        }
      });

      // 캔버스 실제 크기 변경
      fabricCanvasRef.current.setDimensions({ width: newWidth, height: newHeight });

      // 즉시 표시 크기 업데이트
      updateCanvasDisplaySize(newWidth, newHeight);

      // 히스토리 저장
      setTimeout(saveCanvasState, 100);
    } catch (error) {
      console.error('Error setting canvas size:', error);
    }
  }, [updateCanvasDisplaySize, saveCanvasState]);

  // 배경색 변경
  const setBackgroundColor = useCallback((color: string) => {
    if (!fabricCanvasRef.current) return;

    try {
      // 그라데이션 처리
      if (color.startsWith('gradient-')) {
        const gradientMap: Record<string, string> = {
          'gradient-blue-purple': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          'gradient-pink-red': 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
          'gradient-blue-cyan': 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
          'gradient-green-cyan': 'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)',
          'gradient-pink-yellow': 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
          'gradient-mint-pink': 'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)',
        };

        const gradientCSS = gradientMap[color];
        if (gradientCSS && typeof fabric.Gradient !== 'undefined') {
          // CSS 그라데이션을 Fabric.js 그라데이션으로 변환
          const canvasWidth = fabricCanvasRef.current.width || 800;
          const canvasHeight = fabricCanvasRef.current.height || 600;
          
          const gradient = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: canvasWidth, y2: canvasHeight },
            colorStops: [
              { offset: 0, color: extractGradientColors(gradientCSS)[0] },
              { offset: 1, color: extractGradientColors(gradientCSS)[1] }
            ]
          });
          
          fabricCanvasRef.current.backgroundColor = gradient;
          fabricCanvasRef.current.renderAll?.() || fabricCanvasRef.current.requestRenderAll?.();
        }
      } else {
        // 단색 배경
        fabricCanvasRef.current.backgroundColor = color;
        fabricCanvasRef.current.renderAll?.() || fabricCanvasRef.current.requestRenderAll?.();
      }

      saveCanvasState();
    } catch (error) {
      console.error('Error setting background color:', error);
    }
  }, [saveCanvasState]);

  // 그라데이션에서 색상 추출 (간단한 파싱)
  const extractGradientColors = (gradientCSS: string): [string, string] => {
    const matches = gradientCSS.match(/#[a-fA-F0-9]{6}/g);
    return matches && matches.length >= 2 ? [matches[0], matches[1]] : ['#ffffff', '#000000'];
  };

  // 현재 캔버스 사이즈 반환
  const getCanvasSize = useCallback(() => {
    try {
      return {
        width: fabricCanvasRef.current?.width || canvasSize.width,
        height: fabricCanvasRef.current?.height || canvasSize.height
      };
    } catch (error) {
      console.error('Error getting canvas size:', error);
      return canvasSize;
    }
  }, [canvasSize]);

  // 현재 배경색 반환
  const getBackgroundColor = useCallback(() => {
    try {
      if (!fabricCanvasRef.current) return '#ffffff';
      
      const bgColor = fabricCanvasRef.current.backgroundColor;
      if (typeof bgColor === 'string') {
        return bgColor;
      }
      
      // 그라데이션인 경우 기본값 반환
      return '#ffffff';
    } catch (error) {
      console.error('Error getting background color:', error);
      return '#ffffff';
    }
  }, []);

  // 스티커 추가
  const addSticker = useCallback(async (sticker: Sticker) => {
    if (!fabricCanvasRef.current) return;

    try {
      if (sticker.type === 'speech-bubble') {
        // 말풍선 처리
        const speechBubble = sticker as SpeechBubble;
        const bubbleGroup = await createSpeechBubbleGroup(speechBubble);
        
        // 캔버스 중앙에 배치
        bubbleGroup.set({
          left: fabricCanvasRef.current.width! / 2 - bubbleGroup.width! / 2,
          top: fabricCanvasRef.current.height! / 2 - bubbleGroup.height! / 2
        });
        
        fabricCanvasRef.current.add(bubbleGroup);
        fabricCanvasRef.current.setActiveObject(bubbleGroup);
      } else {
        // 일반 스티커 처리
        const stickerObj = await createStickerObject(sticker);
        
        // 캔버스 중앙에 배치
        stickerObj.set({
          left: fabricCanvasRef.current.width! / 2 - stickerObj.width! / 2,
          top: fabricCanvasRef.current.height! / 2 - stickerObj.height! / 2
        });
        
        fabricCanvasRef.current.add(stickerObj);
        fabricCanvasRef.current.setActiveObject(stickerObj);
      }
      
      fabricCanvasRef.current.renderAll();
      saveCanvasState();
    } catch (error) {
      console.error('Failed to add sticker:', error);
      throw error;
    }
  }, [saveCanvasState]);

  // 말풍선 추가
  const addSpeechBubble = useCallback(async (speechBubble: SpeechBubble, text?: string) => {
    if (!fabricCanvasRef.current) return;

    try {
      const bubbleGroup = await createSpeechBubbleGroup(speechBubble, text);
      
      // 캔버스 중앙에 배치
      bubbleGroup.set({
        left: fabricCanvasRef.current.width! / 2 - bubbleGroup.width! / 2,
        top: fabricCanvasRef.current.height! / 2 - bubbleGroup.height! / 2
      });
      
      fabricCanvasRef.current.add(bubbleGroup);
      fabricCanvasRef.current.setActiveObject(bubbleGroup);
      fabricCanvasRef.current.renderAll();
      saveCanvasState();
    } catch (error) {
      console.error('Failed to add speech bubble:', error);
      throw error;
    }
  }, [saveCanvasState]);

  // 말풍선 텍스트 업데이트
  const updateSpeechBubbleText = useCallback((text: string) => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (!activeObject) return;

    const objectType = getObjectType(activeObject);
    if (objectType === 'speech-bubble') {
      const bubbleGroup = activeObject as CanvasSpeechBubble;
      if (bubbleGroup.bubbleData?.textObject) {
        bubbleGroup.bubbleData.textObject.set({ text });
        fabricCanvasRef.current.renderAll();
        saveCanvasState();
      }
    }
  }, [saveCanvasState]);

  // 말풍선 스타일 업데이트
  const updateSpeechBubbleStyle = useCallback((style: { 
    backgroundColor?: string; 
    borderColor?: string; 
    borderWidth?: number 
  }) => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (!activeObject) return;

    const objectType = getObjectType(activeObject);
    if (objectType === 'speech-bubble') {
      const bubbleGroup = activeObject as CanvasSpeechBubble;
      if (bubbleGroup.bubbleData) {
        // 스타일 속성 업데이트
        Object.assign(bubbleGroup.bubbleData, style);
        
        // 실제 객체에 스타일 적용 (그룹 내 첫 번째 객체가 배경)
        const objects = bubbleGroup.getObjects();
        if (objects.length > 0) {
          const bubbleShape = objects[0];
          if (style.backgroundColor) {
            bubbleShape.set({ fill: style.backgroundColor });
          }
          if (style.borderColor) {
            bubbleShape.set({ stroke: style.borderColor });
          }
          if (style.borderWidth !== undefined) {
            bubbleShape.set({ strokeWidth: style.borderWidth });
          }
        }
        
        fabricCanvasRef.current.renderAll();
        saveCanvasState();
      }
    }
  }, [saveCanvasState]);

  // 선택된 스티커 타입 확인
  const getSelectedStickerType = useCallback(() => {
    if (!fabricCanvasRef.current) return null;

    const activeObject = fabricCanvasRef.current.getActiveObject();
    return getObjectType(activeObject);
  }, []);

  // 선택된 객체 잠금/해제
  const lockSelectedObject = useCallback((locked: boolean) => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (!activeObject) return;

    activeObject.set({
      selectable: !locked,
      evented: !locked,
      hasControls: !locked,
      hasBorders: !locked
    });

    // 스티커 데이터 업데이트
    const objectType = getObjectType(activeObject);
    if (objectType === 'sticker') {
      const stickerObj = activeObject as CanvasSticker;
      if (stickerObj.stickerData) {
        stickerObj.stickerData.isLocked = locked;
      }
    }

    fabricCanvasRef.current.renderAll();
  }, []);

  // 레이어 관리 메서드들

  // 모든 레이어 정보 가져오기
  const getAllLayers = useCallback((): LayerItem[] => {
    if (!fabricCanvasRef.current) return [];

    const objects = fabricCanvasRef.current.getObjects();
    return objects.map((obj, index) => {
      const name = (obj as any).name || 'Unnamed';
      const type = getLayerTypeFromObject(obj);

      return {
        id: obj.__uid || `layer-${index}`,
        name: getLayerName(obj, type),
        type,
        visible: obj.visible !== false,
        locked: !obj.selectable,
        order: objects.length - index, // 위쪽이 높은 order
        opacity: obj.opacity || 1
      };
    });
  }, []);

  // 객체에서 레이어 타입 추출
  const getLayerTypeFromObject = (obj: fabric.Object): LayerItem['type'] => {
    const name = (obj as any).name;
    if (name === 'canvas-background-image' || name === 'template-background') {
      return 'background';
    }

    const objType = getObjectType(obj);
    switch (objType) {
      case 'text': return 'text';
      case 'image': return 'image';
      case 'sticker': return 'sticker';
      case 'speech-bubble': return 'speech-bubble';
      default: return obj.type === 'image' ? 'image' : 'text';
    }
  };

  // 레이어 이름 생성
  const getLayerName = (obj: fabric.Object, type: LayerItem['type']): string => {
    const customName = (obj as any).layerName;
    if (customName) return customName;

    switch (type) {
      case 'text':
        const textObj = obj as fabric.IText;
        const text = textObj.text || '';
        return text.length > 15 ? text.substring(0, 15) + '...' : text || '텍스트';
      case 'image':
        return '이미지';
      case 'sticker':
        return '스티커';
      case 'speech-bubble':
        return '말풍선';
      case 'background':
        return '배경';
      default:
        return '객체';
    }
  };

  // 레이어 가시성 변경
  const setLayerVisibility = useCallback((layerId: string, visible: boolean) => {
    if (!fabricCanvasRef.current) return;

    const obj = findObjectById(layerId);
    if (obj) {
      obj.set('visible', visible);
      fabricCanvasRef.current.renderAll();
      saveCanvasState();
    }
  }, [saveCanvasState]);

  // 레이어 잠금 변경
  const setLayerLock = useCallback((layerId: string, locked: boolean) => {
    if (!fabricCanvasRef.current) return;

    const obj = findObjectById(layerId);
    if (obj) {
      obj.set({
        selectable: !locked,
        evented: !locked,
        hasControls: !locked,
        hasBorders: !locked
      });
      fabricCanvasRef.current.renderAll();
      saveCanvasState();
    }
  }, [saveCanvasState]);

  // ID로 객체 찾기
  const findObjectById = (layerId: string): fabric.Object | null => {
    if (!fabricCanvasRef.current) return null;

    const objects = fabricCanvasRef.current.getObjects();
    return objects.find(obj => obj.__uid === layerId || `layer-${objects.indexOf(obj)}` === layerId) || null;
  };

  // 레이어 순서 변경
  const reorderLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    if (!fabricCanvasRef.current) return;

    const obj = findObjectById(layerId);
    if (!obj) return;

    if (direction === 'up') {
      fabricCanvasRef.current.bringForward(obj);
    } else {
      fabricCanvasRef.current.sendBackwards(obj);
    }

    fabricCanvasRef.current.renderAll();
    saveCanvasState();
  }, [saveCanvasState]);

  // 레이어 선택
  const selectLayerById = useCallback((layerId: string) => {
    if (!fabricCanvasRef.current) return;

    const obj = findObjectById(layerId);
    if (obj && obj.selectable !== false) {
      fabricCanvasRef.current.setActiveObject(obj);
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  // 레이어 이름 변경
  const renameLayer = useCallback((layerId: string, newName: string) => {
    if (!fabricCanvasRef.current) return;

    const obj = findObjectById(layerId);
    if (obj) {
      (obj as any).layerName = newName;
      fabricCanvasRef.current.renderAll();
      saveCanvasState();
    }
  }, [saveCanvasState]);

  // 레이어 삭제
  const deleteLayerById = useCallback((layerId: string) => {
    if (!fabricCanvasRef.current) return;

    const obj = findObjectById(layerId);
    if (obj) {
      fabricCanvasRef.current.remove(obj);
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
      saveCanvasState();
    }
  }, [saveCanvasState]);

  // 레이어 복사
  const duplicateLayerById = useCallback(async (layerId: string) => {
    if (!fabricCanvasRef.current) return;

    const obj = findObjectById(layerId);
    if (obj) {
      try {
        const cloned = await obj.clone();
        cloned.set({
          left: cloned.left + 10,
          top: cloned.top + 10,
        });
        fabricCanvasRef.current.add(cloned);
        fabricCanvasRef.current.setActiveObject(cloned);
        fabricCanvasRef.current.renderAll();
        saveCanvasState();
      } catch (error) {
        console.error('Failed to duplicate layer:', error);
      }
    }
  }, [saveCanvasState]);

  // 드래그 앤 드롭 핸들러들
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 컨테이너를 완전히 벗어났을 때만 드래그 상태 해제
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      console.warn('No image files found in drop');
      return;
    }

    // 첫 번째 이미지 파일만 처리
    const file = imageFiles[0];

    try {
      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('파일 크기가 10MB를 초과합니다.');
      }

      // 지원되는 이미지 형식 체크
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!supportedTypes.includes(file.type)) {
        throw new Error('지원되지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP만 지원)');
      }

      // 캔버스에 이미지 추가
      await addImageFromFile(file, 'fit');

      // 부모 컴포넌트에 드롭 이벤트 전달 (선택사항)
      onImageDrop?.(file);

    } catch (error) {
      console.error('Image drop failed:', error);
      // 에러 처리는 addImageFromFile에서 이미 처리됨
    }
  }, [addImageFromFile, onImageDrop]);

  // 드래그 엔터 핸들러
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  // ref 메서드들 노출
  useImperativeHandle(ref, () => ({
    exportAsImage,
    addText,
    updateTextStyle,
    resetSelectedTextStyle,
    loadTemplate,
    addImageFromUrl,
    addImageFromFile,
    setBackgroundImageFromUrl,
    setBackgroundImageFromFile,
    updateSelectedImageFill,
    deleteSelectedObject,
    duplicateSelectedObject,
    rotateSelectedObject,
    clearCanvas,
    undo,
    redo,
    getCanvas,
    getCanvasContainer,
    getAllTexts,
    changeCanvasSize,
    setBackgroundColor,
    getCanvasSize,
    getBackgroundColor,
    // 스티커 관련 메서드들
    addSticker,
    addSpeechBubble,
    updateSpeechBubbleText,
    updateSpeechBubbleStyle,
    getSelectedStickerType,
    lockSelectedObject,
    // 레이어 관리 메서드들
    getAllLayers,
    setLayerVisibility,
    setLayerLock,
    reorderLayer,
    selectLayerById,
    renameLayer,
    deleteLayerById,
    duplicateLayerById
  }), [exportAsImage, addText, updateTextStyle, resetSelectedTextStyle, loadTemplate, addImageFromUrl, addImageFromFile, setBackgroundImageFromUrl, setBackgroundImageFromFile, updateSelectedImageFill, deleteSelectedObject, duplicateSelectedObject, rotateSelectedObject, clearCanvas, undo, redo, getCanvas, getCanvasContainer, getAllTexts, changeCanvasSize, setBackgroundColor, getCanvasSize, getBackgroundColor, addSticker, addSpeechBubble, updateSpeechBubbleText, updateSpeechBubbleStyle, getSelectedStickerType, lockSelectedObject, getAllLayers, setLayerVisibility, setLayerLock, reorderLayer, selectLayerById, renameLayer, deleteLayerById, duplicateLayerById]);

  return (
    <div
      ref={containerRef}
      className={`fabric-canvas-container w-full h-full flex items-center justify-center p-4 ${className} relative`}
      style={{ minHeight: 0, overflow: 'hidden' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block'
        }}
      />

      {/* 드래그 앤 드롭 오버레이 */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-4 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center shadow-lg">
            <div className="text-blue-600 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">이미지를 여기에 드롭하세요</h3>
            <p className="text-sm text-gray-600">JPG, PNG, GIF, WebP 파일 지원 (최대 10MB)</p>
          </div>
        </div>
      )}
    </div>
  );
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;