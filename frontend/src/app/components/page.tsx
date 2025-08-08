'use client';

import { useState } from 'react';
import { Upload, Sparkles, Globe, Lock, Users, Eye, Settings, Heart, Shield, Zap } from 'lucide-react';
import { Button, Input, Select, TabGroup, SecondaryTabGroup, RangeSlider, Checkbox, RadioBox, Tag } from '@/components/ui';
import { useToastContext } from '@/context/ToastContext';

const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

const tabItems = [
  { key: 'tab1', label: '첫 번째 탭', content: '첫 번째 탭의 내용입니다.' },
  { key: 'tab2', label: '두 번째 탭', content: '두 번째 탭의 내용입니다.' },
  { key: 'tab3', label: '세 번째 탭', content: '세 번째 탭의 내용입니다.' },
];

const secondaryTabs = [
  { key: 'upload', label: '파일 업로드', icon: Upload },
  { key: 'ai', label: 'AI 생성', icon: Sparkles },
];

export default function ComponentsPage() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [errorInput, setErrorInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');
  const [secondaryActiveTab, setSecondaryActiveTab] = useState('upload');
  const [rangeValue1, setRangeValue1] = useState(50);
  const [rangeValue2, setRangeValue2] = useState(75);
  const [rangeValue3, setRangeValue3] = useState(25);
  const [checkboxValue1, setCheckboxValue1] = useState(false);
  const [checkboxValue2, setCheckboxValue2] = useState(true);
  const [checkboxValue3, setCheckboxValue3] = useState(false);
  const [checkboxValue4, setCheckboxValue4] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [privacy, setPrivacy] = useState('friends');
  const [theme, setTheme] = useState('light');
  const [plan, setPlan] = useState('basic');
  
  const { showSuccess, showError, showWarning, showInfo } = useToastContext();

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
      <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                      <h1 className="text-2xl font-bold text-gray-900">
                          UI Components Library
                      </h1>
                      <p className="text-gray-600 mt-1">
                          모든 UI 컴포넌트의 상태와 변형을 한 곳에서 확인할 수
                          있습니다.
                      </p>
                  </div>

                  <div className="p-6 space-y-12">
                      {/* Button Components */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              Button 컴포넌트
                          </h2>

                          <div className="space-y-8">
                              {/* Variants */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      변형 (Variants)
                                  </h3>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Button variant="primary">
                                              Primary
                                          </Button>
                                          <p className="text-sm text-gray-500">
                                              기본 버튼
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Button variant="secondary">
                                              Secondary
                                          </Button>
                                          <p className="text-sm text-gray-500">
                                              보조 버튼
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Button variant="outline">
                                              Outline
                                          </Button>
                                          <p className="text-sm text-gray-500">
                                              아웃라인 버튼
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Button variant="ghost">Ghost</Button>
                                          <p className="text-sm text-gray-500">
                                              고스트 버튼
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Button variant="white">White</Button>
                                          <p className="text-sm text-gray-500">
                                              화이트 버튼
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Button variant="gradient">
                                              Gradient
                                          </Button>
                                          <p className="text-sm text-gray-500">
                                              그라디언트 버튼
                                          </p>
                                      </div>
                                  </div>
                              </div>

                              {/* Sizes */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      크기 (Sizes)
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-4">
                                      <div className="space-y-2">
                                          <Button size="sm">Small</Button>
                                          <p className="text-sm text-gray-500">
                                              작은 크기
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Button size="md">Medium</Button>
                                          <p className="text-sm text-gray-500">
                                              보통 크기
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Button size="lg">Large</Button>
                                          <p className="text-sm text-gray-500">
                                              큰 크기
                                          </p>
                                      </div>
                                  </div>
                              </div>

                              {/* States */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      상태 (States)
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-4">
                                      <div className="space-y-2">
                                          <Button>Normal</Button>
                                          <p className="text-sm text-gray-500">
                                              일반 상태
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Button disabled>Disabled</Button>
                                          <p className="text-sm text-gray-500">
                                              비활성화
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Button
                                              isLoading={isLoading}
                                              onClick={handleLoadingTest}
                                          >
                                              {isLoading
                                                  ? "로딩 중..."
                                                  : "Loading Test"}
                                          </Button>
                                          <p className="text-sm text-gray-500">
                                              로딩 상태
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* Input Components */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              Input 컴포넌트
                          </h2>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                  <div>
                                      <h3 className="text-lg font-medium text-gray-700 mb-4">
                                          기본 상태
                                      </h3>
                                      <Input
                                          label="기본 입력 필드"
                                          placeholder="텍스트를 입력하세요"
                                          value={inputValue}
                                          onChange={(e) =>
                                              setInputValue(e.target.value)
                                          }
                                          helperText="도움말 텍스트입니다"
                                      />
                                  </div>

                                  <div>
                                      <h3 className="text-lg font-medium text-gray-700 mb-4">
                                          필수 필드
                                      </h3>
                                      <Input
                                          label="필수 입력 필드"
                                          placeholder="필수 입력 사항"
                                          required
                                      />
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <div>
                                      <h3 className="text-lg font-medium text-gray-700 mb-4">
                                          에러 상태
                                      </h3>
                                      <Input
                                          label="에러가 있는 필드"
                                          placeholder="에러 상태 테스트"
                                          value={errorInput}
                                          onChange={(e) =>
                                              setErrorInput(e.target.value)
                                          }
                                          error="이 필드는 필수입니다"
                                      />
                                  </div>

                                  <div>
                                      <h3 className="text-lg font-medium text-gray-700 mb-4">
                                          비활성화 상태
                                      </h3>
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
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              Select 컴포넌트
                          </h2>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                  <div>
                                      <h3 className="text-lg font-medium text-gray-700 mb-4">
                                          기본 셀렉트
                                      </h3>
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
                                      <h3 className="text-lg font-medium text-gray-700 mb-4">
                                          비활성화 상태
                                      </h3>
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

                      {/* Checkbox Components */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              Checkbox 컴포넌트
                          </h2>

                          <div className="space-y-8">
                              {/* Variants */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      변형 (Variants)
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="space-y-4">
                                          <h4 className="font-medium text-gray-600">Primary</h4>
                                          <Checkbox
                                              checked={checkboxValue1}
                                              onChange={setCheckboxValue1}
                                              label="Primary 체크박스"
                                              variant="primary"
                                          />
                                      </div>
                                      
                                      <div className="space-y-4">
                                          <h4 className="font-medium text-gray-600">Secondary</h4>
                                          <Checkbox
                                              checked={checkboxValue2}
                                              onChange={setCheckboxValue2}
                                              label="Secondary 체크박스"
                                              variant="secondary"
                                          />
                                      </div>
                                      
                                      <div className="space-y-4">
                                          <h4 className="font-medium text-gray-600">Accent</h4>
                                          <Checkbox
                                              checked={checkboxValue3}
                                              onChange={setCheckboxValue3}
                                              label="Accent 체크박스"
                                              variant="accent"
                                          />
                                      </div>
                                  </div>
                              </div>

                              {/* Sizes */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      크기 (Sizes)
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-6">
                                      <div className="space-y-2">
                                          <Checkbox
                                              checked={checkboxValue4}
                                              onChange={setCheckboxValue4}
                                              label="Small"
                                              size="sm"
                                          />
                                          <p className="text-sm text-gray-500">
                                              작은 크기
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Checkbox
                                              checked={checkboxValue1}
                                              onChange={setCheckboxValue1}
                                              label="Medium"
                                              size="md"
                                          />
                                          <p className="text-sm text-gray-500">
                                              보통 크기
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <Checkbox
                                              checked={checkboxValue2}
                                              onChange={setCheckboxValue2}
                                              label="Large"
                                              size="lg"
                                          />
                                          <p className="text-sm text-gray-500">
                                              큰 크기
                                          </p>
                                      </div>
                                  </div>
                              </div>

                              {/* States */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      상태 (States)
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                          <div className="space-y-2">
                                              <h4 className="font-medium text-gray-600">일반 상태</h4>
                                              <Checkbox
                                                  checked={false}
                                                  onChange={() => {}}
                                                  label="체크되지 않음"
                                              />
                                              <Checkbox
                                                  checked={true}
                                                  onChange={() => {}}
                                                  label="체크됨"
                                              />
                                          </div>
                                      </div>

                                      <div className="space-y-4">
                                          <div className="space-y-2">
                                              <h4 className="font-medium text-gray-600">비활성화 상태</h4>
                                              <Checkbox
                                                  checked={false}
                                                  onChange={() => {}}
                                                  label="비활성화됨"
                                                  disabled
                                              />
                                              <Checkbox
                                                  checked={true}
                                                  onChange={() => {}}
                                                  label="체크됨 + 비활성화"
                                                  disabled
                                              />
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* Error State */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      에러 상태
                                  </h3>
                                  <div className="space-y-4">
                                      <Checkbox
                                          checked={false}
                                          onChange={() => {}}
                                          label="필수 약관에 동의해주세요"
                                          error
                                      />
                                  </div>
                              </div>

                              {/* Usage Example */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      사용 방법
                                  </h3>
                                  <div className="bg-gray-100 p-4 rounded-lg">
                                      <pre className="text-sm text-gray-800 overflow-x-auto">
{`const [checked, setChecked] = useState(false);

<Checkbox
  checked={checked}
  onChange={setChecked}
  label="동의합니다"
  variant="primary"
  size="md"
/>`}
                                      </pre>
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* TabGroup Components */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              TabGroup 컴포넌트
                          </h2>

                          <div className="space-y-8">
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      기본 탭 그룹
                                  </h3>
                                  <div className="max-w-2xl">
                                      <TabGroup
                                          items={tabItems}
                                          activeKey={activeTab}
                                          onChange={setActiveTab}
                                      />

                                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                          <p className="text-gray-700">
                                              {tabItems.find(item => item.key === activeTab)?.content}
                                          </p>
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      사용 방법
                                  </h3>
                                  <div className="bg-gray-100 p-4 rounded-lg">
                                      <pre className="text-sm text-gray-800">
{`const tabItems = [
  { key: 'tab1', label: '첫 번째 탭', content: '내용...' },
  { key: 'tab2', label: '두 번째 탭', content: '내용...' },
];

<TabGroup
  items={tabItems}
  activeKey={activeTab}
  onChange={setActiveTab}
/>`}
                                      </pre>
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* SecondaryTabGroup 컴포넌트 */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              SecondaryTabGroup 컴포넌트
                          </h2>
                          
                          <div className="space-y-8">
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      Secondary Color Tab (Medium)
                                  </h3>
                                  <div className="p-6 bg-gray-50 rounded-lg">
                                      <SecondaryTabGroup
                                          items={secondaryTabs}
                                          activeKey={secondaryActiveTab}
                                          onChange={setSecondaryActiveTab}
                                          size="md"
                                      />
                                      <div className="mt-4 p-4 bg-white rounded border">
                                          <p>현재 선택된 탭: <strong>{secondaryActiveTab}</strong></p>
                                          <p className="text-sm text-gray-600 mt-2">
                                              {secondaryActiveTab === 'upload' && '파일을 드래그 앤 드롭하거나 클릭하여 업로드할 수 있습니다.'}
                                              {secondaryActiveTab === 'ai' && 'AI를 활용하여 창의적인 이미지를 생성할 수 있습니다.'}
                                          </p>
                                      </div>
                                  </div>
                              </div>
                              
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      Size Variants
                                  </h3>
                                  <div className="space-y-6">
                                      <div className="p-6 bg-gray-50 rounded-lg">
                                          <h4 className="text-md font-medium mb-3">Small Size</h4>
                                          <SecondaryTabGroup
                                              items={secondaryTabs}
                                              activeKey={secondaryActiveTab}
                                              onChange={setSecondaryActiveTab}
                                              size="sm"
                                          />
                                      </div>
                                      
                                      <div className="p-6 bg-gray-50 rounded-lg">
                                          <h4 className="text-md font-medium mb-3">Large Size</h4>
                                          <SecondaryTabGroup
                                              items={secondaryTabs}
                                              activeKey={secondaryActiveTab}
                                              onChange={setSecondaryActiveTab}
                                              size="lg"
                                          />
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      컬러 스펙
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="p-4 bg-gray-50 rounded-lg">
                                          <h4 className="font-medium mb-3">Active State</h4>
                                          <div className="space-y-2 text-sm">
                                              <div className="flex items-center space-x-2">
                                                  <div className="w-4 h-4 rounded bg-[#4ECDC4]"></div>
                                                  <span>Border: #4ECDC4 (Secondary 400)</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                  <div className="w-4 h-4 rounded bg-[#1F9B92]"></div>
                                                  <span>Text: #1F9B92 (Secondary 500)</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                  <div className="w-4 h-4 rounded bg-[#F0FDFC]"></div>
                                                  <span>Background: #F0FDFC (Secondary 50)</span>
                                              </div>
                                          </div>
                                      </div>
                                      
                                      <div className="p-4 bg-gray-50 rounded-lg">
                                          <h4 className="font-medium mb-3">Hover State</h4>
                                          <div className="space-y-2 text-sm">
                                              <div className="flex items-center space-x-2">
                                                  <div className="w-4 h-4 rounded bg-[#B8F2ED]"></div>
                                                  <span>Border: #B8F2ED (Secondary 200)</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                  <div className="w-4 h-4 rounded bg-[#4ECDC4]"></div>
                                                  <span>Text: #4ECDC4 (Secondary 400)</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                  <div className="w-4 h-4 rounded bg-[#F0FDFC]"></div>
                                                  <span>Background: #F0FDFC (Secondary 50)</span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      사용 방법
                                  </h3>
                                  <div className="bg-gray-100 p-4 rounded-lg">
                                      <pre className="text-sm text-gray-800 overflow-x-auto">
{`import { SecondaryTabGroup } from '@/components/ui';
import { Upload, Sparkles } from 'lucide-react';

const tabs = [
  { key: 'upload', label: '파일 업로드', icon: Upload },
  { key: 'ai', label: 'AI 생성', icon: Sparkles },
];

const [activeTab, setActiveTab] = useState('upload');

<SecondaryTabGroup
  items={tabs}
  activeKey={activeTab}
  onChange={setActiveTab}
  size="md"
/>`}
                                      </pre>
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* RangeSlider Components */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              RangeSlider 컴포넌트
                          </h2>

                          <div className="space-y-8">
                              {/* Variants */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      변형 (Variants)
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="space-y-4">
                                          <h4 className="font-medium text-gray-600">Primary</h4>
                                          <RangeSlider
                                              min={0}
                                              max={100}
                                              step={5}
                                              value={rangeValue1}
                                              onChange={setRangeValue1}
                                              label="볼륨"
                                              unit="%"
                                              variant="primary"
                                              showValueOnHover
                                          />
                                      </div>
                                      
                                      <div className="space-y-4">
                                          <h4 className="font-medium text-gray-600">Secondary</h4>
                                          <RangeSlider
                                              min={0}
                                              max={100}
                                              step={5}
                                              value={rangeValue2}
                                              onChange={setRangeValue2}
                                              label="밝기"
                                              unit="%"
                                              variant="secondary"
                                              showValueOnHover
                                          />
                                      </div>
                                      
                                      <div className="space-y-4">
                                          <h4 className="font-medium text-gray-600">Accent</h4>
                                          <RangeSlider
                                              min={0}
                                              max={100}
                                              step={5}
                                              value={rangeValue3}
                                              onChange={setRangeValue3}
                                              label="대비"
                                              unit="%"
                                              variant="accent"
                                              showValueOnHover
                                          />
                                      </div>
                                  </div>
                              </div>

                              {/* Sizes */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      크기 (Sizes)
                                  </h3>
                                  <div className="space-y-4">
                                      <div>
                                          <h4 className="font-medium text-gray-600 mb-2">Small</h4>
                                          <RangeSlider
                                              min={0}
                                              max={100}
                                              step={1}
                                              value={30}
                                              onChange={() => {}}
                                              label="작은 크기"
                                              size="small"
                                              variant="primary"
                                          />
                                      </div>
                                      
                                      <div>
                                          <h4 className="font-medium text-gray-600 mb-2">Medium (기본)</h4>
                                          <RangeSlider
                                              min={0}
                                              max={100}
                                              step={1}
                                              value={50}
                                              onChange={() => {}}
                                              label="보통 크기"
                                              size="medium"
                                              variant="primary"
                                          />
                                      </div>
                                      
                                      <div>
                                          <h4 className="font-medium text-gray-600 mb-2">Large</h4>
                                          <RangeSlider
                                              min={0}
                                              max={100}
                                              step={1}
                                              value={80}
                                              onChange={() => {}}
                                              label="큰 크기"
                                              size="large"
                                              variant="primary"
                                          />
                                      </div>
                                  </div>
                              </div>

                              {/* Features */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      기능 (Features)
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                          <h4 className="font-medium text-gray-600">값 표시</h4>
                                          <RangeSlider
                                              min={0}
                                              max={360}
                                              step={15}
                                              value={180}
                                              onChange={() => {}}
                                              label="회전"
                                              unit="°"
                                              variant="secondary"
                                              showValue
                                          />
                                      </div>
                                      
                                      <div className="space-y-4">
                                          <h4 className="font-medium text-gray-600">커스텀 포맷</h4>
                                          <RangeSlider
                                              min={1}
                                              max={5}
                                              step={0.1}
                                              value={2.5}
                                              onChange={() => {}}
                                              label="배율"
                                              variant="accent"
                                              formatValue={(val) => `${val.toFixed(1)}x`}
                                              showValueOnHover
                                          />
                                      </div>
                                  </div>
                              </div>

                              {/* Usage Example */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      사용 방법
                                  </h3>
                                  <div className="bg-gray-100 p-4 rounded-lg">
                                      <pre className="text-sm text-gray-800 overflow-x-auto">
{`const [value, setValue] = useState(50);

<RangeSlider
  min={0}
  max={100}
  step={5}
  value={value}
  onChange={setValue}
  label="볼륨"
  unit="%"
  variant="primary"
  showValueOnHover
/>`}
                                      </pre>
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* RadioBox Components */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              RadioBox 컴포넌트
                          </h2>

                          <div className="space-y-8">
                              {/* Card Variant */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      카드 변형 (Card Variant)
                                  </h3>
                                  <div className="space-y-3 max-w-2xl">
                                      <RadioBox
                                          name="visibility"
                                          value="public"
                                          checked={visibility === 'public'}
                                          onChange={() => setVisibility('public')}
                                          label="전체 공개"
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
                                  
                                  <div className="mt-4 p-3 bg-blue-50 rounded-lg max-w-2xl">
                                      <p className="text-sm text-blue-800">
                                          <strong>선택된 값:</strong> {visibility}
                                      </p>
                                  </div>
                              </div>

                              {/* Default Variant */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      기본 변형 (Default Variant)
                                  </h3>
                                  <div className="space-y-2 max-w-xl">
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
                                  
                                  <div className="mt-4 p-3 bg-gray-100 rounded-lg max-w-xl">
                                      <p className="text-sm text-gray-700">
                                          <strong>선택된 테마:</strong> {theme}
                                      </p>
                                  </div>
                              </div>

                              {/* Mixed Example */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      프리미엄 플랜 선택 (실제 사용 예시)
                                  </h3>
                                  <div className="space-y-3 max-w-3xl">
                                      <RadioBox
                                          name="plan"
                                          value="basic"
                                          checked={plan === 'basic'}
                                          onChange={() => setPlan('basic')}
                                          label="Basic Plan"
                                          description="월 5개 밈 생성, 기본 템플릿 제공 - 무료"
                                          icon={<Heart size={20} />}
                                          variant="card"
                                      />
                                      
                                      <RadioBox
                                          name="plan"
                                          value="pro"
                                          checked={plan === 'pro'}
                                          onChange={() => setPlan('pro')}
                                          label="Pro Plan"
                                          description="무제한 밈 생성, 모든 템플릿 + AI 기능 - $9.99/월"
                                          icon={<Zap size={20} />}
                                          variant="card"
                                      />
                                      
                                      <RadioBox
                                          name="plan"
                                          value="premium"
                                          checked={plan === 'premium'}
                                          onChange={() => setPlan('premium')}
                                          label="Premium Plan"
                                          description="Pro 기능 + 우선 지원, 고급 편집 도구 - $19.99/월"
                                          icon={<Shield size={20} />}
                                          variant="card"
                                      />
                                  </div>
                                  
                                  <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-teal-50 rounded-lg max-w-3xl">
                                      <p className="text-sm text-gray-700">
                                          <strong>선택된 플랜:</strong> {plan}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                          {plan === 'basic' && '🆓 무료 플랜으로 시작하기'}
                                          {plan === 'pro' && '⚡ 프로 기능으로 업그레이드'}
                                          {plan === 'premium' && '👑 프리미엄으로 모든 기능 해제'}
                                      </p>
                                  </div>
                              </div>

                              {/* Disabled State */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      비활성화 상태
                                  </h3>
                                  <div className="space-y-3 max-w-2xl">
                                      <RadioBox
                                          name="disabled-demo"
                                          value="option1"
                                          checked={false}
                                          onChange={() => {}}
                                          label="활성화된 옵션"
                                          description="정상적으로 선택 가능한 옵션입니다"
                                          icon={<Eye size={18} />}
                                          variant="card"
                                      />
                                      
                                      <RadioBox
                                          name="disabled-demo"
                                          value="option2"
                                          checked={false}
                                          onChange={() => {}}
                                          label="비활성화된 옵션"
                                          description="현재 선택할 수 없는 옵션입니다"
                                          icon={<Lock size={18} />}
                                          variant="card"
                                          disabled
                                      />
                                  </div>
                              </div>

                              {/* Usage Example */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      사용 방법
                                  </h3>
                                  <div className="bg-gray-100 p-4 rounded-lg">
                                      <pre className="text-sm text-gray-800 overflow-x-auto">
{`import { RadioBox } from '@/components/ui';
import { Globe, Lock } from 'lucide-react';

const [visibility, setVisibility] = useState('public');

<RadioBox
  name="visibility"
  value="public"
  checked={visibility === 'public'}
  onChange={() => setVisibility('public')}
  label="전체 공개"
  description="모든 사용자가 볼 수 있습니다"
  icon={<Globe size={20} />}
  variant="card"
/>`}
                                      </pre>
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* Tag Components */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              Tag 컴포넌트
                          </h2>

                          <div className="space-y-8">
                              {/* Color Variants */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      색상 변형 (Color Variants)
                                  </h3>
                                  <div className="flex flex-wrap gap-3">
                                      <Tag variant="primary">Primary Tag</Tag>
                                      <Tag variant="secondary">Secondary Tag</Tag>
                                      <Tag variant="accent">Accent Tag</Tag>
                                      <Tag variant="neutral">Neutral Tag</Tag>
                                  </div>
                              </div>

                              {/* Size Variants */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      크기 변형 (Size Variants)
                                  </h3>
                                  <div className="flex items-center flex-wrap gap-3">
                                      <Tag variant="accent" size="sm">Small</Tag>
                                      <Tag variant="accent" size="md">Medium</Tag>
                                      <Tag variant="accent" size="lg">Large</Tag>
                                  </div>
                              </div>

                              {/* Removable Tags */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      제거 가능한 태그 (Removable Tags)
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                      <Tag 
                                          variant="accent" 
                                          removable 
                                          onRemove={() => showSuccess('태그가 제거되었습니다!')}
                                      >
                                          #개발
                                      </Tag>
                                      <Tag 
                                          variant="secondary" 
                                          removable 
                                          onRemove={() => showInfo('디자인 태그 제거')}
                                      >
                                          #디자인
                                      </Tag>
                                      <Tag 
                                          variant="primary" 
                                          removable 
                                          onRemove={() => showWarning('밈 태그 제거됨')}
                                      >
                                          #밈
                                      </Tag>
                                      <Tag 
                                          variant="neutral" 
                                          removable 
                                          onRemove={() => showError('재미 태그 삭제!')}
                                      >
                                          #재미
                                      </Tag>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-2">
                                      각 태그의 X 버튼을 클릭하면 토스트 메시지가 표시됩니다.
                                  </p>
                              </div>

                              {/* Interactive Example */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      아이콘과 함께 사용
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                      <Tag variant="accent" size="lg">
                                          <Heart size={14} className="mr-1" />
                                          좋아요 {Math.floor(Math.random() * 100)}
                                      </Tag>
                                      <Tag variant="secondary" size="lg">
                                          <Users size={14} className="mr-1" />
                                          팔로워 {Math.floor(Math.random() * 500)}
                                      </Tag>
                                      <Tag variant="primary" size="lg">
                                          <Eye size={14} className="mr-1" />
                                          조회 {Math.floor(Math.random() * 1000)}
                                      </Tag>
                                  </div>
                              </div>

                              {/* Usage Example */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      사용 방법
                                  </h3>
                                  <div className="bg-gray-100 p-4 rounded-lg">
                                      <pre className="text-sm text-gray-800 overflow-x-auto">
{`import { Tag } from '@/components/ui';
import { Heart } from 'lucide-react';

// 기본 사용법
<Tag variant="accent">태그 텍스트</Tag>

// 제거 가능한 태그
<Tag 
  variant="primary" 
  removable 
  onRemove={() => console.log('제거됨')}
>
  제거 가능한 태그
</Tag>

// 아이콘과 함께
<Tag variant="secondary">
  <Heart size={14} className="mr-1" />
  좋아요
</Tag>`}
                                      </pre>
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* Color Palette */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">
                              컬러 팔레트
                          </h2>

                          {/* Main Brand Colors */}
                          <div className="mb-8">
                              <h3 className="text-lg font-medium text-gray-700 mb-4">
                                  메인 브랜드 컬러
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                  <div className="space-y-2">
                                      <div
                                          className="w-full h-20 rounded-lg shadow-sm"
                                          style={{ backgroundColor: "#FF6B47" }}
                                      ></div>
                                      <p className="text-sm font-medium text-gray-700">
                                          Primary
                                      </p>
                                      <p className="text-xs text-gray-500">
                                          #FF6B47 - 코랄 오렌지
                                      </p>
                                  </div>
                                  <div className="space-y-2">
                                      <div
                                          className="w-full h-20 rounded-lg shadow-sm"
                                          style={{ backgroundColor: "#4ECDC4" }}
                                      ></div>
                                      <p className="text-sm font-medium text-gray-700">
                                          Secondary
                                      </p>
                                      <p className="text-xs text-gray-500">
                                          #4ECDC4 - 틸 블루
                                      </p>
                                  </div>
                                  <div className="space-y-2">
                                      <div
                                          className="w-full h-20 rounded-lg shadow-sm border border-gray-200"
                                          style={{ backgroundColor: "#F3F4F6" }}
                                      ></div>
                                      <p className="text-sm font-medium text-gray-700">
                                          Gray 100
                                      </p>
                                      <p className="text-xs text-gray-500">
                                          #F3F4F6 - 배경 컬러
                                      </p>
                                  </div>
                                  <div className="space-y-2">
                                      <div
                                          className="w-full h-20 rounded-lg shadow-sm"
                                          style={{ backgroundColor: "#EF4444" }}
                                      ></div>
                                      <p className="text-sm font-medium text-gray-700">
                                          Error Red
                                      </p>
                                      <p className="text-xs text-gray-500">
                                          #EF4444 - 에러 상태
                                      </p>
                                  </div>
                              </div>

                              {/* Primary Color Shades */}
                              <div className="mb-8">
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      Primary 컬러 팔레트
                                  </h3>
                                  <div className="grid grid-cols-5 gap-4">
                                      <div className="space-y-2">
                                          <div
                                              className="w-full h-16 rounded-lg shadow-sm"
                                              style={{
                                                  backgroundColor: "#FFF5F3",
                                              }}
                                          ></div>
                                          <p className="text-xs text-gray-600">
                                              primary-50
                                          </p>
                                          <p className="text-xs text-gray-500">
                                              #FFF5F3
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <div
                                              className="w-full h-16 rounded-lg shadow-sm"
                                              style={{
                                                  backgroundColor: "#FFD1C7",
                                              }}
                                          ></div>
                                          <p className="text-xs text-gray-600">
                                              primary-200
                                          </p>
                                          <p className="text-xs text-gray-500">
                                              #FFD1C7
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <div
                                              className="w-full h-16 rounded-lg shadow-sm"
                                              style={{
                                                  backgroundColor: "#FF6B47",
                                              }}
                                          ></div>
                                          <p className="text-xs text-gray-600">
                                              primary-500
                                          </p>
                                          <p className="text-xs text-gray-500">
                                              #FF6B47
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <div
                                              className="w-full h-16 rounded-lg shadow-sm"
                                              style={{
                                                  backgroundColor: "#FF4A1F",
                                              }}
                                          ></div>
                                          <p className="text-xs text-gray-600">
                                              primary-600
                                          </p>
                                          <p className="text-xs text-gray-500">
                                              #FF4A1F
                                          </p>
                                      </div>
                                      <div className="space-y-2">
                                          <div
                                              className="w-full h-16 rounded-lg shadow-sm"
                                              style={{
                                                  backgroundColor: "#E6330A",
                                              }}
                                          ></div>
                                          <p className="text-xs text-gray-600">
                                              primary-700
                                          </p>
                                          <p className="text-xs text-gray-500">
                                              #E6330A
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Secondary Color Shades */}
                          <div>
                              <h3 className="text-lg font-medium text-gray-700 mb-4">
                                  Secondary 컬러 팔레트
                              </h3>
                              <div className="grid grid-cols-5 gap-4">
                                  <div className="space-y-2">
                                      <div
                                          className="w-full h-16 rounded-lg shadow-sm"
                                          style={{ backgroundColor: "#F0FDFC" }}
                                      ></div>
                                      <p className="text-xs text-gray-600">
                                          secondary-50
                                      </p>
                                      <p className="text-xs text-gray-500">
                                          #F0FDFC
                                      </p>
                                  </div>
                                  <div className="space-y-2">
                                      <div
                                          className="w-full h-16 rounded-lg shadow-sm"
                                          style={{ backgroundColor: "#B8F2ED" }}
                                      ></div>
                                      <p className="text-xs text-gray-600">
                                          secondary-200
                                      </p>
                                      <p className="text-xs text-gray-500">
                                          #B8F2ED
                                      </p>
                                  </div>
                                  <div className="space-y-2">
                                      <div
                                          className="w-full h-16 rounded-lg shadow-sm"
                                          style={{ backgroundColor: "#4ECDC4" }}
                                      ></div>
                                      <p className="text-xs text-gray-600">
                                          secondary-400
                                      </p>
                                      <p className="text-xs text-gray-500">
                                          #4ECDC4
                                      </p>
                                  </div>
                                  <div className="space-y-2">
                                      <div
                                          className="w-full h-16 rounded-lg shadow-sm"
                                          style={{ backgroundColor: "#1F9B92" }}
                                      ></div>
                                      <p className="text-xs text-gray-600">
                                          secondary-600
                                      </p>
                                      <p className="text-xs text-gray-500">
                                          #1F9B92
                                      </p>
                                  </div>
                                  <div className="space-y-2">
                                      <div
                                          className="w-full h-16 rounded-lg shadow-sm"
                                          style={{ backgroundColor: "#1B7F78" }}
                                      ></div>
                                      <p className="text-xs text-gray-600">
                                          secondary-700
                                      </p>
                                      <p className="text-xs text-gray-500">
                                          #1B7F78
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* Toast System */}
                      <section>
                          <h2 className="text-xl font-semibold text-gray-800 mb-6">
                              Toast 알림 시스템
                          </h2>
                          <div className="space-y-8">
                              {/* Toast Examples */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      토스트 타입들
                                  </h3>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <Button
                                          onClick={() => showSuccess('성공적으로 처리되었습니다!')}
                                          variant="primary"
                                          size="sm"
                                      >
                                          Success Toast
                                      </Button>
                                      <Button
                                          onClick={() => showError('오류가 발생했습니다!')}
                                          variant="danger"
                                          size="sm"
                                      >
                                          Error Toast
                                      </Button>
                                      <Button
                                          onClick={() => showWarning('주의가 필요합니다!')}
                                          variant="accent"
                                          size="sm"
                                      >
                                          Warning Toast
                                      </Button>
                                      <Button
                                          onClick={() => showInfo('정보를 확인해주세요.')}
                                          variant="secondary"
                                          size="sm"
                                      >
                                          Info Toast
                                      </Button>
                                  </div>
                              </div>

                              {/* Multiple Toasts */}
                              <div>
                                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                                      여러 토스트 테스트
                                  </h3>
                                  <div className="space-x-4">
                                      <Button
                                          onClick={() => {
                                              showSuccess('첫 번째 성공 메시지');
                                              setTimeout(() => showInfo('두 번째 정보 메시지'), 500);
                                              setTimeout(() => showWarning('세 번째 경고 메시지'), 1000);
                                          }}
                                          variant="primary"
                                      >
                                          연속 토스트 테스트
                                      </Button>
                                  </div>
                              </div>

                              {/* Usage Info */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                  <h4 className="font-medium text-gray-700 mb-2">사용법</h4>
                                  <div className="text-sm text-gray-600 space-y-2">
                                      <p>1. <code className="bg-white px-2 py-1 rounded text-xs">useToastContext()</code> 훅을 사용하여 토스트 함수들을 가져옵니다.</p>
                                      <p>2. <code className="bg-white px-2 py-1 rounded text-xs">showSuccess()</code>, <code className="bg-white px-2 py-1 rounded text-xs">showError()</code>, <code className="bg-white px-2 py-1 rounded text-xs">showWarning()</code>, <code className="bg-white px-2 py-1 rounded text-xs">showInfo()</code> 함수를 호출합니다.</p>
                                      <p>3. 토스트는 자동으로 5초 후에 사라지며, 수동으로 닫을 수도 있습니다.</p>
                                      <p>4. 모든 <code className="bg-white px-2 py-1 rounded text-xs">alert()</code> 호출이 토스트로 교체되었습니다.</p>
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