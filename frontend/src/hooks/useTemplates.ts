// 템플릿 로딩을 위한 React 훅
import { useState, useEffect, useCallback, useRef } from 'react';
import { MemeTemplate } from '@/components/meme/FabricCanvas';
import { 
  getAllTemplates, 
  getRandomTemplates, 
  getTemplatesByCategory, 
  searchTemplates,
  getTemplateStats,
  clearTemplateCache
} from '@/services/templateService';
import { getCuratedTemplates } from '@/services/templateService';
import { CURATED_TEMPLATES } from '@/data/koreanMemeTemplates';

export interface UseTemplatesOptions {
  autoLoad?: boolean; // 자동으로 템플릿 로드할지 여부
  fallbackToCurated?: boolean; // 에러 시 큐레이션된 템플릿으로 폴백할지 여부
  cacheTimeout?: number; // 캐시 타임아웃 (ms)
}

export interface TemplateLoadState {
  templates: MemeTemplate[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  stats: any;
}

export interface UseTemplatesReturn extends TemplateLoadState {
  // 액션들
  loadAllTemplates: () => Promise<void>;
  loadRandomTemplates: (count?: number) => Promise<void>;
  loadTemplatesByCategory: (category: string) => Promise<void>;
  searchTemplates: (query: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
  clearCache: () => void;
  
  // 유틸리티
  getTemplateById: (id: string) => MemeTemplate | undefined;
  filterTemplatesBySource: (source: string) => MemeTemplate[];
}

const defaultOptions: UseTemplatesOptions = {
  autoLoad: true,
  fallbackToCurated: true,
  cacheTimeout: 15 * 60 * 1000, // 15분
};

export const useTemplates = (options: UseTemplatesOptions = {}): UseTemplatesReturn => {
  const opts = { ...defaultOptions, ...options };
  const [state, setState] = useState<TemplateLoadState>({
    templates: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
    stats: null,
  });

  // 중복 요청 방지를 위한 ref
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 상태 업데이트 헬퍼
  const updateState = useCallback((updates: Partial<TemplateLoadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 에러 핸들링 헬퍼
  const handleError = useCallback(async (error: any, fallbackAction?: () => Promise<MemeTemplate[]>) => {
    console.error('Template loading error:', error);
    
    let errorMessage = 'Failed to load templates';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // 폴백 로직
    if (opts.fallbackToCurated && fallbackAction) {
      try {
        console.log('Falling back to curated templates...');
        const fallbackTemplates = await fallbackAction();
        updateState({
          templates: fallbackTemplates,
          error: `${errorMessage} (fallback to curated templates)`,
          isLoading: false,
          lastUpdated: Date.now(),
        });
        return;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        errorMessage += ' (fallback also failed)';
      }
    }
    
    updateState({
      error: errorMessage,
      isLoading: false,
    });
  }, [opts.fallbackToCurated, updateState]);

  // 모든 템플릿 로드
  const loadAllTemplates = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    updateState({ isLoading: true, error: null });
    
    try {
      const templates = await getAllTemplates();
      const stats = await getTemplateStats();
      
      if (abortControllerRef.current?.signal.aborted) return;
      
      updateState({
        templates,
        stats,
        isLoading: false,
        lastUpdated: Date.now(),
      });
      
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) return;
      await handleError(error, () => Promise.resolve(getCuratedTemplates()));
    } finally {
      loadingRef.current = false;
    }
  }, [updateState, handleError]);

  // 랜덤 템플릿 로드 (큐레이션 템플릿 포함)
  const loadRandomTemplates = useCallback(async (count: number = 20) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    updateState({ isLoading: true, error: null });
    
    try {
      // ImgFlip API에서 랜덤 템플릿 가져오기
      const apiTemplates = await getRandomTemplates(Math.max(1, count - CURATED_TEMPLATES.length));
      
      // 큐레이션 템플릿과 API 템플릿을 합치기
      const allTemplates = [...CURATED_TEMPLATES, ...apiTemplates];
      
      // 요청된 개수만큼 랜덤하게 선택
      const shuffled = allTemplates.sort(() => Math.random() - 0.5);
      const selectedTemplates = shuffled.slice(0, count);
      
      updateState({
        templates: selectedTemplates,
        isLoading: false,
        lastUpdated: Date.now(),
      });
      
    } catch (error) {
      await handleError(error, () => Promise.resolve(CURATED_TEMPLATES.slice(0, count)));
    } finally {
      loadingRef.current = false;
    }
  }, [updateState, handleError]);

  // 카테고리별 템플릿 로드
  const loadTemplatesByCategory = useCallback(async (category: string) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    updateState({ isLoading: true, error: null });
    
    try {
      const templates = await getTemplatesByCategory(category);
      updateState({
        templates,
        isLoading: false,
        lastUpdated: Date.now(),
      });
      
    } catch (error) {
      await handleError(error, () => Promise.resolve(getCuratedTemplates()));
    } finally {
      loadingRef.current = false;
    }
  }, [updateState, handleError]);

  // 템플릿 검색
  const handleSearchTemplates = useCallback(async (query: string) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    updateState({ isLoading: true, error: null });
    
    try {
      const templates = await searchTemplates(query);
      updateState({
        templates,
        isLoading: false,
        lastUpdated: Date.now(),
      });
      
    } catch (error) {
      await handleError(error, () => Promise.resolve(getCuratedTemplates()));
    } finally {
      loadingRef.current = false;
    }
  }, [updateState, handleError]);

  // 템플릿 새로고침
  const refreshTemplates = useCallback(async () => {
    clearTemplateCache();
    await loadAllTemplates();
  }, [loadAllTemplates]);

  // 캐시 클리어
  const clearCache = useCallback(() => {
    clearTemplateCache();
    updateState({
      templates: [],
      lastUpdated: null,
      stats: null,
    });
  }, [updateState]);

  // ID로 템플릿 찾기
  const getTemplateById = useCallback((id: string): MemeTemplate | undefined => {
    return state.templates.find(template => template.id === id);
  }, [state.templates]);

  // 소스별 템플릿 필터링
  const filterTemplatesBySource = useCallback((source: string): MemeTemplate[] => {
    return state.templates.filter(template => template.source === source);
  }, [state.templates]);

  // 자동 로드
  useEffect(() => {
    if (opts.autoLoad && state.templates.length === 0 && !state.isLoading && !state.error) {
      loadAllTemplates();
    }
  }, [opts.autoLoad, state.templates.length, state.isLoading, state.error, loadAllTemplates]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      loadingRef.current = false;
    };
  }, []);

  return {
    ...state,
    loadAllTemplates,
    loadRandomTemplates,
    loadTemplatesByCategory,
    searchTemplates: handleSearchTemplates,
    refreshTemplates,
    clearCache,
    getTemplateById,
    filterTemplatesBySource,
  };
};