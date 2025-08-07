'use client';

import React, { useState } from 'react';
import { Upload, Link, Sparkles, Image as ImageIcon } from 'lucide-react';
import { TabGroup } from '@/components/ui';
import ImageUploadComponent from './ImageUploadComponent';
import AIImageGenerator from './AIImageGenerator';

interface ImageSelectorTabsProps {
  onImageSelect: (file: File) => void;
  onImageUrl: (url: string) => void;
  onImageUpload?: (url: string) => void;
  className?: string;
}

const ImageSelectorTabs: React.FC<ImageSelectorTabsProps> = ({
  onImageSelect,
  onImageUrl,
  onImageUpload,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('upload');

  const handleAIImageGenerated = (imageUrl: string, prompt: string) => {
    // AI 생성된 이미지를 URL로 전달
    onImageUrl(imageUrl);
  };

  const tabItems = [
    {
      key: 'upload',
      label: (
        <div className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>파일 업로드</span>
        </div>
      ),
      content: (
        <div className="p-4">
          <ImageUploadComponent
            onImageSelect={onImageSelect}
            onImageUrl={onImageUrl}
            onImageUpload={onImageUpload}
          />
        </div>
      )
    },
    {
      key: 'url',
      label: (
        <div className="flex items-center space-x-2">
          <Link className="w-4 h-4" />
          <span>URL 입력</span>
        </div>
      ),
      content: (
        <div className="p-4">
          <URLImageInput onImageUrl={onImageUrl} />
        </div>
      )
    },
    {
      key: 'ai',
      label: (
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>AI 생성</span>
        </div>
      ),
      content: (
        <div className="p-4">
          <AIImageGenerator onImageGenerated={handleAIImageGenerated} />
        </div>
      )
    }
  ];

  return (
    <div className={className}>
      <TabGroup
        items={tabItems}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="primary"
        size="sm"
      />
    </div>
  );
};

// URL 입력 컴포넌트
const URLImageInput: React.FC<{ onImageUrl: (url: string) => void }> = ({ onImageUrl }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async () => {
    if (!urlInput.trim()) return;

    setIsValidating(true);

    try {
      // URL 유효성 검사
      new URL(urlInput);
      
      // 이미지 URL인지 확인
      const img = new Image();
      img.onload = () => {
        onImageUrl(urlInput);
        setUrlInput('');
        setIsValidating(false);
      };
      img.onerror = () => {
        alert('유효한 이미지 URL이 아닙니다.');
        setIsValidating(false);
      };
      img.src = urlInput;
    } catch {
      alert('유효하지 않은 URL입니다.');
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">이미지 URL 입력</h3>
        <p className="text-sm text-gray-600">
          온라인 이미지의 URL을 입력하여 사용하세요
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isValidating}
        />
        <button
          onClick={handleSubmit}
          disabled={isValidating || !urlInput.trim()}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          {isValidating ? '확인 중...' : '이미지 사용하기'}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">💡 URL 입력 팁</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 이미지 파일의 직접 링크를 사용하세요 (.jpg, .png, .gif 등)</li>
          <li>• 무료 이미지 사이트: Unsplash, Pixabay, Pexels</li>
          <li>• 저작권을 확인하고 사용하세요</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageSelectorTabs;