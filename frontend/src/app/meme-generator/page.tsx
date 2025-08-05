'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, RefreshCw, Type, Image as ImageIcon, X, AlertTriangle, Users, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import TabGroup from '@/components/ui/TabGroup';
import TextStyleControls, { TextStyle } from '@/components/meme/TextStyleControls';
import FabricCanvas, { FabricCanvasRef, MemeTemplate } from '@/components/meme/FabricCanvas';
import ImageUploadComponent from '@/components/meme/ImageUploadComponent';
import TextInputArea from '@/components/meme/TextInputArea';
import AITextGenerator from '@/components/meme/AITextGenerator';
import CanvasOverlay from '@/components/meme/CanvasOverlay';
import ResizablePanel from '@/components/ui/ResizablePanel';
import { AlertDialog, ConfirmDialog } from '@/components/ui/Modal';
import { getRandomImageFromPool } from '@/utils/imagePool';
import RecommendedMemesModal from '@/components/meme/RecommendedMemesModal';

// 인기 밈 템플릿 - 가장 많이 사용되는 클래식 밈들
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
  },
  {
    id: 'success-kid',
    name: '성공한 아이',
    url: 'https://i.imgflip.com/1bhk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '월요일인데' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '공휴일이다!' }
    ]
  },
  {
    id: 'expanding-brain',
    name: '진화하는 뇌',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    textBoxes: [
      { x: 10, y: 30, width: 200, height: 40, defaultText: '일반적인 생각' },
      { x: 10, y: 120, width: 200, height: 40, defaultText: '좀 더 나은 생각' },
      { x: 10, y: 210, width: 200, height: 40, defaultText: '훌륭한 생각' },
      { x: 10, y: 300, width: 200, height: 40, defaultText: '천재적인 생각' }
    ]
  }
];

// 동물 밈 템플릿 - 귀엽고 재미있는 동물들
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
      { x: 10, y: 10, width: 380, height: 60, defaultText: '월요일이 좋다고?' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'NO.' }
    ]
  },
  {
    id: 'surprised-pikachu',
    name: '놀란 피카츄',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '과제를 미뤄두고' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '마감일이 내일?' }
    ]
  },
  {
    id: 'kermit-tea',
    name: '커밋의 차',
    url: 'https://i.imgflip.com/16iyn1.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '남의 일에 간섭 안 해' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '그런데 그건 아니지...' }
    ]
  },
  {
    id: 'evil-kermit',
    name: '악마 커밋',
    url: 'https://i.imgflip.com/1e7ql7.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '일찍 자야지' },
      { x: 210, y: 200, width: 180, height: 60, defaultText: '한 편만 더 보자' }
    ]
  },
  {
    id: 'cat-keyboard',
    name: '키보드 고양이',
    url: 'https://i.imgflip.com/4x1wc.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '중요한 보고서 작성 중' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '고양이: 지금이야!' }
    ]
  }
];

// 한국 드라마 스타일 템플릿 - 한국적 상황과 감정을 표현하는 밈들
const koreanDramaTemplates: MemeTemplate[] = [
  {
    id: 'korean-thinking',
    name: '깊은 생각에 빠진 모습',
    url: 'https://i.imgflip.com/1wz1x.jpg', // Confused Nick Young
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '음... 이건 좀 고민되네' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '어떻게 해야 할까?' }
    ]
  },
  {
    id: 'korean-shocked',
    name: '충격받은 표정',
    url: 'https://i.imgflip.com/2kbn1e.jpg', // Surprised Pikachu
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '헉! 이게 뭐야?!' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '말도 안 돼!' }
    ]
  },
  {
    id: 'korean-dramatic',
    name: '드라마틱한 표정',
    url: 'https://i.imgflip.com/26am.jpg', // This is Fine
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '이런 일이...' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '있을 수가!' }
    ]
  },
  {
    id: 'korean-monday',
    name: '월요일 반응',
    url: 'https://i.imgflip.com/8p0a.jpg', // Grumpy Cat
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '괜찮다고 했는데' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '괜찮지 않아...' }
    ]
  },
  {
    id: 'korean-variety-reaction',
    name: '한국 예능 리액션',
    url: 'https://i.imgflip.com/15s2g3.jpg', // Happy Seal
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '이거 완전 웃겨' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'ㅋㅋㅋㅋㅋ' }
    ]
  }
];

