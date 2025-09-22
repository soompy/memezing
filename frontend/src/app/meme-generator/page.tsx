'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Download, RefreshCw, Edit, Image as ImageIcon, X, AlertTriangle, Users, Sparkles, LogIn, User, Coins, Sticker } from 'lucide-react';
import Button from '@/components/ui/Button';
import TabGroup from '@/components/ui/TabGroup';
import TextStyleControls, { TextStyle } from '@/components/meme/TextStyleControls';
import FabricCanvas, { FabricCanvasRef, MemeTemplate, ImageFillOption } from '@/components/meme/FabricCanvas';
import ImageUploadComponent from '@/components/meme/ImageUploadComponent';
import ImageSelectorTabs from '@/components/meme/ImageSelectorTabs';
import ImageFillControls from '@/components/meme/ImageFillControls';
import TextInputArea from '@/components/meme/TextInputArea';
import CanvasOverlay from '@/components/meme/CanvasOverlay';
import ResizablePanel from '@/components/ui/ResizablePanel';
import { AlertDialog, ConfirmDialog } from '@/components/ui/Modal';
import { getRandomImageFromPool } from '@/utils/imagePool';
import RecommendedMemesModal from '@/components/meme/RecommendedMemesModal';
import MemeCoinTextSuggestions from '@/components/meme/MemeCoinTextSuggestions';
import { memeCoinTemplates } from '@/data/memeCoinTemplates';
import { useTemplates } from '@/hooks/useTemplates';
import TemplateCategories from '@/components/meme/TemplateCategories';
import CanvasSizeControls, { CanvasSize, PRESET_CANVAS_SIZES } from '@/components/meme/CanvasSizeControls';
import BackgroundColorControls from '@/components/meme/BackgroundColorControls';
import StickerCollection from '@/components/meme/StickerCollection';
import SpeechBubbleEditor from '@/components/meme/SpeechBubbleEditor';
import StickerManager from '@/components/meme/StickerManager';
import LayerPanel, { LayerItem } from '@/components/meme/LayerPanel';
import type { Sticker as StickerType, CanvasSpeechBubble } from '@/types/sticker';

