'use client';

import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui';

export default function Hero() {
  const handleGetStarted = () => {
    // 밈 생성기 페이지로 이동
    window.location.href = '/meme-generator';
  };

  const handleDemo = () => {
    // 데모 섹션으로 스크롤
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      className="relative overflow-hidden min-h-screen flex items-center"
      style={{ 
        background: 'linear-gradient(135deg, #FFF5F3 0%, #ffffff 50%, #F0FDFC 100%)' 
      }}
    >
      {/* 배경 데코레이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -right-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{ backgroundColor: '#87E8DF' }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{ backgroundColor: '#FFB3A3' }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{ backgroundColor: '#FFD93D' }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 왼쪽: 텍스트 콘텐츠 */}
          <div className="text-center lg:text-left">
            {/* 베지 배지 */}
            <div 
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: '#FFE6E0', color: '#E6330A' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              한국 문화 특화 밈 플랫폼
            </div>

            {/* 메인 헤드라인 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: '#2C3E50' }}>
              <span 
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(to right, #FF6B47, #4ECDC4)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                밈징어
              </span>
              <br />
              누구나 쉽게 밈을 만드는
              <br />
              <span className="relative">
                가장 쉬운 방법
                <div 
                  className="absolute -bottom-2 left-0 w-full h-3 -skew-y-1"
                  style={{ backgroundColor: '#FFE888' }}
                ></div>
              </span>
            </h1>

            {/* 서브 텍스트 */}
            <p className="text-xl mb-8 max-w-2xl" style={{ color: '#495057' }}>
              드래그 앤 드롭으로 간단하게! 한국 트렌드에 맞는 밈 템플릿으로 
              바이럴 콘텐츠를 5분 만에 완성하세요.
            </p>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="group"
              >
                지금 시작하기
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleDemo}
                className="group"
              >
                <Zap className="mr-2 w-5 h-5" />
                데모 보기
              </Button>
            </div>
          </div>

          {/* 오른쪽: 시각적 요소 */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 mx-auto max-w-md">
              {/* 밈 생성기 미리보기 */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C3E50' }}>
                    밈 생성기 미리보기
                  </h3>
                </div>
                
                {/* 가상의 이미지 영역 */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, rgba(255, 107, 71, 0.2) 0%, rgba(78, 205, 196, 0.2) 100%)' }}
                  ></div>
                  <div className="relative text-center">
                    <div className="text-4xl mb-2">🎭</div>
                    <div className="text-sm font-medium" style={{ color: '#495057' }}>드래그해서 업로드</div>
                  </div>
                </div>

                {/* 가상의 텍스트 입력 */}
                <div className="space-y-2">
                  <div className="h-10 bg-gray-100 rounded-lg flex items-center px-3">
                    <span className="text-sm" style={{ color: '#6B7280' }}>상단 텍스트 입력...</span>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-lg flex items-center px-3">
                    <span className="text-sm" style={{ color: '#6B7280' }}>하단 텍스트 입력...</span>
                  </div>
                </div>

                {/* 가상의 생성 버튼 */}
                <div className="pt-2">
                  <Button 
                    variant="gradient" 
                    size="lg" 
                    className="w-full"
                  >
                    밈 생성하기
                  </Button>
                </div>
              </div>
            </div>

            {/* 플로팅 엘리먼트들 */}
            <div 
              className="absolute -top-6 -left-6 w-12 h-12 rounded-full flex items-center justify-center text-xl animate-bounce"
              style={{ backgroundColor: '#FFD93D' }}
            >
              😂
            </div>
            <div 
              className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full flex items-center justify-center text-xl animate-bounce"
              style={{ backgroundColor: '#FF8B6F' }}
            >
              🔥
            </div>
            <div 
              className="absolute top-1/2 -right-8 w-8 h-8 rounded-full flex items-center justify-center text-sm animate-pulse"
              style={{ backgroundColor: '#4ECDC4' }}
            >
              ✨
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}