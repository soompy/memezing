'use client';

import { useState } from 'react';
import { Button, Input, Select, TabGroup } from '@/components/ui';

const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

export default function ComponentsPage() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [errorInput, setErrorInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">UI Components Library</h1>
            <p className="text-gray-600 mt-1">모든 UI 컴포넌트의 상태와 변형을 한 곳에서 확인할 수 있습니다.</p>
          </div>

          <div className="p-6 space-y-12">
            {/* Button Components */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Button 컴포넌트</h2>
              
              <div className="space-y-8">
                {/* Variants */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">변형 (Variants)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Button variant="primary">Primary</Button>
                      <p className="text-sm text-gray-500">기본 버튼</p>
                    </div>
                    <div className="space-y-2">
                      <Button variant="secondary">Secondary</Button>
                      <p className="text-sm text-gray-500">보조 버튼</p>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline">Outline</Button>
                      <p className="text-sm text-gray-500">아웃라인 버튼</p>
                    </div>
                    <div className="space-y-2">
                      <Button variant="ghost">Ghost</Button>
                      <p className="text-sm text-gray-500">고스트 버튼</p>
                    </div>
                    <div className="space-y-2">
                      <Button variant="white">White</Button>
                      <p className="text-sm text-gray-500">화이트 버튼</p>
                    </div>
                    <div className="space-y-2">
                      <Button variant="gradient">Gradient</Button>
                      <p className="text-sm text-gray-500">그라디언트 버튼</p>
                    </div>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">크기 (Sizes)</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="space-y-2">
                      <Button size="sm">Small</Button>
                      <p className="text-sm text-gray-500">작은 크기</p>
                    </div>
                    <div className="space-y-2">
                      <Button size="md">Medium</Button>
                      <p className="text-sm text-gray-500">보통 크기</p>
                    </div>
                    <div className="space-y-2">
                      <Button size="lg">Large</Button>
                      <p className="text-sm text-gray-500">큰 크기</p>
                    </div>
                  </div>
                </div>

                {/* States */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">상태 (States)</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="space-y-2">
                      <Button>Normal</Button>
                      <p className="text-sm text-gray-500">일반 상태</p>
                    </div>
                    <div className="space-y-2">
                      <Button disabled>Disabled</Button>
                      <p className="text-sm text-gray-500">비활성화</p>
                    </div>
                    <div className="space-y-2">
                      <Button isLoading={isLoading} onClick={handleLoadingTest}>
                        {isLoading ? '로딩 중...' : 'Loading Test'}
                      </Button>
                      <p className="text-sm text-gray-500">로딩 상태</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Input Components */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Input 컴포넌트</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">기본 상태</h3>
                    <Input
                      label="기본 입력 필드"
                      placeholder="텍스트를 입력하세요"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      helperText="도움말 텍스트입니다"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">필수 필드</h3>
                    <Input
                      label="필수 입력 필드"
                      placeholder="필수 입력 사항"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">에러 상태</h3>
                    <Input
                      label="에러가 있는 필드"
                      placeholder="에러 상태 테스트"
                      value={errorInput}
                      onChange={(e) => setErrorInput(e.target.value)}
                      error="이 필드는 필수입니다"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">비활성화 상태</h3>
                    <Input
                      label="비활성화된 필드"
                      placeholder="입력할 수 없습니다"
                      disabled
                      value="비활성화된 값"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Select Components */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select 컴포넌트</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">기본 셀렉트</h3>
                    <Select
                      label="폰트 선택"
                      options={fontOptions}
                      value={selectValue}
                      onChange={setSelectValue}
                      placeholder="폰트를 선택하세요"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">비활성화 상태</h3>
                    <Select
                      label="비활성화된 셀렉트"
                      options={fontOptions}
                      value=""
                      onChange={() => {}}
                      placeholder="선택할 수 없습니다"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Color Palette */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">컬러 팔레트</h2>
              
              {/* Main Brand Colors */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">메인 브랜드 컬러</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div 
                    className="w-full h-20 rounded-lg shadow-sm" 
                    style={{ backgroundColor: '#FF6B47' }}
                  ></div>
                  <p className="text-sm font-medium text-gray-700">Primary</p>
                  <p className="text-xs text-gray-500">#FF6B47 - 코랄 오렌지</p>
                </div>
                <div className="space-y-2">
                  <div 
                    className="w-full h-20 rounded-lg shadow-sm" 
                    style={{ backgroundColor: '#4ECDC4' }}
                  ></div>
                  <p className="text-sm font-medium text-gray-700">Secondary</p>
                  <p className="text-xs text-gray-500">#4ECDC4 - 틸 블루</p>
                </div>
                <div className="space-y-2">
                  <div 
                    className="w-full h-20 rounded-lg shadow-sm border border-gray-200" 
                    style={{ backgroundColor: '#F3F4F6' }}
                  ></div>
                  <p className="text-sm font-medium text-gray-700">Gray 100</p>
                  <p className="text-xs text-gray-500">#F3F4F6 - 배경 컬러</p>
                </div>
                <div className="space-y-2">
                  <div 
                    className="w-full h-20 rounded-lg shadow-sm" 
                    style={{ backgroundColor: '#EF4444' }}
                  ></div>
                  <p className="text-sm font-medium text-gray-700">Error Red</p>
                  <p className="text-xs text-gray-500">#EF4444 - 에러 상태</p>
                </div>
              </div>
              
              {/* Primary Color Shades */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Primary 컬러 팔레트</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#FFF5F3' }}
                    ></div>
                    <p className="text-xs text-gray-600">primary-50</p>
                    <p className="text-xs text-gray-500">#FFF5F3</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#FFD1C7' }}
                    ></div>
                    <p className="text-xs text-gray-600">primary-200</p>
                    <p className="text-xs text-gray-500">#FFD1C7</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#FF6B47' }}
                    ></div>
                    <p className="text-xs text-gray-600">primary-500</p>
                    <p className="text-xs text-gray-500">#FF6B47</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#FF4A1F' }}
                    ></div>
                    <p className="text-xs text-gray-600">primary-600</p>
                    <p className="text-xs text-gray-500">#FF4A1F</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#E6330A' }}
                    ></div>
                    <p className="text-xs text-gray-600">primary-700</p>
                    <p className="text-xs text-gray-500">#E6330A</p>
                  </div>
                </div>
              </div>
              
              {/* Secondary Color Shades */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Secondary 컬러 팔레트</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#F0FDFC' }}
                    ></div>
                    <p className="text-xs text-gray-600">secondary-50</p>
                    <p className="text-xs text-gray-500">#F0FDFC</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#B8F2ED' }}
                    ></div>
                    <p className="text-xs text-gray-600">secondary-200</p>
                    <p className="text-xs text-gray-500">#B8F2ED</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#4ECDC4' }}
                    ></div>
                    <p className="text-xs text-gray-600">secondary-400</p>
                    <p className="text-xs text-gray-500">#4ECDC4</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#1F9B92' }}
                    ></div>
                    <p className="text-xs text-gray-600">secondary-600</p>
                    <p className="text-xs text-gray-500">#1F9B92</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg shadow-sm" 
                      style={{ backgroundColor: '#1B7F78' }}
                    ></div>
                    <p className="text-xs text-gray-600">secondary-700</p>
                    <p className="text-xs text-gray-500">#1B7F78</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}