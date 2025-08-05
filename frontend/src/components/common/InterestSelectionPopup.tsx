'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { Heart, Users, Coffee, Music, Camera, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui';

interface Interest {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number; color?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
}

const interests: Interest[] = [
  { id: 'daily', label: '일상/라이프', icon: Heart, color: '#ec4899', bgColor: '#fdf2f8' },
  { id: 'social', label: '소셜/친구', icon: Users, color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'cafe', label: '카페/맛집', icon: Coffee, color: '#d97706', bgColor: '#fffbeb' },
  { id: 'music', label: '음악/엔터', icon: Music, color: '#dc2626', bgColor: '#fef2f2' },
  { id: 'photo', label: '사진/여행', icon: Camera, color: '#16a34a', bgColor: '#f0fdf4' },
  { id: 'work', label: '직장/업무', icon: Briefcase, color: '#4b5563', bgColor: '#f9fafb' },
  { id: 'study', label: '학습/교육', icon: GraduationCap, color: '#4f46e5', bgColor: '#eef2ff' },
  { id: 'trend', label: '트렌드/이슈', icon: Sparkles, color: '#ea580c', bgColor: '#fff7ed' }
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
      size="md"
      showCloseButton={false}
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <Container>
        <Header>
          <Title>어떤 밈에 관심있으세요?</Title>
          <Description>
            관심사를 선택하면 더욱 재미있고<br/>
            개인화된 밈 템플릿을 추천해드려요!
          </Description>
        </Header>

        <InterestsContainer>
          <InterestsGrid>
            {interests.map((interest) => {
              const Icon = interest.icon;
              const isSelected = selectedInterests.includes(interest.id);
              
              return (
                <InterestButton
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  isSelected={isSelected}
                  bgColor={interest.bgColor}
                >
                  {isSelected && (
                    <SelectedBadge>
                      <span>✓</span>
                    </SelectedBadge>
                  )}
                  
                  <Icon 
                    size={32} 
                    color={isSelected ? '#E65100' : interest.color}
                    style={{ marginBottom: '0.75rem' }}
                  />
                  
                  <InterestLabel isSelected={isSelected}>
                    {interest.label}
                  </InterestLabel>
                </InterestButton>
              );
            })}
          </InterestsGrid>
        </InterestsContainer>

        {selectedInterests.length > 0 && (
          <SelectedCount>
            <p>🎉 {selectedInterests.length}개 관심사 선택됨</p>
          </SelectedCount>
        )}

        <ButtonContainer>
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

          <SubButtonContainer>
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
          </SubButtonContainer>
        </ButtonContainer>

        <InfoBox>
          <p>
            <strong>개인화 혜택:</strong> 선택하신 관심사를 바탕으로<br/>
            인기 템플릿, 트렌드 키워드, 맞춤 스타일을 우선 추천해드려요!
          </p>
        </InfoBox>
      </Container>
    </Modal>
  );
}

const Container = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  max-width: 500px;
  margin: 0 auto 2rem auto;
  
  @media (max-width: 640px) {
    max-width: 100%;
    padding: 0 0.5rem;
  }
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background: linear-gradient(to right, #f97316, #fbbf24);
  border-radius: 50%;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin: 0 0 0.75rem 0;
`;

const Description = styled.p`
  color: #4b5563;
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
`;

const InterestsContainer = styled.div`
  max-height: 24rem;
  overflow-y: auto;
  
  @media (max-width: 640px) {
    max-height: 20rem;
    padding-right: 0.25rem;
    
    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  }
`;

const InterestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 640px) {
    gap: 0.5rem;
    padding: 0.25rem;
  }
`;

const InterestButton = styled.button<{ isSelected: boolean; bgColor: string }>`
  position: relative;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 2px solid ${props => props.isSelected ? '#E65100' : '#e5e7eb'};
  background: ${props => props.isSelected ? '#f3f4f6' : props.bgColor};
  transition: all 0.2s ease;
  text-align: center;
  cursor: pointer;
  transform: ${props => props.isSelected ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${props => props.isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'};
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 640px) {
    padding: 0.75rem 0.5rem;
    min-height: 100px;
    transform: none;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
    
    @media (max-width: 640px) {
      transform: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: #E65100;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  span {
    color: white;
    font-size: 0.75rem;
  }
`;

const InterestLabel = styled.div<{ isSelected: boolean }>`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.isSelected ? '#581c87' : '#111827'};
  text-align: center;
  line-height: 1.2;
  
  @media (max-width: 640px) {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
`;

const SelectedCount = styled.div`
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  
  p {
    color: #374151;
    font-weight: 500;
    margin: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: sticky;
  bottom: 0;
  background: white;
  padding-top: 1rem;
  
  @media (max-width: 640px) {
    gap: 0.5rem;
    padding-top: 0.75rem;
  }
`;

const SubButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const InfoBox = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #eff6ff;
  border-radius: 0.5rem;
  border: 1px solid #bfdbfe;
  
  p {
    color: #1d4ed8;
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }
`;