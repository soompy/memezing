import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 댓글 좋아요 토글
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

    const commentId = params.id;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 댓글 존재 확인
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        meme: {
          select: {
            id: true,
            title: true,
            isPublic: true
          }
        }
      }
    });

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비공개 밈의 댓글은 좋아요 불가
    if (!comment.meme.isPublic) {
      return NextResponse.json(
        { error: '비공개 밈의 댓글에는 좋아요를 할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 자기 댓글 좋아요 방지 (선택사항)
    if (comment.userId === user.id) {
      return NextResponse.json(
        { error: '자신의 댓글에는 좋아요를 할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 현재 좋아요 상태 확인
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: commentId
        }
      }
    });

    let isLiked = false;
    let likesCount = comment.likesCount;
    let message = '';

    if (existingLike) {
      // 좋아요 취소
      await prisma.$transaction(async (tx) => {
        await tx.commentLike.delete({
          where: { id: existingLike.id }
        });
        
        await tx.comment.update({
          where: { id: commentId },
          data: {
            likesCount: {
              decrement: 1
            }
          }
        });
      });
      
      isLiked = false;
      likesCount = Math.max(0, likesCount - 1);
      message = '댓글 좋아요를 취소했습니다.';
    } else {
      // 좋아요 추가
      await prisma.$transaction(async (tx) => {
        await tx.commentLike.create({
          data: {
            userId: user.id,
            commentId: commentId
          }
        });
        
        await tx.comment.update({
          where: { id: commentId },
          data: {
            likesCount: {
              increment: 1
            }
          }
        });
      });
      
      isLiked = true;
      likesCount = likesCount + 1;
      message = '댓글에 좋아요를 했습니다.';
    }

    return NextResponse.json({
      success: true,
      data: {
        isLiked,
        likesCount,
        comment: {
          id: comment.id,
          content: comment.content.slice(0, 50) + (comment.content.length > 50 ? '...' : ''),
          author: comment.user.name
        }
      },
      message
    });

  } catch (error) {
    console.error('Comment like API error:', error);
    return NextResponse.json(
      { error: '댓글 좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 댓글 좋아요 상태 확인
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const commentId = params.id;

    let isLiked = false;
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (user) {
        const like = await prisma.commentLike.findUnique({
          where: {
            userId_commentId: {
              userId: user.id,
              commentId: commentId
            }
          }
        });
        isLiked = !!like;
      }
    }

    // 댓글 좋아요 수 조회
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        likesCount: true
      }
    });

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        isLiked,
        likesCount: comment.likesCount
      }
    });

  } catch (error) {
    console.error('Comment like status API error:', error);
    return NextResponse.json(
      { error: '댓글 좋아요 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}