// 트렌드/인터넷 밈 템플릿 - 최신 유행하는 밈들
const trendingTemplates: MemeTemplate[] = [
  {
    id: 'this-is-fine',
    name: '괜찮아 이건',
    url: 'https://i.imgflip.com/26am.jpg',  
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '모든 게 무너져가고 있지만' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '괜찮아... 이건...' }
    ]
  },
  {
    id: 'stonks',
    name: '스톤크스',
    url: 'https://i.imgflip.com/2ze47r.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '잠깐 자는 동안' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '주식이 떡상했다 STONKS ↗️' }
    ]
  },
  {
    id: 'woman-pointing',
    name: '가리키는 여자',
    url: 'https://i.imgflip.com/345v97.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 180, height: 60, defaultText: '제발 그만해' },
      { x: 200, y: 200, width: 180, height: 60, defaultText: '아니야 더 해야지' }
    ]
  },
  {
    id: 'galaxy-brain',
    name: '갤럭시 브레인',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    textBoxes: [
      { x: 10, y: 30, width: 200, height: 40, defaultText: '8시간 자기' },
      { x: 10, y: 120, width: 200, height: 40, defaultText: '6시간 자기' },
      { x: 10, y: 210, width: 200, height: 40, defaultText: '4시간 자기' },
      { x: 10, y: 300, width: 200, height: 40, defaultText: '안 자기' }
    ]
  }
];

// 감정 표현 템플릿 - 다양한 감정을 표현하는 밈들
const emotionTemplates: MemeTemplate[] = [
  {
    id: 'crying-jordan',
    name: '우는 조던',
    url: 'https://i.imgflip.com/9ehk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '금요일이 끝나고' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '또 월요일이 온다는 현실' }
    ]
  },
  {
    id: 'hide-pain-harold',
    name: '고통 숨기는 해롤드',
    url: 'https://i.imgflip.com/gk5el.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '"괜찮냐?"' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '"네 괜찮아요 ^^"' }
    ]
  },
  {
    id: 'surprised-tom',
    name: '놀란 톰',
    url: 'https://i.imgflip.com/37y8cg.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '집에 가려고 하는데' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '갑자기 야근이라고?' }
    ]
  },
  {
    id: 'evil-smile',
    name: '사악한 미소',
    url: 'https://i.imgflip.com/2wifvo.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '친구가 시험 망했다고 할 때' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '나도 망했지만 위로해주는 나' }
    ]
  }
];

