'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import TabGroup from '@/components/ui/TabGroup';
import TextStyleControls, { TextStyle } from '@/components/meme/TextStyleControls';

interface TextBox {
  x: number;
  y: number;
  width: number;
  height: number;
  defaultText: string;
}

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  textBoxes: TextBox[];
}

const popularTemplates: MemeTemplate[] = [
  {
    id: 'drake',
    name: '드레이크 밈',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '이건 별로' },
      { x: 10, y: 180, width: 200, height: 60, defaultText: '이게 좋아' }
    ]
  },
  {
    id: 'distracted-boyfriend',
    name: '한눈파는 남친',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    textBoxes: [
      { x: 50, y: 50, width: 150, height: 40, defaultText: '새로운 것' },
      { x: 250, y: 100, width: 120, height: 40, defaultText: '남친' },
      { x: 400, y: 80, width: 120, height: 40, defaultText: '기존 것' }
    ]
  },
  {
    id: 'woman-yelling-cat',
    name: '고양이 vs 여자',
    url: 'https://i.imgflip.com/345v97.jpg',
    textBoxes: [
      { x: 20, y: 20, width: 180, height: 50, defaultText: '화난 여자' },
      { x: 320, y: 150, width: 150, height: 50, defaultText: '무관심한 고양이' }
    ]
  }
];

// 기본 텍스트 스타일
const defaultTextStyle: TextStyle = {
  fontSize: 30,
  fontFamily: 'Impact, Arial Black, sans-serif',
  fontWeight: 'bold',
  fontStyle: 'normal',
  color: '#FFFFFF',
  textAlign: 'center',
  strokeColor: '#000000',
  strokeWidth: 2,
};

