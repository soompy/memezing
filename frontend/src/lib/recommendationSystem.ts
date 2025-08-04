// 관심사 기반 밈 추천 시스템

export interface MemeTemplate {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  category: string;
  tags: string[];
  isActive: boolean;
  popularity?: number;
  createdAt?: string;
}

export interface UserPreference {
  category: string;
  value: string;
  weight: number;
  source: 'onboarding' | 'interaction' | 'explicit';
}

export interface RecommendationResult {
  template: MemeTemplate;
  score: number;
  reason: string;
}

// 관심사와 밈 카테고리/태그 매핑
const INTEREST_MAPPING: Record<string, string[]> = {
  humor: ['funny', 'comedy', 'joke', 'meme', 'viral'],
  kpop: ['music', 'kpop', 'idol', 'dance', 'concert'],
  drama: ['kdrama', 'romance', 'tv', 'series', 'acting'],
  animals: ['pet', 'cat', 'dog', 'cute', 'animal'],
  food: ['food', 'cooking', 'restaurant', 'korean', 'recipe'],
  gaming: ['game', 'gaming', 'esports', 'pc', 'mobile'],
  sports: ['sport', 'soccer', 'baseball', 'exercise', 'fitness'],
  study: ['study', 'student', 'exam', 'school', 'education'],
  relationship: ['love', 'couple', 'dating', 'romance', 'relationship'],
  work: ['office', 'work', 'job', 'business', 'career'],
  weather: ['weather', 'season', 'rain', 'snow', 'temperature'],
  politics: ['news', 'politics', 'society', 'current', 'issue']
};

// 샘플 밈 템플릿 데이터 (실제로는 API나 데이터베이스에서 가져올 것)
export const SAMPLE_MEME_TEMPLATES: MemeTemplate[] = [
  // 유머 관련
  {
    id: 'distracted-boyfriend',
    name: '딴 데 보는 남자친구',
    description: '선택의 딜레마를 표현할 때 사용',
    imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
    category: 'funny',
    tags: ['funny', 'choice', 'meme', 'viral'],
    isActive: true,
    popularity: 95
  },
  {
    id: 'drake-pointing',
    name: '드레이크 포인팅',
    description: '좋은 것과 나쁜 것을 비교할 때',
    imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
    category: 'funny',
    tags: ['funny', 'comparison', 'choice', 'viral'],
    isActive: true,
    popularity: 90
  },
  
  // 음식 관련
  {
    id: 'korean-food-reaction',
    name: '한국 음식 반응',
    description: '맛있는 한국 음식을 먹을 때의 반응',
    imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
    category: 'food',
    tags: ['food', 'korean', 'reaction', 'delicious'],
    isActive: true,
    popularity: 80
  },
  
  // 직장 관련
  {
    id: 'office-worker-tired',
    name: '지친 직장인',
    description: '월요일 아침이나 야근할 때의 심정',
    imageUrl: 'https://i.imgflip.com/1bhk.jpg',
    category: 'work',
    tags: ['work', 'office', 'tired', 'monday'],
    isActive: true,
    popularity: 85
  },
  
  // 연애 관련
  {
    id: 'couple-argument',
    name: '커플 싸움',
    description: '연인과의 갈등 상황을 표현',
    imageUrl: 'https://i.imgflip.com/2cp1.jpg',
    category: 'relationship',
    tags: ['love', 'couple', 'argument', 'relationship'],
    isActive: true,
    popularity: 75
  },
  
  // 공부 관련
  {
    id: 'student-exam-stress',
    name: '시험 스트레스',
    description: '시험 기간의 학생 심리를 표현',
    imageUrl: 'https://i.imgflip.com/1c1uej.jpg',
    category: 'study',
    tags: ['study', 'exam', 'stress', 'student'],
    isActive: true,
    popularity: 70
  },
  
  // 게임 관련
  {
    id: 'gaming-rage',
    name: '게임 분노',
    description: '게임에서 질 때의 감정',
    imageUrl: 'https://i.imgflip.com/5c7lwm.jpg',
    category: 'gaming',
    tags: ['game', 'gaming', 'rage', 'frustration'],
    isActive: true,
    popularity: 82
  },
  
  // K-POP 관련
  {
    id: 'kpop-fan-reaction',
    name: 'K-POP 팬 반응',
    description: '좋아하는 아이돌을 볼 때의 반응',
    imageUrl: 'https://i.imgflip.com/26am.jpg',
    category: 'kpop',
    tags: ['kpop', 'idol', 'fan', 'excited'],
    isActive: true,
    popularity: 78
  }
];

