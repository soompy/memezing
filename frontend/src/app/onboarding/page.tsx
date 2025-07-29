'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Check, ArrowRight } from 'lucide-react';

interface Interest {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const interests: Interest[] = [
  { id: 'humor', name: '유머', emoji: '😂', description: '웃긴 밈과 농담' },
  { id: 'kpop', name: 'K-POP', emoji: '🎵', description: '아이돌과 음악 밈' },
  { id: 'drama', name: '드라마', emoji: '📺', description: 'K-드라마 밈' },
  { id: 'animals', name: '동물', emoji: '🐱', description: '귀여운 동물 밈' },
  { id: 'food', name: '음식', emoji: '🍜', description: '한국 음식 문화 밈' },
  { id: 'gaming', name: '게임', emoji: '🎮', description: '게임 관련 밈' },
  { id: 'sports', name: '스포츠', emoji: '⚽', description: '스포츠와 운동 밈' },
  { id: 'study', name: '공부', emoji: '📚', description: '학생과 직장인 밈' },
  { id: 'relationship', name: '연애', emoji: '💕', description: '연애와 관계 밈' },
  { id: 'work', name: '직장', emoji: '💼', description: '직장인 공감 밈' },
  { id: 'weather', name: '날씨', emoji: '🌦️', description: '날씨와 계절 밈' },
  { id: 'politics', name: '시사', emoji: '📰', description: '시사와 정치 밈' },
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
    
    // TODO: API 호출로 관심사 저장
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 딜레이
      router.push('/meme-generator?first=true');
    } catch (error) {
      console.error('관심사 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = currentStep === 1 || selectedInterests.length >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 진행 단계 */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step < currentStep ? <Check className="w-5 h-5" /> : step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {currentStep === 1 && (
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🎭</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              밈징어에 오신 것을 환영합니다!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              한국 문화에 특화된 밈 생성과 공유의 새로운 경험을 시작해보세요
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold text-gray-900 mb-2">쉬운 밈 생성</h3>
                <p className="text-sm text-gray-600">다양한 템플릿으로 간편하게 밈을 만들어보세요</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">🌟</div>
                <h3 className="font-semibold text-gray-900 mb-2">맞춤형 피드</h3>
                <p className="text-sm text-gray-600">당신의 관심사에 맞는 밈을 추천해드려요</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="font-semibold text-gray-900 mb-2">활발한 커뮤니티</h3>
                <p className="text-sm text-gray-600">다른 사용자들과 밈을 공유하고 소통하세요</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              관심사를 선택해주세요
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              최소 3개 이상 선택하시면 맞춤형 밈을 추천해드려요
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedInterests.includes(interest.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">{interest.emoji}</div>
                  <div className="font-semibold text-gray-900 mb-1">{interest.name}</div>
                  <div className="text-xs text-gray-500">{interest.description}</div>
                  {selectedInterests.includes(interest.id) && (
                    <div className="mt-2">
                      <Check className="w-5 h-5 text-blue-600 mx-auto" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                선택된 관심사: {selectedInterests.length}개
                {selectedInterests.length < 3 && (
                  <span className="text-red-500 ml-1">
                    (최소 3개 선택 필요)
                  </span>
                )}
              </p>
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
            className="group"
          >
            {currentStep === 1 ? '시작하기' : '완료하고 첫 밈 만들기'}
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
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