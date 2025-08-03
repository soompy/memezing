'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import TabGroup from '@/components/ui/TabGroup';
import TextStyleControls, { TextStyle } from '@/components/meme/TextStyleControls';
import { Drama, ArrowLeft, Mouse, Save, Rocket, Image as ImageIcon } from 'lucide-react';

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
    id: 'expanding-brain',
    name: '확장하는 뇌',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    textBoxes: [
      { x: 200, y: 30, width: 180, height: 40, defaultText: '기본 생각' },
      { x: 200, y: 130, width: 180, height: 40, defaultText: '조금 더 발전' },
      { x: 200, y: 230, width: 180, height: 40, defaultText: '더 깊은 생각' },
      { x: 200, y: 330, width: 180, height: 40, defaultText: '천재적 발상' }
    ]
  },
  {
    id: 'surprised-pikachu',
    name: '놀란 피카츄',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
    textBoxes: [
      { x: 10, y: 20, width: 300, height: 60, defaultText: '예상치 못한 결과' },
      { x: 10, y: 320, width: 300, height: 60, defaultText: '놀라는 반응' }
    ]
  },
  {
    id: 'change-my-mind',
    name: '내 생각을 바꿔봐',
    url: 'https://i.imgflip.com/24y43o.jpg',
    textBoxes: [
      { x: 180, y: 250, width: 200, height: 80, defaultText: '논란이 될 만한 의견' }
    ]
  },
  {
    id: 'roll-safe',
    name: '현명한 선택',
    url: 'https://i.imgflip.com/1h7in3.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '실패할 수 없다면' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '애초에 시도하지 않으면 돼' }
    ]
  },
  {
    id: 'brain-before-sleep',
    name: '잠들기 전 뇌',
    url: 'https://picsum.photos/400/400?random=10&grayscale',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '하루 종일: 조용함' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '잠들 때: 온갖 생각' }
    ]
  },
  {
    id: 'modern-problems',
    name: '현대적 해결책',
    url: 'https://picsum.photos/400/400?random=11',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '현대적 문제들은' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '현대적 해결책이 필요해' }
    ]
  },
  {
    id: 'stonks',
    name: '주식 상승',
    url: 'https://picsum.photos/400/400?random=12&blur=1',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '투자했더니' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'STONKS ↗️' }
    ]
  },
  {
    id: 'success-kid',
    name: '성공한 아이',
    url: 'https://picsum.photos/400/400?random=13',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '힘든 일을 해냈을 때' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '성취감 최고!' }
    ]
  },
  {
    id: 'this-is-fine',
    name: '괜찮다는 척',
    url: 'https://picsum.photos/400/400?random=14&sepia',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '모든 게 엉망이지만' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '괜찮아, 다 괜찮아' }
    ]
  },
  {
    id: 'galaxy-brain',
    name: '갤럭시 브레인',
    url: 'https://picsum.photos/400/400?random=15&blur=2',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '일반인의 생각' },
      { x: 10, y: 120, width: 380, height: 60, defaultText: '좀 더 발전된 생각' },
      { x: 10, y: 220, width: 380, height: 60, defaultText: '천재의 생각' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '우주적 깨달음' }
    ]
  },
  {
    id: 'money-printer',
    name: '돈 인쇄기',
    url: 'https://picsum.photos/400/400?random=16',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '경제 위기가 오면' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '돈을 더 찍으면 돼!' }
    ]
  },
  {
    id: 'internet-explorer',
    name: '인터넷 익스플로러',
    url: 'https://picsum.photos/400/400?random=17&grayscale',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '2023년 트렌드를' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '이제야 발견했어!' }
    ]
  },
  {
    id: 'coffin-dance',
    name: '관 춤',
    url: 'https://picsum.photos/400/400?random=18',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '위험한 일을 할 때' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '미리 준비하는 것들' }
    ]
  },
  {
    id: 'lisa-simpson-presentation',
    name: '리사 심슨 발표',
    url: 'https://picsum.photos/400/400?random=19',
    textBoxes: [
      { x: 100, y: 50, width: 250, height: 100, defaultText: '중요한 사실을\n발표합니다' }
    ]
  },
  {
    id: 'monkey-puppet',
    name: '원숭이 인형',
    url: 'https://picsum.photos/400/400?random=20&blur=1',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '어색한 상황에서' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '몰래 지켜보는 중...' }
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
  },
  {
    id: 'romantic-korean',
    name: '설레는 로맨스',
    url: 'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '당신을 만나서' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '정말 행복해요' }
    ]
  },
  {
    id: 'serious-korean',
    name: '진지한 상황',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '이건 정말 심각한 문제야' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '어떻게 해결하지?' }
    ]
  },
  {
    id: 'study-pressure',
    name: '공부 스트레스',
    url: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '시험이 코앞인데...' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '아직도 할 게 많아!' }
    ]
  },
  {
    id: 'confused-korean',
    name: '당황스러운 상황',
    url: 'https://images.unsplash.com/photo-1615109398623-88346a601842?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '잠깐... 뭐라고?' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '이해가 안 가는데?' }
    ]
  },
  {
    id: 'angry-korean',
    name: '화가 난 상황',
    url: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '진짜 화가 나!' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '이럴 수가 있나?' }
    ]
  },
  {
    id: 'sad-korean',
    name: '슬픈 이별',
    url: 'https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '이제 정말 끝인가요?' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '잘 지내세요...' }
    ]
  },
  {
    id: 'jealous-korean',
    name: '질투하는 모습',
    url: 'https://images.unsplash.com/photo-1604426633861-11b2faead63c?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '저 사람이 뭐길래?' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '나보다 예쁘다고?' }
    ]
  },
  {
    id: 'happy-korean',
    name: '행복한 순간',
    url: 'https://images.unsplash.com/photo-1616391182219-e080b4d1043a?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '세상에서 제일 행복해!' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '꿈만 같아요' }
    ]
  },
  {
    id: 'workplace-korean',
    name: '직장인의 고뇌',
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '또 야근이야?' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '언제까지 이래야 하지...' }
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
  opacity: 1
};

