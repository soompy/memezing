'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useImageLoader } from '@/hooks/useImagePreloader';
import { isValidImageUrl } from '@/utils/imageLoader';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
  quality?: number;
  blur?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  lazy?: boolean;
  threshold?: number;
  sizes?: string;
  srcSet?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  referrerPolicy?: 'no-referrer' | 'origin' | 'unsafe-url';
  style?: React.CSSProperties;
}

/**
 * 고성능 최적화된 이미지 컴포넌트
 * - Intersection Observer를 통한 지연 로딩
 * - WebP 포맷 자동 감지 및 변환
 * - Progressive JPEG 지원
 * - 스켈레톤 로딩 UI
 * - 에러 처리 및 폴백
 */
const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  priority = false,
  quality = 85,
  blur = true,
  onLoad,
  onError,
  lazy = true,
  threshold = 0.1,
  sizes,
  srcSet,
  crossOrigin = 'anonymous',
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'origin',
  style = {}
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  // 이미지 로더 훅 사용
  const {
    isLoading,
    result,
    error,
    isSuccess,
    isError
  } = useImageLoader(isInView ? src : null, {
    timeout: 15000,
    retryCount: 2,
    useProxy: true
  });

  // Intersection Observer 설정
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [lazy, priority, threshold]);

  // WebP 지원 감지
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dataURL = canvas.toDataURL('image/webp');
        setSupportsWebP(dataURL.startsWith('data:image/webp'));
      } else {
        setSupportsWebP(false);
      }
    };

    checkWebPSupport();
  }, []);

  // 최적화된 이미지 URL 생성
  const getOptimizedImageUrl = useCallback((originalUrl: string) => {
    if (!isValidImageUrl(originalUrl)) return originalUrl;

    // 외부 이미지인 경우 프록시 사용
    if (!originalUrl.startsWith('/') && !originalUrl.startsWith('data:')) {
      const params = new URLSearchParams();
      params.set('url', originalUrl);
      
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      if (quality !== 85) params.set('q', quality.toString());
      if (supportsWebP) params.set('f', 'webp');
      
      return `/api/image-proxy?${params.toString()}`;
    }

    return originalUrl;
  }, [width, height, quality, supportsWebP]);

  // 이미지 로드 성공 처리
  useEffect(() => {
    if (isSuccess && result?.url) {
      setCurrentSrc(result.url);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    }
  }, [isSuccess, result, onLoad]);

  // 이미지 로드 에러 처리
  useEffect(() => {
    if (isError || error) {
      setHasError(true);
      setIsLoaded(false);
      onError?.(error || 'Failed to load image');
    }
  }, [isError, error, onError]);

  // 스켈레톤 로딩 컴포넌트
  const SkeletonLoader = () => (
    <div
      className={`animate-pulse bg-gray-200 ${className}`}
      style={{
        width: width || '100%',
        height: height || '200px',
        ...style
      }}
    >
      <div className="flex items-center justify-center h-full text-gray-400">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );

  // 에러 상태 컴포넌트
  const ErrorState = () => (
    <div
      className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
      style={{
        width: width || '100%',
        height: height || '200px',
        ...style
      }}
    >
      <div className="text-center text-gray-500">
        <svg
          className="w-8 h-8 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xs">이미지 로드 실패</p>
      </div>
    </div>
  );

  // 로딩 중이거나 뷰포트에 진입하지 않은 경우
  if (!isInView && lazy && !priority) {
    return <SkeletonLoader />;
  }

  // 로딩 중
  if (isLoading || (!isLoaded && !hasError)) {
    return <SkeletonLoader />;
  }

  // 에러 상태
  if (hasError || isError) {
    return <ErrorState />;
  }

  // 성공적으로 로드됨
  return (
    <div className="relative overflow-hidden">
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={style}
        sizes={sizes}
        srcSet={srcSet}
        crossOrigin={crossOrigin}
        loading={loading}
        decoding={decoding}
        referrerPolicy={referrerPolicy}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          setHasError(true);
          onError?.('Image failed to load');
        }}
      />
      
      {/* 블러 효과 (로딩 중) */}
      {blur && !isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            filter: 'blur(10px)',
            opacity: 0.7
          }}
        />
      )}
      
      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;