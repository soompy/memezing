'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, Type, Image as ImageIcon, Menu, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import TabGroup from '@/components/ui/TabGroup';
import TextStyleControls, { TextStyle } from '@/components/meme/TextStyleControls';
import FabricCanvas, { FabricCanvasRef, MemeTemplate } from '@/components/meme/FabricCanvas';
import ImageUploadComponent from '@/components/meme/ImageUploadComponent';
import TextInputArea from '@/components/meme/TextInputArea';
import CanvasOverlay from '@/components/meme/CanvasOverlay';

// 기존 템플릿 데이터 (일부만 가져옴)
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
  },
  {
    id: 'two-buttons',
    name: '두 가지 선택',
    url: 'https://i.imgflip.com/1g8my4.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 180, height: 40, defaultText: '어려운 선택' },
      { x: 100, y: 120, width: 120, height: 30, defaultText: '선택 A' },
      { x: 250, y: 120, width: 120, height: 30, defaultText: '선택 B' }
    ]
  }
];

const koreanDramaTemplates: MemeTemplate[] = [
  {
    id: 'thinking-korean',
    name: '깊은 생각에 빠진 모습',
    url: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '음... 이건 좀 고민되네' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '어떻게 해야 할까?' }
    ]
  },
  {
    id: 'shocked-korean',
    name: '충격받은 표정',
    url: 'https://images.unsplash.com/photo-1569913486515-b74bf7751574?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '헉! 이게 뭐야?!' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '말도 안 돼!' }
    ]
  }
];

