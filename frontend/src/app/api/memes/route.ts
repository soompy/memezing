import { NextRequest, NextResponse } from 'next/server';

// 밈 템플릿 인터페이스
interface MemeTemplate {
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

// 임시 밈 템플릿 데이터 (실제로는 데이터베이스에서 가져올 것)
const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'distracted-boyfriend',
    name: '딴 데 보는 남자친구',
    description: '선택의 딜레마를 표현할 때 사용',
    imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
    category: 'funny',
    tags: ['funny', 'choice', 'meme', 'viral'],
    isActive: true,
    popularity: 95,
    createdAt: new Date().toISOString()
  },
  {
    id: 'drake-pointing',
    name: '드레이크 포인팅',
    description: '좋은 것과 나쁜 것을 비교할 때',
    imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
    category: 'funny',
    tags: ['funny', 'comparison', 'drake', 'viral'],
    isActive: true,
    popularity: 90,
    createdAt: new Date().toISOString()
  },
  {
    id: 'woman-yelling-cat',
    name: '소리지르는 여자와 고양이',
    description: '논쟁이나 반박할 때 사용',
    imageUrl: 'https://i.imgflip.com/345v97.jpg',
    category: 'funny',
    tags: ['funny', 'argument', 'cat', 'viral'],
    isActive: true,
    popularity: 88,
    createdAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const interests = searchParams.get('interests')?.split(',') || [];

    let filteredTemplates = MEME_TEMPLATES.filter(template => template.isActive);

    // 카테고리 필터링
    if (category) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.category === category
      );
    }

    // 관심사 기반 필터링
    if (interests.length > 0) {
      filteredTemplates = filteredTemplates.filter(template =>
        template.tags.some(tag => 
          interests.some(interest => 
            tag.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // 인기도 순으로 정렬
    filteredTemplates.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    // 제한된 수만 반환
    const limitedTemplates = filteredTemplates.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limitedTemplates,
      total: filteredTemplates.length
    });

  } catch (error) {
    console.error('Meme templates fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch meme templates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}