import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 북마크 상태 확인
export async function GET(
  request: NextRequest,
  { params }: { params: { memeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const memeId = params.memeId;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_memeId: {
          userId: user.id,
          memeId: memeId
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        isBookmarked: !!bookmark,
        bookmarkedAt: bookmark?.createdAt || null
      }
    });

  } catch (error) {
    console.error('Bookmark status API error:', error);
    return NextResponse.json(
      { error: '북마크 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 북마크 토글 (추가/제거)
export async function POST(
  request: NextRequest,
  { params }: { params: { memeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const memeId = params.memeId;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 밈 존재 및 공개 상태 확인
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

    // 현재 북마크 상태 확인
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_memeId: {
          userId: user.id,
          memeId: memeId
        }
      }
    });

    let isBookmarked = false;
    let message = '';

    if (existingBookmark) {
      // 북마크 제거
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id }
      });
      isBookmarked = false;
      message = '북마크에서 제거되었습니다.';
    } else {
      // 북마크 추가
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          memeId: memeId
        }
      });
      isBookmarked = true;
      message = '북마크에 추가되었습니다.';
    }

    // 총 북마크 수 조회
    const bookmarkCount = await prisma.bookmark.count({
      where: { memeId: memeId }
    });

    return NextResponse.json({
      success: true,
      data: {
        isBookmarked,
        bookmarkCount,
        meme: {
          id: meme.id,
          title: meme.title,
          author: meme.user.name
        }
      },
      message
    });

  } catch (error) {
    console.error('Bookmark toggle API error:', error);
    return NextResponse.json(
      { error: '북마크 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 북마크 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: { memeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const memeId = params.memeId;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_memeId: {
          userId: user.id,
          memeId: memeId
        }
      }
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: '북마크되지 않은 밈입니다.' },
        { status: 404 }
      );
    }

    await prisma.bookmark.delete({
      where: { id: bookmark.id }
    });

    return NextResponse.json({
      success: true,
      message: '북마크에서 제거되었습니다.'
    });

  } catch (error) {
    console.error('Remove bookmark API error:', error);
    return NextResponse.json(
      { error: '북마크 제거 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}