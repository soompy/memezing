'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Sparkles, Crown, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { Sticker, StickerCategory } from '@/types/sticker';
import { 
  STICKER_CATEGORIES, 
  getStickersByCategory, 
  getTrendingStickers, 
  searchStickers 
} from '@/data/stickerCollections';

export interface StickerCollectionProps {
  onStickerSelect: (sticker: Sticker) => void;
  selectedCategory?: string;
  showPremiumOnly?: boolean;
  className?: string;
}

const StickerCollection: React.FC<StickerCollectionProps> = ({
  onStickerSelect,
  selectedCategory = 'trending',
  showPremiumOnly = false,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSticker, setHoveredSticker] = useState<string | null>(null);

  // 현재 표시할 스티커들 계산
  const displayStickers = useMemo(() => {
    let stickers: Sticker[] = [];

    if (searchQuery.trim()) {
      // 검색 모드
      stickers = searchStickers(searchQuery);
    } else if (activeCategory === 'trending') {
      // 트렌딩 스티커
      stickers = getTrendingStickers(20);
    } else {
      // 카테고리별 스티커
      stickers = getStickersByCategory(activeCategory);
    }

    // 프리미엄 필터
    if (showPremiumOnly) {
      stickers = stickers.filter(sticker => sticker.isPremium);
    }

    return stickers.sort((a, b) => b.popularity - a.popularity);
  }, [activeCategory, searchQuery, showPremiumOnly]);

  // 카테고리 선택 핸들러
  const handleCategorySelect = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery(''); // 검색 쿼리 초기화
  }, []);

  // 스티커 선택 핸들러
  const handleStickerClick = useCallback((sticker: Sticker) => {
    onStickerSelect(sticker);
  }, [onStickerSelect]);

  // 검색 핸들러
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // 검색 시 트렌딩 카테고리로 변경
    if (query.trim()) {
      setActiveCategory('trending');
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 검색 바 */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="스티커 검색..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-1">
        {STICKER_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
              activeCategory === category.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
            }`}
            title={category.description}
          >
            <span className="text-sm">{category.icon}</span>
            <span className="hidden sm:inline">{category.name}</span>
          </button>
        ))}
      </div>

      {/* 스티커 그리드 */}
      <div className="space-y-4">
        {/* 결과 개수 및 상태 */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {searchQuery ? `"${searchQuery}" 검색 결과` : STICKER_CATEGORIES.find(c => c.id === activeCategory)?.name}
            {` (${displayStickers.length}개)`}
          </span>
          {showPremiumOnly && (
            <div className="flex items-center gap-1 text-amber-600">
              <Crown size={12} />
              <span className="text-xs">프리미엄만</span>
            </div>
          )}
        </div>

        {/* 스티커 그리드 */}
        {displayStickers.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {displayStickers.map((sticker) => (
              <div
                key={sticker.id}
                className="relative group"
                onMouseEnter={() => setHoveredSticker(sticker.id)}
                onMouseLeave={() => setHoveredSticker(null)}
              >
                {/* 스티커 버튼 */}
                <button
                  onClick={() => handleStickerClick(sticker)}
                  className="w-full aspect-square p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group relative overflow-hidden"
                  title={sticker.name}
                >
                  {/* 스티커 이미지 */}
                  <OptimizedImage
                    src={sticker.thumbnailUrl || sticker.url}
                    alt={sticker.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                    priority={false}
                    lazy={true}
                  />
                  
                  {/* 프리미엄 배지 */}
                  {sticker.isPremium && (
                    <div className="absolute top-1 right-1">
                      <Crown size={12} className="text-amber-500" />
                    </div>
                  )}

                  {/* 인기도 표시 */}
                  {sticker.popularity > 90 && (
                    <div className="absolute top-1 left-1">
                      <Sparkles size={10} className="text-orange-500" />
                    </div>
                  )}
                </button>

                {/* 호버 툴팁 */}
                {hoveredSticker === sticker.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {sticker.name}
                      {sticker.isPremium && (
                        <Crown size={10} className="inline ml-1 text-amber-400" />
                      )}
                    </div>
                    {/* 화살표 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* 결과 없음 */
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery 
                  ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                  : '스티커가 없습니다.'
                }
              </p>
              {searchQuery && (
                <p className="text-xs mt-1">다른 검색어를 시도해보세요.</p>
              )}
            </div>
            {searchQuery && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                전체 스티커 보기
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 프리미엄 알림 (무료 사용자용) */}
      {displayStickers.some(s => s.isPremium) && !showPremiumOnly && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Crown size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                프리미엄 스티커 이용 안내
              </p>
              <p className="text-xs text-amber-700 mt-1">
                일부 스티커는 프리미엄 사용자만 이용 가능합니다.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              업그레이드
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerCollection;