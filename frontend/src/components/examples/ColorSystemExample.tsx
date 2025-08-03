'use client';

import { Heart, Users, Zap } from 'lucide-react';
import { 
  PrimaryText, 
  SecondaryText, 
  MutedText,
  BrandContainer,
  GradientBackground,
  BrandButton,
  IconContainer,
  BrandCard,
  CSSVariableText,
  CSSVariableButton
} from '@/components/ui/StyledComponents/StyledComponents';

export default function ColorSystemExample() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">컬러 시스템 사용 예시</h1>
        
        {/* 1. Styled Components 사용 예시 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Styled Components 방식</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BrandContainer variant="primary">
              <IconContainer variant="primary" size="lg">
                <Heart />
              </IconContainer>
              <PrimaryText size="lg">Primary 테마</PrimaryText>
              <SecondaryText>
                이것은 primary 컬러를 사용한 컨테이너입니다.
              </SecondaryText>
              <MutedText size="sm">부가 설명 텍스트</MutedText>
              <div className="mt-4">
                <BrandButton variant="primary" size="md">
                  Primary 버튼
                </BrandButton>
              </div>
            </BrandContainer>

            <BrandContainer variant="secondary">
              <IconContainer variant="secondary" size="lg">
                <Users />
              </IconContainer>
              <PrimaryText size="lg">Secondary 테마</PrimaryText>
              <SecondaryText>
                이것은 secondary 컬러를 사용한 컨테이너입니다.
              </SecondaryText>
              <MutedText size="sm">부가 설명 텍스트</MutedText>
              <div className="mt-4">
                <BrandButton variant="secondary" size="md">
                  Secondary 버튼
                </BrandButton>
              </div>
            </BrandContainer>

            <BrandContainer variant="accent">
              <IconContainer variant="accent" size="lg">
                <Zap />
              </IconContainer>
              <PrimaryText size="lg">Accent 테마</PrimaryText>
              <SecondaryText>
                이것은 accent 컬러를 사용한 컨테이너입니다.
              </SecondaryText>
              <MutedText size="sm">부가 설명 텍스트</MutedText>
              <div className="mt-4">
                <BrandButton variant="accent" size="md">
                  Accent 버튼
                </BrandButton>
              </div>
            </BrandContainer>
          </div>
        </section>

        {/* 2. 그라디언트 배경 예시 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">2. 그라디언트 배경</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GradientBackground variant="primary">
              <h3 className="text-2xl font-bold mb-4">Primary 그라디언트</h3>
              <p className="mb-4">아름다운 그라디언트 배경을 사용한 컨테이너입니다.</p>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                투명 버튼
              </button>  
            </GradientBackground>

            <GradientBackground variant="purple">
              <h3 className="text-2xl font-bold mb-4">Purple 그라디언트</h3>
              <p className="mb-4">보라색 그라디언트 배경을 사용한 컨테이너입니다.</p>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                투명 버튼
              </button>
            </GradientBackground>
          </div>
        </section>

        {/* 3. CSS 변수 사용 예시 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">3. CSS 변수 방식</h2>
          
          <BrandCard hover>
            <CSSVariableText>CSS 변수 제목</CSSVariableText>
            <p style={{ color: 'var(--text-secondary)' }}>
              CSS 변수를 사용하면 더 유연한 테마 시스템을 구축할 수 있습니다.
            </p>
            <div className="mt-4 space-x-4">
              <CSSVariableButton>CSS 변수 버튼</CSSVariableButton>
              <button 
                style={{ 
                  background: 'var(--color-secondary-400)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                인라인 CSS 변수
              </button>
            </div>
          </BrandCard>
        </section>

        {/* 4. 버튼 사이즈 예시 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">4. 버튼 사이즈 비교</h2>
          
          <div className="space-x-4 space-y-4">
            <div>
              <BrandButton variant="primary" size="sm">Small 버튼</BrandButton>
              <BrandButton variant="primary" size="md">Medium 버튼</BrandButton>
              <BrandButton variant="primary" size="lg">Large 버튼</BrandButton>
            </div>
            <div>
              <BrandButton variant="secondary" size="sm">Small 버튼</BrandButton>
              <BrandButton variant="secondary" size="md">Medium 버튼</BrandButton>
              <BrandButton variant="secondary" size="lg">Large 버튼</BrandButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}