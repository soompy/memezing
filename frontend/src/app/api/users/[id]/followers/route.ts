import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 팔로워 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    const userId = params.id;

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
              isVerified: true,
              createdAt: true,
              _count: {
                select: {
                  memes: true,
                  followers: true,
                  following: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.follow.count({
        where: { followingId: userId }
      })
    ]);

    const formattedFollowers = followers.map(follow => ({
      id: follow.follower.id,
      name: follow.follower.name,
      email: follow.follower.email,
      image: follow.follower.image,
      bio: follow.follower.bio,
      isVerified: follow.follower.isVerified,
      createdAt: follow.follower.createdAt,
      followedAt: follow.createdAt,
      stats: {
        memesCount: follow.follower._count.memes,
        followersCount: follow.follower._count.followers,
        followingCount: follow.follower._count.following
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedFollowers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Followers API error:', error);
    return NextResponse.json(
      { error: '팔로워 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}