'use client';

import React from 'react';
import ImageUploadComponent from './ImageUploadComponent';

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
  return (
    <div className={className}>
      <div className="p-4">
        <ImageUploadComponent
          onImageSelect={onImageSelect}
          onImageUrl={onImageUrl}
          onImageUpload={onImageUpload}
        />
      </div>
    </div>
  );
};


export default ImageSelectorTabs;