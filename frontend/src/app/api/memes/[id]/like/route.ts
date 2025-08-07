import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 좋아요 토글 (POST)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { id: memeId } = params;

    // 사용자 조회
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
      where: { id: memeId }
    });

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 기존 좋아요 확인
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_memeId: {
          userId: user.id,
          memeId: memeId
        }
      }
    });

    let isLiked: boolean;
    let likesCount: number;

    if (existingLike) {
      // 좋아요 취소
      await prisma.$transaction(async (tx) => {
        await tx.like.delete({
          where: { id: existingLike.id }
        });
        
        await tx.meme.update({
          where: { id: memeId },
          data: {
            likesCount: {
              decrement: 1
            }
          }
        });
      });
      
      isLiked = false;
      likesCount = meme.likesCount - 1;
    } else {
      // 좋아요 추가
      await prisma.$transaction(async (tx) => {
        await tx.like.create({
          data: {
            userId: user.id,
            memeId: memeId
          }
        });
        
        await tx.meme.update({
          where: { id: memeId },
          data: {
            likesCount: {
              increment: 1
            }
          }
        });
      });
      
      isLiked = true;
      likesCount = meme.likesCount + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        isLiked,
        likesCount
      },
      message: isLiked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.'
    });

  } catch (error) {
    console.error('Like toggle API error:', error);
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 좋아요 상태 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: memeId } = params;

    // 밈과 좋아요 수 조회
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: {
        id: true,
        likesCount: true
      }
    });

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    let isLiked = false;

    // 로그인한 사용자의 좋아요 상태 확인
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (user) {
        const like = await prisma.like.findUnique({
          where: {
            userId_memeId: {
              userId: user.id,
              memeId: memeId
            }
          }
        });
        
        isLiked = !!like;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        memeId,
        isLiked,
        likesCount: meme.likesCount
      }
    });

  } catch (error) {
    console.error('Get like status API error:', error);
    return NextResponse.json(
      { error: '좋아요 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}