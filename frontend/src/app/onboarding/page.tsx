'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Check, Drama, Palette, Star, MessageCircle, Laugh, Music, Tv, Cat, Utensils, Gamepad2, Zap, BookOpen, Heart, Briefcase, CloudRain, Newspaper } from 'lucide-react';

interface Interest {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
}

const interests: Interest[] = [
  { id: 'humor', name: '유머', icon: Laugh, description: '웃긴 밈과 농담' },
  { id: 'kpop', name: 'K-POP', icon: Music, description: '아이돌과 음악 밈' },
  { id: 'drama', name: '드라마', icon: Tv, description: 'K-드라마 밈' },
  { id: 'animals', name: '동물', icon: Cat, description: '귀여운 동물 밈' },
  { id: 'food', name: '음식', icon: Utensils, description: '한국 음식 문화 밈' },
  { id: 'gaming', name: '게임', icon: Gamepad2, description: '게임 관련 밈' },
  { id: 'sports', name: '스포츠', icon: Zap, description: '스포츠와 운동 밈' },
  { id: 'study', name: '공부', icon: BookOpen, description: '학생과 직장인 밈' },
  { id: 'relationship', name: '연애', icon: Heart, description: '연애와 관계 밈' },
  { id: 'work', name: '직장', icon: Briefcase, description: '직장인 공감 밈' },
  { id: 'weather', name: '날씨', icon: CloudRain, description: '날씨와 계절 밈' },
  { id: 'politics', name: '시사', icon: Newspaper, description: '시사와 정치 밈' },
];

export default function Onboarding() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // 관심사가 선택된 경우 로컬 스토리지에 저장 (추후 API 연동 시 사용)
      if (selectedInterests.length > 0) {
        // 로컬 스토리지에 관심사 저장
        localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
        
        // 선호도 데이터 저장 (통계용)
        const preferencesData = selectedInterests.map(interest => ({
          category: interest,
          value: interest,
          weight: 1.0,
          source: 'onboarding'
        }));
        localStorage.setItem('userPreferences', JSON.stringify(preferencesData));
        
        // 온보딩 완료 플래그 설정
        localStorage.setItem('onboardingCompleted', 'true');
        
        // 추후 API 서버가 준비되면 사용
        /*
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/user/preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            interests: selectedInterests,
            preferences: preferencesData,
            isOnboarded: true
          }),
        });
        */
      }
      
      // 성공 시 밈 생성기로 이동 (첫 방문 플래그 포함)
      router.push('/meme-generator?first=true&welcome=true&interests=' + selectedInterests.join(','));
    } catch (error) {
      console.error('온보딩 데이터 저장 실패:', error);
      // 실패해도 온보딩은 완료하고 진행
      router.push('/meme-generator?first=true');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = currentStep === 1 || selectedInterests.length >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 relative overflow-hidden">
      {/* 배경 데코레이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-3000"></div>
      </div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* 진행 단계 */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            {[1, 2].map((step) => (
              <div key={step} className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    step < currentStep
                      ? 'bg-primary-500 text-white scale-110'
                      : step === currentStep
                      ? 'bg-primary text-white scale-110 shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {/* 현재 단계에 펄스 링 효과 */}
                {step === currentStep && (
                  <div 
                    className="absolute inset-0 rounded-full animate-ping opacity-50"
                    style={{
                      background: 'linear-gradient(to right, #9069eb, #6de0d8)'
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-400 h-2 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {currentStep === 1 && (
          <div className="text-center mb-12">
            {/* 로고 애니메이션 */}
            <div className="mb-8">
              <div className="text-6xl font-bold mb-4 animate-bounce" style={{fontFamily: "'Black Han Sans', sans-serif"}}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-400">
                  밈징
                </span>
              </div>
              <div className="flex justify-center space-x-2 mb-6">
                <div className="text-4xl animate-bounce animation-delay-100">🎉</div>
                <div className="text-4xl animate-bounce animation-delay-300">🎭</div>
                <div className="text-4xl animate-bounce animation-delay-500">✨</div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              밈징에 오신 것을 환영합니다!
            </h1>
            <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
              한국 문화에 특화된 밈 생성과 공유의 새로운 경험을 시작해보세요
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Palette size={32} className="mb-3 mx-auto text-primary-500" />
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>쉬운 밈 생성</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>다양한 템플릿으로 간편하게 밈을 만들어보세요</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Star size={32} className="mb-3 mx-auto text-secondary-500" />
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>맞춤형 피드</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>당신의 관심사에 맞는 밈을 추천해드려요</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <MessageCircle size={32} className="mb-3 mx-auto text-accent-500" />
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>활발한 커뮤니티</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>다른 사용자들과 밈을 공유하고 소통하세요</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center mb-8">
            <div className="text-5xl mb-6 animate-bounce">🎯</div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              관심사를 선택해주세요
            </h1>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              최소 3개 이상 선택하시면 맞춤형 밈을 추천해드려요
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedInterests.includes(interest.id)
                      ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-secondary-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <interest.icon size={24} className={`mb-2 mx-auto transition-colors duration-300 ${
                    selectedInterests.includes(interest.id) ? 'text-primary-600' : 'text-gray-700'
                  }`} />
                  <div className={`font-semibold mb-1 transition-colors duration-300 ${
                    selectedInterests.includes(interest.id) ? 'text-primary-700' : 'text-gray-900'
                  }`}>{interest.name}</div>
                  <div className="text-xs text-gray-500">{interest.description}</div>
                  {selectedInterests.includes(interest.id) && (
                    <div className="mt-2 animate-bounce">
                      <Check className="w-5 h-5 text-primary-600 mx-auto" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center mb-6">
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm transition-all duration-300 shadow-lg ${
                selectedInterests.length >= 3 
                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300 shadow-green-200/50' 
                  : 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-2 border-orange-300 shadow-orange-200/50'
              }`}>
                <div className="mr-2 text-lg">
                  {selectedInterests.length >= 3 ? '🎉' : '🕰️'}
                </div>
                <span className="font-medium">
                  선택된 관심사: <span className="font-bold">{selectedInterests.length}</span>개
                  {selectedInterests.length < 3 && (
                    <span className="ml-2 opacity-75">
                      (최소 3개 선택 필요)
                    </span>
                  )}
                  {selectedInterests.length >= 3 && (
                    <span className="ml-2 opacity-75">
                      ✨ 완벽해요!
                    </span>
                  )}
                </span>
              </div>
              
              {selectedInterests.length >= 3 && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    선택하신 관심사로 맞춤형 밈을 추천해드릴게요! 🎁
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                    {selectedInterests.slice(0, 5).map((interestId) => {
                      const interest = interests.find(i => i.id === interestId);
                      return interest ? (
                        <span
                          key={interestId}
                          className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-xs font-medium border border-primary-200"
                        >
                          #{interest.name}
                        </span>
                      ) : null;
                    })}
                    {selectedInterests.length > 5 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{selectedInterests.length - 5}개 더
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => currentStep === 1 ? router.push('/') : setCurrentStep(1)}
          >
            {currentStep === 1 ? '홈으로' : '이전'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            isLoading={isLoading}
            className="group bg-gradient-to-r from-primary-500 to-secondary-400 hover:from-primary-600 hover:to-secondary-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            size="lg"
          >
            {currentStep === 1 ? '시작하기' : '완료하고 첫 밈 만들기'}
          </Button>
        </div>

        {/* 건너뛰기 옵션 */}
        {currentStep === 2 && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/meme-generator')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              관심사 설정 건너뛰기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}