import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 템플릿 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'popular'; // popular, recent, usage

    // 정렬 옵션
    const orderBy: any = {};
    switch (sortBy) {
      case 'recent':
        orderBy.createdAt = 'desc';
        break;
      case 'usage':
        orderBy.usageCount = 'desc';
        break;
      default:
        orderBy.usageCount = 'desc'; // 기본적으로 인기순
    }

    // 필터 조건
    const where: any = {
      isActive: true
    };
    
    if (category) {
      where.category = category;
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy,
      take: limit
    });

    // 임시로 하드코딩된 템플릿 반환 (데이터베이스가 비어있을 경우)
    if (templates.length === 0) {
      const hardcodedTemplates = [
        {
          id: 'drake',
          name: '드레이크 밈',
          imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
          category: 'popular',
          textBoxes: [
            { x: 10, y: 10, width: 200, height: 60, defaultText: '이건 별로' },
            { x: 10, y: 180, width: 200, height: 60, defaultText: '이게 좋아' }
          ],
          isActive: true,
          usageCount: 1000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'distracted-boyfriend',
          name: '한눈파는 남친',
          imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
          category: 'popular',
          textBoxes: [
            { x: 50, y: 50, width: 150, height: 40, defaultText: '새로운 것' },
            { x: 250, y: 100, width: 120, height: 40, defaultText: '남친' },
            { x: 400, y: 80, width: 120, height: 40, defaultText: '기존 것' }
          ],
          isActive: true,
          usageCount: 950,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'woman-yelling-cat',
          name: '고양이 vs 여자',
          imageUrl: 'https://i.imgflip.com/345v97.jpg',
          category: 'popular',
          textBoxes: [
            { x: 20, y: 20, width: 180, height: 50, defaultText: '화난 여자' },
            { x: 320, y: 150, width: 150, height: 50, defaultText: '무관심한 고양이' }
          ],
          isActive: true,
          usageCount: 880,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'two-buttons',
          name: '두 가지 선택',
          imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
          category: 'popular',
          textBoxes: [
            { x: 10, y: 10, width: 180, height: 40, defaultText: '어려운 선택' },
            { x: 100, y: 120, width: 120, height: 30, defaultText: '선택 A' },
            { x: 250, y: 120, width: 120, height: 30, defaultText: '선택 B' }
          ],
          isActive: true,
          usageCount: 750,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // 카테고리 필터링
      let filteredTemplates = hardcodedTemplates;
      if (category) {
        filteredTemplates = hardcodedTemplates.filter(t => t.category === category);
      }

      return NextResponse.json({
        success: true,
        data: filteredTemplates.slice(0, limit),
        total: filteredTemplates.length,
        message: '하드코딩된 템플릿을 반환했습니다. 실제 데이터베이스에 템플릿을 추가해주세요.'
      });
    }

    return NextResponse.json({
      success: true,
      data: templates,
      total: templates.length
    });

  } catch (error) {
    console.error('Get templates API error:', error);
    return NextResponse.json(
      { error: '템플릿 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}