export default function MemeGeneratorPage() {
  const canvasRef = useRef<FabricCanvasRef>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('images');
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontSize: 40,
    fontFamily: 'Arial Black, Arial, sans-serif',
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2,
    textAlign: 'center',
    opacity: 1
  });
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [canvasContainer, setCanvasContainer] = useState<HTMLDivElement | null>(null);

  // 템플릿 선택 핸들러
  const handleTemplateSelect = useCallback(async (template: MemeTemplate) => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    try {
      await canvasRef.current.loadTemplate(template);
      setSelectedTemplate(template);
      console.log('Template loaded successfully:', template.name);
    } catch (error) {
      console.error('Template loading failed:', error);
      
      // 더 구체적인 에러 메시지 제공
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('CORS')) {
        console.warn('CORS error detected, but template may still load');
        // CORS 에러의 경우 경고만 표시하고 계속 진행
        setSelectedTemplate(template);
      } else if (errorMessage.includes('Network')) {
        alert('네트워크 연결을 확인해주세요. 인터넷 연결이 불안정할 수 있습니다.');
      } else {
        // 일반적인 에러의 경우 재시도 옵션 제공
        const retry = confirm('템플릿을 불러오는데 실패했습니다. 다시 시도하시겠습니까?');
        if (retry) {
          // 재시도
          setTimeout(() => handleTemplateSelect(template), 500);
          return;
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 텍스트 추가
  const handleAddText = useCallback((text: string = '새 텍스트') => {
    if (!canvasRef.current) return;
    
    canvasRef.current.addText(text, {
      fontSize: textStyle.fontSize,
      fontFamily: textStyle.fontFamily,
      fontWeight: textStyle.fontWeight,
      fill: textStyle.color,
      stroke: textStyle.strokeColor,
      strokeWidth: textStyle.strokeWidth,
      textAlign: textStyle.textAlign,
      opacity: textStyle.opacity
    });
  }, [textStyle]);

  // 텍스트 스타일 변경
  const handleStyleChange = useCallback((newStyle: TextStyle) => {
    setTextStyle(newStyle);
    
    // 선택된 객체가 있으면 스타일 적용
    if (selectedObject && canvasRef.current) {
      canvasRef.current.updateTextStyle(newStyle);
    }
  }, [selectedObject]);

  // 텍스트 스타일 리셋
  const handleStyleReset = useCallback(() => {
    const defaultStyle: TextStyle = {
      fontSize: 40,
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      textAlign: 'center',
      opacity: 1
    };
    setTextStyle(defaultStyle);
  }, []);

  // 이미지 파일 업로드
  const handleImageUpload = useCallback(async (file: File) => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    try {
      await canvasRef.current.addImageFromFile(file);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 이미지 URL 추가
  const handleImageUrl = useCallback(async (url: string) => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    try {
      await canvasRef.current.addImageFromUrl(url);
    } catch (error) {
      console.error('Image URL loading failed:', error);
      alert('이미지 URL 로딩에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 밈 다운로드
  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    
    const dataURL = canvasRef.current.exportAsImage();
    if (!dataURL) {
      alert('이미지 생성에 실패했습니다.');
      return;
    }
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 캔버스 클리어
  const handleClear = useCallback(() => {
    if (!canvasRef.current) return;
    
    canvasRef.current.clearCanvas();
    setSelectedTemplate(null);
  }, []);

  // 선택된 객체 삭제
  const handleDeleteSelected = useCallback(() => {
    if (!canvasRef.current) return;
    
    canvasRef.current.deleteSelectedObject();
  }, []);

  // 선택된 객체 복사
  const handleDuplicateSelected = useCallback(() => {
    if (!canvasRef.current) return;
    
    canvasRef.current.duplicateSelectedObject();
  }, []);

  // 선택된 객체 회전
  const handleRotateSelected = useCallback(() => {
    if (!canvasRef.current) return;
    
    canvasRef.current.rotateSelectedObject();
  }, []);

  // 캔버스 컨테이너 업데이트
  const updateCanvasContainer = useCallback(() => {
    if (canvasRef.current) {
      setCanvasContainer(canvasRef.current.getCanvasContainer());
    }
  }, []);

  // 캔버스가 마운트된 후 컨테이너 설정
  useEffect(() => {
    const timer = setTimeout(updateCanvasContainer, 100);
    return () => clearTimeout(timer);
  }, [updateCanvasContainer]);

  // 전역 키보드 이벤트 리스너 (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드나 텍스트 편집 중일 때는 무시
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl+Z (Undo)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canvasRef.current) {
          canvasRef.current.undo();
        }
      }
      
      // Ctrl+Y 또는 Ctrl+Shift+Z (Redo)
      if ((event.ctrlKey || event.metaKey) && 
          (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (canvasRef.current) {
          canvasRef.current.redo();
        }
      }
    };

    // 전역 키보드 이벤트 등록
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const tabs = [
    { key: 'images', label: '이미지 선택', icon: ImageIcon },
    { key: 'text', label: '텍스트', icon: Type }
  ];

  // 사이드바 토글
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 모바일 메뉴 버튼 */}
            <Button 
              variant="secondary" 
              size="sm"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </Button>
            
            <Button variant="secondary" size="sm" className="hidden md:flex">
              <ArrowLeft size={16} className="mr-2" />
              뒤로가기
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">밈 생성기</h1>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading}
            >
              <Download size={16} className="mr-1 md:mr-2" />
              <span className="hidden sm:inline">다운로드</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)] relative">
        {/* 사이드바 */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          fixed md:relative z-30 md:z-auto
          w-80 h-full bg-white border-r border-gray-200 flex flex-col
        `}>
          {/* Sticky 탭 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-4 shadow-sm">
            <TabGroup
              items={tabs}
              activeKey={activeTab}
              onChange={setActiveTab}
            />
          </div>
          
          {/* 스크롤 가능한 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {activeTab === 'images' && (
                <div className="space-y-6">
                  {/* 이미지 업로드 섹션 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">직접 업로드</h3>
                    <ImageUploadComponent
                      onImageSelect={handleImageUpload}
                      onImageUrl={handleImageUrl}
                    />
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200"></div>

                  {/* 인기 템플릿 섹션 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">인기 템플릿</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {popularTemplates.map((template) => (
                        <button
                          key={template.id}
                          className={`
                            relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                            ${selectedTemplate?.id === template.id 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => {
                            handleTemplateSelect(template);
                            setIsSidebarOpen(false); // 모바일에서 템플릿 선택 후 사이드바 닫기
                          }}
                          disabled={isLoading}
                        >
                          <img
                            src={template.url}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                            <p className="text-xs font-medium truncate">{template.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-4">한국 드라마 스타일</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {koreanDramaTemplates.map((template) => (
                        <button
                          key={template.id}
                          className={`
                            relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                            ${selectedTemplate?.id === template.id 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => {
                            handleTemplateSelect(template);
                            setIsSidebarOpen(false);
                          }}
                          disabled={isLoading}
                        >
                          <img
                            src={template.url}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                            <p className="text-xs font-medium truncate">{template.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'text' && (
                <div className="space-y-6">
                  {/* 글귀 입력 섹션 */}
                  <div>
                    <TextInputArea
                      onTextAdd={handleAddText}
                    />
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200"></div>

                  {/* 텍스트 스타일 섹션 */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">텍스트 스타일</h3>
                      <Button
                        size="sm"
                        onClick={() => handleAddText()}
                      >
                        기본 텍스트 추가
                      </Button>
                    </div>
                    <TextStyleControls
                      style={textStyle}
                      onChange={handleStyleChange}
                      onReset={handleStyleReset}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오버레이 (모바일에서 사이드바가 열렸을 때) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* 메인 캔버스 영역 */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          {/* 캔버스 컨테이너 */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-100 min-h-0">
            <div className="w-full h-full max-w-4xl relative">
              {isLoading && (
                <div className="text-center mb-4">
                  <div className="inline-flex items-center space-x-2">
                    <RefreshCw size={16} className="animate-spin" />
                    <span>로딩 중...</span>
                  </div>
                </div>
              )}
              
              <FabricCanvas
                ref={canvasRef}
                width={800}
                height={600}
                onSelectionChange={setSelectedObject}
                className="w-full h-full"
              />

              {/* 캔버스 오버레이 - 선택된 객체 주변에 액션 버튼 표시 */}
              <CanvasOverlay
                selectedObject={selectedObject}
                canvasContainer={canvasContainer}
                onDelete={handleDeleteSelected}
                onClear={handleClear}
                onDuplicate={handleDuplicateSelected}
                onRotate={handleRotateSelected}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}