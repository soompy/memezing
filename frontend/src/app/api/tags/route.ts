import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 태그 검색 및 자동완성
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const popular = searchParams.get('popular') === 'true';

    let where: any = {
      isActive: true
    };

    // 검색어가 있는 경우 태그 이름으로 필터링
    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive'
      };
    }

    // 카테고리 필터링
    if (category) {
      where.category = category;
    }

    // 정렬 기준
    let orderBy: any = { createdAt: 'desc' };
    if (popular) {
      orderBy = { usageCount: 'desc' };
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy,
      take: limit,
      select: {
        id: true,
        name: true,
        usageCount: true,
        category: true,
        createdAt: true
      }
    });

    // 인기 태그와 제안 태그 구분
    const suggestions = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      usageCount: tag.usageCount,
      category: tag.category,
      isPopular: tag.usageCount > 10
    }));

    return NextResponse.json({
      success: true,
      data: {
        tags: suggestions,
        total: tags.length,
        query
      }
    });

  } catch (error) {
    console.error('Tags autocomplete API error:', error);
    return NextResponse.json(
      { error: '태그 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 새 태그 생성 (자동 태그 생성용)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { tags, increment = true } = await request.json();

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: '태그 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    // 태그 정규화 (소문자, 공백 제거, 특수문자 제거)
    const normalizedTags = tags.map((tag: string) => 
      tag.trim().toLowerCase().replace(/[^a-zA-Z0-9가-힣]/g, '')
    ).filter(tag => tag.length > 0 && tag.length <= 20);

    if (normalizedTags.length === 0) {
      return NextResponse.json(
        { error: '유효한 태그가 없습니다.' },
        { status: 400 }
      );
    }

    const results = [];

    for (const tagName of normalizedTags) {
      // 기존 태그 찾기 또는 새로 생성
      const existingTag = await prisma.tag.findUnique({
        where: { name: tagName }
      });

      if (existingTag) {
        // 기존 태그의 사용 횟수 증가
        if (increment) {
          const updatedTag = await prisma.tag.update({
            where: { id: existingTag.id },
            data: {
              usageCount: { increment: 1 },
              updatedAt: new Date()
            }
          });
          results.push(updatedTag);
        } else {
          results.push(existingTag);
        }
      } else {
        // 새 태그 생성
        const newTag = await prisma.tag.create({
          data: {
            name: tagName,
            usageCount: increment ? 1 : 0,
            category: determineTagCategory(tagName),
            isActive: true
          }
        });
        results.push(newTag);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tags: results
      },
      message: `${results.length}개의 태그가 처리되었습니다.`
    });

  } catch (error) {
    console.error('Create tags API error:', error);
    return NextResponse.json(
      { error: '태그 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 인기 태그와 카테고리별 태그 조회
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'trending') {
      // 트렌딩 태그 업데이트 (일일 배치 작업용)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // 최근 1주일간 많이 사용된 태그를 trending으로 분류
      const trendingTags = await prisma.tag.findMany({
        where: {
          isActive: true,
          updatedAt: { gte: oneWeekAgo },
          usageCount: { gte: 5 }
        },
        orderBy: { usageCount: 'desc' },
        take: 10
      });

      // 기존 trending 태그들의 카테고리 초기화
      await prisma.tag.updateMany({
        where: { category: 'trending' },
        data: { category: 'popular' }
      });

      // 새로운 trending 태그들 설정
      if (trendingTags.length > 0) {
        await prisma.tag.updateMany({
          where: { id: { in: trendingTags.map(t => t.id) } },
          data: { category: 'trending' }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          trendingTagsCount: trendingTags.length
        },
        message: 'trending 태그가 업데이트되었습니다.'
      });
    }

    return NextResponse.json(
      { error: '잘못된 액션입니다.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Update tags API error:', error);
    return NextResponse.json(
      { error: '태그 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 태그 카테고리 자동 분류 함수
function determineTagCategory(tagName: string): string {
  // 감정 관련 태그
  const emotionTags = ['웃긴', '슬픈', '화난', '놀란', '행복', '우울', '기쁜', '짜증'];
  // 트렌드 관련 태그
  const trendTags = ['최신', '인기', '핫', '트렌드', '바이럴'];
  // 밈 유형 관련 태그
  const typeTags = ['드레이크', '스폰지밥', '심슨', '짤방', '움짤', '텍스트'];

  if (emotionTags.some(emotion => tagName.includes(emotion))) {
    return 'emotion';
  }
  
  if (trendTags.some(trend => tagName.includes(trend))) {
    return 'trending';
  }
  
  if (typeTags.some(type => tagName.includes(type))) {
    return 'type';
  }

  // 사용 횟수가 많으면 popular, 그렇지 않으면 new
  return 'new';
}