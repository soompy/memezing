import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const sortBy = searchParams.get('sortBy') || 'popular'; // 'popular' or 'recent'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // 정렬 조건 설정
    let orderBy: any = {};
    if (sortBy === 'popular') {
      orderBy = { likesCount: 'desc' };
    } else if (sortBy === 'recent') {
      orderBy = { createdAt: 'desc' };
    }

    // 공개된 밈들을 조회
    const memes = await prisma.meme.findMany({
      where: { 
        isPublic: true 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: limit
    });

    // 총 개수 조회
    const totalCount = await prisma.meme.count({
      where: { isPublic: true }
    });

    // 현재 사용자의 좋아요 상태 확인
    let userLikes: string[] = [];
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (user) {
        const likes = await prisma.like.findMany({
          where: {
            userId: user.id,
            memeId: { in: memes.map(meme => meme.id) }
          }
        });
        userLikes = likes.map(like => like.memeId);
      }
    }

    // 커뮤니티 통계 조회
    const stats = await getCommunityStats();

    // 데이터 포맷팅
    const formattedMemes = memes.map(meme => ({
      id: meme.id,
      title: meme.title || '제목 없음',
      imageUrl: meme.imageUrl,
      author: meme.user.name || '익명',
      authorAvatar: meme.user.image,
      likes: meme.likesCount,
      shares: meme.sharesCount,
      views: meme.viewsCount,
      createdAt: formatTimeAgo(meme.createdAt),
      isLiked: userLikes.includes(meme.id),
      user: meme.user,
      commentsCount: meme._count.comments
    }));

    return NextResponse.json({
      success: true,
      data: {
        memes: formattedMemes,
        stats,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Community fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '커뮤니티 데이터 조회에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 커뮤니티 통계 조회 함수
async function getCommunityStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalMembers,
    todayLikes,
    todayShares,
    totalMemes
  ] = await Promise.all([
    prisma.user.count(),
    prisma.like.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    }),
    prisma.meme.aggregate({
      where: {
        updatedAt: {
          gte: today
        }
      },
      _sum: {
        sharesCount: true
      }
    }),
    prisma.meme.count({
      where: { isPublic: true }
    })
  ]);

  return {
    totalMembers,
    todayLikes,
    todayShares: todayShares._sum.sharesCount || 0,
    totalMemes
  };
}

// 시간 포맷팅 함수
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}