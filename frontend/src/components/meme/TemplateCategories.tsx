'use client';

import React, { useState, useMemo } from 'react';
import { RefreshCw, Globe, Flag, Heart } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Button from '@/components/ui/Button';
import type { MemeTemplate } from '@/components/meme/FabricCanvas';

export type TemplateCategory = 'all' | 'korean' | 'foreign' | 'animal';

interface TemplateCategoryInfo {
  id: TemplateCategory;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const TEMPLATE_CATEGORIES: TemplateCategoryInfo[] = [
  {
    id: 'all',
    name: '전체',
    icon: <Globe size={16} />,
    description: '모든 템플릿'
  },
  {
    id: 'korean',
    name: '한국',
    icon: <Flag size={16} />,
    description: '한국 밈 템플릿'
  },
  {
    id: 'foreign',
    name: '외국',
    icon: <Globe size={16} />,
    description: '해외 밈 템플릿'
  },
  {
    id: 'animal',
    name: '동물',
    icon: <Heart size={16} />,
    description: '동물 밈 템플릿'
  }
];

interface TemplateCategoriesProps {
  templates: MemeTemplate[];
  selectedTemplate: MemeTemplate | null;
  onTemplateSelect: (template: MemeTemplate) => void;
  isLoading?: boolean;
  onSidebarClose?: () => void;
  onRefreshTemplates?: () => void;
  error?: string | null;
}

const TemplateCategories: React.FC<TemplateCategoriesProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  isLoading = false,
  onSidebarClose,
  onRefreshTemplates,
  error
}) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');

  // 템플릿을 카테고리별로 자동 분류
  const categorizeTemplate = (template: MemeTemplate): TemplateCategory => {
    // 이미 카테고리가 설정된 경우 그대로 사용
    if (template.category && template.category !== 'general') {
      return template.category;
    }

    // 태그나 이름을 기반으로 자동 분류
    const name = template.name.toLowerCase();
    const tags = template.tags?.join(' ').toLowerCase() || '';
    const combined = `${name} ${tags}`;

    // 한국 관련 키워드
    const koreanKeywords = [
      '한국', '코리아', 'korea', '김치', '불고기', '태극기', '한글',
      '서울', '부산', '강남', '청담', '홍대', '명동', '이태원',
      '아이돌', 'kpop', 'k-pop', '삼성', 'lg', '현대',
      '치킨', '라면', '소주', '맥주', '호프', '노래방',
      '무궁화', '한강', '남산', '롯데', '신라', '조선'
    ];

    // 동물 관련 키워드
    const animalKeywords = [
      'dog', 'cat', 'puppy', 'kitten', 'animal', 'pet', 'zoo',
      '강아지', '고양이', '개', '고양이', '동물', '애완동물',
      'bird', 'fish', 'rabbit', 'hamster', 'guinea pig',
      '새', '물고기', '토끼', '햄스터', '기니피그',
      'lion', 'tiger', 'elephant', 'giraffe', 'monkey',
      '사자', '호랑이', '코끼리', '기린', '원숭이',
      'panda', 'bear', 'wolf', 'fox', 'deer',
      '팬더', '곰', '늑대', '여우', '사슴'
    ];

    // 카테고리 판단
    if (koreanKeywords.some(keyword => combined.includes(keyword))) {
      return 'korean';
    }
    
    if (animalKeywords.some(keyword => combined.includes(keyword))) {
      return 'animal';
    }

    // 기본적으로 해외 템플릿으로 분류 (대부분 ImgFlip API에서 오는 템플릿들)
    return 'foreign';
  };

  // 카테고리별로 필터링된 템플릿들
  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') {
      return templates;
    }

    return templates.filter(template => {
      const category = categorizeTemplate(template);
      return category === activeCategory;
    });
  }, [templates, activeCategory]);

  const handleTemplateSelect = (template: MemeTemplate) => {
    onTemplateSelect(template);
    onSidebarClose?.();
  };

  const handleCategoryChange = (category: TemplateCategory) => {
    setActiveCategory(category);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">템플릿 선택</h3>
        {onRefreshTemplates && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRefreshTemplates}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            새로고침
          </Button>
        )}
      </div>

      {/* 카테고리 탭 */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }`}
              title={category.description}
            >
              {category.icon}
              <span>{category.name}</span>
              <span className="text-xs opacity-60">
                ({templates.filter(t => category.id === 'all' || categorizeTemplate(t) === category.id).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">템플릿을 불러오는 중...</p>
        </div>
      )}

      {/* 결과 개수 표시 */}
      {!isLoading && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            {TEMPLATE_CATEGORIES.find(c => c.id === activeCategory)?.name} 템플릿 
            <span className="font-semibold text-gray-800">({filteredTemplates.length}개)</span>
          </p>
        </div>
      )}

      {/* 템플릿 그리드 */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`relative group cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="aspect-square relative">
                  <OptimizedImage
                    src={template.url}
                    alt={template.name}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                    priority={false}
                    lazy={true}
                  />
                  
                  {/* 카테고리 배지 */}
                  <div className="absolute top-2 left-2">
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      categorizeTemplate(template) === 'korean' 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : categorizeTemplate(template) === 'animal'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {categorizeTemplate(template) === 'korean' && '🇰🇷'}
                      {categorizeTemplate(template) === 'foreign' && '🌍'}
                      {categorizeTemplate(template) === 'animal' && '🐾'}
                    </div>
                  </div>

                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="transform scale-0 group-hover:scale-100 transition-transform duration-200">
                      <div className="bg-white rounded-full p-2 shadow-lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 템플릿 이름 */}
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate" title={template.name}>
                    {template.name}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-400 mb-2">
                <Globe size={48} className="mx-auto opacity-50" />
              </div>
              <p className="text-sm text-gray-500">
                {activeCategory === 'all' 
                  ? '템플릿이 없습니다.' 
                  : `${TEMPLATE_CATEGORIES.find(c => c.id === activeCategory)?.name} 템플릿이 없습니다.`
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                새로고침을 눌러 다른 템플릿을 불러오세요.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateCategories;