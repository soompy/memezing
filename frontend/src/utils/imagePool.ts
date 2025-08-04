// 밈 이미지 풀 관리 시스템
export interface MemeImagePool {
  id: string;
  name: string;
  category: 'popular' | 'animal' | 'trending' | 'emotion' | 'korean-drama';
  urls: string[]; // 여러 이미지 URL 풀
  textBoxes: {
    x: number;
    y: number;
    width: number;
    height: number;
    defaultText: string;
  }[];
  tags: string[]; // 검색용 태그
}

// 인기 밈 이미지 풀
const popularMemePool: MemeImagePool[] = [
  {
    id: 'drake',
    name: '드레이크 밈',
    category: 'popular',
    urls: [
      'https://i.imgflip.com/30b1gx.jpg',
      'https://i.imgflip.com/26am.jpg', // This is Fine 대체 이미지
      'https://i.imgflip.com/1ur9b0.jpg' // 다른 인기 이미지
    ],
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '이건 별로' },
      { x: 10, y: 180, width: 200, height: 60, defaultText: '이게 좋아' }
    ],
    tags: ['drake', '선택', '비교', '취향']
  },
  {
    id: 'distracted-boyfriend',
    name: '한눈파는 남친',
    category: 'popular',
    urls: [
      'https://i.imgflip.com/1ur9b0.jpg',
      'https://i.imgflip.com/345v97.jpg', // Woman Yelling Cat 대체
      'https://i.imgflip.com/1g8my4.jpg'  // Two Buttons 대체
    ],
    textBoxes: [
      { x: 50, y: 50, width: 150, height: 40, defaultText: '새로운 것' },
      { x: 250, y: 100, width: 120, height: 40, defaultText: '남친' },
      { x: 400, y: 80, width: 120, height: 40, defaultText: '기존 것' }
    ],
    tags: ['관계', '선택', '유혹', '남친']
  },
  {
    id: 'woman-yelling-cat',
    name: '고양이 vs 여자',
    category: 'popular',
    urls: [
      'https://i.imgflip.com/345v97.jpg',
      'https://i.imgflip.com/8p0a.jpg', // Grumpy Cat
      'https://i.imgflip.com/2kbn1e.jpg' // Surprised Pikachu
    ],
    textBoxes: [
      { x: 20, y: 20, width: 180, height: 50, defaultText: '화난 여자' },
      { x: 320, y: 150, width: 150, height: 50, defaultText: '무관심한 고양이' }
    ],
    tags: ['논쟁', '고양이', '여자', '대립']
  }
];

// 동물 밈 이미지 풀
const animalMemePool: MemeImagePool[] = [
  {
    id: 'doge',
    name: '도지 밈',
    category: 'animal',
    urls: [
      'https://i.imgflip.com/4t0m5.jpg',
      'https://i.imgflip.com/1bhk.jpg', // Success Kid
      'https://i.imgflip.com/16iyn1.jpg' // Kermit Tea
    ],
    textBoxes: [
      { x: 50, y: 30, width: 150, height: 40, defaultText: 'such wow' },
      { x: 250, y: 80, width: 120, height: 40, defaultText: 'much meme' },
      { x: 30, y: 200, width: 140, height: 40, defaultText: 'very funny' },
      { x: 280, y: 250, width: 100, height: 40, defaultText: 'amaze' }
    ],
    tags: ['개', '도지', '귀여움', '밈']
  },
  {
    id: 'grumpy-cat',
    name: '불뚝고양이',
    category: 'animal',
    urls: [
      'https://i.imgflip.com/8p0a.jpg',
      'https://i.imgflip.com/2d3al6.jpg', // Crying Cat
      'https://i.imgflip.com/345v97.jpg'   // Woman Yelling Cat
    ],
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '월요일이 좋다고?' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'NO.' }
    ],
    tags: ['고양이', '화남', '거부', '월요일']
  }
];

