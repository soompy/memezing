import { MemeTemplate } from '@/components/meme/FabricCanvas';

// 밈 코인 템플릿 데이터
export const memeCoinTemplates: MemeTemplate[] = [
  {
    id: 'pepe-coin',
    name: 'PEPE 코인',
    url: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'HODL PEPE' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '🚀 TO THE MOON' }
    ]
  },
  {
    id: 'doge-coin',
    name: 'DOGE 코인',
    url: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    textBoxes: [
      { x: 50, y: 30, width: 150, height: 40, defaultText: 'such crypto' },
      { x: 250, y: 80, width: 120, height: 40, defaultText: 'much hodl' },
      { x: 30, y: 200, width: 140, height: 40, defaultText: 'very moon' },
      { x: 280, y: 250, width: 100, height: 40, defaultText: 'wow' }
    ]
  },
  {
    id: 'shiba-coin',
    name: 'SHIB 코인',
    url: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'SHIBA ARMY STRONG' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'BURNING SHIB 🔥' }
    ]
  },
  {
    id: 'bonk-coin',
    name: 'BONK 코인',
    url: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'BONK IT UP!' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'SOLANA MEME KING 👑' }
    ]
  },
  {
    id: 'floki-coin',
    name: 'FLOKI 코인',
    url: 'https://assets.coingecko.com/coins/images/16746/large/PNG_image.png',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'FLOKI VIKINGS' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'VALHALLA AWAITS ⚔️' }
    ]
  },
  {
    id: 'wif-coin',
    name: 'WIF 코인',
    url: 'https://assets.coingecko.com/coins/images/33767/large/dogwifhat.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'DOG WIF HAT' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'FASHION DOGE 🎩' }
    ]
  },
  {
    id: 'popcat-coin',
    name: 'POPCAT 코인',
    url: 'https://assets.coingecko.com/coins/images/33827/large/popcat.png',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'POP POP POP' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'CAT GO BRRRR 🐱' }
    ]
  },
  {
    id: 'book-of-meme',
    name: 'BOME 코인',
    url: 'https://assets.coingecko.com/coins/images/35352/large/photo_2024-03-15_10-50-40.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'BOOK OF MEME' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'MEME ENCYCLOPEDIA 📚' }
    ]
  }
];

// 밈 코인 카테고리
export const memeCoinCategories = [
  {
    id: 'classic-meme',
    name: '클래식 밈코인',
    description: '전통적인 밈코인들',
    coins: ['doge-coin', 'shiba-coin', 'pepe-coin', 'floki-coin']
  },
  {
    id: 'solana-meme',
    name: '솔라나 밈코인',
    description: '솔라나 체인의 밈코인들',
    coins: ['bonk-coin', 'wif-coin', 'popcat-coin']
  },
  {
    id: 'trending',
    name: '트렌딩 밈코인',
    description: '최근 인기 있는 밈코인들',
    coins: ['book-of-meme', 'wif-coin', 'popcat-coin', 'bonk-coin']
  }
];

// 밈 코인별 추천 텍스트
export const memeCoinTexts = {
  'pepe-coin': [
    'PEPECOIN TO $1',
    'FEELS GOOD MAN',
    'RARE PEPE DETECTED',
    'BUY THE DIP PEPE'
  ],
  'doge-coin': [
    'SUCH MOON',
    'MUCH WOW',
    'VERY CRYPTO',
    'TO THE MOON DOGE'
  ],
  'shiba-coin': [
    'SHIBA ARMY UNITE',
    'BURN SHIB BURN',
    'WOOF WOOF',
    'SHIB TO $0.01'
  ],
  'bonk-coin': [
    'BONK THE BONKERS',
    'SOLANA MEME KING',
    'BONK IT UP',
    'BONKERS GAINS'
  ]
};