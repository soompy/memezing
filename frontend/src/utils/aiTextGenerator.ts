// AI 텍스트 생성을 위한 유틸리티 함수들

export interface MemeTextSuggestion {
  id: string;
  text: string;
  category: string;
  tone: 'funny' | 'sarcastic' | 'cute' | 'dramatic' | 'trendy';
}

// 밈 카테고리별 텍스트 템플릿
const memeTemplates = {
  monday: [
    "월요일이 또 왔다...",
    "주말은 어디갔지?",
    "월요병 급성기",
    "이제 겨우 월요일",
    "벌써 금요일인줄 알았는데"
  ],
  work: [
    "회사에서 나를 찾습니다",
    "야근은 내 운명",
    "퇴근시간이 언제죠?",
    "업무 폭탄 투하",
    "점심시간이 제일 행복해"
  ],
  study: [
    "시험 D-1",
    "공부는 언제 할까?",
    "과제 폭탄",
    "도서관 자리 전쟁",
    "커피만이 답이야"
  ],
  food: [
    "치킨이냐 피자냐 그것이 문제로다",
    "다이어트는 내일부터",
    "야식의 유혹",
    "맛있는 걸 먹고 죽자",
    "배고픈 시간"
  ],
  relationship: [
    "솔로부대 찬가",
    "연애가 뭔가요?",
    "썸 타는 중",
    "애인이 최고야",
    "혼자가 편해"
  ],
  kpop: [
    "아이돌 덕질하는 중",
    "콘서트 티켓팅 전쟁",
    "최애가 최고야",
    "덕질 = 행복",
    "앨범 사재기"
  ],
  drama: [
    "드라마 정주행 중",
    "몇화까지 봤지?",
    "다음화가 궁금해",
    "남주가 너무 멋있어",
    "결말 스포 금지"
  ],
  weather: [
    "오늘 날씨 어때?",
    "우산 챙겨야겠다",
    "덥다 더워",
    "춥다 추워",
    "완벽한 날씨"
  ],
  gaming: [
    "게임 한판만 더",
    "랭크게임의 늪",
    "팀운이 전부야",
    "롤 한게임?",
    "게임 중독자"
  ],
  trending: [
    "요즘 핫한 그것",
    "트렌드를 따라가자",
    "인스타 핫플",
    "요즘 애들은 모르지",
    "바로 그거야!"
  ]
};

// 감정/톤별 수식어
const toneModifiers = {
  funny: ["ㅋㅋㅋ", "ㅎㅎㅎ", "웃겨", "빵터짐", "ㅋㅋㅋㅋㅋ"],
  sarcastic: ["진짜?", "어머", "와우", "대박", "놀랍네"],
  cute: ["♥", "귀여워", "사랑해", "☆", "♡"],
  dramatic: ["!!!", "...", "으악", "아니야", "!!!"],
  trendy: ["인정", "리얼", "팩트", "ㅇㅈ", "맞음"]
};

// AI 텍스트 생성 함수 (실제로는 Claude API를 사용할 수 있지만, 여기서는 템플릿 기반으로 구현)
export function generateMemeText(
  category?: string,
  tone?: 'funny' | 'sarcastic' | 'cute' | 'dramatic' | 'trendy'
): MemeTextSuggestion[] {
  const suggestions: MemeTextSuggestion[] = [];
  
  // 카테고리별 텍스트 선택
  let templates: string[] = [];
  if (category && memeTemplates[category as keyof typeof memeTemplates]) {
    templates = memeTemplates[category as keyof typeof memeTemplates];
  } else {
    // 랜덤 카테고리에서 선택
    const categories = Object.keys(memeTemplates);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    templates = memeTemplates[randomCategory as keyof typeof memeTemplates];
    category = randomCategory;
  }
  
  // 3-5개의 제안 생성
  const numSuggestions = Math.min(5, templates.length);
  const selectedTemplates = [...templates].sort(() => 0.5 - Math.random()).slice(0, numSuggestions);
  
  selectedTemplates.forEach((template, index) => {
    let text = template;
    
    // 톤에 따른 수식어 추가 (50% 확률)
    if (tone && Math.random() > 0.5) {
      const modifiers = toneModifiers[tone];
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      text = Math.random() > 0.5 ? `${text} ${modifier}` : `${modifier} ${text}`;
    }
    
    suggestions.push({
      id: `suggestion-${Date.now()}-${index}`,
      text,
      category: category || 'general',
      tone: tone || 'funny'
    });
  });
  
  return suggestions;
}

// 컨텍스트 기반 텍스트 생성 (이미지나 기존 텍스트를 분석하여 관련 텍스트 생성)
export function generateContextualText(existingTexts: string[]): MemeTextSuggestion[] {
  // 기존 텍스트에서 키워드 추출 및 관련 카테고리 추정
  const keywords = existingTexts.join(' ').toLowerCase();
  
  let detectedCategory = 'trending';
  
  if (keywords.includes('월요') || keywords.includes('주말')) {
    detectedCategory = 'monday';
  } else if (keywords.includes('회사') || keywords.includes('업무') || keywords.includes('야근')) {
    detectedCategory = 'work';
  } else if (keywords.includes('공부') || keywords.includes('시험')) {
    detectedCategory = 'study';
  } else if (keywords.includes('치킨') || keywords.includes('피자') || keywords.includes('음식')) {
    detectedCategory = 'food';
  } else if (keywords.includes('연애') || keywords.includes('솔로')) {
    detectedCategory = 'relationship';
  } else if (keywords.includes('아이돌') || keywords.includes('콘서트')) {
    detectedCategory = 'kpop';
  } else if (keywords.includes('드라마') || keywords.includes('배우')) {
    detectedCategory = 'drama';
  } else if (keywords.includes('게임') || keywords.includes('롤')) {
    detectedCategory = 'gaming';
  }
  
  return generateMemeText(detectedCategory, 'funny');
}

// 한국어 밈 특화 랜덤 텍스트 생성
export function generateRandomKoreanMeme(): MemeTextSuggestion[] {
  const categories = Object.keys(memeTemplates);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const tones: Array<'funny' | 'sarcastic' | 'cute' | 'dramatic' | 'trendy'> = ['funny', 'sarcastic', 'cute', 'dramatic', 'trendy'];
  const randomTone = tones[Math.floor(Math.random() * tones.length)];
  
  return generateMemeText(randomCategory, randomTone);
}

// 실제 AI API를 사용하는 함수 (나중에 구현)
export async function generateAIText(_prompt: string): Promise<MemeTextSuggestion[]> {
  // TODO: 실제 AI API (Claude, GPT 등) 연동
  // 현재는 템플릿 기반 응답 반환
  
  try {
    // 임시로 랜덤 생성 사용
    await new Promise(resolve => setTimeout(resolve, 1000)); // API 호출 시뮬레이션
    return generateRandomKoreanMeme();
  } catch (error) {
    console.error('AI text generation failed:', error);
    return generateRandomKoreanMeme(); // 폴백
  }
}