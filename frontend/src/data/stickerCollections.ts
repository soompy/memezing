import type { StickerCategory, Sticker, SpeechBubble, StickerCollection } from '@/types/sticker';

// 스티커 카테고리 정의
export const STICKER_CATEGORIES: StickerCategory[] = [
  {
    id: 'trending',
    name: '트렌딩',
    icon: '🔥',
    description: '인기 밈 페이스',
    order: 0
  },
  {
    id: 'classic-memes',
    name: '클래식 밈',
    icon: '😂',
    description: '전설적인 밈 캐릭터들',
    order: 1
  },
  {
    id: 'rage-faces',
    name: '레이지 페이스',
    icon: '😡',
    description: '분노와 감정 표현',
    order: 2
  },
  {
    id: 'reaction-faces',
    name: '리액션',
    icon: '😮',
    description: '반응 표현 밈',
    order: 3
  },
  {
    id: 'speech-bubbles',
    name: '말풍선',
    icon: '💬',
    description: '다양한 스타일의 말풍선',
    order: 4
  }
];

// 말풍선 컬렉션
export const SPEECH_BUBBLES: SpeechBubble[] = [
  {
    id: 'speech-basic',
    name: '기본 말풍선',
    categoryId: 'speech-bubbles',
    url: '/stickers/speech-bubbles/basic.svg',
    width: 200,
    height: 100,
    type: 'speech-bubble',
    bubbleStyle: 'speech',
    tailPosition: 'bottom-left',
    tags: ['말풍선', '기본', 'speech'],
    popularity: 100,
    customizable: {
      backgroundColor: true,
      borderColor: true,
      borderWidth: true,
      fontSize: true,
      textColor: true,
      padding: true
    },
    defaultText: '여기에 텍스트를 입력하세요',
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'thought-cloud',
    name: '생각 구름',
    categoryId: 'speech-bubbles',
    url: '/stickers/speech-bubbles/thought.svg',
    width: 180,
    height: 120,
    type: 'speech-bubble',
    bubbleStyle: 'thought',
    tailPosition: 'bottom-center',
    tags: ['생각', '구름', 'thought'],
    popularity: 85,
    customizable: {
      backgroundColor: true,
      borderColor: false,
      borderWidth: false,
      fontSize: true,
      textColor: true,
      padding: true
    },
    defaultText: '흠...',
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'scream-bubble',
    name: '외침 말풍선',
    categoryId: 'speech-bubbles',
    url: '/stickers/speech-bubbles/scream.svg',
    width: 220,
    height: 80,
    type: 'speech-bubble',
    bubbleStyle: 'scream',
    tailPosition: 'bottom-center',
    tags: ['외침', '강조', 'scream'],
    popularity: 70,
    customizable: {
      backgroundColor: true,
      borderColor: true,
      borderWidth: true,
      fontSize: true,
      textColor: true,
      padding: true
    },
    defaultText: '와!',
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  }
];

