'use client';

import { useState } from 'react';
import { Globe, Lock, Users, Eye, Settings, Heart } from 'lucide-react';
import RadioBox from '@/components/ui/RadioBox';
import Tag from '@/components/ui/Tag';
import Button from '@/components/ui/Button';

export default function TestComponentsPage() {
  const [visibility, setVisibility] = useState('public');
  const [theme, setTheme] = useState('light');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">컴포넌트 테스트</h1>
          <p className="text-gray-600">개선된 RadioBox와 Tag 컴포넌트를 확인해보세요</p>
        </div>

        {/* RadioBox 테스트 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">RadioBox - Card 변형</h2>
          <div className="space-y-3">
            <RadioBox
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              label="공개"
              description="모든 사용자가 콘텐츠를 볼 수 있습니다"
              icon={<Globe size={20} />}
              variant="card"
            />
            
            <RadioBox
              name="visibility"
              value="private"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
              label="비공개"
              description="본인만 콘텐츠를 볼 수 있습니다"
              icon={<Lock size={20} />}
              variant="card"
            />
            
            <RadioBox
              name="visibility"
              value="friends"
              checked={visibility === 'friends'}
              onChange={() => setVisibility('friends')}
              label="친구 공개"
              description="팔로워들만 콘텐츠를 볼 수 있습니다"
              icon={<Users size={20} />}
              variant="card"
            />
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <strong>선택된 값:</strong> {visibility}
          </div>
        </div>

        {/* RadioBox 기본 변형 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">RadioBox - Default 변형</h2>
          <div className="space-y-2">
            <RadioBox
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={() => setTheme('light')}
              label="라이트 모드"
              description="밝은 테마를 사용합니다"
              icon={<Eye size={18} />}
              variant="default"
            />
            
            <RadioBox
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={() => setTheme('dark')}
              label="다크 모드"
              description="어두운 테마를 사용합니다"
              icon={<Settings size={18} />}
              variant="default"
            />
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <strong>선택된 테마:</strong> {theme}
          </div>
        </div>

        {/* Tag 테스트 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tag 컴포넌트</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">색상 변형</h3>
              <div className="flex flex-wrap gap-2">
                <Tag variant="primary">Primary Tag</Tag>
                <Tag variant="secondary">Secondary Tag</Tag>
                <Tag variant="accent">Accent Tag</Tag>
                <Tag variant="neutral">Neutral Tag</Tag>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">크기 변형</h3>
              <div className="flex items-center gap-2">
                <Tag size="sm">Small</Tag>
                <Tag size="md">Medium</Tag>
                <Tag size="lg">Large</Tag>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">제거 가능한 태그</h3>
              <div className="flex flex-wrap gap-2">
                <Tag variant="accent" removable onRemove={() => alert('태그 제거!')}>
                  #개발
                </Tag>
                <Tag variant="secondary" removable onRemove={() => alert('태그 제거!')}>
                  #디자인
                </Tag>
                <Tag variant="primary" removable onRemove={() => alert('태그 제거!')}>
                  #밈
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {/* 상호작용 테스트 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">상호작용 테스트</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
            
            <div className="flex gap-2">
              <Tag variant="accent" removable>
                <Heart size={12} className="mr-1" />
                좋아요 #{Math.floor(Math.random() * 100)}
              </Tag>
            </div>
          </div>
        </div>

        {/* 접근성 정보 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">접근성 개선사항</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 키보드 탐색 지원 (Tab, Enter, Space)</li>
            <li>• 고대비 포커스 표시</li>
            <li>• 스크린 리더 호환 라벨링</li>
            <li>• 시각적 피드백 강화 (호버, 선택 상태)</li>
            <li>• 부드러운 애니메이션 및 트랜지션</li>
          </ul>
        </div>
      </div>
    </div>
  );
}