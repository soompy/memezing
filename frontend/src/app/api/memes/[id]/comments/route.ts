import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { createCommentNotification, createReplyNotification } from '@/lib/notification-helpers';

const prisma = new PrismaClient();

// 밈의 댓글 목록 조회 (대댓글 포함)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memeId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest'; // 'newest', 'oldest', 'popular'
    
    const skip = (page - 1) * limit;

    // 밈 존재 확인
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: { 
        id: true, 
        isPublic: true,
        userId: true,
        title: true
      }
    });

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비공개 밈의 경우 작성자만 댓글 조회 가능
    const session = await getServerSession(authOptions);
    if (!meme.isPublic) {
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user || user.id !== meme.userId) {
        return NextResponse.json(
          { error: '비공개 밈입니다.' },
          { status: 403 }
        );
      }
    }

    // 정렬 기준 설정
    let orderBy: any = { createdAt: 'desc' }; // newest
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'popular') {
      orderBy = { likesCount: 'desc' };
    }

    // 최상위 댓글만 먼저 조회 (parentId가 null인 댓글들)
    const [topLevelComments, totalComments] = await Promise.all([
      prisma.comment.findMany({
        where: {
          memeId: memeId,
          parentId: null // 최상위 댓글만
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
          // 대댓글들도 포함
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  isVerified: true
                }
              },
              likes: session?.user ? {
                where: {
                  userId: (await prisma.user.findUnique({
                    where: { email: session.user.email! },
                    select: { id: true }
                  }))?.id || ''
                }
              } : false
            },
            orderBy: { createdAt: 'asc' } // 대댓글은 오래된 순으로
          },
          likes: session?.user ? {
            where: {
              userId: (await prisma.user.findUnique({
                where: { email: session.user.email! },
                select: { id: true }
              }))?.id || ''
            }
          } : false
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.comment.count({
        where: {
          memeId: memeId,
          parentId: null
        }
      })
    ]);

    // 댓글 데이터 포맷팅 (좋아요 상태 포함)
    const formattedComments = topLevelComments.map(comment => ({
      id: comment.id,
      content: comment.content,
      isEdited: comment.isEdited,
      likesCount: comment.likesCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
      isLikedByCurrentUser: comment.likes && comment.likes.length > 0,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        isEdited: reply.isEdited,
        likesCount: reply.likesCount,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        parentId: reply.parentId,
        user: reply.user,
        isLikedByCurrentUser: reply.likes && reply.likes.length > 0
      })),
      repliesCount: comment.replies.length
    }));

    return NextResponse.json({
      success: true,
      data: {
        comments: formattedComments,
        pagination: {
          page,
          limit,
          total: totalComments,
          totalPages: Math.ceil(totalComments / limit)
        },
        sort,
        meme: {
          id: meme.id,
          title: meme.title,
          isPublic: meme.isPublic
        }
      }
    });

  } catch (error) {
    console.error('Get comments API error:', error);
    return NextResponse.json(
      { error: '댓글 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 새 댓글 또는 대댓글 작성
export async function POST(
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

    const memeId = params.id;
    const { content, parentId } = await request.json();

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

    // 밈 존재 확인
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: { 
        id: true, 
        isPublic: true,
        userId: true,
        title: true
      }
    });

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비공개 밈의 경우 작성자만 댓글 작성 가능
    if (!meme.isPublic && user.id !== meme.userId) {
      return NextResponse.json(
        { error: '비공개 밈에는 댓글을 작성할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 대댓글인 경우 부모 댓글 확인
    let parentComment = null;
    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { 
          id: parentId,
          memeId: memeId // 같은 밈의 댓글인지 확인
        },
        select: {
          id: true,
          userId: true,
          content: true,
          parentId: true
        }
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: '부모 댓글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 대댓글의 대댓글 방지 (최대 2단계까지만)
      if (parentComment.parentId) {
        return NextResponse.json(
          { error: '대댓글에는 답글을 작성할 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        memeId: memeId,
        parentId: parentId || null
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

    // 알림 생성
    if (parentId && parentComment) {
      // 대댓글인 경우 - 원 댓글 작성자에게 알림
      if (parentComment.userId !== user.id) {
        await createReplyNotification({
          originalCommenterId: parentComment.userId,
          replierUserId: user.id,
          memeId: memeId,
          commentId: parentId,
          replyId: comment.id,
          replyContent: content.trim()
        });
      }
    } else {
      // 일반 댓글인 경우 - 밈 작성자에게 알림
      if (meme.userId !== user.id) {
        await createCommentNotification({
          memeOwnerId: meme.userId,
          commenterId: user.id,
          memeId: memeId,
          commentId: comment.id,
          memeTitle: meme.title,
          commentContent: content.trim()
        });
      }
    }

    // 활동 피드에 추가 (댓글 작성)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: user.id,
          actionType: 'comment',
          targetType: 'comment',
          targetId: comment.id,
          data: {
            memeId: memeId,
            memeTitle: meme.title,
            commentContent: content.trim().slice(0, 100)
          }
        })
      });
    } catch (feedError) {
      console.error('Failed to create activity feed:', feedError);
      // 피드 생성 실패해도 댓글 작성은 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      data: {
        comment: {
          id: comment.id,
          content: comment.content,
          isEdited: comment.isEdited,
          likesCount: comment.likesCount,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          parentId: comment.parentId,
          user: comment.user,
          isLikedByCurrentUser: false,
          repliesCount: 0
        }
      },
      message: parentId ? '답글이 작성되었습니다.' : '댓글이 작성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    console.error('Create comment API error:', error);
    return NextResponse.json(
      { error: '댓글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}