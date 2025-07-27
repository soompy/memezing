'use client';

import { ArrowRight, Star, Users, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CTA() {
  const handleGetStarted = () => {
    // 나중에 회원가입 페이지로 이동
    console.log('Get started clicked');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            지금 바로 시작해서
            <br />
            <span className="text-yellow-300">바이럴 밈</span>을 만들어보세요!
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            회원가입부터 첫 밈 완성까지 단 3분! 
            수천 명의 크리에이터들이 이미 밈징어와 함께하고 있어요.
          </p>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 group shadow-xl"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              데모 다시보기
            </Button>
          </div>

          {/* 신뢰성 지표 */}
          <div className="text-blue-100 text-sm">
            ✓ 신용카드 필요 없음 &nbsp;&nbsp; ✓ 언제든 계정 삭제 가능 &nbsp;&nbsp; ✓ 광고 없는 깔끔한 경험
          </div>
        </div>

        {/* 사회적 증명 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">10,000+</div>
            <div className="text-blue-100">활성 사용자</div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-blue-100">사용자 만족도</div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">100만+</div>
            <div className="text-blue-100">생성된 밈</div>
          </div>
        </div>

        {/* 추가 동기부여 */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">
            🎁 런칭 기념 특별 혜택
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-sm">
                1
              </div>
              <div>
                <div className="font-semibold text-white mb-1">
                  프리미엄 템플릿 무료 이용
                </div>
                <div className="text-blue-100 text-sm">
                  출시 기념으로 모든 프리미엄 템플릿을 무료로 제공
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-sm">
                2
              </div>
              <div>
                <div className="font-semibold text-white mb-1">
                  AI 텍스트 제안 기능
                </div>
                <div className="text-blue-100 text-sm">
                  AI가 상황에 맞는 재미있는 텍스트를 자동으로 제안
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-sm">
                3
              </div>
              <div>
                <div className="font-semibold text-white mb-1">
                  무제한 클라우드 저장
                </div>
                <div className="text-blue-100 text-sm">
                  만든 밈을 무제한으로 저장하고 어디서든 접근
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-sm">
                4
              </div>
              <div>
                <div className="font-semibold text-white mb-1">
                  우선 고객지원
                </div>
                <div className="text-blue-100 text-sm">
                  문의사항이 있을 때 최우선으로 빠른 답변 제공
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm">
              ⏰ 한정 시간 혜택 - 놓치지 마세요!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}