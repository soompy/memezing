import { MemeTemplate } from '@/components/meme/FabricCanvas';

// 개선된 템플릿 인터페이스
export interface ImprovedMemeTemplate extends MemeTemplate {
  category: 'classic' | 'animal' | 'trending' | 'emotion' | 'korean' | 'memecoin';
  tags: string[];
  popularity: number; // 1-10
  urls: {
    primary: string;
    fallback?: string;
    thumbnail?: string;
  };
  metadata?: {
    source?: string;
    license?: string;
    dateAdded?: string;
  };
}

// 검증된 외부 이미지 URL들
export const verifiedImageUrls = {
  classic: {
    drake: 'https://i.imgflip.com/30b1gx.jpg',
    distractedBoyfriend: 'https://i.imgflip.com/1ur9b0.jpg',
    womanYellingCat: 'https://i.imgflip.com/345v97.jpg',
    twoButtons: 'https://i.imgflip.com/1g8my4.jpg',
    successKid: 'https://i.imgflip.com/1bhk.jpg',
    expandingBrain: 'https://i.imgflip.com/1jhl6f.jpg',
  },
  animal: {
    doge: 'https://i.imgflip.com/4t0m5.jpg',
    grumpyCat: 'https://i.imgflip.com/30b1gx.jpg',
    surprisedPikachu: 'https://i.imgflip.com/2kbn1e.jpg',
    kermitTea: 'https://i.imgflip.com/26am.jpg',
    evilKermit: 'https://i.imgflip.com/1e7ql7.jpg',
    catKeyboard: 'https://i.imgflip.com/1kk.jpg',
  },
  trending: {
    thisIsFine: 'https://i.imgflip.com/15s2iwx.jpg',
    stonks: 'https://i.imgflip.com/37x4o4.jpg',
    womanPointing: 'https://i.imgflip.com/4acd7.jpg',
    galaxyBrain: 'https://i.imgflip.com/1jhl6f.jpg',
  },
  emotion: {
    cryingJordan: 'https://i.imgflip.com/9ehk.jpg',
    hidePainHarold: 'https://i.imgflip.com/gk5el.jpg',
    surprisedTom: 'https://i.imgflip.com/37y8cg.jpg',
    evilSmile: 'https://i.imgflip.com/2wifvo.jpg',
  },
} as const;

// 개선된 클래식 템플릿
export const improvedClassicTemplates: ImprovedMemeTemplate[] = [
  {
    id: 'drake',
    name: '드레이크 밈',
    category: 'classic',
    tags: ['선택', '비교', '드레이크'],
    popularity: 10,
    urls: {
      primary: verifiedImageUrls.classic.drake,
      thumbnail: verifiedImageUrls.classic.drake,
    },
    url: verifiedImageUrls.classic.drake, // 기존 호환성
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '이건 별로' },
      { x: 10, y: 180, width: 200, height: 60, defaultText: '이게 좋아' }
    ],
    metadata: {
      source: 'imgflip',
      license: 'fair-use',
      dateAdded: '2024-01-01',
    }
  },
  {
    id: 'distracted-boyfriend',
    name: '한눈파는 남친',
    category: 'classic',
    tags: ['선택', '유혹', '관계'],
    popularity: 9,
    urls: {
      primary: verifiedImageUrls.classic.distractedBoyfriend,
      thumbnail: verifiedImageUrls.classic.distractedBoyfriend,
    },
    url: verifiedImageUrls.classic.distractedBoyfriend,
    textBoxes: [
      { x: 50, y: 50, width: 150, height: 40, defaultText: '새로운 것' },
      { x: 250, y: 100, width: 120, height: 40, defaultText: '남친' },
      { x: 400, y: 80, width: 120, height: 40, defaultText: '기존 것' }
    ],
  },
  // ... 나머지 템플릿들
];

// 템플릿 관리 유틸리티
export class TemplateManager {
  private templates: Map<string, ImprovedMemeTemplate> = new Map();

  constructor(initialTemplates: ImprovedMemeTemplate[]) {
    initialTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // 카테고리별 템플릿 가져오기
  getByCategory(category: string): ImprovedMemeTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category)
      .sort((a, b) => b.popularity - a.popularity);
  }

  // 인기순 템플릿 가져오기
  getPopular(limit = 10): ImprovedMemeTemplate[] {
    return Array.from(this.templates.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  // 태그로 검색
  searchByTag(tag: string): ImprovedMemeTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.tags.includes(tag));
  }

  // 템플릿 추가/업데이트
  addTemplate(template: ImprovedMemeTemplate): void {
    this.templates.set(template.id, template);
  }

  // 템플릿 가져오기
  getTemplate(id: string): ImprovedMemeTemplate | undefined {
    return this.templates.get(id);
  }
}

// 전역 템플릿 매니저 인스턴스
export const templateManager = new TemplateManager(improvedClassicTemplates);