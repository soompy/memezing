import { MemeTemplate } from '@/components/meme/FabricCanvas';

// 100% 검증되고 안정적인 템플릿들만 모음
export const stableTemplates: MemeTemplate[] = [
  // 클래식 템플릿들
  {
    id: 'drake',
    name: '드레이크 밈 (좋아/싫어)',
    url: 'https://i.imgflip.com/30b1gx.jpg', // 검증됨 ✓
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '이건 별로' },
      { x: 10, y: 180, width: 200, height: 60, defaultText: '이게 좋아' }
    ]
  },
  {
    id: 'distracted-boyfriend',
    name: '한눈파는 남친',
    url: 'https://i.imgflip.com/1ur9b0.jpg', // 검증됨 ✓
    textBoxes: [
      { x: 50, y: 50, width: 150, height: 40, defaultText: '새로운 것' },
      { x: 250, y: 100, width: 120, height: 40, defaultText: '남친' },
      { x: 400, y: 80, width: 120, height: 40, defaultText: '기존 것' }
    ]
  },
  {
    id: 'woman-yelling-cat',
    name: '고양이 vs 여자',
    url: 'https://i.imgflip.com/345v97.jpg', // 검증됨 ✓
    textBoxes: [
      { x: 20, y: 20, width: 180, height: 50, defaultText: '화난 여자' },
      { x: 320, y: 150, width: 150, height: 50, defaultText: '무관심한 고양이' }
    ]
  },
  {
    id: 'two-buttons',
    name: '두 가지 선택 (어려운 결정)',
    url: 'https://i.imgflip.com/1g8my4.jpg', // 검증됨 ✓
    textBoxes: [
      { x: 10, y: 10, width: 180, height: 40, defaultText: '어려운 선택' },
      { x: 100, y: 120, width: 120, height: 30, defaultText: '선택 A' },
      { x: 250, y: 120, width: 120, height: 30, defaultText: '선택 B' }
    ]
  },
  {
    id: 'success-kid',
    name: '성공한 아이 (성취감)',
    url: 'https://i.imgflip.com/1bhk.jpg', // 검증됨 ✓
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '월요일인데' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '공휴일이다!' }
    ]
  },

  // 동물 템플릿들
  {
    id: 'doge',
    name: '도지 밈 (멀티 텍스트)',
    url: 'https://i.imgflip.com/4t0m5.jpg', // 검증됨 ✓
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
    url: 'https://i.imgflip.com/2kbn1e.jpg', // 검증됨 ✓  
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '과제를 미뤄두고' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '마감일이 내일?' }
    ]
  },
  {
    id: 'evil-kermit',
    name: '악마 커밋 (내면의 갈등)',
    url: 'https://i.imgflip.com/1e7ql7.jpg', // 검증됨 ✓
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '일찍 자야지' },
      { x: 210, y: 200, width: 180, height: 60, defaultText: '한 편만 더 보자' }
    ]
  },

  // 감정 표현 템플릿들  
  {
    id: 'hide-pain-harold',
    name: '고통 숨기는 해롤드 (괜찮은 척)',
    url: 'https://i.imgflip.com/gk5el.jpg', // 검증됨 ✓
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: '"괜찮냐?"' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '"네 괜찮아요 ^^"' }
    ]
  }
];

// 카테고리별로 분류된 템플릿들
export const categorizedStableTemplates = {
  classic: stableTemplates.filter(t => 
    ['drake', 'distracted-boyfriend', 'woman-yelling-cat', 'two-buttons', 'success-kid'].includes(t.id)
  ),
  animal: stableTemplates.filter(t => 
    ['doge', 'surprised-pikachu', 'evil-kermit'].includes(t.id)
  ),
  emotion: stableTemplates.filter(t => 
    ['hide-pain-harold'].includes(t.id)
  ),
  trending: stableTemplates.filter(t => 
    ['surprised-pikachu', 'evil-kermit'].includes(t.id)
  ), // 동일한 템플릿 재사용
  korean: stableTemplates.filter(t => 
    ['drake', 'hide-pain-harold'].includes(t.id)
  ) // 한국적 상황에 맞게 재활용
};