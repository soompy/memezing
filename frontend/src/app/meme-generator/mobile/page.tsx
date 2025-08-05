'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, RefreshCw, Type, Image as ImageIcon, Settings, ChevronUp, ChevronDown, X, Plus, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import MobileFabricCanvas, { MobileFabricCanvasRef, MemeTemplate } from '@/components/meme/MobileFabricCanvas';
import CanvasOverlay from '@/components/meme/CanvasOverlay';
import AITextGenerator from '@/components/meme/AITextGenerator';
import { getRandomImageFromPool } from '@/utils/imagePool';

// 템플릿 데이터
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

// 동물 밈 템플릿
const animalTemplates: MemeTemplate[] = [
  {
    id: 'doge',
    name: '도지 밈',
    url: 'https://i.imgflip.com/4t0m5.jpg',
    textBoxes: [
      { x: 50, y: 30, width: 150, height: 40, defaultText: 'such wow' },
      { x: 250, y: 80, width: 120, height: 40, defaultText: 'much meme' },
      { x: 30, y: 200, width: 140, height: 40, defaultText: 'very funny' },
      { x: 280, y: 250, width: 100, height: 40, defaultText: 'amaze' }
    ]
  },
  {
    id: 'grumpy-cat',
    name: '불기돌고양이',
    url: 'https://i.imgflip.com/8p0a.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '월요일이 좋다고?' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: 'NO.' }
    ]
  },
  {
    id: 'surprised-pikachu',
    name: '놀란 피카츄',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '과제를 미뤄두고' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: '마감일이 내일?' }
    ]
  },
  {
    id: 'kermit-tea',
    name: '커밋의 차',
    url: 'https://i.imgflip.com/16iyn1.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '남의 일에 간섭 안 해' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: '그런데 그건 아니지...' }
    ]
  },
  {
    id: 'success-kid',
    name: '성공한 아기',
    url: 'https://i.imgflip.com/1bhk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '월급날이다' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: 'YES!' }
    ]
  },
  {
    id: 'evil-kermit',
    name: '악한 커밋',
    url: 'https://i.imgflip.com/3oevdk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '일찍 자야지' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: '한 편만 더...' }
    ]
  }
];

// 트렌딩 밈 템플릿
const trendingTemplates: MemeTemplate[] = [
  {
    id: 'this-is-fine',
    name: '괜찮아 개',
    url: 'https://i.imgflip.com/26am.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '시험 망했어도' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: '괜찮아' }
    ]
  },
  {
    id: 'expanding-brain',
    name: '확장하는 뇌',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    textBoxes: [
      { x: 10, y: 50, width: 150, height: 30, defaultText: '일반적인 생각' },
      { x: 10, y: 120, width: 150, height: 30, defaultText: '좀 더 발전된 생각' },
      { x: 10, y: 190, width: 150, height: 30, defaultText: '천재적인 생각' },
      { x: 10, y: 260, width: 150, height: 30, defaultText: '초월적인 깨달음' }
    ]
  },
  {
    id: 'change-my-mind',
    name: '내 생각을 바꿔봐',
    url: 'https://i.imgflip.com/24y43o.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 300, height: 50, defaultText: '치킨이 최고의 음식이다' },
      { x: 180, y: 200, width: 140, height: 40, defaultText: 'Change My Mind' }
    ]
  },
  {
    id: 'roll-safe',
    name: '롤 세이프',
    url: 'https://i.imgflip.com/1h7in3.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '돈이 없으면' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: '쓸 일도 없지' }
    ]
  }
];

// 감정 표현 템플릿
const emotionTemplates: MemeTemplate[] = [
  {
    id: 'crying-cat',
    name: '우는 고양이',
    url: 'https://i.imgflip.com/2d3al6.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '금요일이 끝나간다' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: '😭😭😭' }
    ]
  },
  {
    id: 'happy-seal',
    name: '행복한 물개',
    url: 'https://i.imgflip.com/15s2g3.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '퇴근 시간이다!' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: '🎉🎉🎉' }
    ]
  },
  {
    id: 'confused-nick-young',
    name: '당황한 닉 영',
    url: 'https://i.imgflip.com/1wz1x.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '어? 내 지갑이?' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: '????' }
    ]
  },
  {
    id: 'angry-baby',
    name: '화난 아기',
    url: 'https://i.imgflip.com/oqzb4.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 320, height: 50, defaultText: '월요일 아침' },
      { x: 10, y: 270, width: 320, height: 50, defaultText: '싫다!!!' }
    ]
  }
];

