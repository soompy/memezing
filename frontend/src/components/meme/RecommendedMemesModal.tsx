'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, Heart, Eye, ChevronLeft, ChevronRight, Star, Zap, RefreshCw } from 'lucide-react';
import { recommendMemes, getUserData, RecommendationResult, MemeTemplate } from '@/lib/recommendationSystem';

interface RecommendedMemesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (template: MemeTemplate) => void;
  isWelcome?: boolean;
  selectedInterests?: string[];
}

export default function RecommendedMemesModal({ 
  isOpen,
  onClose, 
  onTemplateSelect, 
  isWelcome = false,
  selectedInterests = []
}: RecommendedMemesModalProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(isWelcome);

  useEffect(() => {
    if (isOpen) {
      loadRecommendations();
      // 웰컴 애니메이션 초기화
      setShowWelcomeAnimation(isWelcome);
      if (isWelcome) {
        // 3초 후 웰컴 애니메이션 종료
        setTimeout(() => {
          setShowWelcomeAnimation(false);
        }, 3000);
      }
    }
  }, [isOpen, selectedInterests, isWelcome]);

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
      const recommendedMemes = recommendMemes(interests, [], undefined, 12);
      setRecommendations(recommendedMemes);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, Math.ceil(recommendations.length / 6)));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(recommendations.length / 6)) % Math.max(1, Math.ceil(recommendations.length / 6)));
  };

  const handleTemplateClick = (template: MemeTemplate) => {
    onTemplateSelect(template);
    onClose();
    
    // 사용자 상호작용 로그
    try {
      const interactions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
      interactions.push({
        action: 'select_recommended_popup',
        templateId: template.id,
        templateCategory: template.category,
        templateTags: template.tags,
        timestamp: new Date().toISOString(),
        source: 'recommendation_modal'
      });
      localStorage.setItem('userInteractions', JSON.stringify(interactions));
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  };

  const handleRefresh = () => {
    loadRecommendations();
    setCurrentIndex(0);
  };

  if (!isOpen) return null;

  const visibleRecommendations = recommendations.slice(currentIndex * 6, (currentIndex + 1) * 6);
  const totalSlides = Math.ceil(recommendations.length / 6);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 배경 오버레이 */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* 모달 콘텐츠 */}
        <motion.div
          className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* 헤더 */}
          <div className="relative bg-gradient-to-r from-primary-500 via-secondary-400 to-accent-400 px-8 py-6 text-white overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute inset-0">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse animation-delay-1000"></div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                  animate={showWelcomeAnimation ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 2, repeat: showWelcomeAnimation ? Infinity : 0 }}
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
                <div>
                  <motion.h2 
                    className="text-2xl text-gray-900 md:text-3xl font-bold mb-1"
                    initial={isWelcome ? { scale: 0.8, opacity: 0 } : {}}
                    animate={isWelcome ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {isWelcome ? '🎉 환영합니다!' : '✨ 맞춤 추천 밈'}
                  </motion.h2>
                  <motion.p 
                    className="text-gray-900 text-lg"
                    initial={isWelcome ? { y: 10, opacity: 0 } : {}}
                    animate={isWelcome ? { y: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    {isWelcome 
                      ? '당신의 관심사를 바탕으로 특별한 밈을 준비했어요!' 
                      : '관심사 기반 맞춤 템플릿을 확인해보세요'}
                  </motion.p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  title="새로고침"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="p-8 max-h-[calc(90vh-140px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-lg text-gray-800 mb-2">맞춤 추천을 준비하고 있어요...</p>
                <p className="text-sm text-gray-700">잠시만 기다려주세요 ✨</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">추천할 밈이 없어요</h3>
                <p className="text-gray-800 mb-6">온보딩에서 관심사를 선택하시면 맞춤 추천을 받을 수 있어요!</p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-400 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                {/* 웰컴 메시지 */}
                {isWelcome && (
                  <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 rounded-2xl border border-primary-200">
                      <Star className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-primary-800">마음에 드는 템플릿을 클릭해서 바로 시작해보세요!</span>
                      <Zap className="w-5 h-5 text-secondary-600" />
                    </div>
                  </motion.div>
                )}

                {/* 추천 템플릿 그리드 */}
                <div className="relative">
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
                    key={currentIndex} // 슬라이드 변경 시 애니메이션 재실행
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {visibleRecommendations.map((recommendation, index) => (
                      <motion.div
                        key={`${recommendation.template.id}-${currentIndex}`}
                        className="group cursor-pointer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTemplateClick(recommendation.template)}
                      >
                        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                          {/* 템플릿 이미지 */}
                          <div className="aspect-square relative overflow-hidden">
                            <img
                              src={recommendation.template.imageUrl}
                              alt={recommendation.template.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* 추천 점수 배지 */}
                            <div className="absolute top-3 right-3">
                              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary-500 to-secondary-400 text-white text-xs font-bold rounded-full shadow-lg">
                                <TrendingUp className="w-3 h-3" />
                                <span>{Math.round(recommendation.score)}</span>
                              </div>
                            </div>

                            {/* 호버 시 플레이 버튼 */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-xl">
                                <div className="w-0 h-0 border-l-[8px] border-l-primary-600 border-y-[6px] border-y-transparent ml-1"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 템플릿 정보 */}
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-1">
                              {recommendation.template.name}
                            </h4>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-full">
                                {recommendation.reason}
                              </span>
                              {recommendation.template.popularity && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Heart className="w-3 h-3 fill-current" />
                                  <span>{recommendation.template.popularity}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* 네비게이션 버튼 */}
                  {totalSlides > 1 && (
                    <div className="flex justify-center items-center gap-6">
                      <button
                        onClick={prevSlide}
                        disabled={currentIndex === 0}
                        className="p-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                      </button>
                      
                      {/* 인디케이터 */}
                      <div className="flex gap-2">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-3 rounded-full transition-all duration-300 ${
                              index === currentIndex 
                                ? 'bg-gradient-to-r from-primary-500 to-secondary-400 w-8' 
                                : 'bg-gray-300 hover:bg-gray-400 w-3'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={nextSlide}
                        disabled={currentIndex === totalSlides - 1}
                        className="p-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-700" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 푸터 */}
          <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-800">
                총 <span className="font-semibold text-primary-700">{recommendations.length}개</span>의 추천 밈
              </div>
              <div className="flex items-center gap-3">
                {totalSlides > 1 && (
                  <div className="text-sm text-gray-700">
                    {currentIndex + 1} / {totalSlides}
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                >
                  나중에 보기
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}