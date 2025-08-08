import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 북마크 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, popular, oldest
    
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 정렬 설정
    const orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy.meme = { likesCount: 'desc' };
        break;
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: user.id },
        include: {
          meme: {
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
                  comments: true,
                  bookmarks: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.bookmark.count({
        where: { userId: user.id }
      })
    ]);

    // 현재 사용자의 좋아요 상태 확인
    const memeIds = bookmarks.map(bookmark => bookmark.meme.id);
    const userLikes = await prisma.like.findMany({
      where: {
        userId: user.id,
        memeId: { in: memeIds }
      },
      select: { memeId: true }
    });
    const likedMemeIds = new Set(userLikes.map(like => like.memeId));

    const formattedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.id,
      bookmarkedAt: bookmark.createdAt,
      meme: {
        ...bookmark.meme,
        isLiked: likedMemeIds.has(bookmark.meme.id),
        isBookmarked: true,
        stats: {
          likes: bookmark.meme._count.likes,
          comments: bookmark.meme._count.comments,
          bookmarks: bookmark.meme._count.bookmarks
        }
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedBookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Bookmarks list API error:', error);
    return NextResponse.json(
      { error: '북마크 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 북마크 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { memeId } = await request.json();

    if (!memeId) {
      return NextResponse.json(
        { error: '밈 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 밈 존재 확인
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: {
        id: true,
        title: true,
        isPublic: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!meme.isPublic) {
      return NextResponse.json(
        { error: '비공개 밈은 북마크할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 중복 북마크 확인
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_memeId: {
          userId: user.id,
          memeId: memeId
        }
      }
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: '이미 북마크된 밈입니다.' },
        { status: 409 }
      );
    }

    // 북마크 추가
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        memeId: memeId
      },
      include: {
        meme: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: bookmark,
      message: '북마크에 추가되었습니다.'
    });

  } catch (error) {
    console.error('Add bookmark API error:', error);
    return NextResponse.json(
      { error: '북마크 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}