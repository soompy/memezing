'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { User, Image, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-900">
              안녕하세요, {user?.username}님! 👋
            </h1>
            <p className="text-600 mt-2">
              오늘도 멋진 밈을 만들어보세요!
            </p>
          </div>

          {/* 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Image className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-500">내 밈</p>
                  <p className="text-2xl font-bold text-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-500">총 조회수</p>
                  <p className="text-2xl font-bold text-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-accent" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-500">팔로워</p>
                  <p className="text-2xl font-bold text-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-500">가입일</p>
                  <p className="text-sm font-bold text-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 최근 밈 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-900">최근 만든 밈</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-900">아직 만든 밈이 없습니다</h3>
                    <p className="mt-1 text-sm text-500">
                      첫 번째 밈을 만들어보세요!
                    </p>
                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600">
                        밈 만들기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 인기 템플릿 */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-900">인기 템플릿</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {['드레이크 포인팅', '디카프리오 포인팅', '놀란 얼굴'].map((template, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🎭</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-900">{template}</p>
                          <p className="text-xs text-500">{90 + index}% 사용률</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 최근 활동 */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-900">최근 활동</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-500">
                      아직 활동이 없습니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}