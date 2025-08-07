'use client';

import React, { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import { SecondaryTabGroup, SecondaryTabItem } from '@/components/ui';
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

  const tabs: SecondaryTabItem[] = [
    {
      key: 'upload',
      label: '파일 업로드',
      icon: Upload
    },
    {
      key: 'ai',
      label: 'AI 생성',
      icon: Sparkles
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="p-4">
            <ImageUploadComponent
              onImageSelect={onImageSelect}
              onImageUrl={onImageUrl}
              onImageUpload={onImageUpload}
            />
          </div>
        );
      case 'ai':
        return (
          <div className="p-4">
            <AIImageGenerator onImageGenerated={handleAIImageGenerated} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {/* Secondary 컬러 탭 헤더 */}
      <SecondaryTabGroup
        items={tabs}
        activeKey={activeTab}
        onChange={setActiveTab}
        size="md"
        className="mb-4"
      />
      
      {/* 탭 컨텐츠 */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};


export default ImageSelectorTabs;