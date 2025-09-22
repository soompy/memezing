'use client';

import React from 'react';
import ImageUploadComponent, { ImageFillOption } from './ImageUploadComponent';

interface ImageSelectorTabsProps {
  onImageSelect: (file: File, fillOption?: ImageFillOption) => void;
  onImageUrl: (url: string, fillOption?: ImageFillOption) => void;
  onImageUpload?: (url: string) => void;
  onBackgroundImageSelect?: (file: File, fillOption?: ImageFillOption) => void;
  onBackgroundImageUrl?: (url: string, fillOption?: ImageFillOption) => void;
  className?: string;
}

const ImageSelectorTabs: React.FC<ImageSelectorTabsProps> = ({
  onImageSelect,
  onImageUrl,
  onImageUpload,
  onBackgroundImageSelect,
  onBackgroundImageUrl,
  className = ''
}) => {
  return (
    <div className={className}>
      <div className="p-4">
        <ImageUploadComponent
          onImageSelect={onImageSelect}
          onImageUrl={onImageUrl}
          onImageUpload={onImageUpload}
          onBackgroundImageSelect={onBackgroundImageSelect}
          onBackgroundImageUrl={onBackgroundImageUrl}
        />
      </div>
    </div>
  );
};


export default ImageSelectorTabs;