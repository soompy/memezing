'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { globalImageCache } from '@/utils/imageCache';

export interface ProgressiveImageProps {
  src: string;
  lowQualitySrc?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  lazy?: boolean;
  threshold?: number;
  quality?: number;
  blur?: boolean;
  style?: React.CSSProperties;
}

interface LoadingState {
  lowQualityLoaded: boolean;
  highQualityLoaded: boolean;
  error: boolean;
  inView: boolean;
}

/**
 * Progressive JPEG 스타일의 이미지 로딩 컴포넌트
 * - 저품질 이미지를 먼저 로드하여 즉시 표시
 * - 고품질 이미지를 백그라운드에서 로드
 * - 블러 효과로 부드러운 전환
 * - 메모리 캐시 활용
 */
const ProgressiveImage: React.FC<ProgressiveImageProps> = memo(({
  src,
  lowQualitySrc,
  alt,
  width,
  height,
  className = '',
  priority = false,
  onLoad,
  onError,
  lazy = true,
  threshold = 0.1,
  quality = 85,
  blur = true,
  style = {}
}) => {
  const imgRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<LoadingState>({
    lowQualityLoaded: false,
    highQualityLoaded: false,
    error: false,
    inView: !lazy || priority
  });
  
  const [lowQualityUrl, setLowQualityUrl] = useState<string>('');
  const [highQualityUrl, setHighQualityUrl] = useState<string>('');

  // Intersection Observer 설정
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState(prev => ({ ...prev, inView: true }));
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

  // 저품질 이미지 URL 생성
  const generateLowQualityUrl = useCallback((originalUrl: string): string => {
    if (lowQualitySrc) return lowQualitySrc;
    
    // 자동 저품질 버전 생성 (해상도 1/4, 품질 30%)
    const params = new URLSearchParams();
    params.set('url', originalUrl);
    if (width) params.set('w', Math.round(width / 4).toString());
    if (height) params.set('h', Math.round(height / 4).toString());
    params.set('q', '30');
    params.set('f', 'jpeg'); // 저품질은 JPEG 사용
    params.set('blur', '1'); // 약간의 블러 효과
    
    return `/api/image-optimize?${params.toString()}`;
  }, [lowQualitySrc, width, height]);

  // 고품질 이미지 URL 생성
  const generateHighQualityUrl = useCallback((originalUrl: string): string => {
    const params = new URLSearchParams();
    params.set('url', originalUrl);
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', 'auto'); // WebP 우선
    
    return `/api/image-optimize?${params.toString()}`;
  }, [width, height, quality]);

  // 이미지 로딩 함수
  const loadImage = useCallback(async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 캐시에서 확인
      const cacheKey = url;
      const cached = globalImageCache.get(cacheKey);
      
      if (cached) {
        if (typeof cached.data === 'string') {
          resolve(cached.data);
          return;
        } else {
          // ArrayBuffer를 Blob URL로 변환
          const blob = new Blob([cached.data], { type: cached.contentType });
          const blobUrl = URL.createObjectURL(blob);
          resolve(blobUrl);
          return;
        }
      }

      // 실제 이미지 로드
      const img = new Image();
      
      img.onload = () => {
        // 캐시에 저장
        globalImageCache.set(cacheKey, url, 'image/jpeg');
        resolve(url);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  }, []);

  // 뷰포트에 진입했을 때 이미지 로딩 시작
  useEffect(() => {
    if (!state.inView) return;

    const loadImages = async () => {
      try {
        // 1단계: 저품질 이미지 로드
        const lowQualityUrl = generateLowQualityUrl(src);
        
        try {
          const loadedLowUrl = await loadImage(lowQualityUrl);
          setLowQualityUrl(loadedLowUrl);
          setState(prev => ({ ...prev, lowQualityLoaded: true }));
        } catch (lowError) {
          console.warn('Low quality image failed to load:', lowError);
        }

        // 2단계: 고품질 이미지 로드 (백그라운드)
        const highQualityUrl = generateHighQualityUrl(src);
        
        try {
          const loadedHighUrl = await loadImage(highQualityUrl);
          setHighQualityUrl(loadedHighUrl);
          setState(prev => ({ ...prev, highQualityLoaded: true }));
          onLoad?.();
        } catch (highError) {
          console.error('High quality image failed to load:', highError);
          setState(prev => ({ ...prev, error: true }));
          onError?.(highError instanceof Error ? highError.message : 'Failed to load image');
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: true }));
        onError?.(error instanceof Error ? error.message : 'Failed to load images');
      }
    };

    loadImages();
  }, [state.inView, src, generateLowQualityUrl, generateHighQualityUrl, loadImage, onLoad, onError]);

  // 스켈레톤 로더
  const SkeletonLoader = () => (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 ${className}`}
      style={{
        width: width || '100%',
        height: height || '200px',
        ...style
      }}
    >
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 opacity-30">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="h-3 bg-gray-300 rounded w-24 mx-auto opacity-30"></div>
        </div>
      </div>
    </div>
  );

  // 에러 상태
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
          className="w-8 h-8 mx-auto mb-2 text-red-400"
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
        <button
          onClick={() => {
            setState({
              lowQualityLoaded: false,
              highQualityLoaded: false,
              error: false,
              inView: true
            });
          }}
          className="mt-2 px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );

  // 뷰포트에 진입하지 않은 경우
  if (!state.inView && lazy && !priority) {
    return (
      <div ref={imgRef} className={className} style={style}>
        <SkeletonLoader />
      </div>
    );
  }

  // 에러 상태
  if (state.error && !state.lowQualityLoaded) {
    return <ErrorState />;
  }

  // 이미지 렌더링
  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={style}>
      {/* 로딩 상태에서 스켈레톤 표시 */}
      {!state.lowQualityLoaded && !state.highQualityLoaded && <SkeletonLoader />}
      
      {/* 저품질 이미지 (블러 효과와 함께) */}
      {state.lowQualityLoaded && lowQualityUrl && (
        <img
          src={lowQualityUrl}
          alt={alt}
          width={width}
          height={height}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            state.highQualityLoaded ? 'opacity-0' : 'opacity-100'
          } ${blur ? 'filter blur-sm scale-105' : ''}`}
          loading="eager"
          decoding="async"
        />
      )}
      
      {/* 고품질 이미지 */}
      {state.highQualityLoaded && highQualityUrl && (
        <img
          src={highQualityUrl}
          alt={alt}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-100"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={onLoad}
          onError={(e) => onError?.(`High quality image load failed`)}
        />
      )}
      
      {/* 로딩 인디케이터 */}
      {(state.lowQualityLoaded && !state.highQualityLoaded) && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* 품질 인디케이터 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 text-xs bg-black bg-opacity-75 text-white px-2 py-1 rounded">
          {state.highQualityLoaded ? 'HQ' : state.lowQualityLoaded ? 'LQ' : 'Loading...'}
        </div>
      )}
    </div>
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';

export default ProgressiveImage;