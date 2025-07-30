'use client';

import { useState, useEffect } from 'react';
import { Header, Footer } from '@/components/ui';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Demo from '@/components/sections/Demo';
// import SignUpIncentive from '@/components/sections/SignUpIncentive'; // 추후 공개 예정
import CTA from '@/components/sections/CTA';
import InterestSelectionPopup from '@/components/common/InterestSelectionPopup';

export default function HomePage() {
  const [showInterestPopup, setShowInterestPopup] = useState(false);

  useEffect(() => {
    // 로그인 상태 확인 (실제로는 auth store나 session에서 확인)
    const isLoggedIn = false; // 임시로 false로 설정
    
    // 1주일간 보지 않기 설정 확인
    const dontShowUntil = localStorage.getItem('interestPopup_dontShowUntil');
    const shouldNotShow = dontShowUntil && new Date() < new Date(dontShowUntil);
    
    // 이미 관심사를 선택했는지 확인
    const hasSelectedInterests = localStorage.getItem('userInterests');
    
    // 로그인하지 않았고, 1주일간 보지 않기가 설정되지 않았고, 관심사를 선택하지 않았으면 팝업 표시
    if (!isLoggedIn && !shouldNotShow && !hasSelectedInterests) {
      // 페이지 로드 후 2초 뒤에 팝업 표시
      const timer = setTimeout(() => {
        setShowInterestPopup(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInterestConfirm = (selectedInterests: string[]) => {
    // 선택된 관심사 저장
    localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
    setShowInterestPopup(false);
    
    // 분석을 위한 이벤트 전송 (실제 구현 시)
    console.log('Selected interests:', selectedInterests);
  };

  const handleInterestSkip = () => {
    setShowInterestPopup(false);
    // 건너뛰기 이벤트 전송
    console.log('Interest selection skipped');
  };

  const handleDontShowAgain = () => {
    // 1주일간 보지 않기 설정
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    localStorage.setItem('interestPopup_dontShowUntil', oneWeekLater.toISOString());
    
    setShowInterestPopup(false);
    console.log('Interest popup disabled for 1 week');
  };

  const handlePopupClose = () => {
    // 일반적인 닫기는 아무것도 저장하지 않음 (다음 방문 시 다시 표시)
    setShowInterestPopup(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Demo />
        {/* <SignUpIncentive /> */} {/* 추후 공개 예정 */}
        <CTA />
      </main>
      <Footer />
      
      {/* 관심사 선택 팝업 */}
      <InterestSelectionPopup
        isOpen={showInterestPopup}
        onClose={handlePopupClose}
        onConfirm={handleInterestConfirm}
        onSkip={handleInterestSkip}
        onDontShowAgain={handleDontShowAgain}
      />
    </div>
  );
}