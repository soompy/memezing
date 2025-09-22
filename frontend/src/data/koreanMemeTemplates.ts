import type { MemeTemplate } from '@/components/meme/FabricCanvas';

// 한국 밈 템플릿 컬렉션
export const KOREAN_MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'korean-angry-cat',
    name: '화난 고양이 (한국어)',
    url: 'https://i.imgflip.com/1e7ql7.jpg',
    category: 'korean',
    region: 'ko',
    textBoxes: [
      { x: 10, y: 10, width: 300, height: 50, defaultText: '뭐라고?' },
      { x: 10, y: 250, width: 300, height: 50, defaultText: '다시 말해봐' }
    ],
    tags: ['화남', '고양이', '한국어', '분노'],
    popularity: 85,
    source: 'curated'
  },
  {
    id: 'korean-thinking-man',
    name: '생각하는 남자',
    url: 'https://i.imgflip.com/1g8my4.jpg',
    category: 'korean',
    region: 'ko',
    textBoxes: [
      { x: 10, y: 10, width: 300, height: 50, defaultText: '음...' },
      { x: 10, y: 250, width: 300, height: 50, defaultText: '이게 맞나?' }
    ],
    tags: ['생각', '고민', '한국어'],
    popularity: 80,
    source: 'curated'
  },
  {
    id: 'korean-surprised-pikachu',
    name: '놀란 피카츄',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
    category: 'korean',
    region: 'ko',
    textBoxes: [
      { x: 10, y: 10, width: 300, height: 50, defaultText: '어?' },
      { x: 10, y: 250, width: 300, height: 50, defaultText: '진짜?' }
    ],
    tags: ['놀람', '피카츄', '한국어', '포켓몬'],
    popularity: 90,
    source: 'curated'
  },
  {
    id: 'korean-drake-pointing',
    name: '드레이크 가리키기',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    category: 'korean',
    region: 'ko',
    textBoxes: [
      { x: 220, y: 30, width: 200, height: 120, defaultText: '이건 별로' },
      { x: 220, y: 150, width: 200, height: 120, defaultText: '이게 좋아' }
    ],
    tags: ['선택', '비교', '한국어', '드레이크'],
    popularity: 95,
    source: 'curated'
  },
  {
    id: 'korean-woman-yelling-cat',
    name: '소리치는 여자와 고양이',
    url: 'https://i.imgflip.com/345v97.jpg',
    category: 'korean',
    region: 'ko',
    textBoxes: [
      { x: 10, y: 10, width: 240, height: 80, defaultText: '야! 너 뭐해!' },
      { x: 250, y: 150, width: 240, height: 80, defaultText: '뭐?' }
    ],
    tags: ['싸움', '고양이', '한국어', '논쟁'],
    popularity: 85,
    source: 'curated'
  },
  {
    id: 'korean-expanding-brain',
    name: '확장되는 뇌',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    category: 'korean',
    region: 'ko',
    textBoxes: [
      { x: 170, y: 30, width: 200, height: 40, defaultText: '기본' },
      { x: 170, y: 100, width: 200, height: 40, defaultText: '좀 더' },
      { x: 170, y: 170, width: 200, height: 40, defaultText: '훨씬 더' },
      { x: 170, y: 240, width: 200, height: 40, defaultText: '완전히' }
    ],
    tags: ['발전', '단계', '한국어', '진화'],
    popularity: 80,
    source: 'curated'
  }
];

// 동물 밈 템플릿 컬렉션
export const ANIMAL_MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'grumpy-cat',
    name: '불만족 고양이',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    category: 'animal',
    textBoxes: [
      { x: 10, y: 10, width: 300, height: 50, defaultText: '싫어' },
      { x: 10, y: 250, width: 300, height: 50, defaultText: '정말 싫어' }
    ],
    tags: ['고양이', '불만', '동물'],
    popularity: 90,
    source: 'curated'
  },
  {
    id: 'doge',
    name: '도지',
    url: 'https://i.imgflip.com/4t0m5.jpg',
    category: 'animal',
    textBoxes: [
      { x: 50, y: 50, width: 100, height: 30, defaultText: 'much wow' },
      { x: 200, y: 100, width: 100, height: 30, defaultText: 'very meme' },
      { x: 100, y: 200, width: 100, height: 30, defaultText: 'such dog' }
    ],
    tags: ['개', '도지', '시바견', '동물'],
    popularity: 95,
    source: 'curated'
  },
  {
    id: 'success-kid',
    name: '성공 아기',
    url: 'https://i.imgflip.com/1bhk.jpg',
    category: 'animal',
    textBoxes: [
      { x: 10, y: 10, width: 300, height: 50, defaultText: '성공했다!' }
    ],
    tags: ['성공', '아기', '기쁨'],
    popularity: 85,
    source: 'curated'
  },
  {
    id: 'angry-cat',
    name: '화난 고양이',
    url: 'https://i.imgflip.com/1e7ql7.jpg',
    category: 'animal',
    textBoxes: [
      { x: 10, y: 10, width: 300, height: 50, defaultText: 'What did you say?' },
      { x: 10, y: 250, width: 300, height: 50, defaultText: 'Say that again!' }
    ],
    tags: ['고양이', '화남', '동물'],
    popularity: 80,
    source: 'curated'
  },
  {
    id: 'distracted-boyfriend',
    name: '바람피는 남자친구',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    category: 'animal',
    textBoxes: [
      { x: 50, y: 50, width: 100, height: 40, defaultText: '새로운 것' },
      { x: 200, y: 200, width: 100, height: 40, defaultText: '기존 것' },
      { x: 300, y: 100, width: 100, height: 40, defaultText: '나' }
    ],
    tags: ['선택', '바람', '관계'],
    popularity: 90,
    source: 'curated'
  }
];

// 모든 큐레이션 템플릿 합치기
export const CURATED_TEMPLATES: MemeTemplate[] = [
  ...KOREAN_MEME_TEMPLATES,
  ...ANIMAL_MEME_TEMPLATES
];