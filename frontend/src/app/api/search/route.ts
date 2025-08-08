import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 통합 검색 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 검색 파라미터
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'all'; // all, memes, templates, users
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // 정렬 및 필터링
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, recent, popular, views
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const category = searchParams.get('category'); // 템플릿 카테고리
    const dateFrom = searchParams.get('dateFrom'); // YYYY-MM-DD
    const dateTo = searchParams.get('dateTo'); // YYYY-MM-DD
    const isPublic = searchParams.get('isPublic') !== 'false';
    const isAiGenerated = searchParams.get('isAiGenerated'); // true, false, null
    const userId = searchParams.get('userId'); // 특정 사용자
    const hasImage = searchParams.get('hasImage'); // 이미지 포함 여부
    const minViews = parseInt(searchParams.get('minViews') || '0');
    const minLikes = parseInt(searchParams.get('minLikes') || '0');
    
    const skip = (page - 1) * limit;

    let results: any = {};

    // 밈 검색
    if (type === 'all' || type === 'memes') {
      const memeWhere: any = {
        AND: [
          isPublic ? { isPublic: true } : {},
          // 텍스트 검색
          query ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { tags: { hasSome: query.split(' ') } }
            ]
          } : {},
          // 태그 필터
          tags.length > 0 ? { tags: { hassome: tags } } : {},
          // 날짜 필터
          dateFrom ? { createdAt: { gte: new Date(dateFrom) } } : {},
          dateTo ? { createdAt: { lte: new Date(dateTo + 'T23:59:59') } } : {},
          // AI 생성 필터
          isAiGenerated !== null ? { isAiGenerated: isAiGenerated === 'true' } : {},
          // 사용자 필터
          userId ? { userId } : {},
          // 조회수/좋아요 최소값
          minViews > 0 ? { viewsCount: { gte: minViews } } : {},
          minLikes > 0 ? { likesCount: { gte: minLikes } } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      };

      // 정렬 설정
      const memeOrderBy: any = {};
      switch (sortBy) {
        case 'recent':
          memeOrderBy.createdAt = 'desc';
          break;
        case 'popular':
          memeOrderBy.likesCount = 'desc';
          break;
        case 'views':
          memeOrderBy.viewsCount = 'desc';
          break;
        default:
          // 검색 관련성 기준 정렬 (제목 매치 우선)
          if (query) {
            memeOrderBy.title = 'asc'; // 제목이 있는 것 우선
          } else {
            memeOrderBy.createdAt = 'desc';
          }
      }

      const [memes, memesTotal] = await Promise.all([
        prisma.meme.findMany({
          where: memeWhere,
          orderBy: memeOrderBy,
          skip: type === 'memes' ? skip : 0,
          take: type === 'memes' ? limit : 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                isVerified: true
              }
            },
            template: {
              select: {
                id: true,
                name: true,
                category: true
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          }
        }),
        type === 'memes' ? prisma.meme.count({ where: memeWhere }) : Promise.resolve(0)
      ]);

      results.memes = {
        data: memes,
        total: type === 'memes' ? memesTotal : memes.length,
        pagination: type === 'memes' ? {
          page,
          limit,
          total: memesTotal,
          totalPages: Math.ceil(memesTotal / limit)
        } : null
      };
    }

    // 템플릿 검색
    if (type === 'all' || type === 'templates') {
      const templateWhere: any = {
        AND: [
          { isActive: true },
          query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } }
            ]
          } : {},
          category ? { category } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      };

      const templateOrderBy: any = {};
      switch (sortBy) {
        case 'recent':
          templateOrderBy.createdAt = 'desc';
          break;
        case 'popular':
          templateOrderBy.usageCount = 'desc';
          break;
        default:
          templateOrderBy.usageCount = 'desc';
      }

      const [templates, templatesTotal] = await Promise.all([
        prisma.template.findMany({
          where: templateWhere,
          orderBy: templateOrderBy,
          skip: type === 'templates' ? skip : 0,
          take: type === 'templates' ? limit : 10,
          include: {
            _count: {
              select: {
                memes: true
              }
            }
          }
        }),
        type === 'templates' ? prisma.template.count({ where: templateWhere }) : Promise.resolve(0)
      ]);

      results.templates = {
        data: templates,
        total: type === 'templates' ? templatesTotal : templates.length,
        pagination: type === 'templates' ? {
          page,
          limit,
          total: templatesTotal,
          totalPages: Math.ceil(templatesTotal / limit)
        } : null
      };
    }

    // 사용자 검색
    if (type === 'all' || type === 'users') {
      const userWhere: any = {
        AND: [
          { isActive: true },
          query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } }
            ]
          } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      };

      const userOrderBy: any = {};
      switch (sortBy) {
        case 'recent':
          userOrderBy.createdAt = 'desc';
          break;
        default:
          userOrderBy.lastLoginAt = 'desc';
      }

      const [users, usersTotal] = await Promise.all([
        prisma.user.findMany({
          where: userWhere,
          orderBy: userOrderBy,
          skip: type === 'users' ? skip : 0,
          take: type === 'users' ? limit : 10,
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            isVerified: true,
            createdAt: true,
            lastLoginAt: true,
            _count: {
              select: {
                memes: true,
                likes: true,
                comments: true
              }
            }
          }
        }),
        type === 'users' ? prisma.user.count({ where: userWhere }) : Promise.resolve(0)
      ]);

      results.users = {
        data: users,
        total: type === 'users' ? usersTotal : users.length,
        pagination: type === 'users' ? {
          page,
          limit,
          total: usersTotal,
          totalPages: Math.ceil(usersTotal / limit)
        } : null
      };
    }

    // 검색 통계
    const stats = {
      totalMemes: results.memes?.total || 0,
      totalTemplates: results.templates?.total || 0,
      totalUsers: results.users?.total || 0,
      query,
      searchType: type,
      appliedFilters: {
        tags,
        category,
        dateFrom,
        dateTo,
        isAiGenerated,
        userId,
        minViews,
        minLikes
      }
    };

    return NextResponse.json({
      success: true,
      data: results,
      stats,
      message: `검색 결과: ${stats.totalMemes + stats.totalTemplates + stats.totalUsers}개 항목`
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 인기 검색어/태그 조회
export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json(); // 'tags', 'keywords', 'categories'

    let result: any = {};

    if (type === 'tags' || !type) {
      // 가장 많이 사용된 태그들
      const popularTags = await prisma.meme.findMany({
        where: {
          isPublic: true,
          tags: {
            not: []
          }
        },
        select: {
          tags: true
        }
      });

      const tagCount: Record<string, number> = {};
      popularTags.forEach(meme => {
        meme.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      result.popularTags = Object.entries(tagCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([tag, count]) => ({ tag, count }));
    }

    if (type === 'categories' || !type) {
      // 인기 템플릿 카테고리
      const categories = await prisma.template.groupBy({
        by: ['category'],
        where: {
          isActive: true
        },
        _count: {
          category: true
        },
        _sum: {
          usageCount: true
        },
        orderBy: {
          _sum: {
            usageCount: 'desc'
          }
        }
      });

      result.popularCategories = categories.map(cat => ({
        category: cat.category,
        templateCount: cat._count.category,
        totalUsage: cat._sum.usageCount || 0
      }));
    }

    if (type === 'keywords' || !type) {
      // 최근 인기 검색 키워드 (실제로는 서버에 검색 로그를 저장해야 함)
      // 임시로 밈 제목에서 자주 나오는 단어들 추출
      const recentMemes = await prisma.meme.findMany({
        where: {
          isPublic: true,
          title: {
            not: null
          },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 최근 30일
          }
        },
        select: {
          title: true,
          viewsCount: true
        },
        orderBy: {
          viewsCount: 'desc'
        },
        take: 100
      });

      // 간단한 키워드 추출 (실제로는 더 정교한 NLP 처리 필요)
      const wordCount: Record<string, number> = {};
      recentMemes.forEach(meme => {
        if (meme.title) {
          const words = meme.title
            .toLowerCase()
            .replace(/[^가-힣a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 1);
          
          words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + meme.viewsCount;
          });
        }
      });

      result.trendingKeywords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([keyword, score]) => ({ keyword, score }));
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: '인기 검색 데이터를 조회했습니다.'
    });

  } catch (error) {
    console.error('Popular search API error:', error);
    return NextResponse.json(
      { error: '인기 검색 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}