// 클래식 밈 페이스 컬렉션 (SVG 구현)
export const CLASSIC_MEME_STICKERS: Sticker[] = [
  {
    id: 'troll-face',
    name: '트롤페이스',
    categoryId: 'classic-memes',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <ellipse cx="60" cy="80" rx="50" ry="35" fill="#F4C2A1" stroke="#000" stroke-width="2"/>
        <ellipse cx="45" cy="65" rx="8" ry="12" fill="#000"/>
        <ellipse cx="75" cy="65" rx="8" ry="12" fill="#000"/>
        <path d="M 30 85 Q 60 110 90 85" stroke="#000" stroke-width="3" fill="none"/>
        <path d="M 35 87 Q 60 105 85 87" stroke="#000" stroke-width="2" fill="none"/>
        <ellipse cx="60" cy="55" rx="3" ry="8" fill="#000"/>
      </svg>
    `),
    width: 120,
    height: 120,
    type: 'meme-face',
    tags: ['트롤', '장난', 'classic', 'troll'],
    popularity: 100,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'me-gusta',
    name: '미 구스타',
    categoryId: 'classic-memes',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="110" height="120" viewBox="0 0 110 120">
        <ellipse cx="55" cy="80" rx="45" ry="35" fill="#8B4513" stroke="#000" stroke-width="2"/>
        <ellipse cx="42" cy="70" rx="6" ry="8" fill="#FFF"/>
        <ellipse cx="68" cy="70" rx="6" ry="8" fill="#FFF"/>
        <ellipse cx="42" cy="70" rx="3" ry="4" fill="#000"/>
        <ellipse cx="68" cy="70" rx="3" ry="4" fill="#000"/>
        <path d="M 35 90 Q 55 105 75 90 Q 75 95 55 100 Q 35 95 35 90" fill="#000"/>
        <text x="55" y="110" text-anchor="middle" font-family="Arial" font-size="8" fill="#000">ME GUSTA</text>
      </svg>
    `),
    width: 110,
    height: 120,
    type: 'meme-face',
    tags: ['미구스타', '좋아', 'me gusta', 'like'],
    popularity: 95,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'forever-alone',
    name: '포에버 얼론',
    categoryId: 'classic-memes',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120">
        <ellipse cx="50" cy="70" rx="40" ry="30" fill="#F4C2A1" stroke="#000" stroke-width="2"/>
        <ellipse cx="38" cy="60" rx="4" ry="6" fill="#000"/>
        <ellipse cx="62" cy="60" rx="4" ry="6" fill="#000"/>
        <path d="M 30 80 Q 50 70 70 80" stroke="#000" stroke-width="2" fill="none"/>
        <circle cx="25" cy="65" r="2" fill="#00BFFF"/>
        <circle cx="75" cy="65" r="2" fill="#00BFFF"/>
        <text x="50" y="110" text-anchor="middle" font-family="Arial" font-size="6" fill="#000">FOREVER ALONE</text>
      </svg>
    `),
    width: 100,
    height: 120,
    type: 'meme-face',
    tags: ['외로움', '혼자', 'forever alone', 'lonely'],
    popularity: 90,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'pepe-sad',
    name: '슬픈 페페',
    categoryId: 'classic-memes',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <ellipse cx="50" cy="60" rx="35" ry="25" fill="#4CAF50" stroke="#000" stroke-width="2"/>
        <ellipse cx="40" cy="50" rx="6" ry="8" fill="#000"/>
        <ellipse cx="60" cy="50" rx="6" ry="8" fill="#000"/>
        <path d="M 25 70 Q 50 55 75 70" stroke="#000" stroke-width="2" fill="none"/>
        <circle cx="20" cy="55" r="2" fill="#00BFFF"/>
        <circle cx="80" cy="55" r="2" fill="#00BFFF"/>
        <ellipse cx="50" cy="45" rx="2" ry="6" fill="#000"/>
      </svg>
    `),
    width: 100,
    height: 100,
    type: 'meme-face',
    tags: ['페페', '슬픔', 'pepe', 'sad', 'frog'],
    popularity: 95,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'herp-derp',
    name: '헐프 덜프',
    categoryId: 'classic-memes',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120">
        <ellipse cx="50" cy="70" rx="40" ry="30" fill="#F4C2A1" stroke="#000" stroke-width="2"/>
        <ellipse cx="35" cy="60" rx="5" ry="8" fill="#000"/>
        <ellipse cx="65" cy="65" rx="3" ry="5" fill="#000"/>
        <ellipse cx="50" cy="50" rx="2" ry="6" fill="#000"/>
        <path d="M 30 85 Q 50 95 70 85" stroke="#000" stroke-width="2" fill="none"/>
        <line x1="25" y1="75" x2="30" y2="80" stroke="#000" stroke-width="2"/>
        <text x="50" y="110" text-anchor="middle" font-family="Arial" font-size="6" fill="#000">HERP DERP</text>
      </svg>
    `),
    width: 100,
    height: 120,
    type: 'meme-face',
    tags: ['헐프덜프', '바보', 'herp derp', 'stupid'],
    popularity: 85,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  }
];

// 레이지 페이스 컬렉션
export const RAGE_FACE_STICKERS: Sticker[] = [
  {
    id: 'rage-face',
    name: '레이지 페이스',
    categoryId: 'rage-faces',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <ellipse cx="60" cy="70" rx="45" ry="35" fill="#FF6B6B" stroke="#000" stroke-width="3"/>
        <ellipse cx="45" cy="55" rx="8" ry="6" fill="#000"/>
        <ellipse cx="75" cy="55" rx="8" ry="6" fill="#000"/>
        <path d="M 25 85 Q 60 105 95 85" stroke="#000" stroke-width="4" fill="none"/>
        <path d="M 40 45 L 50 35" stroke="#000" stroke-width="3"/>
        <path d="M 80 45 L 70 35" stroke="#000" stroke-width="3"/>
        <text x="60" y="110" text-anchor="middle" font-family="Arial" font-size="8" fill="#000" font-weight="bold">FUUUUU</text>
      </svg>
    `),
    width: 120,
    height: 120,
    type: 'meme-face',
    tags: ['분노', '화남', 'rage', 'angry'],
    popularity: 95,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'no-rage',
    name: 'NO 레이지',
    categoryId: 'rage-faces',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <ellipse cx="60" cy="70" rx="45" ry="35" fill="#FFB74D" stroke="#000" stroke-width="2"/>
        <ellipse cx="45" cy="60" rx="6" ry="8" fill="#000"/>
        <ellipse cx="75" cy="60" rx="6" ry="8" fill="#000"/>
        <ellipse cx="60" cy="45" rx="2" ry="8" fill="#000"/>
        <ellipse cx="60" cy="85" rx="15" ry="8" fill="#000"/>
        <text x="60" y="110" text-anchor="middle" font-family="Arial" font-size="12" fill="#FF0000" font-weight="bold">NO!</text>
      </svg>
    `),
    width: 120,
    height: 120,
    type: 'meme-face',
    tags: ['거부', '싫어', 'no', 'refuse'],
    popularity: 90,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'poker-face',
    name: '포커 페이스',
    categoryId: 'rage-faces',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <ellipse cx="60" cy="70" rx="45" ry="35" fill="#F4C2A1" stroke="#000" stroke-width="2"/>
        <ellipse cx="45" cy="60" rx="4" ry="6" fill="#000"/>
        <ellipse cx="75" cy="60" rx="4" ry="6" fill="#000"/>
        <ellipse cx="60" cy="50" rx="2" ry="6" fill="#000"/>
        <line x1="45" y1="85" x2="75" y2="85" stroke="#000" stroke-width="2"/>
        <text x="60" y="110" text-anchor="middle" font-family="Arial" font-size="6" fill="#000">POKER FACE</text>
      </svg>
    `),
    width: 120,
    height: 120,
    type: 'meme-face',
    tags: ['무표정', '포커페이스', 'poker', 'blank'],
    popularity: 85,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  }
];

