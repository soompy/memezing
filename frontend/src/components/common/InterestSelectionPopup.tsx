'use client';

import { useState } from 'react';
import { Heart, Users, Coffee, Music, Camera, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui';

interface Interest {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const interests: Interest[] = [
  { id: 'daily', label: '일상/라이프', icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-50 hover:bg-pink-100' },
  { id: 'social', label: '소셜/친구', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  { id: 'cafe', label: '카페/맛집', icon: Coffee, color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100' },
  // { id: 'gaming', label: '게임/오락', icon: GameController2, color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
  { id: 'music', label: '음악/엔터', icon: Music, color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100' },
  { id: 'photo', label: '사진/여행', icon: Camera, color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100' },
  { id: 'work', label: '직장/업무', icon: Briefcase, color: 'text-gray-600', bgColor: 'bg-gray-50 hover:bg-gray-100' },
  { id: 'study', label: '학습/교육', icon: GraduationCap, color: 'text-indigo-600', bgColor: 'bg-indigo-50 hover:bg-indigo-100' },
  { id: 'trend', label: '트렌드/이슈', icon: Sparkles, color: 'text-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100' }
];

interface InterestSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedInterests: string[]) => void;
  onSkip: () => void;
  onDontShowAgain: () => void;
}

export default function InterestSelectionPopup({
  isOpen,
  onClose,
  onConfirm,
  onSkip,
  onDontShowAgain
}: InterestSelectionPopupProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedInterests);
    setSelectedInterests([]);
  };

  const handleSkip = () => {
    onSkip();
    setSelectedInterests([]);
  };

  const handleDontShowAgain = () => {
    onDontShowAgain();
    setSelectedInterests([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      closeOnOverlayClick={true}
      closeOnEscape={true}
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="text-center mb-8">
        {/* 아이콘과 제목 */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            어떤 밈이 관심있으세요?
          </h2>
          <p className="text-gray-600 text-lg">
            관심사를 선택하면 더욱 재미있고 <br/>
            개인화된 밈 템플릿을 추천해드려요!
          </p>
        </div>

        {/* 관심사 선택 영역 */}
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {interests.map((interest) => {
              const Icon = interest.icon;
              const isSelected = selectedInterests.includes(interest.id);
              
              return (
                <button
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${isSelected 
                      ? 'border-purple-500 bg-purple-50 shadow-md transform scale-105' 
                      : `border-gray-200 ${interest.bgColor}`
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  
                  <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-purple-600' : interest.color}`} />
                  
                  <div className={`font-semibold text-sm ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                    {interest.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 선택된 관심사 개수 표시 */}
        {selectedInterests.length > 0 && (
          <div className="mb-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-purple-700 font-medium">
              🎉 {selectedInterests.length}개 관심사 선택됨
            </p>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="space-y-3">
          {/* 메인 확인 버튼 */}
          <Button
            onClick={handleConfirm}
            disabled={selectedInterests.length === 0}
            className="w-full py-2 text-sm font-semibold"
            size="sm"
          >
            {selectedInterests.length > 0 
              ? `선택 완료 (${selectedInterests.length}개)` 
              : '관심사를 선택해주세요'
            }
          </Button>

          {/* 부가 옵션 버튼들 */}
          <div className="flex gap-2">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="flex-1 py-2 text-sm"
              size="sm"
            >
              건너뛰기
            </Button>
            
            <Button
              onClick={handleDontShowAgain}
              variant="secondary"
              className="flex-1 py-2 text-sm"
              size="sm"
            >
              1주일간 보지 않기
            </Button>
          </div>
        </div>

        {/* 추가 안내 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700 text-sm leading-relaxed">
            💡 <strong>개인화 혜택:</strong> 선택하신 관심사를 바탕으로 <br/>
            인기 템플릿, 트렌드 키워드, 맞춤 스타일을 우선 추천해드려요!
          </p>
        </div>
      </div>
    </Modal>
  );
}