export default function MobileMemeGeneratorPage() {
  const router = useRouter();
  const canvasRef = useRef<MobileFabricCanvasRef>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasContainer, setCanvasContainer] = useState<HTMLDivElement | null>(null);
  const [currentTool, setCurrentTool] = useState<'none' | 'templates' | 'text' | 'ai' | 'upload' | 'settings'>('none');
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [quickTexts] = useState<string[]>(['상단 텍스트', '하단 텍스트']);
  const [newText, setNewText] = useState('');

  // 데스크톱 감지 및 리디렉션
  useEffect(() => {
    const checkDesktop = () => {
      const isDesktop = window.innerWidth >= 768 && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isDesktop) {
        router.push('/meme-generator');
      }
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    return () => window.removeEventListener('resize', checkDesktop);
  }, [router]);

  // 템플릿 선택 핸들러
  const handleTemplateSelect = useCallback(async (template: MemeTemplate) => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    try {
      await canvasRef.current.loadTemplate(template);
      setCurrentTool('none');
      setIsBottomSheetExpanded(false);
    } catch (error) {
      console.error('Template loading failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 텍스트 추가
  const handleAddText = useCallback((text: string = '새 텍스트') => {
    if (!canvasRef.current) return;
    
    canvasRef.current.addText(text, {
      fontSize: 36,
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontWeight: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      textAlign: 'center'
    });
    
    setCurrentTool('none');
    setIsBottomSheetExpanded(false);
  }, []);

  // 빠른 텍스트 추가
  const handleQuickTextAdd = useCallback(() => {
    if (newText.trim()) {
      handleAddText(newText.trim());
      setNewText('');
    }
  }, [newText, handleAddText]);

  // 이미지 업로드
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvasRef.current) return;
    
    setIsLoading(true);
    canvasRef.current.addImageFromFile(file)
      .then(() => {
        setCurrentTool('none');
        setIsBottomSheetExpanded(false);
      })
      .catch((error) => {
        console.error('Image upload failed:', error);
        // TODO: 토스트 알림으로 교체 예정 - 이미지 업로드 실패 알림
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 다운로드
  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    
    const dataURL = canvasRef.current.exportAsImage();
    if (!dataURL) {
      // TODO: 토스트 알림으로 교체 예정 - 이미지 생성 실패 알림
      return;
    }
    
    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 캔버스 액션들
  const handleDeleteSelected = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.deleteSelectedObject();
  }, []);

  const handleDuplicateSelected = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.duplicateSelectedObject();
  }, []);

  const handleRotateSelected = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.rotateSelectedObject();
  }, []);

  const handleClear = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.clearCanvas();
  }, []);

  // 캔버스 컨테이너 업데이트
  const updateCanvasContainer = useCallback(() => {
    if (canvasRef.current) {
      setCanvasContainer(canvasRef.current.getCanvasContainer());
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateCanvasContainer, 100);
    return () => clearTimeout(timer);
  }, [updateCanvasContainer]);

  // 전역 키보드 이벤트 (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canvasRef.current) {
          canvasRef.current.undo();
        }
      }
      
      if ((event.ctrlKey || event.metaKey) && 
          (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (canvasRef.current) {
          canvasRef.current.redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 도구 선택
  const selectTool = (tool: typeof currentTool) => {
    if (currentTool === tool) {
      setCurrentTool('none');
      setIsBottomSheetExpanded(false);
    } else {
      setCurrentTool(tool);
      setIsBottomSheetExpanded(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 모바일 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-gray-900" style={{fontFamily: "'Black Han Sans', sans-serif", fontSize: '1.2rem', fontWeight: 'light'}}>밈징</h1>
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <RefreshCw size={16} className="animate-spin mr-1" />
              로딩중...
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/community')}
            className="px-3"
          >
            <Users size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            disabled={isLoading}
            className="px-3"
          >
            <RefreshCw size={16} />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            disabled={isLoading}
            className="px-3"
          >
            <Download size={16} />
          </Button>
        </div>
      </header>

      {/* 메인 캔버스 영역 */}
      <div className="flex-1 relative bg-gray-100 min-h-0">
        <div className="w-full h-full flex items-center justify-center p-4">
          <MobileFabricCanvas
            ref={canvasRef}
            width={350}
            height={350}
            onSelectionChange={setSelectedObject}
            className="w-full h-full max-w-sm max-h-sm"
          />

          {/* 캔버스 오버레이 */}
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

      {/* 하단 도구 바 */}
      <div className="bg-white border-t border-gray-200 p-4 shrink-0">
        <div className="grid grid-cols-5 gap-2 mb-4">
          <Button
            variant={currentTool === 'templates' ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => selectTool('templates')}
            className="flex flex-col items-center p-2 h-auto"
          >
            <ImageIcon size={18} className="mb-1" />
            <span className="text-xs">템플릿</span>
          </Button>
          
          <Button
            variant={currentTool === 'text' ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => selectTool('text')}
            className="flex flex-col items-center p-2 h-auto"
          >
            <Type size={18} className="mb-1" />
            <span className="text-xs">텍스트</span>
          </Button>
          
          <Button
            variant={currentTool === 'ai' ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => selectTool('ai')}
            className="flex flex-col items-center p-2 h-auto"
          >
            <RefreshCw size={18} className="mb-1" />
            <span className="text-xs">AI</span>
          </Button>
          
          <Button
            variant={currentTool === 'upload' ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => selectTool('upload')}
            className="flex flex-col items-center p-2 h-auto"
          >
            <Plus size={18} className="mb-1" />
            <span className="text-xs">업로드</span>
          </Button>
          
          <Button
            variant={currentTool === 'settings' ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => selectTool('settings')}
            className="flex flex-col items-center p-2 h-auto"
          >
            <Settings size={18} className="mb-1" />
            <span className="text-xs">설정</span>
          </Button>
        </div>

        {/* 빠른 텍스트 추가 */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickTextAdd()}
            placeholder="빠른 텍스트 추가..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
          />
          <Button
            onClick={handleQuickTextAdd}
            disabled={!newText.trim()}
            className="px-4"
          >
            추가
          </Button>
        </div>
      </div>

      {/* 하단 시트 */}
      {currentTool !== 'none' && (
        <div
          className={`fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 transition-transform duration-300 z-50 ${
            isBottomSheetExpanded ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: '60vh' }}
        >
          {/* 시트 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {currentTool === 'templates' && '템플릿 선택'}
              {currentTool === 'text' && '텍스트 도구'}
              {currentTool === 'ai' && 'AI 텍스트 생성'}
              {currentTool === 'upload' && '이미지 업로드'}
              {currentTool === 'settings' && '설정'}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
              >
                {isBottomSheetExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentTool('none');
                  setIsBottomSheetExpanded(false);
                }}
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* 시트 콘텐츠 */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentTool === 'templates' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">🔥 인기 템플릿</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {popularTemplates.map((template) => (
                      <button
                        key={template.id}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-colors"
                        onClick={() => handleTemplateSelect(template)}
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
                
                <div>
                  <h4 className="text-sm font-medium mb-3">🐾 동물</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {animalTemplates.map((template) => (
                      <button
                        key={template.id}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-colors"
                        onClick={() => handleTemplateSelect(template)}
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
                
                <div>
                  <h4 className="text-sm font-medium mb-3">🔥 트렌딩</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {trendingTemplates.map((template) => (
                      <button
                        key={template.id}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-colors"
                        onClick={() => handleTemplateSelect(template)}
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
                
                <div>
                  <h4 className="text-sm font-medium mb-3">😭 감정표현</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {emotionTemplates.map((template) => (
                      <button
                        key={template.id}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-colors"
                        onClick={() => handleTemplateSelect(template)}
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

            {currentTool === 'text' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">빠른 텍스트</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {quickTexts.map((text, index) => (
                      <Button
                        key={index}
                        variant="secondary"
                        onClick={() => handleAddText(text)}
                        className="text-sm"
                      >
                        {text}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">사용법</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• 위의 버튼을 눌러 미리 설정된 텍스트 추가</li>
                    <li>• 하단 입력창에서 원하는 텍스트 입력</li>
                    <li>• 캔버스에서 텍스트를 터치하여 편집</li>
                    <li>• 드래그하여 위치 이동</li>
                  </ul>
                </div>
              </div>
            )}

            {currentTool === 'ai' && (
              <div className="space-y-4">
                <AITextGenerator
                  onTextSelect={handleAddText}
                  existingTexts={canvasRef.current?.getAllTexts() || []}
                  className="border-0 p-0"
                />
              </div>
            )}

            {currentTool === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="mobile-file-upload"
                  />
                  <label htmlFor="mobile-file-upload" className="cursor-pointer">
                    <Plus size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">이미지를 선택하세요</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG 파일 지원</p>
                  </label>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• 이미지를 터치하여 선택</p>
                  <p>• 드래그하여 위치 이동</p>
                  <p>• 핀치로 크기 조정</p>
                  <p>• 회전 버튼으로 각도 조정</p>
                </div>
              </div>
            )}

            {currentTool === 'settings' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">단축키</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Ctrl+Z: 실행 취소</p>
                    <p>• Ctrl+Y: 다시 실행</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">도움말</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• 객체를 터치하면 편집 버튼이 나타납니다</p>
                    <p>• 두 손가락으로 캔버스를 확대/축소할 수 있습니다</p>
                    <p>• 완성된 밈은 다운로드 버튼으로 저장하세요</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 백드롭 */}
      {isBottomSheetExpanded && (
        <div 
          className="fixed inset-0 bg-black z-40"
          style={{ opacity: 0.5 }}
          onClick={() => {
            setCurrentTool('none');
            setIsBottomSheetExpanded(false);
          }}
        />
      )}
    </div>
  );
}