// 리액션 페이스 컬렉션
export const REACTION_FACE_STICKERS: Sticker[] = [
  {
    id: 'lol-guy',
    name: 'LOL 가이',
    categoryId: 'reaction-faces',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120">
        <ellipse cx="50" cy="70" rx="40" ry="30" fill="#F4C2A1" stroke="#000" stroke-width="2"/>
        <path d="M 35 55 Q 40 50 45 55" stroke="#000" stroke-width="2" fill="none"/>
        <path d="M 55 55 Q 60 50 65 55" stroke="#000" stroke-width="2" fill="none"/>
        <ellipse cx="50" cy="50" rx="2" ry="6" fill="#000"/>
        <path d="M 25 85 Q 50 100 75 85" stroke="#000" stroke-width="3" fill="none"/>
        <text x="50" y="110" text-anchor="middle" font-family="Arial" font-size="8" fill="#000" font-weight="bold">LOL</text>
      </svg>
    `),
    width: 100,
    height: 120,
    type: 'meme-face',
    tags: ['lol', '웃음', 'laughing', 'funny'],
    popularity: 90,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'yao-ming',
    name: '야오밍 (비치 플리즈)',
    categoryId: 'reaction-faces',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120">
        <ellipse cx="50" cy="70" rx="40" ry="30" fill="#D4A574" stroke="#000" stroke-width="2"/>
        <ellipse cx="40" cy="60" rx="4" ry="6" fill="#000"/>
        <ellipse cx="60" cy="60" rx="4" ry="6" fill="#000"/>
        <ellipse cx="50" cy="50" rx="2" ry="6" fill="#000"/>
        <path d="M 30 80 Q 50 75 70 80" stroke="#000" stroke-width="2" fill="none"/>
        <path d="M 35 85 Q 50 90 65 85" stroke="#000" stroke-width="2" fill="none"/>
        <text x="50" y="110" text-anchor="middle" font-family="Arial" font-size="6" fill="#000">BITCH PLEASE</text>
      </svg>
    `),
    width: 100,
    height: 120,
    type: 'meme-face',
    tags: ['야오밍', '비웃음', 'yao ming', 'bitch please'],
    popularity: 85,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'okay-guy',
    name: '오케이 가이',
    categoryId: 'reaction-faces',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120">
        <ellipse cx="50" cy="70" rx="40" ry="30" fill="#F4C2A1" stroke="#000" stroke-width="2"/>
        <ellipse cx="40" cy="60" rx="4" ry="6" fill="#000"/>
        <ellipse cx="60" cy="60" rx="4" ry="6" fill="#000"/>
        <ellipse cx="50" cy="50" rx="2" ry="6" fill="#000"/>
        <path d="M 30 85 Q 50 75 70 85" stroke="#000" stroke-width="2" fill="none"/>
        <circle cx="25" cy="65" r="2" fill="#00BFFF"/>
        <text x="50" y="110" text-anchor="middle" font-family="Arial" font-size="8" fill="#000">OKAY...</text>
      </svg>
    `),
    width: 100,
    height: 120,
    type: 'meme-face',
    tags: ['오케이', '실망', 'okay', 'disappointed'],
    popularity: 80,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  },
  {
    id: 'challenge-accepted',
    name: '도전 수락',
    categoryId: 'reaction-faces',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <ellipse cx="60" cy="70" rx="45" ry="35" fill="#8B4513" stroke="#000" stroke-width="2"/>
        <ellipse cx="45" cy="60" rx="6" ry="8" fill="#FF0000"/>
        <ellipse cx="75" cy="60" rx="6" ry="8" fill="#FF0000"/>
        <path d="M 30 85 Q 60 75 90 85" stroke="#000" stroke-width="3" fill="none"/>
        <path d="M 40 45 L 50 35" stroke="#000" stroke-width="2"/>
        <path d="M 80 45 L 70 35" stroke="#000" stroke-width="2"/>
        <text x="60" y="110" text-anchor="middle" font-family="Arial" font-size="6" fill="#000" font-weight="bold">CHALLENGE ACCEPTED</text>
      </svg>
    `),
    width: 120,
    height: 120,
    type: 'meme-face',
    tags: ['도전', '수락', 'challenge', 'accepted'],
    popularity: 75,
    metadata: {
      transparent: true,
      vector: true,
      animated: false
    }
  }
];


