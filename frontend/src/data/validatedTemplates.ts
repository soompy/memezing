import { MemeTemplate } from '@/components/meme/FabricCanvas';

// 검증된 유효한 밈 템플릿들 - 중복 제거 및 유효한 URL만 사용
export const validatedClassicTemplates: MemeTemplate[] = [
  {
    id: 'drake',
    name: '드레이크 밈',
    url: 'https://i.imgflip.com/30b1gx.jpg', // 검증됨
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '이건 별로' },
      { x: 10, y: 180, width: 200, height: 60, defaultText: '이게 좋아' }
    ]
  },
  {
    id: 'distracted-boyfriend',
    name: '한눈파는 남친',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    textBoxes: [
      { x: 50, y: 50, width: 150, height: 40, defaultText: '새로운 것' },
      { x: 250, y: 100, width: 120, height: 40, defaultText: '남친' },
      { x: 400, y: 80, width: 120, height: 40, defaultText: '기존 것' }
    ]
  },
  {
    id: 'woman-yelling-cat',
    name: '고양이 vs 여자',
    url: 'https://i.imgflip.com/345v97.jpg',
    textBoxes: [
      { x: 20, y: 20, width: 180, height: 50, defaultText: '화난 여자' },
      { x: 320, y: 150, width: 150, height: 50, defaultText: '무관심한 고양이' }
    ]
  },
  {
    id: 'two-buttons',
    name: '두 가지 선택',
    url: 'https://i.imgflip.com/1g8my4.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 180, height: 40, defaultText: '어려운 선택' },
      { x: 100, y: 120, width: 120, height: 30, defaultText: '선택 A' },
      { x: 250, y: 120, width: 120, height: 30, defaultText: '선택 B' }
    ]
  },
  {
    id: 'success-kid',
    name: '성공한 아이',
    url: 'https://i.imgflip.com/1bhk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '월요일인데' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '공휴일이다!' }
    ]
  }
];

export const validatedAnimalTemplates: MemeTemplate[] = [
  {
    id: 'doge',
    name: '도지 밈',
    url: 'https://i.imgflip.com/4t0m5.jpg',
    textBoxes: [
      { x: 50, y: 30, width: 150, height: 40, defaultText: 'such wow' },
      { x: 250, y: 80, width: 120, height: 40, defaultText: 'much meme' },
      { x: 30, y: 200, width: 140, height: 40, defaultText: 'very funny' },
      { x: 280, y: 250, width: 100, height: 40, defaultText: 'amaze' }
    ]
  },
  {
    id: 'surprised-pikachu',
    name: '놀란 피카칎',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '과제를 미뤄두고' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '마감일이 내일?' }
    ]
  },
  {
    id: 'evil-kermit',
    name: '악마 커밋',
    url: 'https://i.imgflip.com/1e7ql7.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '일찍 자야지' },
      { x: 210, y: 200, width: 180, height: 60, defaultText: '한 편만 더 보자' }
    ]
  }
];

export const validatedTrendingTemplates: MemeTemplate[] = [
  {
    id: 'stonks',
    name: '스톤크스',
    url: 'https://i.imgflip.com/37x4o4.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '잠깐 자는 동안' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '주식이 떡상했다 STONKS ↗️' }
    ]
  },
  {
    id: 'woman-pointing',
    name: '가리키는 여자',
    url: 'https://i.imgflip.com/4acd7.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 180, height: 60, defaultText: '제발 그만해' },
      { x: 200, y: 200, width: 180, height: 60, defaultText: '아니야 더 해야지' }
    ]
  }
];

export const validatedEmotionTemplates: MemeTemplate[] = [
  {
    id: 'hide-pain-harold',
    name: '고통 숨기는 해롤드',
    url: 'https://i.imgflip.com/gk5el.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '"괜찮냐?"' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '"네 괜찮아요 ^^"' }
    ]
  }
];

export const validatedKoreanDramaTemplates: MemeTemplate[] = [
  {
    id: 'korean-monday',
    name: '월요일 반응',
    url: 'https://i.imgflip.com/30b1gx.jpg', // drake meme 재사용
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 60, defaultText: '괜찮다고 했는데' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '괜찮지 않아...' }
    ]
  },
  {
    id: 'korean-thinking',
    name: '생각하는 사람',
    url: 'https://i.imgflip.com/1g7q4.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '이것도 해야 하고' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '저것도 해야 하고...' }
    ]
  },
  {
    id: 'korean-workplace',
    name: '직장인 고충',
    url: 'https://i.imgflip.com/1ur9b0.jpg', // distracted boyfriend 재사용
    textBoxes: [
      { x: 50, y: 50, width: 150, height: 40, defaultText: '야근' },
      { x: 250, y: 100, width: 120, height: 40, defaultText: '나' },
      { x: 400, y: 80, width: 120, height: 40, defaultText: '퇴근' }
    ]
  }
];

// 모든 템플릿을 내보내기
export const allValidatedTemplates = {
  classic: validatedClassicTemplates,
  animal: validatedAnimalTemplates,
  trending: validatedTrendingTemplates,
  emotion: validatedEmotionTemplates,
  koreanDrama: validatedKoreanDramaTemplates,
};