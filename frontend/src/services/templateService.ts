// 통합 템플릿 서비스
import { MemeTemplate } from '@/components/meme/FabricCanvas';
import { fetchImgFlipTemplates } from './imgflipApi';
import { allValidatedTemplates } from '@/data/validatedTemplates';
import { memeCoinTemplates } from '@/data/memeCoinTemplates';

export interface TemplateSource {
  id: string;
  name: string;
  description: string;
  priority: number; // 우선순위 (낮을수록 높은 우선순위)
}

// 템플릿 소스 정의
export const TEMPLATE_SOURCES: TemplateSource[] = [
  {
    id: 'curated',
    name: '큐레이션',
    description: '엄선된 한국어 밈 템플릿',
    priority: 1,
  },
  {
    id: 'memecoin',
    name: '밈코인',
    description: '인기 밈코인 템플릿',
    priority: 2,
  },
  {
    id: 'imgflip',
    name: 'ImgFlip',
    description: '글로벌 인기 밈 템플릿',
    priority: 3,
  },
];

// 통합된 템플릿 캐시
let unifiedTemplateCache: MemeTemplate[] | null = null;
let lastUnifiedFetch: number = 0;
const UNIFIED_CACHE_DURATION = 15 * 60 * 1000; // 15분

/**
 * 모든 소스에서 템플릿을 가져와 통합합니다
 */
export const getAllTemplates = async (): Promise<MemeTemplate[]> => {
  try {
    // 캐시된 데이터가 있고 아직 유효하면 반환
    if (unifiedTemplateCache && Date.now() - lastUnifiedFetch < UNIFIED_CACHE_DURATION) {
      return unifiedTemplateCache;
    }

    console.log('Fetching templates from all sources...');
    
    // 병렬로 모든 소스에서 템플릿 가져오기
    const [curatedTemplates, imgflipTemplates] = await Promise.allSettled([
      getCuratedTemplates(),
      fetchImgFlipTemplates(),
    ]);

    // 결과 합치기
    const allTemplates: MemeTemplate[] = [];

    // 큐레이션된 템플릿 (최우선)
    if (curatedTemplates.status === 'fulfilled') {
      allTemplates.push(...curatedTemplates.value);
    }

    // ImgFlip 템플릿
    if (imgflipTemplates.status === 'fulfilled') {
      const filteredImgFlipTemplates = filterAndDeduplicateTemplates(
        imgflipTemplates.value,
        allTemplates
      );
      allTemplates.push(...filteredImgFlipTemplates);
    }

    // 캐시 업데이트
    unifiedTemplateCache = allTemplates;
    lastUnifiedFetch = Date.now();

    console.log(`Successfully fetched ${allTemplates.length} total templates`);
    return allTemplates;

  } catch (error) {
    console.error('Failed to fetch unified templates:', error);
    
    // 에러 발생 시 큐레이션된 템플릿만 반환
    return getCuratedTemplates();
  }
};

/**
 * 큐레이션된 템플릿 (기존 템플릿 + 밈코인)을 가져옵니다
 */
export const getCuratedTemplates = (): MemeTemplate[] => {
  const templates: MemeTemplate[] = [];
  
  // 기존 검증된 템플릿들
  Object.values(allValidatedTemplates).forEach(categoryTemplates => {
    templates.push(...categoryTemplates);
  });
  
  // 밈코인 템플릿들
  templates.push(...memeCoinTemplates);
  
  // 각 템플릿에 소스 정보 추가
  return templates.map(template => ({
    ...template,
    source: template.source || 'curated',
  }));
};

/**
 * 특정 카테고리의 템플릿만 가져옵니다
 */
export const getTemplatesByCategory = async (category: string): Promise<MemeTemplate[]> => {
  const allTemplates = await getAllTemplates();
  
  switch (category) {
    case 'popular':
      return allTemplates.slice(0, 20); // 상위 20개
    case 'korean':
      return allTemplates.filter(t => 
        t.source === 'curated' || t.source === 'memecoin'
      );
    case 'global':
      return allTemplates.filter(t => t.source === 'imgflip');
    case 'memecoin':
      return allTemplates.filter(t => t.source === 'memecoin');
    default:
      return allTemplates;
  }
};

/**
 * 랜덤 템플릿을 가져옵니다
 */
export const getRandomTemplates = async (count: number = 20): Promise<MemeTemplate[]> => {
  const allTemplates = await getAllTemplates();
  
  // 셔플 알고리즘
  const shuffled = [...allTemplates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * 템플릿 검색
 */
export const searchTemplates = async (query: string): Promise<MemeTemplate[]> => {
  if (!query.trim()) return [];
  
  const allTemplates = await getAllTemplates();
  const lowerQuery = query.toLowerCase();
  
  return allTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.id.toLowerCase().includes(lowerQuery)
  );
};

/**
 * ImgFlip 템플릿을 필터링하고 중복 제거
 */
const filterAndDeduplicateTemplates = (
  imgflipTemplates: MemeTemplate[],
  existingTemplates: MemeTemplate[]
): MemeTemplate[] => {
  const existingUrls = new Set(existingTemplates.map(t => t.url));
  const existingNames = new Set(existingTemplates.map(t => t.name.toLowerCase()));
  
  return imgflipTemplates.filter(template => {
    // URL 중복 체크
    if (existingUrls.has(template.url)) return false;
    
    // 이름 유사성 체크 (간단한 버전)
    const templateName = template.name.toLowerCase();
    for (const existingName of existingNames) {
      if (templateName.includes(existingName) || existingName.includes(templateName)) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * 템플릿 통계 정보
 */
export const getTemplateStats = async () => {
  const allTemplates = await getAllTemplates();
  
  const stats = {
    total: allTemplates.length,
    bySource: {} as Record<string, number>,
    lastUpdated: lastUnifiedFetch,
    cacheStatus: unifiedTemplateCache ? 'cached' : 'fresh',
  };
  
  // 소스별 통계
  allTemplates.forEach(template => {
    const source = template.source || 'unknown';
    stats.bySource[source] = (stats.bySource[source] || 0) + 1;
  });
  
  return stats;
};

/**
 * 캐시 클리어
 */
export const clearTemplateCache = (): void => {
  unifiedTemplateCache = null;
  lastUnifiedFetch = 0;
  console.log('Template cache cleared');
};

/**
 * 템플릿 미리로드 (앱 시작시 호출)
 */
export const preloadTemplates = async (): Promise<void> => {
  try {
    console.log('Preloading templates...');
    await getAllTemplates();
    console.log('Templates preloaded successfully');
  } catch (error) {
    console.error('Failed to preload templates:', error);
  }
};