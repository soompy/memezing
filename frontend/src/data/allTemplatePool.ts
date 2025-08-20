import { MemeTemplate } from '@/components/meme/FabricCanvas';

// 전체 템플릿 풀 - 40개 이상의 다양한 템플릿들
export const allTemplatePool: MemeTemplate[] = [
  // 기존 인기 템플릿들
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
  {
    id: 'hide-pain-harold',
    name: '고통 숨기는 해롤드 (괜찮은 척)',
    url: 'https://i.imgflip.com/gk5el.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '"괜찮냐?"' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '"네 괜찮아요 ^^"' }
    ]
  },
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

  // 추가 템플릿들 (더 많은 다양성 제공)
  {
    id: 'expanding-brain',
    name: '진화하는 뇌 (단계별 깨달음)',
    url: 'https://i.imgflip.com/1jhl9f.jpg',
    textBoxes: [
      { x: 10, y: 30, width: 180, height: 40, defaultText: '기본 생각' },
      { x: 10, y: 120, width: 180, height: 40, defaultText: '좀 더 나은 생각' },
      { x: 10, y: 210, width: 180, height: 40, defaultText: '더 좋은 생각' },
      { x: 10, y: 300, width: 180, height: 40, defaultText: '최고의 깨달음' }
    ]
  },
  {
    id: 'disaster-girl',
    name: '재난 소녀 (흑막)',
    url: 'https://i.imgflip.com/5c7lwm.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '모든 것이 불타고 있을 때' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '나는 미소를 짓고 있다' }
    ]
  },
  {
    id: 'stonks',
    name: '스톤크스 (주식 상승)',
    url: 'https://i.imgflip.com/2ze47r.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '잠깐 자는 동안' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '주식이 떡상 STONKS ↗️' }
    ]
  },
  {
    id: 'galaxy-brain',
    name: '은하계 뇌 (극한의 지능)',
    url: 'https://i.imgflip.com/8xwk.jpg',
    textBoxes: [
      { x: 10, y: 50, width: 180, height: 40, defaultText: '일반인 생각' },
      { x: 10, y: 150, width: 180, height: 40, defaultText: '천재의 생각' },
      { x: 10, y: 250, width: 180, height: 40, defaultText: '신의 생각' }
    ]
  },
  {
    id: 'always-has-been',
    name: '항상 그랬어 (우주인)',
    url: 'https://i.imgflip.com/3cp8hk.jpg',
    textBoxes: [
      { x: 50, y: 50, width: 200, height: 40, defaultText: '이게 다 거짓말이었어?' },
      { x: 300, y: 300, width: 180, height: 40, defaultText: '항상 그랬어' }
    ]
  },
  {
    id: 'wojak-crying',
    name: '우는 보이잭',
    url: 'https://i.imgflip.com/2xscjb.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '슬픈 현실' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '왜 이럴까요...' }
    ]
  },
  {
    id: 'confused-nick',
    name: '혼란스러운 닉',
    url: 'https://i.imgflip.com/1wz1x.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '이게 뭔 상황이야?' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '????' }
    ]
  },
  {
    id: 'buff-doge',
    name: '버프 도지 vs 치즈 도지',
    url: 'https://i.imgflip.com/43a45p.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 180, height: 60, defaultText: '강한 나' },
      { x: 200, y: 200, width: 180, height: 60, defaultText: '약한 나' }
    ]
  },
  {
    id: 'monkey-puppet',
    name: '원숭이 인형 (어색함)',
    url: 'https://i.imgflip.com/3lmzyx.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '친구들이 싸울 때' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '그냥 조용히 있는 나' }
    ]
  },
  {
    id: 'panik-kalm-panik',
    name: '패닉-칼름-패닉',
    url: 'https://i.imgflip.com/5c7lwm.jpg',
    textBoxes: [
      { x: 10, y: 20, width: 380, height: 40, defaultText: 'PANIK' },
      { x: 10, y: 160, width: 380, height: 40, defaultText: 'KALM' },
      { x: 10, y: 300, width: 380, height: 40, defaultText: 'PANIK' }
    ]
  },

  // 한국적 상황 템플릿들
  {
    id: 'korean-office-life',
    name: '한국 직장생활',
    url: 'https://i.imgflip.com/gk5el.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '"야근 괜찮지?"' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '"네... 괜찮습니다 ㅠㅠ"' }
    ]
  },
  {
    id: 'korean-exam-hell',
    name: '한국 입시지옥',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '수능까지 D-365' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '벌써...?' }
    ]
  },
  {
    id: 'korean-delivery',
    name: '한국 배달문화',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '밖에 나가서 먹기' },
      { x: 10, y: 180, width: 200, height: 60, defaultText: '배달시켜서 먹기' }
    ]
  },
  {
    id: 'korean-hierarchy',
    name: '한국 서열문화',
    url: 'https://i.imgflip.com/1h7in3.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '선배한테 혼날 일이 없어' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '선배를 안 만나면' }
    ]
  },
  {
    id: 'korean-age-system',
    name: '한국 나이 시스템',
    url: 'https://i.imgflip.com/1otk96.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '만 나이로 25살' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '한국 나이로는 27살' }
    ]
  },

  // 트렌드/인터넷 문화 템플릿들
  {
    id: 'impostor-sus',
    name: '어몽어스 (의심스러움)',
    url: 'https://i.imgflip.com/4x1wc.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '조용히 있던 사람이' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '갑자기 말이 많네... SUS' }
    ]
  },
  {
    id: 'trade-offer',
    name: '거래 제안',
    url: 'https://i.imgflip.com/16x6u0.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '거래를 제안한다' },
      { x: 10, y: 160, width: 180, height: 40, defaultText: '내가 주는 것:' },
      { x: 200, y: 160, width: 180, height: 40, defaultText: '네가 주는 것:' }
    ]
  },
  {
    id: 'soyjak-wojak',
    name: '소이잭 vs 차드',
    url: 'https://i.imgflip.com/g1ur.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 180, height: 60, defaultText: '약한 주장' },
      { x: 200, y: 200, width: 180, height: 60, defaultText: '강한 반박' }
    ]
  }
];

// 각 새로고침마다 표시할 템플릿 개수
export const DISPLAY_TEMPLATE_COUNT = 20;