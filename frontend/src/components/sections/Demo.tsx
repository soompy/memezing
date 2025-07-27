'use client';

import { useState, useEffect } from 'react';
import { Play, ArrowRight, Download, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button';

const demoSteps = [
  {
    id: 1,
    title: '이미지 업로드',
    description: '드래그 앤 드롭으로 이미지를 업로드하세요',
    image: '🖼️',
    action: '이미지 선택',
  },
  {
    id: 2,
    title: '텍스트 추가',
    description: '상단과 하단에 재미있는 텍스트를 입력하세요',
    image: '✏️',
    action: '텍스트 입력',
  },
  {
    id: 3,
    title: '스타일 설정',
    description: '폰트, 색상, 크기를 자유롭게 조정하세요',
    image: '🎨',
    action: '스타일 적용',
  },
  {
    id: 4,
    title: '완성 & 공유',
    description: '밈을 생성하고 SNS에 바로 공유하세요',
    image: '🚀',
    action: '공유하기',
  },
];

const popularTemplates = [
  {
    name: '드레이크 포인팅',
    category: '선택형',
    emoji: '👆',
    usage: '95%',
  },
  {
    name: '디카프리오 포인팅',
    category: '강조형',
    emoji: '👉',
    usage: '88%',
  },
  {
    name: '놀란 얼굴',
    category: '놀람형',
    emoji: '😲',
    usage: '92%',
  },
  {
    name: '성공한 아이',
    category: '성취형',
    emoji: '💪',
    usage: '85%',
  },
];

export default function Demo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev >= 4 ? 1 : prev + 1));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handlePlayDemo = () => {
    setIsPlaying(!isPlaying);
    setCurrentStep(1);
  };

  return (
    <section id="demo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            밈 만들기, 이렇게 쉬워요!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            복잡한 편집 프로그램 없이도 4단계만 따라하면 누구나 프로급 밈을 만들 수 있어요
          </p>
          
          <Button 
            onClick={handlePlayDemo}
            size="lg"
            className="group"
          >
            <Play className="mr-2 w-5 h-5" />
            {isPlaying ? '데모 일시정지' : '데모 플레이'}
          </Button>
        </div>

        {/* 데모 스텝 시각화 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* 왼쪽: 스텝 리스트 */}
          <div className="space-y-6">
            {demoSteps.map((step, index) => (
              <div
                key={step.id}
                className={`relative flex items-center p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
                  currentStep === step.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                {/* 스텝 번호 */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    currentStep === step.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id}
                </div>

                {/* 스텝 내용 */}
                <div className="ml-6 flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {step.description}
                  </p>
                  
                  {currentStep === step.id && (
                    <div className="inline-flex items-center text-sm font-medium text-blue-600">
                      {step.action}
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* 이모지 */}
                <div className="text-3xl">
                  {step.image}
                </div>

                {/* 연결선 */}
                {index < demoSteps.length - 1 && (
                  <div className="absolute -bottom-3 left-6 w-0.5 h-6 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>

          {/* 오른쪽: 미리보기 화면 */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
              {/* 브라우저 헤더 시뮬레이션 */}
              <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="ml-4 text-sm text-gray-400">memezing.app</div>
              </div>

              {/* 현재 스텝에 따른 미리보기 */}
              {currentStep === 1 && (
                <div className="text-center">
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 bg-gray-50">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📁</div>
                      <div className="text-gray-500">이미지를 드래그하세요</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    또는 파일 선택
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center relative">
                    <div className="absolute top-2 left-2 right-2 bg-white/90 rounded p-2 text-center text-sm font-bold">
                      상단 텍스트 입력...
                    </div>
                    <div className="text-2xl">🖼️</div>
                    <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded p-2 text-center text-sm font-bold">
                      하단 텍스트 입력...
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="p-2 border rounded text-sm" placeholder="상단 텍스트" />
                    <input className="p-2 border rounded text-sm" placeholder="하단 텍스트" />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center relative">
                    <div className="absolute top-2 left-2 right-2 bg-black/80 text-white rounded p-2 text-center text-sm font-bold">
                      나만의 스타일로!
                    </div>
                    <div className="text-2xl">🎨</div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-white rounded p-2 text-center text-sm font-bold">
                      완벽한 밈 완성
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 text-center">
                      <div className="text-xs text-gray-500 mb-1">폰트</div>
                      <div className="p-2 bg-gray-100 rounded text-xs">Bold</div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-xs text-gray-500 mb-1">색상</div>
                      <div className="p-2 bg-black text-white rounded text-xs">검은색</div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-xs text-gray-500 mb-1">크기</div>
                      <div className="p-2 bg-gray-100 rounded text-xs">24px</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center relative">
                    <div className="absolute top-2 left-2 right-2 bg-black/90 text-white rounded p-2 text-center text-sm font-bold">
                      내가 만든 최고의 밈!
                    </div>
                    <div className="text-2xl">✨</div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/90 text-white rounded p-2 text-center text-sm font-bold">
                      지금 바로 공유하자!
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      다운로드
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Share2 className="w-3 h-3 mr-1" />
                      공유하기
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 플로팅 인디케이터 */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentStep}/4 단계
            </div>
          </div>
        </div>

        {/* 인기 템플릿 섹션 */}
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              지금 가장 인기있는 템플릿
            </h3>
            <p className="text-lg text-gray-600">
              다른 사용자들이 가장 많이 사용하는 밈 템플릿들을 확인해보세요
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTemplates.map((template, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {template.emoji}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">
                  {template.name}
                </h4>
                <div className="text-sm text-gray-500 mb-3">
                  {template.category}
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: template.usage }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {template.usage}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline">
              모든 템플릿 보기
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}