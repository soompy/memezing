'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showWelcome, setShowWelcome] = useState(false);

  // 첫 방문자 확인 (localStorage 사용)
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedMemezing');
    if (!hasVisited && !user) {
      setShowWelcome(true);
    }
  }, [user]);

  const handleGetStarted = () => {
    localStorage.setItem('hasVisitedMemezing', 'true');
    setShowWelcome(false);
    router.push('/register');
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('hasVisitedMemezing', 'true');
    setShowWelcome(false);
  };

  return (
    <>
      {/* 첫 방문 웰컴 모달 */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black" style={{ opacity: 0.5 }}></div>
          <div className="relative bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="text-6xl mb-6">🎭</div>
            <h2 className="text-2xl font-bold text-900 mb-4">
              밈징어에 오신 것을 환영합니다!
            </h2>
            <p className="text-600 mb-8">
              한국 문화에 특화된 밈 생성과 공유 플랫폼에서 
              창의적인 여정을 시작해보세요!
            </p>
            <div className="space-y-3">
              <Button onClick={handleGetStarted} className="w-full">
                시작하기 (회원가입)
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSkipOnboarding}
                className="w-full"
              >
                둘러보기
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-900 mb-4">
              🎭 밈징어
            </h1>
            <p className="text-lg text-600">
              한국 문화 특화 밈 생성 플랫폼
            </p>
            
            {/* 로그인하지 않은 사용자를 위한 CTA */}
            {!user && (
              <div className="mt-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => router.push('/meme-generator')}>
                    🎨 밈 만들어보기
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/feed')}>
                    👀 밈 둘러보기
                  </Button>
                </div>
                <p className="text-sm text-500">
                  <button 
                    onClick={() => router.push('/register')}
                    className="text-primary hover:underline"
                  >
                    회원가입
                  </button>
                  하면 더 많은 기능을 이용할 수 있어요!
                </p>
              </div>
            )}
          </header>

        {/* 주요 기능 소개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="font-semibold text-900 mb-2">쉬운 밈 생성</h3>
            <p className="text-sm text-600">인기 템플릿이나 내 이미지로 간편하게 밈을 만들어보세요</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-semibold text-900 mb-2">고급 편집</h3>
            <p className="text-sm text-600">폰트, 색상, 크기를 자유롭게 조정하여 개성있는 밈을 완성하세요</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="font-semibold text-900 mb-2">쉬운 공유</h3>
            <p className="text-sm text-600">완성된 밈을 다운로드하거나 SNS에 바로 공유해보세요</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-lg shadow-sm px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="text-sm font-medium text-700">
                백엔드 서버
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-700">
                이미지 업로드
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-sm font-medium text-700">
                MVP 개발 중
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}