export default function MemeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [textInputs, setTextInputs] = useState<string[]>([]);
  const [textStyles, setTextStyles] = useState<TextStyle[]>([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [templateType, setTemplateType] = useState<'popular' | 'upload'>('popular');
  const [textBoxPositions, setTextBoxPositions] = useState<TextBox[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());
  const [renderTimeout, setRenderTimeout] = useState<NodeJS.Timeout | null>(null);
  const [quickEditMode, setQuickEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTextIndex, setDraggedTextIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 토스트 메시지 표시 함수
  const showErrorToast = (message: string) => {
    setError(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setTimeout(() => setError(null), 300); // 애니메이션 후 제거
    }, 4000);
  };

  // 이미지 프리로딩 및 캐싱 함수
  const preloadImage = async (imageUrl: string): Promise<HTMLImageElement> => {
    // 캐시에서 확인
    if (imageCache.has(imageUrl)) {
      return imageCache.get(imageUrl)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // 캐시에 저장
        setImageCache(prev => new Map(prev.set(imageUrl, img)));
        resolve(img);
      };
      
      img.onerror = (error) => {
        const errorMessage = `이미지를 불러올 수 없습니다: ${imageUrl}`;
        console.error('이미지 로딩 실패:', error);
        showErrorToast(errorMessage);
        reject(new Error(errorMessage));
      };
      
      img.src = imageUrl;
    });
  };

  // 인기 템플릿 이미지들을 미리 로딩
  useEffect(() => {
    const preloadTemplateImages = async () => {
      try {
        // 개별적으로 로딩하여 일부 실패가 전체에 영향을 주지 않도록 함
        const loadPromises = popularTemplates.map(async (template) => {
          try {
            await preloadImage(template.url);
          } catch (error) {
            console.warn(`템플릿 ${template.name} 프리로딩 실패:`, error);
            // 개별 실패는 무시하고 계속 진행
          }
        });
        
        await Promise.all(loadPromises);
      } catch (error) {
        console.error('템플릿 이미지 프리로딩 중 예상치 못한 오류:', error);
      }
    };

    preloadTemplateImages();
  }, []);

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (renderTimeout) {
        clearTimeout(renderTimeout);
      }
    };
  }, [renderTimeout]);

  // 디바운싱된 렌더링 함수
  const debouncedRender = (template: MemeTemplate, texts: string[], styles: TextStyle[], delay: number = 200) => {
    // 기존 타임아웃 클리어
    if (renderTimeout) {
      clearTimeout(renderTimeout);
    }

    // 새로운 타임아웃 설정
    const newTimeout = setTimeout(() => {
      generateMemePreview(template, texts, styles);
    }, delay);
    
    setRenderTimeout(newTimeout);
  };

  const handleTemplateSelect = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTextInputs(template.textBoxes.map(box => box.defaultText));
    // 각 텍스트 박스마다 기본 스타일 적용
    setTextStyles(template.textBoxes.map(() => ({ ...defaultTextStyle })));
    setTextBoxPositions([...template.textBoxes]); // 텍스트 박스 위치 초기화
    setSelectedTextIndex(0);
    setTemplateType('popular');
    // 템플릿 선택 후 자동으로 미리보기 생성 (즉시 실행)
    debouncedRender(template, template.textBoxes.map(box => box.defaultText), template.textBoxes.map(() => ({ ...defaultTextStyle })), 100);
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImages(prev => [...prev, imageUrl]);
  };

  const handleUploadedImageSelect = (imageUrl: string) => {
    // 업로드된 이미지를 템플릿으로 사용 (기본 텍스트 박스 2개)
    const customTemplate: MemeTemplate = {
      id: `custom-${Date.now()}`,
      name: '내 이미지',
      url: imageUrl,
      textBoxes: [
        { x: 10, y: 10, width: 300, height: 60, defaultText: '상단 텍스트' },
        { x: 10, y: 200, width: 300, height: 60, defaultText: '하단 텍스트' }
      ]
    };
    setSelectedTemplate(customTemplate);
    setTextInputs(['상단 텍스트', '하단 텍스트']);
    setTextStyles([{ ...defaultTextStyle }, { ...defaultTextStyle }]);
    setTextBoxPositions([...customTemplate.textBoxes]); // 텍스트 박스 위치 초기화
    setSelectedTextIndex(0);
    setTemplateType('upload');
    // 업로드된 이미지 선택 후 자동으로 미리보기 생성
    debouncedRender(customTemplate, ['상단 텍스트', '하단 텍스트'], [{ ...defaultTextStyle }, { ...defaultTextStyle }], 100);
  };

  const handleTextChange = (index: number, value: string) => {
    const newTextInputs = [...textInputs];
    newTextInputs[index] = value;
    setTextInputs(newTextInputs);
    // 텍스트 변경 시 자동으로 미리보기 업데이트 (디바운싱)
    if (selectedTemplate) {
      debouncedRender(selectedTemplate, newTextInputs, textStyles, 300);
    }
  };

  const handleStyleChange = (style: TextStyle) => {
    const newStyles = [...textStyles];
    newStyles[selectedTextIndex] = style;
    setTextStyles(newStyles);
    // 스타일 변경 시 자동으로 미리보기 업데이트 (디바운싱)
    if (selectedTemplate) {
      debouncedRender(selectedTemplate, textInputs, newStyles, 200);
    }
  };

  const handleStyleReset = () => {
    const newStyles = [...textStyles];
    newStyles[selectedTextIndex] = { ...defaultTextStyle };
    setTextStyles(newStyles);
  };

  // 텍스트 박스 위치 조정 함수들
  const handleTextBoxPositionChange = (index: number, newPosition: Partial<TextBox>) => {
    const newPositions = [...textBoxPositions];
    newPositions[index] = { ...newPositions[index], ...newPosition };
    setTextBoxPositions(newPositions);
    
    // 위치 변경 시 미리보기 업데이트 (디바운싱)
    if (selectedTemplate) {
      const updatedTemplate = { ...selectedTemplate, textBoxes: newPositions };
      debouncedRender(updatedTemplate, textInputs, textStyles, 200);
    }
  };

  const resetTextBoxPositions = () => {
    if (selectedTemplate) {
      setTextBoxPositions([...selectedTemplate.textBoxes]);
      debouncedRender(selectedTemplate, textInputs, textStyles, 200);
    }
  };

  // 드래그 앤 드롭 관련 함수들
  const getCanvasMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTextBoxAtPosition = (x: number, y: number): number | null => {
    const currentTextBoxes = textBoxPositions.length > 0 ? textBoxPositions : (selectedTemplate?.textBoxes || []);
    
    // 역순으로 검사 (위에 있는 텍스트 박스가 우선)
    for (let i = currentTextBoxes.length - 1; i >= 0; i--) {
      const box = currentTextBoxes[i];
      if (x >= box.x && x <= box.x + box.width && 
          y >= box.y && y <= box.y + box.height) {
        return i;
      }
    }
    return null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTemplate) return;

    const mousePos = getCanvasMousePosition(e);
    const textBoxIndex = getTextBoxAtPosition(mousePos.x, mousePos.y);

    if (textBoxIndex !== null) {
      const currentTextBoxes = textBoxPositions.length > 0 ? textBoxPositions : selectedTemplate.textBoxes;
      const box = currentTextBoxes[textBoxIndex];
      
      setIsDragging(true);
      setDraggedTextIndex(textBoxIndex);
      setDragOffset({
        x: mousePos.x - box.x,
        y: mousePos.y - box.y
      });
      setSelectedTextIndex(textBoxIndex);
      
      // 커서 스타일 변경
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTemplate) return;

    const mousePos = getCanvasMousePosition(e);

    if (isDragging && draggedTextIndex !== null) {
      // 드래그 중일 때 텍스트 박스 위치 업데이트
      const newX = mousePos.x - dragOffset.x;
      const newY = mousePos.y - dragOffset.y;
      
      // 캔버스 경계 제한
      const canvas = canvasRef.current;
      if (canvas) {
        const currentTextBoxes = textBoxPositions.length > 0 ? textBoxPositions : selectedTemplate.textBoxes;
        const box = currentTextBoxes[draggedTextIndex];
        
        const constrainedX = Math.max(0, Math.min(newX, canvas.width - box.width));
        const constrainedY = Math.max(0, Math.min(newY, canvas.height - box.height));
        
        handleTextBoxPositionChange(draggedTextIndex, { 
          x: constrainedX, 
          y: constrainedY 
        });
      }
    } else {
      // 드래그 중이 아닐 때 커서 스타일 업데이트
      const textBoxIndex = getTextBoxAtPosition(mousePos.x, mousePos.y);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = textBoxIndex !== null ? 'grab' : 'default';
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedTextIndex(null);
    setDragOffset({ x: 0, y: 0 });
    
    // 커서 스타일 초기화
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };

  const handleCanvasMouseLeave = () => {
    // 캔버스를 벗어나면 드래그 종료
    handleCanvasMouseUp();
  };

  // 미리보기 생성 함수 (매개변수로 받아서 처리)
  const generateMemePreview = async (template: MemeTemplate, texts: string[], styles: TextStyle[]) => {
    if (!template || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsImageLoading(true);
    
    try {
      // 캐시된 이미지 사용 또는 새로 로딩
      const img = await preloadImage(template.url);
      
      // 원본 이미지 크기 사용
      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;
      
      // 표시용 캔버스 크기 계산 (미리보기용)
      const maxDisplayWidth = 600;
      const maxDisplayHeight = 500;
      let displayWidth = originalWidth;
      let displayHeight = originalHeight;
      
      // 미리보기를 위한 크기 조정 (비율 유지)
      if (originalWidth > maxDisplayWidth || originalHeight > maxDisplayHeight) {
        const ratio = Math.min(maxDisplayWidth / originalWidth, maxDisplayHeight / originalHeight);
        displayWidth = originalWidth * ratio;
        displayHeight = originalHeight * ratio;
      }
      
      // 캔버스는 원본 크기로 설정 (다운로드 품질 유지)
      canvas.width = originalWidth;
      canvas.height = originalHeight;
      
      // 캔버스 스타일만 표시 크기로 설정 (미리보기)
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      
      // 성능 최적화: 이미지 스무딩 활성화 (고품질 렌더링)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 원본 크기로 이미지 그리기
      ctx.drawImage(img, 0, 0, originalWidth, originalHeight);
      
      // 배치 처리로 텍스트 렌더링 최적화 (현재 위치 상태 사용)
      const currentTextBoxes = textBoxPositions.length > 0 ? textBoxPositions : template.textBoxes;
      currentTextBoxes.forEach((box, index) => {
        const text = texts[index] || '';
        const style = styles[index] || defaultTextStyle;
        
        if (!text.trim()) return; // 빈 텍스트 스킵
        
        // 원본 크기 기준으로 텍스트 박스 사용 (스케일링 없음)
        const textBox = {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        };
        
        // 폰트 설정 최적화: 한 번에 설정
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
        ctx.fillStyle = style.color;
        ctx.strokeStyle = style.strokeColor;
        ctx.lineWidth = style.strokeWidth;
        ctx.textAlign = style.textAlign;
        ctx.textBaseline = 'middle';
        
        // 텍스트 위치 계산
        let x: number;
        switch (style.textAlign) {
          case 'left':
            x = textBox.x + 10;
            break;
          case 'right':
            x = textBox.x + textBox.width - 10;
            break;
          default: // center
            x = textBox.x + textBox.width / 2;
        }
        const y = textBox.y + textBox.height / 2;
        
        // 텍스트 래핑 처리
        const maxWidth = textBox.width - 20;
        const lines = wrapText(ctx, text, maxWidth);
        const lineHeight = style.fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        const startY = y - totalHeight / 2 + style.fontSize / 2;
        
        // 배치 텍스트 렌더링
        lines.forEach((line, lineIndex) => {
          const lineY = startY + lineIndex * lineHeight;
          
          // 스트로크와 필 순서 최적화
          if (style.strokeWidth > 0) {
            ctx.strokeText(line, x, lineY);
          }
          ctx.fillText(line, x, lineY);
        });
      });

      // 드래그 모드일 때 텍스트 박스 경계 표시
      if (isDragging || draggedTextIndex !== null) {
        ctx.save();
        currentTextBoxes.forEach((box, index) => {
          ctx.strokeStyle = index === draggedTextIndex ? '#3b82f6' : '#e5e7eb';
          ctx.lineWidth = index === draggedTextIndex ? 3 : 1;
          ctx.setLineDash(index === draggedTextIndex ? [5, 5] : [2, 2]);
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });
        ctx.restore();
      }

      setIsImageLoading(false);
      
    } catch (error) {
      console.error('밈 생성 중 오류 발생:', error);
      setIsImageLoading(false);
      
      // 사용자에게 친화적인 오류 메시지 표시
      if (error instanceof Error) {
        if (error.message.includes('이미지를 불러올 수 없습니다')) {
          showErrorToast('이미지 로딩에 실패했습니다. 네트워크 연결을 확인해주세요.');
        } else if (error.message.includes('Canvas')) {
          showErrorToast('캔버스 렌더링 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        } else {
          showErrorToast('밈 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        showErrorToast('알 수 없는 오류가 발생했습니다. 페이지를 새로고침해주세요.');
      }
    }
  };

  const generateMeme = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    // 최종 생성은 미리보기와 동일하게 처리
    await generateMemePreview(selectedTemplate, textInputs, textStyles);
    setIsGenerating(false);
  };

  // 텍스트 래핑 함수 (성능 최적화)
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    if (!text || maxWidth <= 0) return [];
    
    // 간단한 텍스트는 바로 반환
    if (ctx.measureText(text).width <= maxWidth) {
      return [text];
    }
    
    const words = text.split(/\s+/); // 정규식으로 더 효율적인 분할
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const testWidth = ctx.measureText(testLine).width;
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        // 현재 줄이 너무 길면 추가
        if (currentLine) lines.push(currentLine);
        currentLine = word;
        
        // 단일 단어가 너무 긴 경우 강제 줄 바꿈
        if (ctx.measureText(word).width > maxWidth) {
          // 문자 단위로 분할
          let charLine = '';
          for (const char of word) {
            const testCharLine = charLine + char;
            if (ctx.measureText(testCharLine).width <= maxWidth) {
              charLine = testCharLine;
            } else {
              if (charLine) lines.push(charLine);
              charLine = char;
            }
          }
          currentLine = charLine;
        }
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const downloadMeme = () => {
    try {
      if (!canvasRef.current) {
        showErrorToast('다운로드할 밈이 없습니다. 먼저 밈을 생성해주세요.');
        return;
      }
      
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      link.click();
      
      // 성공 메시지는 토스트로 표시하지 않음 (다운로드 자체가 피드백)
    } catch (error) {
      console.error('다운로드 실패:', error);
      showErrorToast('다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const shareMeme = async () => {
    try {
      if (!canvasRef.current) {
        showErrorToast('공유할 밈이 없습니다. 먼저 밈을 생성해주세요.');
        return;
      }

      const canvas = canvasRef.current;
      
      canvas.toBlob(async (blob) => {
        try {
          if (!blob) {
            showErrorToast('이미지 생성에 실패했습니다. 다시 시도해주세요.');
            return;
          }

          const file = new File([blob], `meme-${Date.now()}.png`, { type: 'image/png' });
          
          // Web Share API 지원 확인
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: '내가 만든 밈',
              text: '밈징어에서 만든 재미있는 밈을 확인해보세요!',
              files: [file]
            });
          } else if (navigator.clipboard) {
            // 클립보드 API 지원 시 URL 복사
            try {
              await navigator.clipboard.writeText(window.location.href);
              showErrorToast('페이지 링크가 클립보드에 복사되었습니다!');
            } catch (clipboardError) {
              // 클립보드 접근 실패 시 대체 방법
              const textArea = document.createElement('textarea');
              textArea.value = window.location.href;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              showErrorToast('페이지 링크가 복사되었습니다!');
            }
          } else {
            showErrorToast('이 브라우저에서는 공유 기능을 지원하지 않습니다.');
          }
        } catch (shareError) {
          console.error('공유 실패:', shareError);
          showErrorToast('공유 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      }, 'image/png');
    } catch (error) {
      console.error('공유 준비 실패:', error);
      showErrorToast('공유 준비 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎭 밈 생성기
          </h1>
          <p className="text-lg text-gray-600">
            인기 템플릿으로 나만의 밈을 만들어보세요
          </p>
        </header>

        <div className="space-y-6 md:space-y-8">
          {/* 상단: 1단계와 2단계 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
            {/* 1단계: 템플릿 선택 */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                📋 1단계: 템플릿 선택
              </h2>
              
              {/* 탭 선택 */}
              <TabGroup
                items={[
                  { key: 'popular', label: '인기 템플릿' },
                  { key: 'upload', label: '내 이미지' }
                ]}
                activeKey={templateType}
                onChange={(key) => setTemplateType(key as 'popular' | 'upload')}
                className="mb-4"
              />

              {/* 인기 템플릿 */}
              {templateType === 'popular' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3">
                  {popularTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`cursor-pointer rounded-lg border-2 p-2 md:p-3 transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id && templateType === 'popular'
                          ? 'border-primary bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <img
                        src={template.url}
                        alt={template.name}
                        className="w-full h-16 md:h-20 object-cover rounded mb-2"
                      />
                      <p className="text-xs font-medium text-gray-700 text-center truncate">
                        {template.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* 이미지 업로드 */}
              {templateType === 'upload' && (
                <div className="space-y-4">
                  <ImageUpload
                    onUpload={handleImageUpload}
                    maxSizeInMB={5}
                    className="mb-4"
                  />
                  
                  {uploadedImages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        업로드된 이미지
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3">
                        {uploadedImages.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={`cursor-pointer rounded-lg border-2 p-2 md:p-3 transition-all hover:shadow-md ${
                              selectedTemplate?.url === imageUrl && templateType === 'upload'
                                ? 'border-primary bg-primary-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleUploadedImageSelect(imageUrl)}
                          >
                            <img
                              src={imageUrl}
                              alt={`업로드된 이미지 ${index + 1}`}
                              className="w-full h-16 md:h-20 object-cover rounded mb-2"
                            />
                            <p className="text-xs font-medium text-gray-700 text-center truncate">
                              내 이미지 {index + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadedImages.length === 0 && (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm">이미지를 업로드하면</p>
                      <p className="text-sm">밈 템플릿으로 사용할 수 있습니다</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2단계: 텍스트 편집 및 스타일링 */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                ✏️ 2단계: 텍스트 편집 및 스타일링
              </h2>
              
              {selectedTemplate ? (
                <div className="space-y-4 md:space-y-6">
                  {/* 편집 모드 토글 */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">편집 모드</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setQuickEditMode(false)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          !quickEditMode 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        개별 편집
                      </button>
                      <button
                        onClick={() => setQuickEditMode(true)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          quickEditMode 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        빠른 편집
                      </button>
                    </div>
                  </div>

                  {!quickEditMode ? (
                    <>
                      {/* 개별 편집 모드 - 텍스트 박스 선택 탭 */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">편집할 텍스트 선택</label>
                        <TabGroup
                          items={selectedTemplate.textBoxes.map((_, index) => ({
                            key: index.toString(),
                            label: `텍스트 ${index + 1}`
                          }))}
                          activeKey={selectedTextIndex.toString()}
                          onChange={(key) => setSelectedTextIndex(parseInt(key))}
                          variant="pills"
                        />
                      </div>

                      {/* 선택된 텍스트 입력 */}
                      <Input
                        label={`텍스트 ${selectedTextIndex + 1} 내용`}
                        value={textInputs[selectedTextIndex] || ''}
                        onChange={(e) => handleTextChange(selectedTextIndex, e.target.value)}
                        placeholder={selectedTemplate.textBoxes[selectedTextIndex]?.defaultText}
                      />
                    </>
                  ) : (
                    <>
                      {/* 빠른 편집 모드 - 모든 텍스트 한 번에 편집 */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">모든 텍스트 빠른 편집</label>
                        <div className="space-y-3">
                          {selectedTemplate.textBoxes.map((box, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-16 text-xs font-medium text-gray-500 text-center">
                                텍스트 {index + 1}
                              </div>
                              <Input
                                value={textInputs[index] || ''}
                                onChange={(e) => handleTextChange(index, e.target.value)}
                                placeholder={box.defaultText}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* 텍스트 스타일링 (개별 편집 모드에서만 표시) */}
                  {!quickEditMode && textStyles.length > 0 && (
                    <div>
                      <TextStyleControls
                        style={textStyles[selectedTextIndex] || defaultTextStyle}
                        onChange={handleStyleChange}
                        onReset={handleStyleReset}
                      />
                    </div>
                  )}

                  {/* 텍스트 박스 위치 조정 (개별 편집 모드에서만 표시) */}
                  {!quickEditMode && textBoxPositions.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 text-sm">📍 텍스트 위치 조정</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetTextBoxPositions}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          초기화
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">X 위치</label>
                          <input
                            type="range"
                            min="0"
                            max="500"
                            step="5"
                            value={textBoxPositions[selectedTextIndex]?.x || 0}
                            onChange={(e) => handleTextBoxPositionChange(selectedTextIndex, { x: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs text-gray-500">{textBoxPositions[selectedTextIndex]?.x || 0}px</span>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Y 위치</label>
                          <input
                            type="range"
                            min="0"
                            max="400"
                            step="5"
                            value={textBoxPositions[selectedTextIndex]?.y || 0}
                            onChange={(e) => handleTextBoxPositionChange(selectedTextIndex, { y: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs text-gray-500">{textBoxPositions[selectedTextIndex]?.y || 0}px</span>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">너비</label>
                          <input
                            type="range"
                            min="100"
                            max="500"
                            step="10"
                            value={textBoxPositions[selectedTextIndex]?.width || 200}
                            onChange={(e) => handleTextBoxPositionChange(selectedTextIndex, { width: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs text-gray-500">{textBoxPositions[selectedTextIndex]?.width || 200}px</span>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">높이</label>
                          <input
                            type="range"
                            min="30"
                            max="150"
                            step="5"
                            value={textBoxPositions[selectedTextIndex]?.height || 60}
                            onChange={(e) => handleTextBoxPositionChange(selectedTextIndex, { height: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs text-gray-500">{textBoxPositions[selectedTextIndex]?.height || 60}px</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-500 text-center">
                          슬라이더를 조정하면 실시간으로 미리보기가 업데이트됩니다
                        </p>
                        <p className="text-xs text-blue-600 text-center font-medium">
                          💡 또는 미리보기에서 텍스트를 직접 드래그하세요!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 모든 텍스트 미리보기 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">전체 텍스트 미리보기</label>
                    {selectedTemplate.textBoxes.map((box, index) => (
                      <div
                        key={index}
                        className={`p-3 text-sm rounded-lg border cursor-pointer transition-all ${
                          selectedTextIndex === index
                            ? 'border-primary bg-primary-50'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedTextIndex(index)}
                      >
                        <span className="font-medium text-primary">텍스트 {index + 1}:</span>{' '}
                        <span className={selectedTextIndex === index ? 'font-medium' : ''}>
                          {textInputs[index] || box.defaultText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-3xl mb-4">👈</div>
                  <p className="font-medium">먼저 템플릿을 선택해주세요</p>
                  <p className="text-sm mt-2">좌측에서 템플릿을 선택하면<br/>텍스트 편집이 가능합니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 하단: 3단계 미리보기 및 생성 */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
              🎨 3단계: 미리보기 및 밈 생성
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* 미리보기 영역 */}
              <div className="lg:col-span-2">
                <div className="text-center">
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 md:p-6 bg-gray-50 flex items-center justify-center relative">
                        {isImageLoading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              <span className="text-sm text-gray-600">이미지 처리 중...</span>
                            </div>
                          </div>
                        )}
                        <canvas
                          ref={canvasRef}
                          className="max-w-full max-h-[400px] md:max-h-[500px] rounded-lg shadow-sm"
                          style={{ backgroundColor: 'white' }}
                          onMouseDown={handleCanvasMouseDown}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseLeave}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          💡 템플릿 선택, 텍스트 수정, 스타일 변경, 위치 조정 시 실시간으로 미리보기가 업데이트됩니다.
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          🖱️ 텍스트를 직접 클릭하고 드래그하여 위치를 조정할 수 있습니다!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-24 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-6xl mb-6">🎭</div>
                      <p className="text-xl font-medium mb-2">밈 미리보기</p>
                      <p className="text-sm">템플릿을 선택하고 텍스트를 입력하면<br/>여기에 밈 미리보기가 표시됩니다</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 버튼 및 가이드 */}
              <div className="space-y-4 md:space-y-6">
                {/* 생성 및 액션 버튼 */}
                <div className="space-y-3">
                  <Button
                    onClick={generateMeme}
                    isLoading={isGenerating}
                    className="w-full text-base md:text-lg py-3 md:py-4"
                    size="lg"
                    disabled={!selectedTemplate}
                  >
                    {isGenerating ? '🎨 밈 생성 중...' : '🎨 밈 생성하기'}
                  </Button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    <Button
                      onClick={downloadMeme}
                      variant="outline"
                      disabled={!selectedTemplate || isGenerating}
                      className="w-full py-2 md:py-3 text-sm md:text-base"
                    >
                      📥 다운로드
                    </Button>
                    <Button
                      onClick={shareMeme}
                      variant="secondary"
                      disabled={!selectedTemplate || isGenerating}
                      className="w-full py-2 md:py-3 text-sm md:text-base"
                    >
                      🔗 공유하기
                    </Button>
                  </div>
                </div>

                {/* 빠른 가이드 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                    💡 사용 팁
                  </h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-blue-600">1</span>
                      <span>템플릿 선택 후 바로 텍스트 편집 가능</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-blue-600">2</span>
                      <span>텍스트별로 다른 스타일 적용 가능</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-blue-600">3</span>
                      <span>생성 후 바로 다운로드/공유</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 고급 기능 안내 */}
        <div className="mt-8 md:mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 md:p-8 border border-purple-200">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
            🚀 고급 기능으로 더 멋진 밈을 만들어보세요!
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-purple-100">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">🎭</div>
              <h4 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">다양한 템플릿</h4>
              <p className="text-xs md:text-sm text-gray-600">인기 밈부터 내 이미지까지 자유롭게 사용</p>
            </div>
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-purple-100">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">🎨</div>
              <h4 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">스타일 커스터마이징</h4>
              <p className="text-xs md:text-sm text-gray-600">폰트, 색상, 크기, 외곽선 자유자재로 조절</p>
            </div>
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-purple-100">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">📱</div>
              <h4 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">간편한 공유</h4>
              <p className="text-xs md:text-sm text-gray-600">다운로드나 직접 공유로 친구들과 나누기</p>
            </div>
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-purple-100">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">⚡</div>
              <h4 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">실시간 미리보기</h4>
              <p className="text-xs md:text-sm text-gray-600">편집하는 동안 바로바로 결과 확인</p>
            </div>
          </div>
        </div>
      </div>

      {/* 토스트 알림 */}
      {error && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm transform transition-all duration-300 ${
          showToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">오류 발생</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={() => {
                setShowToast(false);
                setTimeout(() => setError(null), 300);
              }}
              className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}