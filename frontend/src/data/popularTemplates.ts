import { MemeTemplate } from '@/components/meme/FabricCanvas';

// 가장 인기 있는 20개 밈 템플릿 선정
export const popularTemplates: MemeTemplate[] = [
  // 클래식 필수 템플릿들
  {
    id: 'drake',
    name: '드레이크 밈 (좋아/싫어)',
    url: 'https://i.imgflip.com/30b1gx.jpg',
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
    name: '두 가지 선택 (어려운 결정)',
    url: 'https://i.imgflip.com/1g8my4.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 180, height: 40, defaultText: '어려운 선택' },
      { x: 100, y: 120, width: 120, height: 30, defaultText: '선택 A' },
      { x: 250, y: 120, width: 120, height: 30, defaultText: '선택 B' }
    ]
  },
  {
    id: 'success-kid',
    name: '성공한 아이 (성취감)',
    url: 'https://i.imgflip.com/1bhk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '월요일인데' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '공휴일이다!' }
    ]
  },

  // 동물 템플릿들
  {
    id: 'doge',
    name: '도지 밈 (멀티 텍스트)',
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
    name: '놀란 피카츄 (충격)',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '과제를 미뤄두고' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '마감일이 내일?' }
    ]
  },
  {
    id: 'evil-kermit',
    name: '악마 커밋 (내면의 갈등)',
    url: 'https://i.imgflip.com/1e7ql7.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '일찍 자야지' },
      { x: 210, y: 200, width: 180, height: 60, defaultText: '한 편만 더 보자' }
    ]
  },

  // 감정 표현
  {
    id: 'hide-pain-harold',
    name: '고통 숨기는 해롤드 (괜찮은 척)',
    url: 'https://i.imgflip.com/gk5el.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '"괜찮냐?"' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '"네 괜찮아요 ^^"' }
    ]
  },

  // 추가 인기 템플릿들 (검증된 URL만 사용)
  {
    id: 'change-my-mind',
    name: '내 생각을 바꿔봐',
    url: 'https://i.imgflip.com/24y43o.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '논란이 될 만한 의견' },
      { x: 10, y: 320, width: 200, height: 40, defaultText: 'CHANGE MY MIND' }
    ]
  },
  {
    id: 'this-is-fine',
    name: '괜찮아 이건 (상황 부정)',
    url: 'https://i.imgflip.com/26am.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '모든게 엉망이지만' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '괜찮아 이건' }
    ]
  },
  {
    id: 'mocking-spongebob',
    name: '조롱하는 스폰지밥',
    url: 'https://i.imgflip.com/1otk96.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '평범한 말' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'PlAiN tExT LiKe ThIs' }
    ]
  },
  {
    id: 'roll-safe',
    name: '똑똑한 흑인 (현명한 조언)',
    url: 'https://i.imgflip.com/1h7in3.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '문제가 생길 수 없어' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '애초에 시도를 안 하면' }
    ]
  },
  {
    id: 'first-time',
    name: '처음이야? (경험자의 여유)',
    url: 'https://i.imgflip.com/1bij.jpg',
    textBoxes: [
      { x: 50, y: 200, width: 150, height: 50, defaultText: '처음이야?' }
    ]
  },
  {
    id: 'uno-draw-25',
    name: 'UNO 25장 뽑기',
    url: 'https://i.imgflip.com/3lmzyx.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 40, defaultText: '해야 할 일' },
      { x: 250, y: 150, width: 140, height: 40, defaultText: 'UNO 25장 뽑기' }
    ]
  },
  // 추가로 검증된 템플릿들 (중복 이미지 제거됨)
  {
    id: 'awkward-penguin',
    name: '어색한 상황',
    url: 'https://i.imgflip.com/5c7lwm.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '어색한 상황' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '그냥 웃어넘기자...' }
    ]
  },
  {
    id: 'confession-bear',
    name: '솔직한 고백',
    url: 'https://i.imgflip.com/16x6u0.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '솔직히 말하면...' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '비밀스러운 고백' }
    ]
  },
  {
    id: 'bad-luck-brian',
    name: '불운한 상황',
    url: 'https://i.imgflip.com/g1ur.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '좋은 일이 생겼는데' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '결국 망했다' }
    ]
  },
  {
    id: 'philosoraptor',
    name: '생각하는 시간',
    url: 'https://i.imgflip.com/8xwk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '생각해보니...' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '철학적인 질문' }
    ]
  }
];