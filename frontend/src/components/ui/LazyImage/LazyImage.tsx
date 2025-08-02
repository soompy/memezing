'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  fallback = '/images/placeholder.png',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px'
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const currentImg = imgRef.current;
    if (!currentImg) return;

    // Intersection Observer로 viewport 진입 감지
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(currentImg);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageSrc = hasError ? fallback : src;
  const shouldLoad = isInView || isLoaded;

  return (
    <ImageContainer className={className}>
      {/* 플레이스홀더 */}
      {!isLoaded && (
        <Placeholder width={width} height={height}>
          {placeholder ? (
            <img src={placeholder} alt="" />
          ) : (
            <PlaceholderContent>
              <div className="spinner" />
            </PlaceholderContent>
          )}
        </Placeholder>
      )}

      {/* 실제 이미지 */}
      <Image
        ref={imgRef}
        src={shouldLoad ? imageSrc : ''}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        isLoaded={isLoaded}
        loading="lazy"
      />
    </ImageContainer>
  );
}

// Styled Components
const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--surface-hover);
`;

const Placeholder = styled.div<{ width?: number; height?: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-hover);
  
  ${({ width, height }) => width && height && `
    width: ${width}px;
    height: ${height}px;
  `}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.3;
  }
`;

const PlaceholderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 100px;

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-light);
    border-top: 2px solid var(--brand-primary);
    border-radius: 50%;
    animation: ${keyframes`
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    `} 1s linear infinite;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Image = styled.img<{ isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: ${({ isLoaded }) => (isLoaded ? 1 : 0)};
  
  ${({ isLoaded }) => isLoaded && `
    animation: ${fadeIn} 0.3s ease;
  `}
`;