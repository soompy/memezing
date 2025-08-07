'use client';

import { useRef, useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { validateImageFile, uploadImageWithProgress, UploadProgress, UploadError } from '@/lib/upload';
import { useToastContext } from '@/context/ToastContext';

interface ImageUploadComponentProps {
  onImageSelect: (file: File) => void;
  onImageUrl: (url: string) => void;
  onImageUpload?: (url: string) => void; // 업로드 완료 시 URL 반환
  className?: string;
  accept?: string;
  maxSize?: number; // MB 단위
  uploadType?: 'meme' | 'avatar' | 'template';
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  onImageSelect,
  onImageUrl,
  onImageUpload,
  className = '',
  accept = 'image/*',
  maxSize = 10,
  uploadType = 'meme'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showError, showSuccess } = useToastContext();

  // 상태 초기화
  const resetStates = useCallback(() => {
    setUploadProgress(null);
    setUploadError(null);
    setUploadSuccess(null);
  }, []);

  // 파일 업로드 핸들러
  const handleUpload = useCallback(async (file: File) => {
    // 파일 검증
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error!);
      return;
    }

    setIsUploading(true);
    resetStates();

    try {
      const result = await uploadImageWithProgress(
        file,
        uploadType,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadSuccess('업로드가 완료되었습니다!');
      setUploadProgress(null);
      
      // 로컬 파일 선택과 업로드된 URL 모두 전달
      onImageSelect(file);
      if (onImageUpload) {
        onImageUpload(result.url);
      }
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof UploadError 
        ? error.message 
        : '업로드 중 오류가 발생했습니다.';
      setUploadError(errorMessage);
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  }, [uploadType, onImageSelect, onImageUpload, resetStates]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    handleUpload(file);
  }, [handleUpload]);

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
      showError('유효하지 않은 URL입니다.');
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
              className={`${dragOver ? 'text-blue-500' : 'text-gray-400'} ${isUploading ? 'animate-pulse' : ''}`} 
            />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isUploading ? '업로드 중...' : '이미지를 드래그하거나 클릭하여 업로드'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF, WebP 파일 지원 (최대 {maxSize}MB)
              </p>
            </div>
            
            {/* 업로드 진행률 */}
            {uploadProgress && (
              <div className="w-full max-w-sm">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>업로드 중...</span>
                  <span>{uploadProgress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}
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

      {/* 상태 메시지 */}
      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle size={20} className="text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-700">{uploadError}</p>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle size={20} className="text-green-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-green-700">{uploadSuccess}</p>
        </div>
      )}

      {/* 모드 전환 버튼 */}
      <div className="flex justify-center mt-4 space-x-2">
        <Button
          variant={!isUrlMode ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setIsUrlMode(false)}
          disabled={isUploading}
        >
          <Upload size={16} className="mr-2" />
          파일 업로드
        </Button>
        <Button
          variant={isUrlMode ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setIsUrlMode(true)}
          disabled={isUploading}
        >
          <ImageIcon size={16} className="mr-2" />
          URL로 추가
        </Button>
      </div>
    </div>
  );
};

export default ImageUploadComponent;