export default function MemeGeneratorPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
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
  
  // 추천 밈 모달 관련 상태
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [isWelcome, setIsWelcome] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // URL 파라미터 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
      
      // 첫 방문 및 웰컴 플래그 확인
      const isFirst = params.get('first') === 'true';
      const isWelcomeParam = params.get('welcome') === 'true';
      const interests = params.get('interests')?.split(',') || [];
      
      if (isFirst || isWelcomeParam) {
        // 페이지 로드 후 잠시 후 모달 표시
        setTimeout(() => {
          setShowRecommendationsModal(true);
          setIsWelcome(isWelcomeParam);
          setUserInterests(interests);
        }, 500);
      }
    }
  }, []);
  
  // 모달 상태들
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'danger' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    type: 'info' | 'warning' | 'danger' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: '확인',
    type: 'info'
  });

  // 알럿 표시 함수
  const showAlert = useCallback((title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success' = 'info') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type
    });
  }, []);

  // 컨펌 표시 함수
  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmText: string = '확인',
    type: 'info' | 'warning' | 'danger' | 'success' = 'info'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      type
    });
  }, []);

  // 모달 닫기 함수들
  const closeAlert = useCallback(() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 모바일 감지 및 리디렉션
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        router.push('/meme-generator/mobile');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  // 템플릿 선택 핸들러
  const handleTemplateSelect = useCallback(async (template: MemeTemplate) => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    try {
      await canvasRef.current.loadTemplate(template);
      setSelectedTemplate(template);
      // TODO: 템플릿 로딩 성공 로그 - 프로덕션에서는 제거됨
    } catch (error) {
      console.error('Template loading failed:', error);
      
      // 더 구체적인 에러 메시지 제공
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('CORS')) {
        console.warn('CORS error detected, but template may still load');
        // CORS 에러의 경우 경고만 표시하고 계속 진행
        setSelectedTemplate(template);
      } else if (errorMessage.includes('Network')) {
        showAlert('네트워크 오류', '네트워크 연결을 확인해주세요. 인터넷 연결이 불안정할 수 있습니다.', 'warning');
      } else {
        // 일반적인 에러의 경우 재시도 옵션 제공
        showConfirm(
          '템플릿 로딩 실패',
          '템플릿을 불러오는데 실패했습니다. 다시 시도하시겠습니까?',
          () => {
            setTimeout(() => handleTemplateSelect(template), 500);
          },
          '재시도',
          'warning'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, showConfirm]);

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
      showAlert('업로드 실패', '이미지 업로드에 실패했습니다. 파일 형식이나 크기를 확인해주세요.', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // 이미지 URL 추가
  const handleImageUrl = useCallback(async (url: string) => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    try {
      await canvasRef.current.addImageFromUrl(url);
    } catch (error) {
      console.error('Image URL loading failed:', error);
      showAlert('URL 로딩 실패', '이미지 URL 로딩에 실패했습니다. URL이 올바른지 확인해주세요.', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // 밈 다운로드
  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    
    const dataURL = canvasRef.current.exportAsImage();
    if (!dataURL) {
      showAlert('다운로드 실패', '이미지 생성에 실패했습니다. 다시 시도해주세요.', 'danger');
      return;
    }
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 성공 메시지 표시
    showAlert('다운로드 완료', '밈이 성공적으로 다운로드되었습니다!', 'success');
  }, [showAlert]);

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
    { key: 'text', label: '텍스트', icon: Type },
    { key: 'ai', label: 'AI 텍스트', icon: RefreshCw }
  ];

  // 커뮤니티 페이지 이동
  const goToCommunity = useCallback(() => {
    router.push('/community');
  }, [router]);

  // 템플릿 새로고침 함수들
  const refreshTemplateImages = useCallback((templateArray: MemeTemplate[]) => {
    return templateArray.map(template => ({
      ...template,
      url: getRandomImageFromPool(template.id)
    }));
  }, []);

  const refreshPopularTemplates = useCallback(() => {
    // 인기 템플릿 이미지 새로고침
    const refreshed = refreshTemplateImages(popularTemplates);
    // 실제로는 상태를 업데이트해야 하지만, 현재는 페이지 새로고침으로 대체
    window.location.reload();
  }, [refreshTemplateImages]);

  const refreshAnimalTemplates = useCallback(() => {
    // 동물 템플릿 이미지 새로고침
    window.location.reload();
  }, []);

  const refreshKoreanTemplates = useCallback(() => {
    // 한국 드라마 템플릿 이미지 새로고침
    window.location.reload();
  }, []);

  // 추천 밈 템플릿 선택 핸들러
  const handleRecommendedTemplateSelect = useCallback((template: any) => {
    // 추천 밈의 템플릿 형식을 MemeTemplate 형식으로 변환
    const memeTemplate: MemeTemplate = {
      id: template.id,
      name: template.name,
      url: template.imageUrl,
      textBoxes: [
        { x: 10, y: 10, width: 380, height: 60, defaultText: '상단 텍스트' },
        { x: 10, y: 320, width: 380, height: 60, defaultText: '하단 텍스트' }
      ]
    };
    
    // 실제로 캔버스에 템플릿 로드
    handleTemplateSelect(memeTemplate);
  }, [handleTemplateSelect]);

  // 추천 밈 모달 열기 (헤더 버튼용)
  const openRecommendationsModal = useCallback(() => {
    setShowRecommendationsModal(true);
    setIsWelcome(false); // 헤더에서 열 때는 웰컴 메시지 없음
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-gray-900" style={{fontFamily: "'Black Han Sans', sans-serif", fontSize: '1.7rem', fontWeight: 'light'}}>밈징</h1>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={openRecommendationsModal}
              className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200 text-primary-700 hover:from-primary-100 hover:to-secondary-100"
            >
              <Sparkles size={16} className="mr-1 md:mr-2" />
              <span className="hidden sm:inline">추천 밈</span>
              <span className="sm:hidden">추천</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={goToCommunity}
            >
              <Users size={16} className="mr-1 md:mr-2" />
              <span className="hidden sm:inline">커뮤니티</span>
            </Button>
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

      <div className="h-[calc(100vh-80px)]">
        {/* 모바일에서는 기존 방식 유지, 데스크톱에서는 리사이저블 패널 사용 */}
        <div className="block md:hidden h-full">
          {/* 모바일 레이아웃 */}
          <div className="flex h-full relative">
            {/* 모바일 사이드바 */}
            <div className={`
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              transition-transform duration-300 ease-in-out
              fixed z-30 w-80 h-full bg-white border-r border-gray-200 flex flex-col
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
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">🔥 인기 템플릿</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={refreshPopularTemplates}
                            className="text-gray-500 hover:text-gray-700"
                            title="새로운 이미지로 바꾸기"
                          >
                            <RefreshCw size={16} />
                          </Button>
                        </div>
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
                        
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">🐾 동물</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={refreshAnimalTemplates}
                            className="text-gray-500 hover:text-gray-700"
                            title="새로운 이미지로 바꾸기"
                          >
                            <RefreshCw size={16} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {animalTemplates.map((template) => (
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
                        
                        <h3 className="text-lg font-semibold mb-4">🔥 트렌드</h3>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {trendingTemplates.map((template) => (
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
                        
                        <h3 className="text-lg font-semibold mb-4">😭 감정 표현</h3>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {emotionTemplates.map((template) => (
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
                        
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">🎬 한국 드라마 스타일</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={refreshKoreanTemplates}
                            className="text-gray-500 hover:text-gray-700"
                            title="새로운 이미지로 바꾸기"
                          >
                            <RefreshCw size={16} />
                          </Button>
                        </div>
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
                  
                  {activeTab === 'ai' && (
                    <div className="space-y-6">
                      <AITextGenerator
                        onTextSelect={handleAddText}
                        existingTexts={canvasRef.current?.getAllTexts() || []}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 모바일 오버레이 */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-20"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* 모바일 캔버스 영역 */}
            <div className="flex-1 flex items-center justify-center p-4 bg-gray-100">
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

        {/* 데스크톱 리사이저블 레이아웃 */}
        <div className="hidden md:block h-full">
          <ResizablePanel
            defaultLeftWidth={420}
            minLeftWidth={350}
            maxLeftWidth={600}
            leftPanel={
              <>
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
                          
                          <h3 className="text-lg font-semibold mb-4">🐾 동물</h3>
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            {animalTemplates.map((template) => (
                              <button
                                key={template.id}
                                className={`
                                  relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                                  ${selectedTemplate?.id === template.id 
                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                `}
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
                          
                          <h3 className="text-lg font-semibold mb-4">🔥 트렌드</h3>
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            {trendingTemplates.map((template) => (
                              <button
                                key={template.id}
                                className={`
                                  relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                                  ${selectedTemplate?.id === template.id 
                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                `}
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
                          
                          <h3 className="text-lg font-semibold mb-4">😭 감정 표현</h3>
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            {emotionTemplates.map((template) => (
                              <button
                                key={template.id}
                                className={`
                                  relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                                  ${selectedTemplate?.id === template.id 
                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                `}
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
                          
                          <h3 className="text-lg font-semibold mb-4">🎬 한국 드라마 스타일</h3>
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
                    
                    {activeTab === 'ai' && (
                      <div className="space-y-6">
                        <AITextGenerator
                          onTextSelect={handleAddText}
                          existingTexts={canvasRef.current?.getAllTexts() || []}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            }
            rightPanel={
              <div className="flex flex-col h-full">
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
              </div>
            }
          />
        </div>
      </div>

      {/* 알럿 모달 */}
      <AlertDialog
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        icon={
          alertModal.type === 'danger' ? <X className="w-6 h-6" /> :
          alertModal.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
          alertModal.type === 'success' ? <Download className="w-6 h-6" /> :
          <ArrowLeft className="w-6 h-6" />
        }
      />

      {/* 컨펌 모달 */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onConfirm={() => {
          confirmModal.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        icon={
          confirmModal.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
          confirmModal.type === 'danger' ? <X className="w-6 h-6" /> :
          <RefreshCw className="w-6 h-6" />
        }
      />

      {/* 추천 밈 모달 */}
      <RecommendedMemesModal
        isOpen={showRecommendationsModal}
        onClose={() => setShowRecommendationsModal(false)}
        onTemplateSelect={handleRecommendedTemplateSelect}
        isWelcome={isWelcome}
        selectedInterests={userInterests}
      />
    </div>
  );
}