export default function MemeGeneratorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const canvasRef = useRef<FabricCanvasRef>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('design');
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
  const [currentImageFillOption, setCurrentImageFillOption] = useState<ImageFillOption>('fill');
  
  // 스티커 관련 상태
  const [selectedSpeechBubble, setSelectedSpeechBubble] = useState<CanvasSpeechBubble | null>(null);
  const [showSpeechBubbleEditor, setShowSpeechBubbleEditor] = useState(false);

  // 레이어 관리 상태
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  // 캔버스 사이즈 및 배경색 상태
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(PRESET_CANVAS_SIZES[0]); // 기본 사이즈
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff'); // 기본 배경색
  
  // 새로운 템플릿 시스템 사용
  const {
    templates: availableTemplates,
    isLoading: templatesLoading,
    error: templatesError,
    loadRandomTemplates,
    refreshTemplates: refreshAllTemplates,
  } = useTemplates({
    autoLoad: false, // 수동으로 로드
    fallbackToCurated: true,
  });
  
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

  // 템플릿 초기 로드
  useEffect(() => {
    loadRandomTemplates(20); // 랜덤 20개 템플릿 로드
  }, [loadRandomTemplates]);

  // 템플릿 새로고침 함수
  const refreshTemplates = useCallback(async () => {
    await loadRandomTemplates(20);
  }, [loadRandomTemplates]);
  
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

  // 텍스트 스타일 미리보기 (실시간 변경)
  const handleStylePreview = useCallback((previewStyle: Partial<TextStyle>) => {
    // 선택된 객체가 있으면 미리보기 스타일 적용
    if (selectedObject && canvasRef.current) {
      canvasRef.current.updateTextStyle(previewStyle);
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
  const handleImageUpload = useCallback(async (file: File, fillOption?: ImageFillOption) => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    try {
      await canvasRef.current.addImageFromFile(file, fillOption);
    } catch (error) {
      console.error('Image upload failed:', error);
      showAlert('업로드 실패', '이미지 업로드에 실패했습니다. 파일 형식이나 크기를 확인해주세요.', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // 이미지 URL 추가
  const handleImageUrl = useCallback(async (url: string, fillOption?: ImageFillOption) => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    try {
      await canvasRef.current.addImageFromUrl(url, fillOption);
    } catch (error) {
      console.error('Image URL loading failed:', error);
      showAlert('URL 로딩 실패', '이미지 URL 로딩에 실패했습니다. URL이 올바른지 확인해주세요.', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // 배경 이미지 파일 업로드
  const handleBackgroundImageUpload = useCallback(async (file: File, fillOption?: ImageFillOption) => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    try {
      await canvasRef.current.setBackgroundImageFromFile(file, fillOption);
      showAlert('배경 설정 완료', '배경 이미지가 성공적으로 설정되었습니다!', 'success');
    } catch (error) {
      console.error('Background image upload failed:', error);
      showAlert('배경 설정 실패', '배경 이미지 설정에 실패했습니다. 파일 형식이나 크기를 확인해주세요.', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // 배경 이미지 URL 추가
  const handleBackgroundImageUrl = useCallback(async (url: string, fillOption?: ImageFillOption) => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    try {
      await canvasRef.current.setBackgroundImageFromUrl(url, fillOption);
      showAlert('배경 설정 완료', '배경 이미지가 성공적으로 설정되었습니다!', 'success');
    } catch (error) {
      console.error('Background image URL loading failed:', error);
      showAlert('배경 설정 실패', '배경 이미지 URL 로딩에 실패했습니다. URL이 올바른지 확인해주세요.', 'danger');
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
    setBackgroundColor('#ffffff'); // 배경색 상태도 초기화
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

  // 캔버스 사이즈 변경 핸들러
  const handleCanvasSizeChange = useCallback((newSize: CanvasSize) => {
    if (!canvasRef.current) return;

    try {
      // 즉시 상태 업데이트
      setCanvasSize(newSize);

      // 캔버스 크기 변경
      canvasRef.current.changeCanvasSize(newSize.width, newSize.height);

      showAlert('크기 변경 완료', `캔버스 크기가 ${newSize.name}로 변경되었습니다.`, 'success');
    } catch (error) {
      console.error('Failed to change canvas size:', error);
      showAlert('크기 변경 실패', '캔버스 크기 변경에 실패했습니다. 다시 시도해주세요.', 'danger');
    }
  }, [showAlert]);

  // 배경색 변경 핸들러
  const handleBackgroundColorChange = useCallback((color: string) => {
    if (!canvasRef.current) return;
    
    try {
      canvasRef.current.setBackgroundColor(color);
      setBackgroundColor(color);
    } catch (error) {
      console.error('Failed to change background color:', error);
      showAlert('배경색 변경 실패', '배경색 변경에 실패했습니다. 다시 시도해주세요.', 'danger');
    }
  }, [showAlert]);

  const tabs = [
    { key: 'design', label: '디자인', icon: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )},
    { key: 'stickers', label: '스티커', icon: Sticker },
    { key: 'text', label: '편집', icon: Edit }
  ];

  // 커뮤니티 페이지 이동
  const goToCommunity = useCallback(() => {
    router.push('/community');
  }, [router]);

  // 로그인 페이지 이동
  const goToLogin = useCallback(() => {
    router.push('/auth/signin');
  }, [router]);


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

  // 선택된 템플릿이 밈코인인지 확인
  const isMemeCoinTemplate = useCallback((template: MemeTemplate | null) => {
    if (!template) return false;
    return memeCoinTemplates.some(coin => coin.id === template.id);
  }, []);

  // 선택된 밈코인 정보 가져오기
  const getSelectedMemeCoin = useCallback(() => {
    if (!selectedTemplate) return null;
    return memeCoinTemplates.find(coin => coin.id === selectedTemplate.id) || null;
  }, [selectedTemplate]);

  // 선택된 객체가 이미지인지 확인 (배경 이미지 제외)
  const isSelectedObjectImage = useCallback(() => {
    if (!selectedObject || selectedObject.type !== 'image') {
      return false;
    }

    // 배경 이미지와 템플릿 이미지는 제외
    const objectName = (selectedObject as any).name;
    if (objectName === 'canvas-background-image' || objectName === 'template-background') {
      return false;
    }

    return true;
  }, [selectedObject]);

  // 이미지 채우기 옵션 변경 핸들러
  const handleImageFillOptionChange = useCallback((fillOption: ImageFillOption) => {
    if (!canvasRef.current || !isSelectedObjectImage()) return;
    
    canvasRef.current.updateSelectedImageFill(fillOption);
    setCurrentImageFillOption(fillOption);
  }, [isSelectedObjectImage]);

  // 스티커 선택 핸들러
  const handleStickerSelect = useCallback(async (sticker: StickerType) => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    try {
      await canvasRef.current.addSticker(sticker);
    } catch (error) {
      console.error('Sticker loading failed:', error);
      showAlert('스티커 추가 실패', '스티커를 추가하는데 실패했습니다. 다시 시도해주세요.', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // 말풍선 편집 핸들러
  const handleSpeechBubbleEdit = useCallback((bubble: CanvasSpeechBubble) => {
    setSelectedSpeechBubble(bubble);
    setShowSpeechBubbleEditor(true);
  }, []);

  // 말풍선 속성 업데이트 핸들러
  const handleSpeechBubbleUpdate = useCallback((properties: any) => {
    if (!canvasRef.current || !selectedSpeechBubble) return;
    
    try {
      // updateSpeechBubble 메서드가 없다면 updateSpeechBubbleText 사용
      if (properties.text && canvasRef.current.updateSpeechBubbleText) {
        canvasRef.current.updateSpeechBubbleText(properties.text);
      }
      // 다른 속성들은 직접 객체에 적용
      if (selectedSpeechBubble.bubbleData) {
        Object.assign(selectedSpeechBubble.bubbleData, properties);
      }
      canvasRef.current.getCanvas()?.renderAll();
    } catch (error) {
      console.error('Speech bubble update failed:', error);
      showAlert('말풍선 업데이트 실패', '말풍선 속성 변경에 실패했습니다.', 'danger');
    }
  }, [selectedSpeechBubble, showAlert]);

  // 말풍선 에디터 닫기
  const handleSpeechBubbleEditorClose = useCallback(() => {
    setShowSpeechBubbleEditor(false);
    setSelectedSpeechBubble(null);
  }, []);

  // 레이어 관련 핸들러들
  const updateLayers = useCallback(() => {
    try {
      if (canvasRef.current) {
        const newLayers = canvasRef.current.getAllLayers();
        setLayers(newLayers);
      }
    } catch (error) {
      console.error('Failed to update layers:', error);
      setLayers([]); // 에러 시 빈 배열로 초기화
    }
  }, []);

  // 캔버스 객체 변경시 레이어 업데이트
  useEffect(() => {
    const timer = setInterval(updateLayers, 200); // 0.2초마다 레이어 상태 동기화 (더 빠른 반응)
    return () => clearInterval(timer);
  }, [updateLayers]);

  // 선택된 객체가 변경될 때 레이어 선택 상태 동기화
  useEffect(() => {
    if (selectedObject && canvasRef.current) {
      const currentLayers = canvasRef.current.getAllLayers();
      const matchingLayer = currentLayers.find(layer =>
        layer.id === (selectedObject as any).__uid ||
        layer.id === `layer-${currentLayers.indexOf(selectedObject)}`
      );
      if (matchingLayer && matchingLayer.id !== selectedLayerId) {
        setSelectedLayerId(matchingLayer.id);
      }
    } else if (!selectedObject && selectedLayerId) {
      setSelectedLayerId(null);
    }
  }, [selectedObject, selectedLayerId]);

  // 레이어 선택 핸들러
  const handleLayerSelect = useCallback((layerId: string) => {
    try {
      setSelectedLayerId(layerId);
      if (canvasRef.current) {
        canvasRef.current.selectLayerById(layerId);
      }
    } catch (error) {
      console.error('Failed to select layer:', error);
      setSelectedLayerId(null);
    }
  }, []);

  // 레이어 가시성 토글
  const handleLayerVisibilityToggle = useCallback((layerId: string) => {
    try {
      if (canvasRef.current) {
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
          canvasRef.current.setLayerVisibility(layerId, !layer.visible);
          updateLayers();
        }
      }
    } catch (error) {
      console.error('Failed to toggle layer visibility:', error);
    }
  }, [layers, updateLayers]);

  // 레이어 잠금 토글
  const handleLayerLockToggle = useCallback((layerId: string) => {
    try {
      if (canvasRef.current) {
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
          canvasRef.current.setLayerLock(layerId, !layer.locked);
          updateLayers();
        }
      }
    } catch (error) {
      console.error('Failed to toggle layer lock:', error);
    }
  }, [layers, updateLayers]);

  // 레이어 삭제
  const handleLayerDelete = useCallback((layerId: string) => {
    try {
      if (canvasRef.current) {
        canvasRef.current.deleteLayerById(layerId);
        updateLayers();
        if (selectedLayerId === layerId) {
          setSelectedLayerId(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete layer:', error);
    }
  }, [selectedLayerId, updateLayers]);

  // 레이어 복사
  const handleLayerDuplicate = useCallback((layerId: string) => {
    try {
      if (canvasRef.current) {
        canvasRef.current.duplicateLayerById(layerId);
        updateLayers();
      }
    } catch (error) {
      console.error('Failed to duplicate layer:', error);
    }
  }, [updateLayers]);

  // 레이어 순서 변경
  const handleLayerReorder = useCallback((layerId: string, direction: 'up' | 'down') => {
    try {
      if (canvasRef.current) {
        canvasRef.current.reorderLayer(layerId, direction);
        updateLayers();
      }
    } catch (error) {
      console.error('Failed to reorder layer:', error);
    }
  }, [updateLayers]);

  // 레이어 이름 변경
  const handleLayerRename = useCallback((layerId: string, newName: string) => {
    try {
      if (canvasRef.current) {
        canvasRef.current.renameLayer(layerId, newName);
        updateLayers();
      }
    } catch (error) {
      console.error('Failed to rename layer:', error);
    }
  }, [updateLayers]);

  // 드래그 앤 드롭 핸들러
  const handleImageDrop = useCallback((file: File) => {
    showAlert('이미지 추가 완료', `${file.name}이(가) 캔버스에 추가되었습니다!`, 'success');
    updateLayers(); // 레이어 목록 업데이트
  }, [showAlert, updateLayers]);

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
            {session ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile')}
              >
                <User size={16} className="mr-1 md:mr-2" />
                <span className="hidden sm:inline">{session.user?.name || '프로필'}</span>
                <span className="sm:hidden">프로필</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={goToLogin}
              >
                <LogIn size={16} className="mr-1 md:mr-2" />
                <span className="hidden sm:inline">로그인</span>
              </Button>
            )}
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
                  {activeTab === 'design' && (
                    <div className="space-y-6">
                      {/* 레이어 관리 섹션 - 상단 배치 */}
                      <div>
                        <LayerPanel
                          layers={layers}
                          selectedLayerId={selectedLayerId}
                          onLayerSelect={handleLayerSelect}
                          onLayerVisibilityToggle={handleLayerVisibilityToggle}
                          onLayerLockToggle={handleLayerLockToggle}
                          onLayerDelete={handleLayerDelete}
                          onLayerDuplicate={handleLayerDuplicate}
                          onLayerReorder={handleLayerReorder}
                          onLayerRename={handleLayerRename}
                        />
                      </div>

                      {/* 구분선 */}
                      <div className="border-t border-gray-200"></div>

                      {/* 캔버스 스타일 섹션 */}
                      <div>
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold flex items-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" aria-hidden="true">
                              <rect width="18" height="18" x="3" y="3" rx="2"/>
                              <path d="M9 9h6v6H9z"/>
                            </svg>
                            캔버스 스타일
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {/* 캔버스 크기 조절 */}
                          <CanvasSizeControls
                            currentSize={canvasSize}
                            onSizeChange={handleCanvasSizeChange}
                            disabled={isLoading}
                          />

                          {/* 배경색 설정 */}
                          <BackgroundColorControls
                            currentColor={backgroundColor}
                            onColorChange={handleBackgroundColorChange}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* 구분선 */}
                      <div className="border-t border-gray-200"></div>

                      {/* 이미지 선택 섹션 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">이미지 선택</h3>
                        <ImageSelectorTabs
                          onImageSelect={handleImageUpload}
                          onImageUrl={handleImageUrl}
                          onBackgroundImageSelect={handleBackgroundImageUpload}
                          onBackgroundImageUrl={handleBackgroundImageUrl}
                        />
                      </div>

                      {/* 구분선 */}
                      <div className="border-t border-gray-200"></div>

                      {/* 템플릿 그리드 (카테고리별 분류) */}
                      <TemplateCategories
                        templates={availableTemplates}
                        selectedTemplate={selectedTemplate}
                        onTemplateSelect={handleTemplateSelect}
                        isLoading={isLoading || templatesLoading}
                        onSidebarClose={() => setIsSidebarOpen(false)}
                        onRefreshTemplates={refreshTemplates}
                        error={templatesError}
                      />
                    </div>
                  )}

                  {activeTab === 'stickers' && (
                    <div className="space-y-6">
                      {/* 스티커 컬렉션 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">스티커 컬렉션</h3>
                        <StickerCollection
                          onStickerSelect={handleStickerSelect}
                        />
                      </div>

                      {/* 구분선 */}
                      <div className="border-t border-gray-200"></div>

                      {/* 스티커 관리 */}
                      <div>
                        <StickerManager
                          canvas={canvasRef.current?.getCanvas() || null}
                          selectedObject={selectedObject}
                          onObjectSelect={setSelectedObject}
                          onEditSpeechBubble={handleSpeechBubbleEdit}
                        />
                      </div>

                      {/* 말풍선 에디터 (말풍선이 선택되었을 때만 표시) */}
                      {showSpeechBubbleEditor && selectedSpeechBubble && (
                        <>
                          <div className="border-t border-gray-200"></div>
                          <div>
                            <SpeechBubbleEditor
                              selectedBubble={selectedSpeechBubble}
                              onUpdate={handleSpeechBubbleUpdate}
                              onClose={handleSpeechBubbleEditorClose}
                            />
                          </div>
                        </>
                      )}
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

                      {/* 밈코인 텍스트 제안 (밈코인 템플릿이 선택되었을 때만 표시) */}
                      {isMemeCoinTemplate(selectedTemplate) && getSelectedMemeCoin() && (
                        <>
                          <div className="border-t border-gray-200"></div>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">🪙 밈코인 텍스트 제안</h3>
                            <MemeCoinTextSuggestions
                              coinId={getSelectedMemeCoin()!.id}
                              coinName={getSelectedMemeCoin()!.name}
                              onTextSelect={handleAddText}
                            />
                          </div>
                        </>
                      )}

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
                          onPreviewChange={handleStylePreview}
                          onReset={handleStyleReset}
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* 모바일 오버레이 */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black z-20"
                style={{ opacity: 0.5 }}
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* 모바일 캔버스 영역 */}
            <div className="flex-1 flex items-center justify-center bg-gray-100">
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
                  width={canvasSize.width}
                  height={canvasSize.height}
                  onSelectionChange={setSelectedObject}
                  onImageDrop={handleImageDrop}
                  className=""
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
                    {activeTab === 'design' && (
                      <div className="space-y-6">
                        {/* 레이어 관리 섹션 - 상단 배치 */}
                        <div>
                          <LayerPanel
                            layers={layers}
                            selectedLayerId={selectedLayerId}
                            onLayerSelect={handleLayerSelect}
                            onLayerVisibilityToggle={handleLayerVisibilityToggle}
                            onLayerLockToggle={handleLayerLockToggle}
                            onLayerDelete={handleLayerDelete}
                            onLayerDuplicate={handleLayerDuplicate}
                            onLayerReorder={handleLayerReorder}
                            onLayerRename={handleLayerRename}
                          />
                        </div>

                        {/* 구분선 */}
                        <div className="border-t border-gray-200"></div>

                        {/* 캔버스 스타일 섹션 */}
                        <div>
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold flex items-center mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" aria-hidden="true">
                                <rect width="18" height="18" x="3" y="3" rx="2"/>
                                <path d="M9 9h6v6H9z"/>
                              </svg>
                              캔버스 스타일
                            </h3>
                          </div>

                          <div className="space-y-4">
                            {/* 캔버스 크기 조절 */}
                            <CanvasSizeControls
                              currentSize={canvasSize}
                              onSizeChange={handleCanvasSizeChange}
                              disabled={isLoading}
                            />

                            {/* 배경색 설정 */}
                            <BackgroundColorControls
                              currentColor={backgroundColor}
                              onColorChange={handleBackgroundColorChange}
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        {/* 구분선 */}
                        <div className="border-t border-gray-200"></div>

                        {/* 이미지 선택 섹션 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">이미지 선택</h3>
                          <ImageSelectorTabs
                            onImageSelect={handleImageUpload}
                            onImageUrl={handleImageUrl}
                            onBackgroundImageSelect={handleBackgroundImageUpload}
                            onBackgroundImageUrl={handleBackgroundImageUrl}
                          />
                        </div>

                        {/* 구분선 */}
                        <div className="border-t border-gray-200"></div>

                        {/* 템플릿 그리드 (카테고리별 분류) */}
                        <TemplateCategories
                          templates={availableTemplates}
                          selectedTemplate={selectedTemplate}
                          onTemplateSelect={handleTemplateSelect}
                          isLoading={isLoading || templatesLoading}
                          onRefreshTemplates={refreshTemplates}
                          error={templatesError}
                        />
                      </div>
                    )}

                    {/* 선택된 이미지의 채우기 옵션 (이미지가 선택되었을 때만 표시) */}
                    {activeTab === 'design' && isSelectedObjectImage() && (
                      <>
                        <div className="border-t border-gray-200"></div>
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" aria-hidden="true">
                              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                              <circle cx="12" cy="13" r="3"/>
                            </svg>
                            선택된 이미지 채우기 옵션
                          </h3>
                          <ImageFillControls
                            currentFillOption={currentImageFillOption}
                            onFillOptionChange={handleImageFillOptionChange}
                            disabled={isLoading}
                          />
                        </div>
                      </>
                    )}

                    {activeTab === 'stickers' && (
                      <div className="space-y-6">
                        {/* 스티커 컬렉션 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">스티커 컬렉션</h3>
                          <StickerCollection
                            onStickerSelect={handleStickerSelect}
                          />
                        </div>

                        {/* 구분선 */}
                        <div className="border-t border-gray-200"></div>

                        {/* 스티커 관리 */}
                        <div>
                          <StickerManager
                            canvas={canvasRef.current?.getCanvas() || null}
                            selectedObject={selectedObject}
                            onObjectSelect={setSelectedObject}
                            onEditSpeechBubble={handleSpeechBubbleEdit}
                          />
                        </div>

                        {/* 말풍선 에디터 (말풍선이 선택되었을 때만 표시) */}
                        {showSpeechBubbleEditor && selectedSpeechBubble && (
                          <>
                            <div className="border-t border-gray-200"></div>
                            <div>
                              <SpeechBubbleEditor
                                selectedBubble={selectedSpeechBubble}
                                onUpdate={handleSpeechBubbleUpdate}
                                onClose={handleSpeechBubbleEditorClose}
                              />
                            </div>
                          </>
                        )}
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

                        {/* 밈코인 텍스트 제안 (밈코인 템플릿이 선택되었을 때만 표시) */}
                        {isMemeCoinTemplate(selectedTemplate) && getSelectedMemeCoin() && (
                          <>
                            <div className="border-t border-gray-200"></div>
                            <div>
                              <h3 className="text-lg font-semibold mb-4">🪙 밈코인 텍스트 제안</h3>
                              <MemeCoinTextSuggestions
                                coinId={getSelectedMemeCoin()!.id}
                                coinName={getSelectedMemeCoin()!.name}
                                onTextSelect={handleAddText}
                              />
                            </div>
                          </>
                        )}

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
                            onPreviewChange={handleStylePreview}
                            onReset={handleStyleReset}
                          />
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </>
            }
            rightPanel={
              <div className="flex flex-col h-full">
                {/* 캔버스 컨테이너 */}
                <div className="flex-1 flex items-center justify-center bg-gray-100 min-h-0">
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
                      width={canvasSize.width}
                      height={canvasSize.height}
                      onSelectionChange={setSelectedObject}
                      onImageDrop={handleImageDrop}
                      className=""
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