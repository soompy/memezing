'use client';

import { ArrowRight, Star, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';

export default function CTA() {
  const handleGetStarted = () => {
    // 회원가입 페이지로 이동
    window.location.href = '/register';
  };

  return (
    <section 
      className="py-20 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #FFF5F3 0%, #F0FDFC 50%, #FFFBEB 100%)',
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 71, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(255, 217, 61, 0.1) 0%, transparent 50%)
        `
      }}
    >
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-white rounded-full"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 메인 CTA 콘텐츠 */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ color: '#2C3E50' }}>
            지금 바로 시작해서
            <br />
            <span 
              style={{ 
                background: 'linear-gradient(135deg, #FF6B47, #4ECDC4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >바이럴 밈</span>을 만들어보세요!
          </h2>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#495057' }}>
            회원가입부터 첫 밈 완성까지 단 3분! 
            누구나 쉽게 바이럴 밈을 만들 수 있어요.
          </p>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              variant="primary"
              size="lg" 
              onClick={handleGetStarted}
              className="group"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className=""
              style={{ 
                borderColor: '#FF6B47', 
                color: '#FF6B47',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 107, 71, 0.3)'
              }}
            >
              데모 다시보기
            </Button>
          </div>

          {/* 신뢰성 지표 */}
          <div className="text-sm" style={{ color: '#6B7280' }}>
            ✓ 신용카드 필요 없음 &nbsp;&nbsp; ✓ 언제든 계정 삭제 가능 &nbsp;&nbsp; ✓ 광고 없는 깔끔한 경험
          </div>
        </div>

        {/* 사회적 증명 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Users className="w-8 h-8" style={{ color: '#FF6B47' }} />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: '#2C3E50' }}>10,000+</div>
            <div style={{ color: '#6B7280' }}>활성 사용자</div>
          </div>
          
          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Star className="w-8 h-8" style={{ color: '#4ECDC4' }} />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: '#2C3E50' }}>4.9/5</div>
            <div style={{ color: '#6B7280' }}>사용자 만족도</div>
          </div>
          
          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <TrendingUp className="w-8 h-8" style={{ color: '#FFD93D' }} />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: '#2C3E50' }}>100만+</div>
            <div style={{ color: '#6B7280' }}>생성된 밈</div>
          </div>
        </div>

        {/* 추가 동기부여 */}
        <div 
          className="mt-16 rounded-3xl p-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#2C3E50' }}>
            🎁 런칭 기념 특별 혜택
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start space-x-4">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: '#FFFBEB', color: '#374151' }}
              >
                1
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: '#2C3E50' }}>
                  프리미엄 템플릿 무료 이용
                </div>
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  출시 기념으로 모든 프리미엄 템플릿을 무료로 제공
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: '#FFFBEB', color: '#374151' }}
              >
                2
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: '#2C3E50' }}>
                  AI 텍스트 제안 기능
                </div>
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  AI가 상황에 맞는 재미있는 텍스트를 자동으로 제안
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: '#FFFBEB', color: '#374151' }}
              >
                3
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: '#2C3E50' }}>
                  무제한 클라우드 저장
                </div>
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  만든 밈을 무제한으로 저장하고 어디서든 접근
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: '#FFFBEB', color: '#374151' }}
              >
                4
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: '#2C3E50' }}>
                  우선 고객지원
                </div>
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  문의사항이 있을 때 최우선으로 빠른 답변 제공
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div 
              className="inline-block px-4 py-2 rounded-full font-bold text-sm"
              style={{ backgroundColor: '#FFFBEB', color: '#374151' }}
            >
              ⏰ 한정 시간 혜택 - 놓치지 마세요!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}