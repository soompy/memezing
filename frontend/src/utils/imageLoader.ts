// 이미지 로딩 유틸리티 함수들

export interface ImageLoadOptions {
  timeout?: number;
  retryCount?: number;
  useProxy?: boolean;
  fallbackUrl?: string;
  onProgress?: (loaded: number, total: number) => void;
}

export interface ImageLoadResult {
  success: boolean;
  url: string;
  originalUrl: string;
  error?: string;
  fromProxy?: boolean;
  cached?: boolean;
}

/**
 * CORS 안전한 이미지 로딩
 */
export async function loadImageSafely(
  url: string, 
  options: ImageLoadOptions = {}
): Promise<ImageLoadResult> {
  const {
    timeout = 10000,
    retryCount = 2,
    useProxy = true,
    fallbackUrl,
    onProgress
  } = options;

  // 첫 번째 시도: 직접 로딩
  try {
    const result = await loadImageDirect(url, { timeout, onProgress });
    return {
      success: true,
      url: result.url,
      originalUrl: url,
      fromProxy: false
    };
  } catch (directError) {
    console.warn('Direct image loading failed:', directError);
    
    // CORS 에러인지 확인
    if (isCorsError(directError) && useProxy) {
      // 두 번째 시도: 프록시 사용
      try {
        const proxyResult = await loadImageViaProxy(url, { timeout, onProgress });
        return {
          success: true,
          url: proxyResult.url,
          originalUrl: url,
          fromProxy: true,
          cached: proxyResult.cached
        };
      } catch (proxyError) {
        console.warn('Proxy image loading failed:', proxyError);
        
        // 세 번째 시도: 재시도
        if (retryCount > 0) {
          await delay(1000); // 1초 대기
          return loadImageSafely(url, { 
            ...options, 
            retryCount: retryCount - 1 
          });
        }
      }
    }
    
    // 폴백 URL 시도
    if (fallbackUrl && fallbackUrl !== url) {
      try {
        const fallbackResult = await loadImageSafely(fallbackUrl, {
          ...options,
          retryCount: 0,
          fallbackUrl: undefined // 무한 루프 방지
        });
        return {
          ...fallbackResult,
          originalUrl: url
        };
      } catch (fallbackError) {
        console.warn('Fallback image loading failed:', fallbackError);
      }
    }
    
    // 모든 시도가 실패한 경우
    return {
      success: false,
      url: '',
      originalUrl: url,
      error: getErrorMessage(directError)
    };
  }
}

/**
 * 직접 이미지 로딩
 */
async function loadImageDirect(
  url: string, 
  options: { timeout?: number; onProgress?: (loaded: number, total: number) => void }
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const { timeout = 10000, onProgress } = options;
    
    // 타임아웃 설정
    const timeoutId = setTimeout(() => {
      img.src = ''; // 로딩 중단
      reject(new Error('Image loading timeout'));
    }, timeout);
    
    // CORS 설정
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve({ url: img.src });
    };
    
    img.onerror = (error) => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    // 프로그레스 이벤트 (지원하는 브라우저에서만)
    if (onProgress && 'addEventListener' in img) {
      img.addEventListener('progress', (event: any) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      });
    }
    
    img.src = url;
  });
}

/**
 * 프록시를 통한 이미지 로딩
 */
async function loadImageViaProxy(
  url: string,
  options: { timeout?: number; onProgress?: (loaded: number, total: number) => void }
): Promise<{ url: string; cached?: boolean }> {
  const { timeout = 10000, onProgress } = options;
  
  // 프록시 URL 생성
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'image/*',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    // 캐시 여부 확인
    const cached = response.headers.get('X-Cache') === 'HIT';
    
    // Blob URL 생성
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    return { url: blobUrl, cached };
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Proxy request timeout');
    }
    throw error;
  }
}

/**
 * CORS 에러인지 확인
 */
function isCorsError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = error.toString?.()?.toLowerCase() || '';
  
  return (
    errorMessage.includes('cors') ||
    errorMessage.includes('cross-origin') ||
    errorMessage.includes('network error') ||
    errorString.includes('cors') ||
    errorString.includes('cross-origin')
  );
}

/**
 * 에러 메시지 추출
 */
function getErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * 지연 함수
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 여러 이미지를 병렬로 로딩
 */
export async function loadMultipleImages(
  urls: string[],
  options: ImageLoadOptions = {}
): Promise<ImageLoadResult[]> {
  const promises = urls.map(url => loadImageSafely(url, options));
  return Promise.all(promises);
}

/**
 * 이미지 사전 로딩 (캐시용)
 */
export async function preloadImages(
  urls: string[],
  options: ImageLoadOptions = {}
): Promise<void> {
  try {
    await loadMultipleImages(urls, { ...options, useProxy: true });
  } catch (error) {
    console.warn('Image preloading failed:', error);
  }
}

/**
 * 이미지 URL 검증
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'data:', 'blob:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * 이미지 크기 제한 확인
 */
export function checkImageSize(
  width: number, 
  height: number, 
  maxWidth = 4096, 
  maxHeight = 4096
): boolean {
  return width <= maxWidth && height <= maxHeight;
}