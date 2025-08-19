/**
 * 이미지 프록시 유틸리티
 */

// 프록시를 통해 외부 이미지 URL 생성
export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  
  // 이미 로컬 URL이면 그대로 반환
  if (originalUrl.startsWith('/') || originalUrl.startsWith(window.location.origin)) {
    return originalUrl;
  }
  
  // 프록시 URL로 변환
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
}

// 이미지 로딩 상태 관리를 위한 훅
export function useImageLoader() {
  const [loadingImages, setLoadingImages] = React.useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());

  const handleImageLoad = React.useCallback((url: string) => {
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  }, []);

  const handleImageError = React.useCallback((url: string) => {
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
    setFailedImages(prev => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);

  const startLoading = React.useCallback((url: string) => {
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
    setFailedImages(prev => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  }, []);

  return {
    loadingImages,
    failedImages,
    handleImageLoad,
    handleImageError,
    startLoading,
    isLoading: (url: string) => loadingImages.has(url),
    hasFailed: (url: string) => failedImages.has(url),
  };
}

// 이미지 프리로딩 함수
export async function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = getProxiedImageUrl(url);
  });
}

// 기본 fallback 이미지들
export const FALLBACK_IMAGES = {
  classic: '/images/fallback/classic-meme.png',
  animal: '/images/fallback/animal-meme.png',
  trending: '/images/fallback/trending-meme.png',
  emotion: '/images/fallback/emotion-meme.png',
  korean: '/images/fallback/korean-meme.png',
  memecoin: '/images/fallback/memecoin-meme.png',
  default: '/images/fallback/default-meme.png',
} as const;

// 템플릿 카테고리별 fallback 이미지 가져오기
export function getFallbackImage(category?: string): string {
  if (!category) return FALLBACK_IMAGES.default;
  
  const fallback = FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES];
  return fallback || FALLBACK_IMAGES.default;
}

import React from 'react';