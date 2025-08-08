import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 특정 밈 상세 조회 (관리자)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const meme = await prisma.meme.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isVerified: true,
            isActive: true,
            role: true,
            createdAt: true,
            lastLoginAt: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
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
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한에 따른 데이터 필터링
    const canViewUserDetails = permissions.canViewUsers(auth.user.role);
    
    const response = {
      ...meme,
      user: canViewUserDetails ? meme.user : {
        id: meme.user.id,
        name: meme.user.name,
        image: meme.user.image
      },
      likes: canViewUserDetails ? meme.likes : meme.likes.map(like => ({
        id: like.id,
        createdAt: like.createdAt,
        user: {
          id: like.user.id,
          name: like.user.name
        }
      })),
      comments: canViewUserDetails ? meme.comments : meme.comments.map(comment => ({
        ...comment,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          image: comment.user.image
        }
      }))
    };

    await logAdminAction(
      auth.user.id,
      'VIEW_MEME_DETAIL',
      'meme',
      params.id
    );

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Admin meme detail API error:', error);
    return NextResponse.json(
      { error: '밈 상세 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 밈 수정 (관리자)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request, 'admin');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    if (!permissions.canEditMemes(auth.user.role)) {
      return NextResponse.json(
        { error: '밈 수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { title, description, tags, isPublic, reason } = await request.json();

    const meme = await prisma.meme.findUnique({
      where: { id: params.id }
    });

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedMeme = await prisma.meme.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        ...(isPublic !== undefined && { isPublic }),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    await logAdminAction(
      auth.user.id,
      'EDIT_MEME',
      'meme',
      params.id,
      { 
        changes: { title, description, tags, isPublic },
        originalTitle: meme.title,
        reason 
      }
    );

    return NextResponse.json({
      success: true,
      data: updatedMeme,
      message: '밈이 수정되었습니다.'
    });

  } catch (error) {
    console.error('Admin edit meme API error:', error);
    return NextResponse.json(
      { error: '밈 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 밈 삭제 (관리자)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    if (!permissions.canDeleteMemes(auth.user.role)) {
      return NextResponse.json(
        { error: '밈 삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { reason } = await request.json().catch(() => ({}));

    const meme = await prisma.meme.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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

    await prisma.meme.delete({
      where: { id: params.id }
    });

    await logAdminAction(
      auth.user.id,
      'DELETE_MEME',
      'meme',
      params.id,
      { 
        memeTitle: meme.title,
        memeOwner: meme.user.email,
        reason 
      }
    );

    return NextResponse.json({
      success: true,
      message: '밈이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Admin delete meme API error:', error);
    return NextResponse.json(
      { error: '밈 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}