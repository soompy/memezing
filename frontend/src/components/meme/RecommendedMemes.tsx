'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { recommendMemes, getUserData, RecommendationResult, MemeTemplate } from '@/lib/recommendationSystem';

interface RecommendedMemesProps {
  onTemplateSelect: (template: MemeTemplate) => void;
  isWelcome?: boolean;
  selectedInterests?: string[];
}

export default function RecommendedMemes({ 
  onTemplateSelect, 
  isWelcome = false,
  selectedInterests = []
}: RecommendedMemesProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [selectedInterests]);

  const loadRecommendations = () => {
    setIsLoading(true);
    
    try {
      // URL 파라미터에서 관심사를 가져오거나 로컬 스토리지에서 가져오기
      let interests = selectedInterests;
      if (interests.length === 0) {
        const userData = getUserData();
        interests = userData.interests;
      }

      // 추천 밈 생성
      const recommendedMemes = recommendMemes(interests, [], undefined, 8);
      setRecommendations(recommendedMemes);
      
      // 웰컴 메시지가 있는 경우 3초 후에 자동으로 다음 슬라이드로
      if (isWelcome && recommendedMemes.length > 0) {
        setTimeout(() => {
          setCurrentIndex(1);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, Math.ceil(recommendations.length / 4)));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(recommendations.length / 4)) % Math.max(1, Math.ceil(recommendations.length / 4)));
  };

  const handleTemplateClick = (template: MemeTemplate) => {
    onTemplateSelect(template);
    
    // 사용자 상호작용 로그 (추후 선호도 업데이트에 사용)
    try {
      const interactions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
      interactions.push({
        action: 'select_recommended',
        templateId: template.id,
        templateCategory: template.category,
        templateTags: template.tags,
        timestamp: new Date().toISOString(),
        source: 'recommendation'
      });
      localStorage.setItem('userInteractions', JSON.stringify(interactions));
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  };

  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  const visibleRecommendations = recommendations.slice(currentIndex * 4, (currentIndex + 1) * 4);
  const totalSlides = Math.ceil(recommendations.length / 4);

  return (
    <AnimatePresence>
      <motion.div
        className="mb-8 bg-gradient-to-r from-primary-50/80 to-secondary-50/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {isWelcome ? '🎉 환영합니다! 맞춤 추천 밈' : '✨ 당신을 위한 추천 밈'}
                </h3>
                <p className="text-sm">
                  {isWelcome 
                    ? '선택하신 관심사를 바탕으로 특별히 준비했어요!' 
                    : '관심사 기반으로 엄선된 템플릿을 확인해보세요'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalSlides > 1 && (
                <div className="flex items-center gap-1 text-sm">
                  <span>{currentIndex + 1}</span>
                  <span>/</span>
                  <span>{totalSlides}</span>
                </div>
              )}
              <button
                onClick={() => setIsVisible(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">맞춤 추천을 준비하고 있어요...</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* 추천 템플릿 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {visibleRecommendations.map((recommendation, index) => (
                  <motion.div
                    key={recommendation.template.id}
                    className="group cursor-pointer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    onClick={() => handleTemplateClick(recommendation.template)}
                  >
                    <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                      {/* 템플릿 이미지 */}
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={recommendation.template.imageUrl}
                          alt={recommendation.template.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        
                        {/* 추천 점수 배지 */}
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-primary-500 text-xs font-medium rounded-full shadow-lg">
                            <TrendingUp className="w-3 h-3" />
                            <span>{Math.round(recommendation.score)}</span>
                          </div>
                        </div>

                        {/* 호버 시 플레이 버튼 효과 */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-0 h-0 border-l-[6px] border-l-primary-600 border-y-[4px] border-y-transparent ml-1"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 템플릿 정보 */}
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                          {recommendation.template.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">
                            {recommendation.reason}
                          </span>
                          {recommendation.template.popularity && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Heart className="w-3 h-3" />
                              <span>{recommendation.template.popularity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 네비게이션 버튼 */}
              {totalSlides > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* 인디케이터 */}
                  <div className="flex gap-2">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentIndex 
                            ? 'bg-primary-500 w-8' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={nextSlide}
                    disabled={currentIndex === totalSlides - 1}
                    className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}

              {/* 웰컴 메시지 */}
              {isWelcome && (
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>마음에 드는 템플릿을 클릭해서 바로 시작해보세요!</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}