export default function MemeGenerator() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [textInputs, setTextInputs] = useState<string[]>([]);
  const [textStyles, setTextStyles] = useState<TextStyle[]>([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [templateType, setTemplateType] = useState<'popular' | 'korean-drama' | 'upload' | 'online'>('popular');
  const [onlineTemplates, setOnlineTemplates] = useState<MemeTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [textBoxPositions, setTextBoxPositions] = useState<TextBox[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());
  const [quickEditMode, setQuickEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTextIndex, setDraggedTextIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [, setFocusedTextIndex] = useState<number>(0);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageFilter, setImageFilter] = useState('none');
  const [imageBrightness, setImageBrightness] = useState(100);
  const [imageContrast, setImageContrast] = useState(100);
  const [savedProjects, setSavedProjects] = useState<{
    id: string;
    name: string;
    template: MemeTemplate;
    templateType: string;
    textInputs: string[];
    textStyles: TextStyle[];
    textBoxPositions: TextBox[];
    imageScale: number;
    imageRotation: number;
    imageFilter: string;
    imageBrightness: number;
    imageContrast: number;
    savedAt: string;
  }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debouncedRenderRef = useRef<NodeJS.Timeout | null>(null);

  // 토스트 메시지 표시 함수
  const showErrorToast = useCallback((message: string) => {
    setError(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setTimeout(() => setError(null), 300); // 애니메이션 후 제거
    }, 4000);
  }, []);

  // 이미지 프리로딩 및 캐싱 함수
  const preloadImage = useCallback(async (imageUrl: string): Promise<HTMLImageElement> => {
    // 서버 사이드에서는 실행하지 않음
    if (typeof window === 'undefined') {
      throw new Error('preloadImage can only be called on the client side');
    }

    // 캐시에서 확인
    if (imageCache.has(imageUrl)) {
      return imageCache.get(imageUrl)!;
    }

    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
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
  }, [imageCache, setImageCache, showErrorToast]);

  // 온라인 템플릿 로드 함수
  const loadOnlineTemplates = useCallback(async () => {
    if (onlineTemplates.length > 0) return; // 이미 로드됨
    
    setIsLoadingTemplates(true);
    try {
      const response = await fetch('https://api.memegen.link/templates/');
      const templates: { id: string; name: string; blank: string; lines?: number }[] = await response.json();
      
      // 인기 있는 템플릿 선별 (25개로 제한)
      const popularTemplateIds = [
        '10guy', 'buzz', 'captain', 'drake', 'fry', 'success', 'ants', 
        'doge', 'gears', 'disastergirl', 'fine', 'keanu', 'kombucha',
        'matrix', 'money', 'older', 'pepe', 'sad-pablo', 'tenguy',
        'twobuttons', 'waiting', 'woman-cat', 'x-everywhere', 'yallgot',
        'yodawg'
      ];
      
      const filteredTemplates = templates
        .filter((template) => popularTemplateIds.includes(template.id))
        .slice(0, 25)
        .map((template) => ({
          id: template.id,
          name: template.name,
          url: template.blank,
          textBoxes: Array.from({ length: template.lines || 2 }, (_, i) => ({
            x: 10,
            y: i * 150 + 30,
            width: 300,
            height: 60,
            defaultText: `텍스트 ${i + 1}`
          }))
        }));
        
      setOnlineTemplates(filteredTemplates);
    } catch (error) {
      console.error('온라인 템플릿 로드 실패:', error);
      showErrorToast('온라인 템플릿을 불러올 수 없습니다.');
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [onlineTemplates.length, showErrorToast]);

  // 인기 템플릿과 한국 드라마 템플릿 이미지들을 미리 로딩
  useEffect(() => {
    const preloadTemplateImages = async () => {
      try {
        // 개별적으로 로딩하여 일부 실패가 전체에 영향을 주지 않도록 함
        const allTemplates = [...popularTemplates, ...koreanDramaTemplates];
        const loadPromises = allTemplates.map(async (template) => {
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
  }, [preloadImage]);

  // 키보드 단축키 핸들러
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedTemplate) return;
    
    // Ctrl/Cmd + S: 밈 다운로드 (나중에 정의될 함수)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      // generateMeme(); // 나중에 구현
      return;
    }
    
    // Tab: 텍스트 박스 간 이동
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      setSelectedTextIndex((prev) => 
        (prev + 1) % (selectedTemplate.textBoxes.length || 1)
      );
      setFocusedTextIndex((prev) => 
        (prev + 1) % (selectedTemplate.textBoxes.length || 1)
      );
      return;
    }
    
    // Shift + Tab: 역방향 텍스트 박스 이동
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      setSelectedTextIndex((prev) => 
        prev === 0 ? (selectedTemplate.textBoxes.length - 1) : prev - 1
      );
      setFocusedTextIndex((prev) => 
        prev === 0 ? (selectedTemplate.textBoxes.length - 1) : prev - 1
      );
      return;
    }
    
    // 화살표 키: 텍스트 박스 미세 조정
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const moveDistance = e.shiftKey ? 10 : 1;
      
      setTextBoxPositions(prev => {
        const newPositions = [...prev];
        if (newPositions.length === 0) return selectedTemplate.textBoxes;
        
        const currentBox = { ...newPositions[selectedTextIndex] };
        
        switch (e.key) {
          case 'ArrowUp':
            currentBox.y = Math.max(0, currentBox.y - moveDistance);
            break;
          case 'ArrowDown':
            currentBox.y = currentBox.y + moveDistance;
            break;
          case 'ArrowLeft':
            currentBox.x = Math.max(0, currentBox.x - moveDistance);
            break;
          case 'ArrowRight':
            currentBox.x = currentBox.x + moveDistance;
            break;
        }
        
        newPositions[selectedTextIndex] = currentBox;
        return newPositions;
      });
    }
  }, [selectedTemplate, selectedTextIndex]);

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 프로젝트 저장 함수
  const saveProject = useCallback(() => {
    if (!selectedTemplate) {
      showErrorToast('저장할 템플릿이 없습니다.');
      return;
    }

    const projectData = {
      id: Date.now().toString(),
      name: `밈 프로젝트 ${new Date().toLocaleString()}`,
      template: selectedTemplate,
      templateType,
      textInputs,
      textStyles,
      textBoxPositions: textBoxPositions.length > 0 ? textBoxPositions : selectedTemplate.textBoxes,
      imageScale,
      imageRotation,
      imageFilter,
      imageBrightness,
      imageContrast,
      savedAt: new Date().toISOString()
    };

    try {
      const existingProjects = JSON.parse(localStorage.getItem('memeProjects') || '[]');
      const updatedProjects = [...existingProjects, projectData];
      localStorage.setItem('memeProjects', JSON.stringify(updatedProjects));
      setSavedProjects(updatedProjects);
      showErrorToast('프로젝트가 저장되었습니다!');
    } catch (error) {
      console.error('프로젝트 저장 실패:', error);
      showErrorToast('프로젝트 저장에 실패했습니다.');
    }
  }, [selectedTemplate, templateType, textInputs, textStyles, textBoxPositions, 
      imageScale, imageRotation, imageFilter, imageBrightness, imageContrast, showErrorToast]);

  // 프로젝트 불러오기 함수
  const loadProject = useCallback((projectData: typeof savedProjects[0]) => {
    try {
      setSelectedTemplate(projectData.template);
      setTemplateType((projectData.templateType as 'popular' | 'upload' | 'online') || 'popular');
      setTextInputs(projectData.textInputs || []);
      setTextStyles(projectData.textStyles || []);
      setTextBoxPositions(projectData.textBoxPositions || []);
      setImageScale(projectData.imageScale || 1);
      setImageRotation(projectData.imageRotation || 0);
      setImageFilter(projectData.imageFilter || 'none');
      setImageBrightness(projectData.imageBrightness || 100);
      setImageContrast(projectData.imageContrast || 100);
      showErrorToast('프로젝트가 로드되었습니다!');
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      showErrorToast('프로젝트 로드에 실패했습니다.');
    }
  }, [showErrorToast]);

  // 저장된 프로젝트 로드
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('memeProjects') || '[]');
      setSavedProjects(saved);
    } catch (error) {
      console.error('저장된 프로젝트 로드 실패:', error);
    }
  }, []);

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (debouncedRenderRef.current) {
        clearTimeout(debouncedRenderRef.current);
      }
    };
  }, []);

  // 디바운싱된 렌더링 함수 - ref를 사용해서 의존성 문제 해결
  const debouncedRender = useCallback((template: MemeTemplate, texts: string[], styles: TextStyle[], delay: number = 200) => {
    // 기존 타임아웃 클리어
    if (debouncedRenderRef.current) {
      clearTimeout(debouncedRenderRef.current);
    }
    
    // 새로운 타임아웃 설정
    debouncedRenderRef.current = setTimeout(() => {
      generateMemePreview(template, texts, styles);
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTemplateSelect = useCallback((template: MemeTemplate, autoAdvance = true) => {
    setSelectedTemplate(template);
    setTextInputs(template.textBoxes.map(box => box.defaultText));
    // 각 텍스트 박스마다 기본 스타일 적용
    const newTextStyles = template.textBoxes.map(() => ({ ...defaultTextStyle }));
    setTextStyles(newTextStyles);
    setTextBoxPositions([...template.textBoxes]); // 텍스트 박스 위치 초기화
    setSelectedTextIndex(0);
    // 템플릿 선택 후 자동으로 미리보기 생성 (즉시 실행)
    debouncedRender(template, template.textBoxes.map(box => box.defaultText), newTextStyles, 100);
    // 수동으로 선택했을 때만 다음 단계로 자동 이동
    if (autoAdvance) {
      setCurrentStep(2);
    }
  }, [debouncedRender]);

  // 페이지 로드 시 기본 템플릿 자동 선택
  useEffect(() => {
    if (!selectedTemplate && popularTemplates.length > 0) {
      const defaultTemplate = popularTemplates[0];
      handleTemplateSelect(defaultTemplate, false); // autoAdvance = false로 설정
    }
  }, [selectedTemplate, handleTemplateSelect]);

  // 이미지 편집 설정 변경 시 실시간 미리보기 업데이트
  useEffect(() => {
    if (selectedTemplate) {
      debouncedRender(selectedTemplate, textInputs, textStyles, 200);
    }
  }, [selectedTemplate, textInputs, textStyles, imageScale, imageRotation, imageFilter, imageBrightness, imageContrast, debouncedRender]);


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
    // 다음 단계로 자동 이동
    setCurrentStep(2);
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
      
      // 이미지 변형 적용
      ctx.save();
      
      // 스케일링
      const scaledWidth = originalWidth * imageScale;
      const scaledHeight = originalHeight * imageScale;
      const offsetX = (originalWidth - scaledWidth) / 2;
      const offsetY = (originalHeight - scaledHeight) / 2;
      
      // 회전 적용
      if (imageRotation !== 0) {
        ctx.translate(originalWidth / 2, originalHeight / 2);
        ctx.rotate((imageRotation * Math.PI) / 180);
        ctx.translate(-originalWidth / 2, -originalHeight / 2);
      }
      
      // 필터 적용
      let filterString = '';
      if (imageBrightness !== 100) {
        filterString += `brightness(${imageBrightness}%) `;
      }
      if (imageContrast !== 100) {
        filterString += `contrast(${imageContrast}%) `;
      }
      if (imageFilter !== 'none') {
        switch (imageFilter) {
          case 'grayscale':
            filterString += 'grayscale(100%) ';
            break;
          case 'sepia':
            filterString += 'sepia(100%) ';
            break;
          case 'blur':
            filterString += 'blur(2px) ';
            break;
          case 'invert':
            filterString += 'invert(100%) ';
            break;
        }
      }
      
      if (filterString) {
        ctx.filter = filterString.trim();
      }
      
      // 변형된 이미지 그리기
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      
      ctx.restore();
      
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
            } catch {
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

  // 템플릿 재선택 함수
  const handleBackToTemplateSelection = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* 적응형 헤더 - PC에서는 더 간소화, 모바일에서는 기존 유지 */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 lg:py-4">
            <div className="flex items-center space-x-3">
              <Drama className="text-primary" size={28} />
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">밈 생성기</h1>
              {/* PC에서만 현재 단계 표시 */}
              <div className="hidden lg:flex items-center ml-8 space-x-6">
                {[
                  { step: 1, label: '템플릿 선택' },
                  { step: 2, label: '텍스트 편집' },
                  { step: 3, label: '완성 & 공유' }
                ].map(({ step, label }) => ( 
                  <div key={step} className={`flex items-center space-x-2 step-transition`}>
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium step-number ${
                        currentStep === step ? 'active animate-pulse' : ''
                      } ${currentStep > step ? 'completed' : ''} ${
                        currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                      style={currentStep === step ? {
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        boxShadow: '0 0 0 4px rgba(255, 107, 71, 0.3)'
                      } : {}}
                    >
                      {currentStep > step ? (
                        <svg className="w-3 h-3 checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    <span className={`text-sm font-medium hidden xl:block step-label ${
                      currentStep === step ? 'active' : ''
                    } ${currentStep >= step ? 'text-primary' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              {savedProjects.length > 0 && (
                <button className="p-2 text-gray-500 hover:text-primary transition-colors">
                  <Save size={20} />
                </button>
              )}
              <Button
                onClick={saveProject}
                disabled={!selectedTemplate}
                variant="primary"
                size="sm"
              >
                저장
              </Button>
            </div>
          </div>
        </div>
        
        {/* 모바일 전용 진행 표시기 */}
        <div className="lg:hidden px-4 pb-3">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-full h-1.5 rounded-full progress-bar ${
                  currentStep >= step ? 'bg-primary animating' : 'bg-gray-200'
                }`} />
                {step < 3 && <div className="w-2" />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-xs font-medium step-label ${
              currentStep === 1 ? 'active' : ''
            } ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              템플릿
            </span>
            <span className={`text-xs font-medium step-label ${
              currentStep === 2 ? 'active' : ''
            } ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              편집
            </span>
            <span className={`text-xs font-medium step-label ${
              currentStep === 3 ? 'active' : ''
            } ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              완성
            </span>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 적응형 컨테이너 */}
      <div className="flex-1">
        {/* 1단계: 템플릿 선택 */}
        {currentStep === 1 && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-3 mb-6 lg:mb-0">
                <div className="lg:sticky lg:top-24">
                  <div className="hidden lg:block mb-6">
                    <h2 className="text-xl font-bold text-text-900 mb-2">템플릿 선택</h2>
                    <p className="text-sm text-text-500">원하는 밈 템플릿을 선택하세요</p>
                  </div>
                  <div className="flex lg:flex-col items-center lg:items-stretch space-x-3 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                    <Button
                      onClick={() => setTemplateType('popular')}
                      variant={templateType === 'popular' ? 'secondary' : 'primary'}
                      className="group relative px-4 py-3 lg:px-5 lg:py-4 lg:w-full rounded-xl lg:rounded-2xl whitespace-nowrap flex items-center justify-center lg:justify-start"
                    >
                      <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center mr-0 lg:mr-3 bg-white/20">
                        <svg className="w-5 h-5 lg:w-4 lg:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="hidden lg:block">인기 템플릿</span>
                    </Button>
                    <Button
                      onClick={() => setTemplateType('korean-drama')}
                      variant={templateType === 'korean-drama' ? 'secondary' : 'primary'}
                      className="group relative px-4 py-3 lg:px-5 lg:py-4 lg:w-full rounded-xl lg:rounded-2xl whitespace-nowrap flex items-center justify-center lg:justify-start"
                    >
                      <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center mr-0 lg:mr-3 bg-white/20">
                        <Drama className="w-5 h-5 lg:w-4 lg:h-4 text-white" />
                      </div>
                      <span className="hidden lg:block">K-콘텐츠</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setTemplateType('online');
                        loadOnlineTemplates();
                      }}
                      variant={templateType === 'online' ? 'secondary' : 'primary'}
                      className="group relative px-4 py-3 lg:px-5 lg:py-4 lg:w-full rounded-xl lg:rounded-2xl whitespace-nowrap flex items-center justify-center lg:justify-start"
                    >
                      <div className={`w-10 h-10 lg:w-8 lg:h-8 rounded-lg lg:rounded-lg flex items-center justify-center mr-0 lg:mr-3 bg-white/20`}>
                        <svg className={`w-5 h-5 lg:w-4 lg:h-4 text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <span className="hidden lg:block">온라인 템플릿</span>
                    </Button>
                    <Button
                      onClick={() => setTemplateType('upload')}
                      variant={templateType === 'upload' ? 'secondary' : 'primary'}
                      className="group relative px-4 py-3 lg:px-5 lg:py-4 lg:w-full rounded-xl lg:rounded-2xl whitespace-nowrap flex items-center justify-center lg:justify-start"
                    >
                      <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center mr-0 lg:mr-3 bg-white/20">
                        <svg className="w-5 h-5 lg:w-4 lg:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="hidden lg:block">내 이미지</span>
                    </Button>
                  </div>
                  
                  {/* PC 전용 선택된 카테고리 설명 */}
                  <div className="hidden lg:block mt-6 p-4 bg-gray-50 rounded-xl">
                    {templateType === 'popular' && (
                      <div className="text-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-text-800 text-sm">인기 템플릿</h3>
                        <p className="text-xs text-text-500 mt-1">가장 많이 사용되는<br />검증된 밈 템플릿</p>
                      </div>
                    )}
                    {templateType === 'korean-drama' && (
                      <div className="text-center">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Drama className="w-4 h-4 text-red-600" />
                        </div>
                        <h3 className="font-semibold text-text-800 text-sm">K-드라마 템플릿</h3>
                        <p className="text-xs text-text-500 mt-1">인기 한국 드라마의<br />명장면으로 밈 제작</p>
                      </div>
                    )}
                    {templateType === 'online' && (
                      <div className="text-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-text-800 text-sm">온라인 템플릿</h3>
                        <p className="text-xs text-text-500 mt-1">전 세계에서 인기 있는<br />다양한 밈 템플릿</p>
                      </div>
                    )}
                    {templateType === 'upload' && (
                      <div className="text-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-text-800 text-sm">내 이미지</h3>
                        <p className="text-xs text-text-500 mt-1">개인 이미지로<br />특별한 밈 제작</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-9">
                {templateType === 'popular' && (
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg lg:text-xl font-bold text-gray-900">🔥 인기 템플릿</h2>
                      <span className="text-sm text-gray-500 hidden lg:block">{popularTemplates.length}개 템플릿</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                      {popularTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                            selectedTemplate?.id === template.id && templateType === 'popular'
                              ? 'ring-4 ring-primary shadow-2xl scale-105'
                              : 'shadow-lg hover:shadow-xl hover:scale-102'
                          }`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="aspect-square relative">
                            <Image
                              src={template.url}
                              alt={template.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-white font-semibold text-sm drop-shadow-lg">
                                {template.name}
                              </p>
                            </div>
                            {selectedTemplate?.id === template.id && templateType === 'popular' && (
                              <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {templateType === 'korean-drama' && (
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg lg:text-xl font-bold text-gray-900">🎭 K-드라마 템플릿</h2>
                      <span className="text-sm text-gray-500 hidden lg:block">{koreanDramaTemplates.length}개 템플릿</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                      {koreanDramaTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                            selectedTemplate?.id === template.id && templateType === 'korean-drama'
                              ? 'ring-4 ring-primary shadow-2xl scale-105'
                              : 'shadow-lg hover:shadow-xl hover:scale-102'
                          }`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="aspect-square relative">
                            <Image
                              src={template.url}
                              alt={template.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-white font-semibold text-sm drop-shadow-lg">
                                {template.name}
                              </p>
                            </div>
                            {selectedTemplate?.id === template.id && templateType === 'korean-drama' && (
                              <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {templateType === 'upload' && (
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg lg:text-xl font-bold text-gray-900">📷 내 이미지로 만들기</h2>
                      {uploadedImages.length > 0 && (
                        <span className="text-sm text-gray-500 hidden lg:block">{uploadedImages.length}개 이미지</span>
                      )}
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
                      <ImageUpload
                        onUpload={handleImageUpload}
                        maxSizeInMB={5}
                        className="text-center"
                      />
                    </div>
                    
                    {uploadedImages.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-800">업로드된 이미지</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                          {uploadedImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                                selectedTemplate?.url === imageUrl && templateType === 'upload'
                                  ? 'ring-4 ring-primary shadow-2xl scale-105'
                                  : 'shadow-lg hover:shadow-xl hover:scale-102'
                              }`}
                              onClick={() => handleUploadedImageSelect(imageUrl)}
                            >
                              <div className="aspect-square relative">
                                <Image
                                  src={imageUrl}
                                  alt={`업로드된 이미지 ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <p className="text-white font-semibold text-sm drop-shadow-lg">
                                    내 이미지 {index + 1}
                                  </p>
                                </div>
                                {selectedTemplate?.url === imageUrl && templateType === 'upload' && (
                                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadedImages.length === 0 && (
                      <div className="text-center py-16 lg:py-24 bg-white rounded-2xl shadow-lg">
                        <ImageIcon className="mx-auto text-gray-400 mb-4" size={64} />
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">이미지를 업로드하세요</h3>
                        <p className="text-gray-600 text-sm lg:text-base">나만의 이미지로 특별한 밈을 만들어보세요</p>
                      </div>
                    )}
                  </div>
                )}

                {templateType === 'online' && (
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg lg:text-xl font-bold text-gray-900">🌐 온라인 템플릿</h2>
                      {onlineTemplates.length > 0 && (
                        <span className="text-sm text-gray-500 hidden lg:block">{onlineTemplates.length}개 템플릿</span>
                      )}
                    </div>
                    
                    {isLoadingTemplates ? (
                      <div className="text-center py-16 lg:py-24 bg-white rounded-2xl shadow-lg">
                        <div className="inline-block animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-600 font-medium">온라인 템플릿을 불러오는 중...</p>
                        <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                        {onlineTemplates.map((template, index) => (
                          <div
                            key={`${template.id}-${index}`}
                            className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                              selectedTemplate?.id === template.id && templateType === 'online'
                                ? 'ring-4 ring-primary shadow-2xl scale-105'
                                : 'shadow-lg hover:shadow-xl hover:scale-102'
                            }`}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <div className="aspect-square relative">
                              <Image
                                src={template.url}
                                alt={template.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white font-semibold text-sm drop-shadow-lg">
                                  {template.name}
                                </p>
                              </div>
                              {selectedTemplate?.id === template.id && templateType === 'online' && (
                                <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {onlineTemplates.length === 0 && !isLoadingTemplates && (
                      <div className="text-center py-16 lg:py-24 bg-white rounded-2xl shadow-lg">
                        <div className="text-6xl mb-4">🌐</div>
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">연결 오류</h3>
                        <p className="text-gray-600 text-sm lg:text-base">온라인 템플릿을 불러올 수 없습니다</p>
                        <p className="text-gray-500 text-sm">인터넷 연결을 확인해주세요</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2단계: 편집 모드 */}
        {currentStep === 2 && selectedTemplate && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <button
              onClick={handleBackToTemplateSelection}
              className="flex items-center text-gray-600 hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              다른 템플릿 선택
            </button>

            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7 mb-6 lg:mb-0">
                <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 lg:sticky lg:top-24">
                  <h3 className="font-semibold text-gray-800 mb-4 hidden lg:block">미리보기</h3>
                  <div className="relative">
                    {isImageLoading && (
                      <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="text-sm text-gray-600">처리중...</span>
                        </div>
                      </div>
                    )}
                    <canvas
                      ref={canvasRef}
                      className="w-full max-h-80 lg:max-h-96 rounded-lg shadow-sm mx-auto block"
                      style={{ backgroundColor: 'white' }}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseLeave}
                    />
                  </div>
                  
                  <div className="hidden lg:flex items-center justify-center mt-4 text-xs text-gray-500 space-x-4">
                    <div className="flex items-center space-x-1">
                      <Mouse size={14} />
                      <span>드래그로 텍스트 이동</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>⌨️</span>
                      <span>Tab으로 텍스트 선택</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">편집 모드</h3>
                      <div className="flex bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => setQuickEditMode(false)}
                          className={`px-3 py-1.5 lg:px-4 lg:py-2 text-sm rounded-full transition-all ${
                            !quickEditMode 
                              ? 'bg-primary text-white shadow-sm' 
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          개별
                        </button>
                        <button
                          onClick={() => setQuickEditMode(true)}
                          className={`px-3 py-1.5 lg:px-4 lg:py-2 text-sm rounded-full transition-all ${
                            quickEditMode 
                              ? 'bg-primary text-white shadow-sm' 
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          전체
                        </button>
                      </div>
                    </div>

                    {!quickEditMode ? (
                      <div className="space-y-4">
                        <TabGroup
                          items={selectedTemplate.textBoxes.map((_, index) => ({
                            key: index.toString(),
                            label: `${index + 1}`
                          }))}
                          activeKey={selectedTextIndex.toString()}
                          onChange={(key) => setSelectedTextIndex(parseInt(key))}
                          variant="pills"
                        />

                        <Input
                          label={`텍스트 ${selectedTextIndex + 1}`}
                          value={textInputs[selectedTextIndex] || ''}
                          onChange={(e) => handleTextChange(selectedTextIndex, e.target.value)}
                          placeholder={selectedTemplate.textBoxes[selectedTextIndex]?.defaultText}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedTemplate.textBoxes.map((box, index) => (
                          <Input
                            key={index}
                            label={`텍스트 ${index + 1}`}
                            value={textInputs[index] || ''}
                            onChange={(e) => handleTextChange(index, e.target.value)}
                            placeholder={box.defaultText}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {!quickEditMode && textStyles.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
                      <TextStyleControls
                        style={textStyles[selectedTextIndex] || defaultTextStyle}
                        onChange={handleStyleChange}
                        onReset={handleStyleReset}
                      />
                    </div>
                  )}

                  <div className="lg:static sticky bottom-4 bg-white rounded-2xl shadow-lg p-4 lg:p-6 border lg:border-0">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      완성하기 →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3단계: 완성 */}
        {currentStep === 3 && selectedTemplate && (
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center text-gray-600 hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              편집으로 돌아가기
            </button>

            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7 mb-6 lg:mb-0">
                <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
                  <div className="flex items-center justify-center mb-4 lg:mb-6">
                    <div className="flex items-center space-x-2">
                      <Rocket className="text-primary" size={24} />
                      <h3 className="font-bold text-gray-800 text-lg lg:text-xl">완성된 밈</h3>
                    </div>
                  </div>
                  <div className="relative">
                    {isImageLoading && (
                      <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="text-sm text-gray-600">처리중...</span>
                        </div>
                      </div>
                    )}
                    <canvas
                      ref={canvasRef}
                      className="w-full max-h-80 lg:max-h-[500px] rounded-lg shadow-sm mx-auto block"
                      style={{ backgroundColor: 'white' }}
                    />
                  </div>
                  
                  <div className="hidden lg:block mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>템플릿: {selectedTemplate.name}</span>
                      <span>생성일: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 lg:mb-6">액션</h4>
                    <div className="space-y-3 lg:space-y-4">
                      <Button
                        onClick={downloadMeme}
                        disabled={isGenerating}
                        variant="secondary"
                        size="lg"
                        className="w-full"
                      >
                        다운로드
                      </Button>
                      
                      <Button
                        onClick={shareMeme}
                        disabled={isGenerating}
                        variant="primary"
                        size="lg"
                        className="w-full"
                      >
                        공유하기
                      </Button>

                      <Button
                        onClick={saveProject}
                        disabled={!selectedTemplate}
                        variant="outline"
                        size="lg"
                        className="w-full"
                      >
                        프로젝트 저장
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">다음 단계</h4>
                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          setCurrentStep(1);
                          setSelectedTemplate(null);
                          setTextInputs([]);
                          setTextStyles([]);
                        }}
                        variant="outline"
                        size="md"
                        className="w-full"
                      >
                        새 밈 만들기
                      </Button>
                      
                      <Button
                        onClick={() => window.location.href = '/feed'}
                        variant="secondary"
                        size="md"
                        className="w-full"
                      >
                        피드에서 다른 밈 보기
                      </Button>
                      
                      <Button
                        onClick={() => setCurrentStep(2)}
                        variant="ghost"
                        size="md"
                        className="w-full"
                      >
                        계속 편집하기
                      </Button>
                    </div>
                  </div>

                  <div className="lg:hidden bg-white rounded-2xl shadow-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">밈 정보</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>템플릿:</span>
                        <span>{selectedTemplate.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>생성일:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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