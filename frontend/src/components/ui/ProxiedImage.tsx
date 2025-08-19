'use client';

import React, { useState, useCallback } from 'react';
import { ImageIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { getProxiedImageUrl, getFallbackImage } from '@/utils/imageProxy';

interface ProxiedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackCategory?: string;
  showLoadingSpinner?: boolean;
  showErrorIcon?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  retryable?: boolean;
}

const ProxiedImage: React.FC<ProxiedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackCategory,
  showLoadingSpinner = true,
  showErrorIcon = true,
  onLoad,
  onError,
  retryable = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    console.error('ProxiedImage 로딩 실패:', src);
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError, src]);

  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setIsLoading(true);
      setHasError(false);
      setRetryCount(prev => prev + 1);
      // 강제로 이미지를 다시 로드하기 위해 timestamp 추가
      const img = document.querySelector(`img[alt="${alt}"]`) as HTMLImageElement;
      if (img) {
        img.src = getProxiedImageUrl(src) + `&t=${Date.now()}`;
      }
    }
  }, [src, alt, retryCount]);

  const proxiedSrc = getProxiedImageUrl(src);
  const fallbackSrc = getFallbackImage(fallbackCategory);

  if (hasError && retryCount >= 3) {
    // 최대 재시도 후 fallback 이미지 사용
    return (
      <div className={`relative ${className}`}>
        <img
          src={fallbackSrc}
          alt={alt}
          className="w-full h-full object-contain opacity-75"
          onLoad={handleLoad}
        />
        {showErrorIcon && (
          <div className="absolute top-2 left-2">
            <AlertTriangle size={16} className="text-yellow-500" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 로딩 스피너 */}
      {isLoading && showLoadingSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <RefreshCw size={24} className="text-gray-400 animate-spin" />
        </div>
      )}

      {/* 에러 상태 */}
      {hasError && retryable && retryCount < 3 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <ImageIcon size={32} className="text-gray-400 mb-2" />
          <button
            onClick={handleRetry}
            className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
          >
            <RefreshCw size={14} className="mr-1" />
            다시 시도 ({retryCount + 1}/3)
          </button>
        </div>
      )}

      {/* 실제 이미지 */}
      <img
        src={proxiedSrc}
        alt={alt}
        className="w-full h-full object-contain"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          visibility: isLoading ? 'hidden' : 'visible'
        }}
      />
    </div>
  );
};

export default ProxiedImage;