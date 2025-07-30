'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Clock, Users, Star, Zap, Shield, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function SignUpIncentive() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  const [liveStats, setLiveStats] = useState({
    newSignUps: 127,
    activeMakers: 1854
  });

  // 실시간 카운트다운
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 실시간 통계 업데이트
  useEffect(() => {
    const statsTimer = setInterval(() => {
      setLiveStats(prev => ({
        newSignUps: prev.newSignUps + Math.floor(Math.random() * 3),
        activeMakers: prev.activeMakers + Math.floor(Math.random() * 5)
      }));
    }, 8000);

    return () => clearInterval(statsTimer);
  }, []);

  const handleSignUp = (method: 'email' | 'google' | 'apple') => {
    // 회원가입 처리
    if (method === 'google') {
      window.location.href = '/auth/google';
    } else if (method === 'apple') {
      window.location.href = '/auth/apple';
    } else {
      window.location.href = '/register';
    }
  };

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-25 to-orange-50">
      {/* 애니메이션 배경 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-15 animate-pulse"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단: 긴급성과 FOMO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-sm mb-6 animate-pulse">
            <Clock className="w-4 h-4 mr-2" />
            런칭 기념 특별 혜택 마감 임박!
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              지금 가입하면
            </span>
            <br />
            <span className="text-gray-900">모든게 무료! 🎉</span>
          </h2>

          {/* 카운트다운 타이머 */}
          <div className="flex justify-center space-x-4 mb-8">
            {[
              { label: '시간', value: timeLeft.hours },
              { label: '분', value: timeLeft.minutes },
              { label: '초', value: timeLeft.seconds }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <div className="text-3xl font-bold text-purple-600">{item.value.toString().padStart(2, '0')}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 좌측: 혜택 및 가치 제안 */}
          <div className="space-y-8">
            {/* 즉시 혜택 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center mb-6">
                <Gift className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">가입 즉시 받는 혜택</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: '🎨', title: '프리미엄 템플릿 100개', desc: '평생 무료 이용 (정가 ₩29,000)' },
                  { icon: '🤖', title: 'AI 텍스트 생성기', desc: '바이럴 텍스트 자동 생성 (정가 ₩19,000)' },
                  { icon: '☁️', title: '무제한 클라우드 저장', desc: '언제 어디서든 접근 가능 (정가 ₩9,000)' },
                  { icon: '⚡', title: '고속 렌더링', desc: 'HD 품질 밈 3초 안에 생성 (정가 ₩15,000)' }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <span className="text-2xl">{benefit.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{benefit.title}</div>
                      <div className="text-sm text-gray-600">{benefit.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-sm text-green-700 mb-1">총 혜택 가치</div>
                  <div className="text-2xl font-bold text-green-800">₩72,000 → 무료!</div>
                </div>
              </div>
            </div>

            {/* 실시간 통계 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6">
              <h4 className="text-lg font-bold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                실시간 활동
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{liveStats.newSignUps.toLocaleString()}</div>
                  <div className="text-sm opacity-90">오늘 신규 가입자</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{liveStats.activeMakers.toLocaleString()}</div>
                  <div className="text-sm opacity-90">지금 밈 만드는 중</div>
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 가입 폼 */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                3초만에 시작하기
              </h3>
              <p className="text-gray-600">
                신용카드 불필요 • 언제든 취소 가능 • 100% 무료
              </p>
            </div>

            {/* 소셜 로그인 */}
            <div className="space-y-4 mb-6">
              <Button
                onClick={() => handleSignUp('google')}
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center space-x-3 py-4 border-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-semibold">Google로 3초 가입</span>
              </Button>

              <Button
                onClick={() => handleSignUp('apple')}
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center space-x-3 py-4 border-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C8.396 0 8.017.016 8.017.016 6.624.025 5.627.904 5.627 2.299 5.627 3.637 6.567 4.546 7.91 4.546c.386 0 .688-.025.688-.025.016 0 .016 0 .016.016 0 .386-.025.688-.025.688-.025 1.393.904 2.414 2.299 2.414 1.393 0 2.324-1.021 2.299-2.414 0 0-.025-.302-.025-.688 0-.016 0-.016.016-.016 0 0 .302.025.688.025 1.343 0 2.283-.909 2.283-2.247C15.875.904 14.878.025 13.485.016 13.485.016 13.106 0 12.017 0zm2.482 7.086c-2.872 0-5.522 2.036-5.522 5.522 0 3.486 2.65 5.522 5.522 5.522s5.522-2.036 5.522-5.522c0-3.486-2.65-5.522-5.522-5.522z"/>
                </svg>
                <span className="font-semibold">Apple로 간편 가입</span>
              </Button>
            </div>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-4 text-sm text-gray-500">또는</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* 이메일 가입 */}
            <Button
              onClick={() => handleSignUp('email')}
              variant="primary"
              size="lg"
              className="w-full py-4 text-lg font-bold group"
            >
              이메일로 무료 가입하기
              <ArrowRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-1" />
            </Button>

            {/* 보안 및 신뢰성 */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                SSL 보안
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                4.9/5 평점
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                10K+ 사용자
              </div>
            </div>

            {/* 추가 동기부여 */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-semibold text-yellow-800 mb-1">
                  🚀 오늘 가입하면 추가 보너스!
                </div>
                <div className="text-xs text-yellow-700">
                  • 개인 맞춤 온보딩 세션 <br/>
                  • VIP 커뮤니티 초대 <br/>
                  • 신기능 베타 테스터 자격
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 사용자 후기 */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            이미 수많은 사람들이 밈징어와 함께하고 있어요!
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "김민수",
                role: "대학생",
                avatar: "👨‍🎓",
                comment: "수업 과제로 밈을 만들어야 했는데, 밈징어 덕분에 5분 만에 완성! 교수님도 극찬했어요 ㅋㅋ",
                rating: 5
              },
              {
                name: "박소영",
                role: "마케터",
                avatar: "👩‍💼",
                comment: "회사 SNS 운영할 때 밈징어 없으면 안 될 정도예요. 바이럴 밈 만들기가 이렇게 쉬울 줄이야!",
                rating: 5
              },
              {
                name: "이준호",
                role: "유튜버",
                avatar: "📹",
                comment: "썸네일용 밈 만들 때 항상 사용해요. 구독자들 반응이 훨씬 좋아졌어요. 강추!",
                rating: 5
              }
            ].map((review, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{review.avatar}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-600">{review.role}</div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {Array.from({length: review.rating}).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}