// 전체 스티커 컬렉션
export const DEFAULT_STICKER_COLLECTION: StickerCollection = {
  id: 'meme-faces-collection',
  name: '클래식 밈 페이스 팩',
  description: '전설적인 밈 캐릭터들의 컬렉션',
  thumbnailUrl: '/stickers/collection-thumbnails/meme-faces.png',
  stickers: [
    ...SPEECH_BUBBLES,
    ...CLASSIC_MEME_STICKERS,
    ...RAGE_FACE_STICKERS,
    ...REACTION_FACE_STICKERS
  ],
  isDefault: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

// 카테고리별 스티커 가져오기
export function getStickersByCategory(categoryId: string): Sticker[] {
  return DEFAULT_STICKER_COLLECTION.stickers.filter(
    sticker => sticker.categoryId === categoryId
  );
}

// 인기 스티커 가져오기
export function getTrendingStickers(limit: number = 10): Sticker[] {
  return DEFAULT_STICKER_COLLECTION.stickers
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

// 스티커 검색
export function searchStickers(query: string): Sticker[] {
  const lowercaseQuery = query.toLowerCase();
  return DEFAULT_STICKER_COLLECTION.stickers.filter(sticker =>
    sticker.name.toLowerCase().includes(lowercaseQuery) ||
    sticker.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}