/**
 * 사용자 관심사를 기반으로 밈 템플릿을 추천합니다.
 */
export function recommendMemes(
  userInterests: string[],
  userPreferences: UserPreference[] = [],
  templates: MemeTemplate[] = SAMPLE_MEME_TEMPLATES,
  limit: number = 6
): RecommendationResult[] {
  if (!userInterests.length) {
    // 관심사가 없으면 인기순으로 반환
    return templates
      .filter(t => t.isActive)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit)
      .map(template => ({
        template,
        score: template.popularity || 0,
        reason: '인기 밈'
      }));
  }

  const recommendations: RecommendationResult[] = [];

  for (const template of templates) {
    if (!template.isActive) continue;

    let score = 0;
    let reasons: string[] = [];

    // 관심사와 템플릿 매칭 점수 계산
    for (const interest of userInterests) {
      const mappedTags = INTEREST_MAPPING[interest] || [];
      
      // 카테고리 직접 매칭
      if (mappedTags.includes(template.category)) {
        score += 30;
        reasons.push(`${getInterestDisplayName(interest)} 관심사 매칭`);
      }
      
      // 태그 매칭
      const tagMatches = template.tags.filter(tag => mappedTags.includes(tag));
      if (tagMatches.length > 0) {
        score += tagMatches.length * 10;
        reasons.push(`${getInterestDisplayName(interest)} 태그 매칭`);
      }
    }

    // 사용자 선호도 가중치 적용
    for (const preference of userPreferences) {
      if (preference.category === template.category) {
        score += preference.weight * 20;
        reasons.push('개인화된 선호도');
      }
    }

    // 기본 인기도 점수 추가
    score += (template.popularity || 0) * 0.1;

    if (score > 0) {
      recommendations.push({
        template,
        score,
        reason: reasons.length > 0 ? reasons[0] : '추천 밈'
      });
    }
  }

  // 점수순으로 정렬하고 제한된 개수만 반환
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * 관심사 ID를 표시용 이름으로 변환
 */
function getInterestDisplayName(interestId: string): string {
  const mapping: Record<string, string> = {
    humor: '유머',
    kpop: 'K-POP',
    drama: '드라마',
    animals: '동물',
    food: '음식',
    gaming: '게임',
    sports: '스포츠',
    study: '공부',
    relationship: '연애',
    work: '직장',
    weather: '날씨',
    politics: '시사'
  };
  return mapping[interestId] || interestId;
}

/**
 * 사용자 상호작용을 기반으로 선호도를 업데이트합니다.
 */
export function updateUserPreferences(
  currentPreferences: UserPreference[],
  interaction: {
    action: 'view' | 'like' | 'share' | 'create' | 'download';
    templateCategory: string;
    templateTags: string[];
  }
): UserPreference[] {
  const updatedPreferences = [...currentPreferences];
  
  // 액션별 가중치
  const actionWeights = {
    view: 0.1,
    like: 0.3,
    share: 0.5,
    create: 0.7,
    download: 0.4
  };

  const weight = actionWeights[interaction.action];

  // 카테고리 선호도 업데이트
  const categoryPref = updatedPreferences.find(
    p => p.category === interaction.templateCategory && p.value === interaction.templateCategory
  );

  if (categoryPref) {
    categoryPref.weight += weight;
  } else {
    updatedPreferences.push({
      category: interaction.templateCategory,
      value: interaction.templateCategory,
      weight,
      source: 'interaction'
    });
  }

  // 태그 선호도 업데이트
  for (const tag of interaction.templateTags) {
    const tagPref = updatedPreferences.find(
      p => p.category === 'tag' && p.value === tag
    );

    if (tagPref) {
      tagPref.weight += weight * 0.5; // 태그는 카테고리보다 낮은 가중치
    } else {
      updatedPreferences.push({
        category: 'tag',
        value: tag,
        weight: weight * 0.5,
        source: 'interaction'
      });
    }
  }

  return updatedPreferences;
}

/**
 * 로컬 스토리지에서 사용자 데이터를 가져옵니다.
 */
export function getUserData(): {
  interests: string[];
  preferences: UserPreference[];
} {
  try {
    const interests = JSON.parse(localStorage.getItem('userInterests') || '[]');
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '[]');
    
    return { interests, preferences };
  } catch (error) {
    console.error('Failed to load user data:', error);
    return { interests: [], preferences: [] };
  }
}

/**
 * 로컬 스토리지에 사용자 선호도를 저장합니다.
 */
export function saveUserPreferences(preferences: UserPreference[]): void {
  try {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
}