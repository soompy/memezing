import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    
    // 밈과 댓글 정보를 함께 조회
    const meme = await prisma.meme.findUnique({
      where: { 
        id,
        isPublic: true // 공개된 밈만
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
        comments: {
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
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!meme) {
      return NextResponse.json(
        { success: false, error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 사용자의 좋아요 상태 확인
    let isLiked = false;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (user) {
        const like = await prisma.like.findUnique({
          where: {
            userId_memeId: {
              userId: user.id,
              memeId: id
            }
          }
        });
        isLiked = !!like;
      }
    }

    // 조회수 증가
    await prisma.meme.update({
      where: { id },
      data: {
        viewsCount: {
          increment: 1
        }
      }
    });

    // 데이터 포맷팅 (기존 프론트엔드 형식에 맞춤)
    const formattedMeme = {
      id: meme.id,
      title: meme.title || '제목 없음',
      imageUrl: meme.imageUrl,
      author: meme.user.name || '익명',
      likes: meme.likesCount,
      shares: meme.sharesCount,
      views: meme.viewsCount + 1, // 방금 증가된 조회수 반영
      createdAt: formatTimeAgo(meme.createdAt),
      isLiked,
      description: meme.description,
      user: meme.user
    };

    const formattedComments = meme.comments.map(comment => ({
      id: comment.id,
      author: comment.user.name || '익명',
      content: comment.content,
      createdAt: formatTimeAgo(comment.createdAt),
      likes: 0, // TODO: 댓글 좋아요 기능 추가시
      isLiked: false, // TODO: 댓글 좋아요 기능 추가시
      user: comment.user
    }));

    return NextResponse.json({
      success: true,
      data: {
        meme: formattedMeme,
        comments: formattedComments
      }
    });

  } catch (error) {
    console.error('Community meme fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '밈 상세 정보 조회에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 댓글 추가 (POST)
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
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: '댓글은 500자 이하로 입력해주세요.' },
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
      where: { id: memeId, isPublic: true }
    });

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        memeId: memeId
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

    const formattedComment = {
      id: comment.id,
      author: comment.user.name || '익명',
      content: comment.content,
      createdAt: formatTimeAgo(comment.createdAt),
      likes: 0,
      isLiked: false,
      user: comment.user
    };

    return NextResponse.json({
      success: true,
      data: formattedComment,
      message: '댓글이 성공적으로 작성되었습니다.'
    });

  } catch (error) {
    console.error('Add comment API error:', error);
    return NextResponse.json(
      { error: '댓글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
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