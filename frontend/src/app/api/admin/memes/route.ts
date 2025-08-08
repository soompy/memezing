import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 관리자 밈 목록 조회 (모든 밈 포함)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const status = searchParams.get('status'); // public, private, reported
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const reportedOnly = searchParams.get('reportedOnly') === 'true';
    
    const skip = (page - 1) * limit;

    // 필터 조건
    const where: any = {};
    
    if (status === 'public') {
      where.isPublic = true;
    } else if (status === 'private') {
      where.isPublic = false;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: search.split(' ') } }
      ];
    }

    // TODO: 신고된 밈 필터링 (Report 모델이 있다면)
    // if (reportedOnly) {
    //   where.reports = { some: {} };
    // }

    // 정렬 설정
    const orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy.likesCount = 'desc';
        break;
      case 'views':
        orderBy.viewsCount = 'desc';
        break;
      case 'reported':
        // orderBy.reports = { _count: 'desc' };
        orderBy.createdAt = 'desc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [memes, total] = await Promise.all([
      prisma.meme.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              isVerified: true,
              isActive: true,
              role: true
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
      prisma.meme.count({ where })
    ]);

    // 권한에 따른 데이터 필터링
    const canViewUserDetails = permissions.canViewUsers(auth.user.role);
    
    const filteredMemes = memes.map(meme => ({
      ...meme,
      user: canViewUserDetails ? meme.user : {
        id: meme.user.id,
        name: meme.user.name,
        image: meme.user.image
      }
    }));

    await logAdminAction(
      auth.user.id,
      'VIEW_MEMES_LIST',
      'meme',
      undefined,
      { page, limit, status, search }
    );

    return NextResponse.json({
      success: true,
      data: filteredMemes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin memes list API error:', error);
    return NextResponse.json(
      { error: '밈 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 밈 일괄 처리 (삭제, 상태 변경 등)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { action, memeIds, reason } = await request.json();
    
    if (!Array.isArray(memeIds) || memeIds.length === 0) {
      return NextResponse.json(
        { error: '처리할 밈을 선택해주세요.' },
        { status: 400 }
      );
    }

    let result;
    
    switch (action) {
      case 'delete':
        if (!permissions.canDeleteMemes(auth.user.role)) {
          return NextResponse.json(
            { error: '밈 삭제 권한이 없습니다.' },
            { status: 403 }
          );
        }
        
        result = await prisma.meme.deleteMany({
          where: {
            id: { in: memeIds }
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'DELETE_MEMES_BULK',
          'meme',
          undefined,
          { memeIds, count: result.count, reason }
        );
        break;
        
      case 'hide':
        result = await prisma.meme.updateMany({
          where: {
            id: { in: memeIds }
          },
          data: {
            isPublic: false
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'HIDE_MEMES_BULK',
          'meme',
          undefined,
          { memeIds, count: result.count, reason }
        );
        break;
        
      case 'show':
        result = await prisma.meme.updateMany({
          where: {
            id: { in: memeIds }
          },
          data: {
            isPublic: true
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'SHOW_MEMES_BULK',
          'meme',
          undefined,
          { memeIds, count: result.count, reason }
        );
        break;
        
      default:
        return NextResponse.json(
          { error: '알 수 없는 액션입니다.' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: { affected: result.count },
      message: `${result.count}개의 밈이 처리되었습니다.`
    });

  } catch (error) {
    console.error('Admin memes bulk action error:', error);
    return NextResponse.json(
      { error: '밈 일괄 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}