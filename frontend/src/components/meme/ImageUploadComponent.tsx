'use client';

import { useRef, useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ImageUploadComponentProps {
  onImageSelect: (file: File) => void;
  onImageUrl: (url: string) => void;
  className?: string;
  accept?: string;
  maxSize?: number; // MB 단위
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  onImageSelect,
  onImageUrl,
  className = '',
  accept = 'image/*',
  maxSize = 10
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);

  // 파일 유효성 검사
  const validateFile = useCallback((file: File): boolean => {
    // 파일 크기 검사
    if (file.size > maxSize * 1024 * 1024) {
      alert(`파일 크기가 ${maxSize}MB를 초과합니다.`);
      return false;
    }

    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return false;
    }

    return true;
  }, [maxSize]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (validateFile(file)) {
      onImageSelect(file);
    }
  }, [validateFile, onImageSelect]);

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // URL 제출 핸들러
  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;

    try {
      // URL 유효성 검사
      new URL(urlInput);
      onImageUrl(urlInput);
      setUrlInput('');
      setIsUrlMode(false);
    } catch {
      alert('유효하지 않은 URL입니다.');
    }
  }, [urlInput, onImageUrl]);

  // 파일 입력 클릭
  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`image-upload-component ${className}`}>
      {!isUrlMode ? (
        // 파일 업로드 모드
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileInputClick}
        >
          <div className="flex flex-col items-center space-y-3">
            <Upload 
              size={48} 
              className={`${dragOver ? 'text-blue-500' : 'text-gray-400'}`} 
            />
            <div>
              <p className="text-lg font-medium text-gray-700">
                이미지를 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF 파일 지원 (최대 {maxSize}MB)
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      ) : (
        // URL 입력 모드
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <ImageIcon size={48} className="text-gray-400" />
            <div className="w-full max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 URL 입력
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <Button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  size="sm"
                >
                  추가
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모드 전환 버튼 */}
      <div className="flex justify-center mt-4 space-x-2">
        <Button
          variant={!isUrlMode ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setIsUrlMode(false)}
        >
          <Upload size={16} className="mr-2" />
          파일 업로드
        </Button>
        <Button
          variant={isUrlMode ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setIsUrlMode(true)}
        >
          <ImageIcon size={16} className="mr-2" />
          URL로 추가
        </Button>
      </div>
    </div>
  );
};

export default ImageUploadComponent;