// 한국 드라마/콘텐츠 이미지 풀 (한국적 상황에 맞는 밈 이미지들)
const koreanContentPool: MemeImagePool[] = [
  {
    id: 'korean-thinking',
    name: '깊은 생각에 빠진 모습',
    category: 'korean-drama',
    urls: [
      // 한국적 상황을 표현할 수 있는 다양한 밈 이미지들
      'https://i.imgflip.com/1wz1x.jpg',  // Confused Nick Young - 혼란스러운 상황용
      'https://i.imgflip.com/2kbn1e.jpg', // Surprised Pikachu - 놀라운 상황용
      'https://i.imgflip.com/1h7in3.jpg', // Roll Safe - 현명한 판단용
      'https://i.imgflip.com/16iyn1.jpg'  // Kermit Tea - 관찰하는 상황용
    ],
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '음... 이건 좀 고민되네' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '어떻게 해야 할까?' }
    ],
    tags: ['한국', '생각', '고민', '선택', '드라마']
  },
  {
    id: 'korean-shocked',
    name: '충격받은 표정',
    category: 'korean-drama',
    urls: [
      'https://i.imgflip.com/2kbn1e.jpg', // Surprised Pikachu
      'https://i.imgflip.com/oqzb4.jpg',  // Angry Baby - 화난 상황용
      'https://i.imgflip.com/1wz1x.jpg',  // Confused Nick Young
      'https://i.imgflip.com/345v97.jpg'  // Woman Yelling Cat - 격한 반응용
    ],
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '헉! 이게 뭐야?!' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '말도 안 돼!' }
    ],
    tags: ['한국', '충격', '놀람', '반응', '대박']
  },
  {
    id: 'korean-dramatic',
    name: '드라마틱한 표정',
    category: 'korean-drama',
    urls: [
      'https://i.imgflip.com/26am.jpg',   // This is Fine - 괜찮은 척 하는 상황
      'https://i.imgflip.com/2d3al6.jpg', // Crying Cat - 슬픈 상황용
      'https://i.imgflip.com/15s2g3.jpg', // Happy Seal - 기쁜 상황용
      'https://i.imgflip.com/1h7in3.jpg'  // Roll Safe - 자신만만한 상황용
    ],
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '이런 일이...' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '있을 수가!' }
    ],
    tags: ['한국', '드라마', '감정', '표현', 'K-드라마']
  },
  {
    id: 'korean-monday',
    name: '월요일 반응',
    category: 'korean-drama',
    urls: [
      'https://i.imgflip.com/8p0a.jpg',   // Grumpy Cat - 싫어하는 상황
      'https://i.imgflip.com/2d3al6.jpg', // Crying Cat - 슬픈 상황
      'https://i.imgflip.com/26am.jpg',   // This is Fine - 체념하는 상황
      'https://i.imgflip.com/oqzb4.jpg'   // Angry Baby - 화나는 상황
    ],
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '괜찮다고 했는데' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '괜찮지 않아...' }
    ],
    tags: ['한국', '월요일', '직장', '학교', '월요병']
  },
  {
    id: 'korean-variety-reaction',
    name: '한국 예능 리액션',
    category: 'korean-drama',
    urls: [
      'https://i.imgflip.com/15s2g3.jpg', // Happy Seal - 즐거운 반응
      'https://i.imgflip.com/1bhk.jpg',   // Success Kid - 성공한 상황
      'https://i.imgflip.com/4t0m5.jpg',  // Doge - 재미있는 상황
      'https://i.imgflip.com/16iyn1.jpg'  // Kermit Tea - 관전하는 상황
    ],
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '이거 완전 웃겨' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'ㅋㅋㅋㅋㅋ' }
    ],
    tags: ['한국', '예능', '리액션', '웃음', 'K-예능', '재미']
  }
];

// 모든 이미지 풀 통합
const allImagePools = [
  ...popularMemePool,
  ...animalMemePool,
  ...koreanContentPool
];

// 랜덤 이미지 선택 함수
export function getRandomImageFromPool(poolId: string): string {
  const pool = allImagePools.find(p => p.id === poolId);
  if (!pool || pool.urls.length === 0) {
    return 'https://i.imgflip.com/30b1gx.jpg'; // 기본 이미지
  }
  
  const randomIndex = Math.floor(Math.random() * pool.urls.length);
  return pool.urls[randomIndex];
}

// 카테고리별 이미지 풀 가져오기
export function getImagePoolsByCategory(category: string): MemeImagePool[] {
  return allImagePools.filter(pool => pool.category === category);
}

// 모든 이미지 풀 가져오기
export function getAllImagePools(): MemeImagePool[] {
  return allImagePools;
}

// 태그로 검색
export function searchImagePoolsByTag(tag: string): MemeImagePool[] {
  return allImagePools.filter(pool => 
    pool.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

// 이미지 풀을 밈 템플릿으로 변환 (랜덤 이미지 포함)
export function convertPoolToTemplate(pool: MemeImagePool): any {
  return {
    id: pool.id,
    name: pool.name,
    url: getRandomImageFromPool(pool.id),
    textBoxes: pool.textBoxes
  };
}

// 인기 템플릿 생성 (매번 랜덤 이미지로)
export function generateRandomPopularTemplates(): any[] {
  return popularMemePool.map(pool => convertPoolToTemplate(pool));
}

// 동물 템플릿 생성 (매번 랜덤 이미지로)
export function generateRandomAnimalTemplates(): any[] {
  return animalMemePool.map(pool => convertPoolToTemplate(pool));
}

// 한국 콘텐츠 템플릿 생성 (매번 랜덤 이미지로)
export function generateRandomKoreanTemplates(): any[] {
  return koreanContentPool.map(pool => convertPoolToTemplate(pool));
}