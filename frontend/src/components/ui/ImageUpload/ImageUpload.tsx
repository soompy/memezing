'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (imageUrl: string) => void;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  className?: string;
}

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
  };
  message: string;
}

export default function ImageUpload({
  onUpload,
  maxSizeInMB = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다. (${acceptedFormats.join(', ')})`;
    }
    
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `파일 크기가 ${maxSizeInMB}MB를 초과합니다.`;
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (result.success && result.data) {
        setPreviewUrl(result.data.url);
        onUpload(result.data.url);
      } else {
        setError(result.message || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="업로드된 이미지 미리보기"
            className="w-full h-64 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-600">업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                이미지를 업로드하세요
              </p>
              <p className="text-sm text-gray-500 mb-4">
                드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
              </p>
              <div className="flex items-center text-xs text-gray-400">
                <Upload className="h-4 w-4 mr-1" />
                최대 {maxSizeInMB}MB, JPG, PNG, GIF, WebP
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}