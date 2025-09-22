import { useState, useEffect, useCallback } from 'react';
import { preloadImages, loadImageSafely, ImageLoadResult } from '@/utils/imageLoader';

export interface PreloadOptions {
  maxConcurrent?: number;
  timeout?: number;
  retryCount?: number;
  useProxy?: boolean;
}

export interface PreloadState {
  isLoading: boolean;
  progress: number;
  completed: number;
  total: number;
  errors: string[];
  results: ImageLoadResult[];
}

/**
 * 이미지 사전 로딩 훅
 */
export function useImagePreloader(
  urls: string[],
  options: PreloadOptions = {}
) {
  const {
    maxConcurrent = 3,
    timeout = 10000,
    retryCount = 1,
    useProxy = true
  } = options;

  const [state, setState] = useState<PreloadState>({
    isLoading: false,
    progress: 0,
    completed: 0,
    total: urls.length,
    errors: [],
    results: []
  });

  const preload = useCallback(async () => {
    if (urls.length === 0) return;

    setState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      completed: 0,
      total: urls.length,
      errors: [],
      results: []
    }));

    const results: ImageLoadResult[] = [];
    const errors: string[] = [];
    let completed = 0;

    // 병렬 처리를 위한 청크 생성
    const chunks: string[][] = [];
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      chunks.push(urls.slice(i, i + maxConcurrent));
    }

    // 각 청크를 순차적으로 처리 (청크 내에서는 병렬)
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (url) => {
        try {
          const result = await loadImageSafely(url, {
            timeout,
            retryCount,
            useProxy
          });
          
          results.push(result);
          
          if (!result.success) {
            errors.push(`${url}: ${result.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${url}: ${errorMessage}`);
          
          results.push({
            success: false,
            url: '',
            originalUrl: url,
            error: errorMessage
          });
        }
        
        completed++;
        
        // 상태 업데이트
        setState(prev => ({
          ...prev,
          completed,
          progress: Math.round((completed / urls.length) * 100),
          errors: [...errors],
          results: [...results]
        }));
      });

      // 현재 청크 완료 대기
      await Promise.all(chunkPromises);
    }

    setState(prev => ({
      ...prev,
      isLoading: false
    }));
  }, [urls, maxConcurrent, timeout, retryCount, useProxy]);

  // URLs가 변경되면 자동 시작
  useEffect(() => {
    if (urls.length > 0) {
      preload();
    }
  }, [preload]);

  const retry = useCallback(() => {
    const failedUrls = state.results
      .filter(result => !result.success)
      .map(result => result.originalUrl);
    
    if (failedUrls.length > 0) {
      // 실패한 URL들만 다시 시도
      const retryPreloader = new Promise(async (resolve) => {
        setState(prev => ({
          ...prev,
          isLoading: true
        }));

        for (const url of failedUrls) {
          try {
            const result = await loadImageSafely(url, {
              timeout,
              retryCount: retryCount + 1, // 재시도 횟수 증가
              useProxy
            });

            // 기존 결과 업데이트
            setState(prev => ({
              ...prev,
              results: prev.results.map(r => 
                r.originalUrl === url ? result : r
              ),
              errors: result.success 
                ? prev.errors.filter(e => !e.startsWith(url))
                : prev.errors
            }));
          } catch (error) {
            console.error(`Retry failed for ${url}:`, error);
          }
        }

        setState(prev => ({
          ...prev,
          isLoading: false
        }));

        resolve(void 0);
      });

      return retryPreloader;
    }
  }, [state.results, timeout, retryCount, useProxy]);

  return {
    ...state,
    preload,
    retry,
    hasErrors: state.errors.length > 0,
    successCount: state.results.filter(r => r.success).length,
    failureCount: state.results.filter(r => !r.success).length
  };
}

/**
 * 단일 이미지 로딩 훅
 */
export function useImageLoader(url: string | null, options: PreloadOptions = {}) {
  const [state, setState] = useState<{
    isLoading: boolean;
    result: ImageLoadResult | null;
    error: string | null;
  }>({
    isLoading: false,
    result: null,
    error: null
  });

  const load = useCallback(async (imageUrl: string) => {
    setState({
      isLoading: true,
      result: null,
      error: null
    });

    try {
      const result = await loadImageSafely(imageUrl, {
        timeout: options.timeout || 10000,
        retryCount: options.retryCount || 1,
        useProxy: options.useProxy !== false
      });

      setState({
        isLoading: false,
        result,
        error: result.success ? null : result.error || 'Unknown error'
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setState({
        isLoading: false,
        result: null,
        error: errorMessage
      });

      throw error;
    }
  }, [options.timeout, options.retryCount, options.useProxy]);

  // URL이 변경되면 자동 로드
  useEffect(() => {
    if (url) {
      load(url);
    } else {
      setState({
        isLoading: false,
        result: null,
        error: null
      });
    }
  }, [url, load]);

  const retry = useCallback(() => {
    if (url) {
      return load(url);
    }
  }, [url, load]);

  return {
    ...state,
    load,
    retry,
    isSuccess: state.result?.success === true,
    isError: !!state.error || state.result?.success === false
  };
}