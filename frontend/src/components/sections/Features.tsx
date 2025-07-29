'use client';

import { MousePointer, Image, Share2, Palette, Clock, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: MousePointer,
    title: '드래그 앤 드롭',
    description: '복잡한 과정 없이 이미지를 끌어다 놓기만 하면 밈 제작 시작!',
    color: 'blue',
  },
  {
    icon: Image,
    title: '한국 트렌드 템플릿',
    description: '인기 드라마, K-POP, 유행어까지! 한국인이 좋아하는 밈 템플릿 제공',
    color: 'purple',
  },
  {
    icon: Share2,
    title: '즉시 공유',
    description: 'SNS 최적화 포맷으로 바로 공유하거나 고화질 다운로드',
    color: 'green',
  },
];

const stats = [
  {
    icon: Clock,
    value: '5분',
    label: '평균 제작 시간',
    description: '아이디어부터 완성까지',
  },
  {
    icon: Palette,
    value: '1,000+',
    label: '다양한 템플릿',
    description: '매주 새로운 템플릿 추가',
  },
  {
    icon: TrendingUp,
    value: '98%',
    label: '만족도',
    description: '사용자들의 높은 평가',
  },
];

const colorStyles = {
  blue: {
    bg: '#FFF5F3',
    icon: '#FF6B47',
    accent: '#FF6B47',
  },
  purple: {
    bg: '#F0FDFC',
    icon: '#4ECDC4',
    accent: '#4ECDC4',
  },
  green: {
    bg: '#FFFBEB',
    icon: '#FFD93D',
    accent: '#FFD93D',
  },
};

export default function Features() {
  return (
    <section className="py-20" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#2C3E50' }}>
            왜 밈징어를 선택해야 할까요?
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: '#495057' }}>
            복잡한 편집 프로그램은 이제 그만! 밈징어와 함께 누구나 5분 만에 바이럴 밈을 만들어보세요.
          </p>
        </div>

        {/* 주요 특징들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorStyles[feature.color as keyof typeof colorStyles];
            
            return (
              <div
                key={index}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 h-full">
                  {/* 아이콘 */}
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon className="w-8 h-8" style={{ color: colors.icon }} />
                  </div>

                  {/* 제목 */}
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                    {feature.title}
                  </h3>

                  {/* 설명 */}
                  <p className="leading-relaxed" style={{ color: '#495057' }}>
                    {feature.description}
                  </p>

                  {/* 호버 액센트 */}
                  <div 
                    className="absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"
                    style={{ backgroundColor: colors.accent }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 통계 섹션 */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: '#2C3E50' }}>
              숫자로 보는 밈징어
            </h3>
            <p className="text-lg" style={{ color: '#495057' }}>
              많은 사용자들이 밈징어와 함께 창의적인 콘텐츠를 만들고 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              
              return (
                <div key={index} className="text-center group">
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: 'linear-gradient(135deg, #FF6B47 0%, #4ECDC4 100%)' }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#2C3E50' }}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold mb-1" style={{ color: '#343A40' }}>
                    {stat.label}
                  </div>
                  <div className="text-sm" style={{ color: '#6B7280' }}>
                    {stat.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 추가 특징 그리드 */}
        <div className="mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 왼쪽: 특징 리스트 */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: '#2C3E50' }}>
                더 많은 놀라운 기능들
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    title: '텍스트 자동 완성',
                    description: 'AI가 제안하는 재미있는 텍스트로 더욱 센스있는 밈 제작',
                  },
                  {
                    title: '실시간 트렌드',
                    description: '지금 가장 인기있는 밈 템플릿과 트렌드를 실시간으로 확인',
                  },
                  {
                    title: '무제한 저장',
                    description: '만든 밈을 무제한으로 저장하고 언제든 다시 편집 가능',
                  },
                  {
                    title: '커뮤니티 공유',
                    description: '다른 사용자들과 밈을 공유하고 영감을 얻어보세요',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div 
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1"
                      style={{ background: 'linear-gradient(to right, #FF6B47, #4ECDC4)' }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1" style={{ color: '#2C3E50' }}>
                        {item.title}
                      </h4>
                      <p style={{ color: '#495057' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 오른쪽: 시각적 요소 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 relative overflow-hidden">
                {/* 배경 패턴 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500 rounded-full"></div>
                  <div className="absolute top-12 right-8 w-6 h-6 bg-purple-500 rounded-full"></div>
                  <div className="absolute bottom-8 left-12 w-4 h-4 bg-pink-500 rounded-full"></div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-yellow-500 rounded-full"></div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="relative z-10 text-center">
                  <div className="text-6xl mb-6">🎨</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    창의성에 제한 없이
                  </h4>
                  <p className="text-gray-600 mb-8">
                    상상하는 모든 밈을 자유롭게 만들어보세요. 
                    우리가 도구를 제공하면, 당신이 창의력을 발휘하세요!
                  </p>
                  
                  {/* 가상의 사용자 아바타들 */}
                  <div className="flex justify-center space-x-2">
                    {['😊', '🤔', '😎', '🥳', '😂'].map((emoji, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-lg"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    +10,000명의 크리에이터들이 함께하고 있어요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}