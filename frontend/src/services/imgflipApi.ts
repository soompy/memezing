// ImgFlip API 서비스
import { MemeTemplate } from '@/components/meme/FabricCanvas';

// ImgFlip API 응답 타입
export interface ImgFlipMeme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

export interface ImgFlipApiResponse {
  success: boolean;
  data: {
    memes: ImgFlipMeme[];
  };
}

// 캐시된 템플릿 저장소
let cachedTemplates: MemeTemplate[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30분

/**
 * ImgFlip API에서 인기 밈 템플릿 목록을 가져옵니다
 */
export const fetchImgFlipTemplates = async (): Promise<MemeTemplate[]> => {
  try {
    // 캐시된 데이터가 있고 아직 유효하면 반환
    if (cachedTemplates && Date.now() - lastFetchTime < CACHE_DURATION) {
      return cachedTemplates;
    }

    console.log('Fetching meme templates from ImgFlip API...');
    
    const response = await fetch('https://api.imgflip.com/get_memes', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`ImgFlip API error: ${response.status}`);
    }

    const data: ImgFlipApiResponse = await response.json();

    if (!data.success || !data.data || !data.data.memes) {
      throw new Error('Invalid response from ImgFlip API');
    }

    // ImgFlip 밈을 MemeTemplate 형식으로 변환
    const templates: MemeTemplate[] = data.data.memes
      .slice(0, 50) // 상위 50개만 사용
      .map((meme) => convertImgFlipToTemplate(meme));

    // 캐시 업데이트
    cachedTemplates = templates;
    lastFetchTime = Date.now();

    console.log(`Successfully fetched ${templates.length} templates from ImgFlip`);
    return templates;

  } catch (error) {
    console.error('Failed to fetch ImgFlip templates:', error);
    
    // 에러 발생 시 빈 배열 반환 (폴백 로직은 호출하는 쪽에서 처리)
    return [];
  }
};

/**
 * ImgFlip 밈을 MemeTemplate 형식으로 변환
 */
const convertImgFlipToTemplate = (imgFlipMeme: ImgFlipMeme): MemeTemplate => {
  // 텍스트 박스 개수에 따라 기본 위치 설정
  const textBoxes = generateTextBoxes(imgFlipMeme.box_count, imgFlipMeme.width, imgFlipMeme.height);

  return {
    id: `imgflip-${imgFlipMeme.id}`,
    name: imgFlipMeme.name,
    url: imgFlipMeme.url,
    textBoxes,
    source: 'imgflip', // 출처 표시
    width: imgFlipMeme.width,
    height: imgFlipMeme.height,
  };
};

/**
 * 텍스트 박스 개수에 따라 적절한 위치에 텍스트 박스 생성
 */
const generateTextBoxes = (boxCount: number, imageWidth: number, imageHeight: number) => {
  const textBoxes = [];
  const boxWidth = Math.min(350, imageWidth * 0.8);
  const boxHeight = 50;
  
  for (let i = 0; i < Math.min(boxCount, 4); i++) { // 최대 4개까지만
    let x, y;
    
    if (boxCount === 1) {
      // 1개: 중앙 하단
      x = (imageWidth - boxWidth) / 2;
      y = imageHeight - boxHeight - 20;
    } else if (boxCount === 2) {
      // 2개: 상단, 하단
      x = (imageWidth - boxWidth) / 2;
      y = i === 0 ? 20 : imageHeight - boxHeight - 20;
    } else if (boxCount === 3) {
      // 3개: 상단, 중앙, 하단
      x = (imageWidth - boxWidth) / 2;
      if (i === 0) y = 20;
      else if (i === 1) y = (imageHeight - boxHeight) / 2;
      else y = imageHeight - boxHeight - 20;
    } else {
      // 4개 이상: 격자 형태
      const cols = 2;
      const row = Math.floor(i / cols);
      const col = i % cols;
      x = col === 0 ? 20 : imageWidth - boxWidth - 20;
      y = row === 0 ? 20 : imageHeight - boxHeight - 20;
    }

    textBoxes.push({
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: boxWidth,
      height: boxHeight,
      defaultText: `텍스트 ${i + 1}`,
    });
  }

  return textBoxes;
};

/**
 * 특정 밈의 상세 정보를 가져옵니다 (필요시 사용)
 */
export const getImgFlipMemeById = async (id: string): Promise<ImgFlipMeme | null> => {
  try {
    const templates = await fetchImgFlipTemplates();
    const template = templates.find(t => t.id === `imgflip-${id}`);
    
    if (!template) return null;
    
    // MemeTemplate을 ImgFlipMeme 형식으로 역변환
    return {
      id: id,
      name: template.name,
      url: template.url,
      width: template.width || 400,
      height: template.height || 400,
      box_count: template.textBoxes.length,
    };
  } catch (error) {
    console.error('Failed to get ImgFlip meme by ID:', error);
    return null;
  }
};

/**
 * 캐시 클리어 (필요시 사용)
 */
export const clearImgFlipCache = (): void => {
  cachedTemplates = null;
  lastFetchTime = 0;
  console.log('ImgFlip cache cleared');
};

/**
 * 캐시 상태 확인
 */
export const getImgFlipCacheStatus = () => {
  return {
    hasCachedData: cachedTemplates !== null,
    cacheAge: lastFetchTime ? Date.now() - lastFetchTime : 0,
    isExpired: Date.now() - lastFetchTime > CACHE_DURATION,
    templateCount: cachedTemplates?.length || 0,
  };
};