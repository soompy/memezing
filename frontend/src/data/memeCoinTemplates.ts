import { MemeTemplate } from '@/components/meme/FabricCanvas';

// 밈 코인 템플릿 데이터 - 검증된 안정적인 이미지 사용
export const memeCoinTemplates: MemeTemplate[] = [
  {
    id: 'doge-coin',
    name: 'DOGE 코인',
    url: 'https://i.imgflip.com/4t0m5.jpg', // 검증된 doge 이미지
    textBoxes: [
      { x: 50, y: 30, width: 150, height: 40, defaultText: 'such crypto' },
      { x: 250, y: 80, width: 120, height: 40, defaultText: 'much hodl' },
      { x: 30, y: 200, width: 140, height: 40, defaultText: 'very moon' },
      { x: 280, y: 250, width: 100, height: 40, defaultText: 'wow' }
    ]
  },
  {
    id: 'pepe-coin',
    name: 'PEPE 코인',
    url: 'https://i.imgflip.com/2kbn1e.jpg', // surprised pikachu 재사용
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'HODL PEPE' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '🚀 TO THE MOON' }
    ]
  },
  {
    id: 'bitcoin-coin',
    name: 'BTC 코인',
    url: 'https://i.imgflip.com/30b1gx.jpg', // drake 이미지 재사용
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'BITCOIN TO 100K' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'DIGITAL GOLD 💰' }
    ]
  },
  {
    id: 'shiba-coin',
    name: 'SHIB 코인',
    url: 'https://i.imgflip.com/1e7ql7.jpg', // evil kermit 재사용
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'SHIBA ARMY STRONG' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'BURNING SHIB 🔥' }
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