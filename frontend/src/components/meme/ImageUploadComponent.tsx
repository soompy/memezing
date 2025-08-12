'use client';

import { useRef, useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { validateImageFile } from '@/lib/upload';
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const { showError, showSuccess } = useToastContext();

  // 상태 초기화
  const resetStates = useCallback(() => {
    setUploadError(null);
    setUploadSuccess(null);
  }, []);


  // 파일 선택 핸들러
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 파일 검증
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error!);
      showError(validation.error!);
      return;
    }

    // 서버 업로드 없이 바로 로컬 파일 전달
    onImageSelect(file);
    setUploadSuccess('이미지가 추가되었습니다!');
    
    // 3초 후 성공 메시지 제거
    setTimeout(() => setUploadSuccess(null), 3000);
  }, [onImageSelect, showError]);

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
  const handleFileInputClick = useCallback((e: React.MouseEvent) => {
    console.log('클릭 이벤트 발생:', e);
    e.preventDefault();
    e.stopPropagation();
    
    if (fileInputRef.current) {
      console.log('파일 인풋 클릭 시도');
      fileInputRef.current.click();
    } else {
      console.error('파일 인풋 참조가 없습니다');
    }
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFileInputClick(e as any);
            }
          }}
        >
          <div className="flex flex-col items-center space-y-3">
            <Upload 
              size={48} 
              className={`${dragOver ? 'text-blue-500' : 'text-gray-400'}`} 
            />
            <div>
              <p className="text-lg font-medium text-gray-700">
                이미지를 드래그하거나 클릭하여 추가
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF, WebP 파일 지원 (최대 {maxSize}MB)
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={(e) => {
              handleFileSelect(e.target.files);
              e.target.value = ''; // 같은 파일을 다시 선택할 수 있도록 초기화
            }}
            className="hidden"
            onClick={(e) => e.stopPropagation()}
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
          onClick={(e) => {
            if (isUrlMode) {
              setIsUrlMode(false);
            } else {
              // 이미 파일 모드인 경우 파일 선택 창 열기
              handleFileInputClick(e as any);
            }
          }}
        >
          <Upload size={16} className="mr-2" />
          파일 선택
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