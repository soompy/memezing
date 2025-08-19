import { MemeTemplate } from '@/components/meme/FabricCanvas';

// K-드라마/K-콘텐츠 스타일의 텍스트를 활용한 템플릿들
// 기존 검증된 이미지 + 한국적 상황/텍스트 조합
export const koreanStyleTemplates: MemeTemplate[] = [
  {
    id: 'kdrama-drake',
    name: '드라마 선택지 (좋아/싫어)',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '재벌 2세와 결혼' },
      { x: 10, y: 180, width: 200, height: 60, defaultText: '평범한 남자와 진짜 사랑' }
    ]
  },
  {
    id: 'kdrama-distracted',
    name: '삼각관계 (드라마 클리셰)',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    textBoxes: [
      { x: 50, y: 50, width: 150, height: 40, defaultText: '첫사랑' },
      { x: 250, y: 100, width: 120, height: 40, defaultText: '주인공' },
      { x: 400, y: 80, width: 120, height: 40, defaultText: '현재 애인' }
    ]
  },
  {
    id: 'kdrama-shocked',
    name: '드라마 반전 (충격)',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '그 사람이 내 형이었어?' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '운명의 장난이야...' }
    ]
  },
  {
    id: 'kdrama-choice',
    name: '드라마 선택의 순간',
    url: 'https://i.imgflip.com/1g8my4.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 180, height: 40, defaultText: '어려운 선택' },
      { x: 100, y: 120, width: 120, height: 30, defaultText: '사랑을 택한다' },
      { x: 250, y: 120, width: 120, height: 30, defaultText: '성공을 택한다' }
    ]
  },
  {
    id: 'kdrama-success',
    name: '드라마 해피엔딩',
    url: 'https://i.imgflip.com/1bhk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '마침내 진실을 밝혀내고' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '해피엔딩!' }
    ]
  },
  {
    id: 'kdrama-pain',
    name: '드라마 고통 참기',
    url: 'https://i.imgflip.com/gk5el.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '"괜찮아?"' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '"응... 괜찮아 (눈물 참으며)"' }
    ]
  },
  {
    id: 'kpop-decision',
    name: 'K-POP 팬심',
    url: 'https://i.imgflip.com/1e7ql7.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '돈을 아껴야지' },
      { x: 210, y: 200, width: 180, height: 60, defaultText: '굿즈 하나만 더...' }
    ]
  },
  {
    id: 'korean-office',
    name: '한국 직장생활',
    url: 'https://i.imgflip.com/26am.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '야근이 일상이고' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '이건 정상이야' }
    ]
  },
  {
    id: 'korean-food',
    name: '한국 음식 자랑',
    url: 'https://i.imgflip.com/24y43o.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '김치가 세계 최고 발효식품이다' },
      { x: 10, y: 320, width: 200, height: 40, defaultText: 'CHANGE MY MIND' }
    ]
  },
  {
    id: 'korean-age',
    name: '한국 나이 시스템',
    url: 'https://i.imgflip.com/1otk96.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '만 나이로 25살' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '한국 나이로는 27살' }
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
    id: 'korean-exam',
    name: '한국 교육열',
    url: 'https://i.imgflip.com/1bij.jpg',
    textBoxes: [
      { x: 50, y: 200, width: 150, height: 50, defaultText: '수능 처음이야?' }
    ]
  }
];

// 한국 상황별 추천 텍스트
export const koreanSituationTexts = {
  workplace: [
    '회식은 참석이 기본',
    '야근이 일상',
    '선배에게 깍듯이',
    '눈치보며 퇴근'
  ],
  drama: [
    '운명의 장난이야',
    '이게 바로 드라마지',
    '반전의 반전',
    '기억을 잃었어'
  ],
  kpop: [
    '최애가 1위 했어!',
    '굿즈 컬렉션 완성',
    '콘서트 티켓팅 성공',
    '덕질 비용 무한대'
  ],
  food: [
    '김치는 만능',
    '라면 + 김치 = 완벽',
    '삼겹살 + 소주',
    '치킨 + 맥주'
  ],
  student: [
    '수능 D-365',
    '학원 뺑뺑이',
    '야자는 기본',
    '서울대 가고 싶어'
  ]
};