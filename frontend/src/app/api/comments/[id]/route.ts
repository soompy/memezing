import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 개별 댓글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const session = await getServerSession(authOptions);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        },
        meme: {
          select: {
            id: true,
            title: true,
            isPublic: true,
            userId: true
          }
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                isVerified: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        likes: session?.user ? {
          where: {
            userId: (await prisma.user.findUnique({
              where: { email: session.user.email! },
              select: { id: true }
            }))?.id || ''
          }
        } : false
      }
    });

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비공개 밈의 댓글인 경우 접근 권한 확인
    if (!comment.meme.isPublic) {
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user || user.id !== comment.meme.userId) {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    const formattedComment = {
      id: comment.id,
      content: comment.content,
      isEdited: comment.isEdited,
      likesCount: comment.likesCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      parentId: comment.parentId,
      user: comment.user,
      meme: comment.meme,
      parent: comment.parent ? {
        id: comment.parent.id,
        content: comment.parent.content.slice(0, 100),
        user: comment.parent.user
      } : null,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        user: reply.user
      })),
      isLikedByCurrentUser: comment.likes && comment.likes.length > 0
    };

    return NextResponse.json({
      success: true,
      data: { comment: formattedComment }
    });

  } catch (error) {
    console.error('Get comment API error:', error);
    return NextResponse.json(
      { error: '댓글 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 댓글 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
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

    const commentId = params.id;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: '댓글은 1000자를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 댓글 존재 확인 및 소유자 검증
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        content: true,
        createdAt: true,
        meme: {
          select: {
            isPublic: true
          }
        }
      }
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingComment.userId !== user.id) {
      return NextResponse.json(
        { error: '댓글을 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 댓글 작성 후 10분 이후에는 수정 불가 (선택사항)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (existingComment.createdAt < tenMinutesAgo) {
      return NextResponse.json(
        { error: '댓글 작성 후 10분 이내에만 수정할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 내용이 같으면 수정하지 않음
    if (existingComment.content.trim() === content.trim()) {
      return NextResponse.json(
        { error: '변경된 내용이 없습니다.' },
        { status: 400 }
      );
    }

    // 댓글 업데이트
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        comment: {
          id: updatedComment.id,
          content: updatedComment.content,
          isEdited: updatedComment.isEdited,
          likesCount: updatedComment.likesCount,
          createdAt: updatedComment.createdAt,
          updatedAt: updatedComment.updatedAt,
          user: updatedComment.user
        }
      },
      message: '댓글이 수정되었습니다.'
    });

  } catch (error) {
    console.error('Update comment API error:', error);
    return NextResponse.json(
      { error: '댓글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
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

    const commentId = params.id;

    // 댓글 존재 확인 및 권한 검증
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        content: true,
        parentId: true,
        _count: {
          select: { replies: true }
        },
        meme: {
          select: {
            userId: true,
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

    // 댓글 작성자이거나 밈 작성자이거나 관리자인 경우만 삭제 가능
    const canDelete = 
      comment.userId === user.id || // 댓글 작성자
      comment.meme.userId === user.id || // 밈 작성자
      ['admin', 'super_admin'].includes(user.role); // 관리자

    if (!canDelete) {
      return NextResponse.json(
        { error: '댓글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 대댓글이 있는 경우 내용만 삭제하고 "[삭제된 댓글입니다]"로 대체
    if (comment._count.replies > 0) {
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          content: '[삭제된 댓글입니다]',
          isEdited: true,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: '댓글이 삭제되었습니다. (답글이 있어 내용만 삭제됨)'
      });
    } else {
      // 대댓글이 없으면 완전 삭제
      await prisma.$transaction(async (tx) => {
        // 댓글 좋아요 먼저 삭제
        await tx.commentLike.deleteMany({
          where: { commentId: commentId }
        });

        // 댓글 삭제
        await tx.comment.delete({
          where: { id: commentId }
        });
      });

      return NextResponse.json({
        success: true,
        message: '댓글이 완전히 삭제되었습니다.'
      });
    }

  } catch (error) {
    console.error('Delete comment API error:', error);
    return NextResponse.json(
      { error: '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}