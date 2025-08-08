import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 특정 사용자 상세 조회 (관리자)
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

    if (!permissions.canViewUsers(auth.user.role)) {
      return NextResponse.json(
        { error: '사용자 상세 조회 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        accounts: {
          select: {
            provider: true,
            createdAt: true
          }
        },
        memes: {
          select: {
            id: true,
            title: true,
            isPublic: true,
            likesCount: true,
            viewsCount: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        likes: {
          include: {
            meme: {
              select: {
                id: true,
                title: true,
                createdAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        comments: {
          include: {
            meme: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            memes: true,
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 추가 통계 계산
    const [publicMemesCount, recentMemesCount, totalViews, totalLikes] = await Promise.all([
      prisma.meme.count({
        where: {
          userId: params.id,
          isPublic: true
        }
      }),
      prisma.meme.count({
        where: {
          userId: params.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.meme.aggregate({
        where: {
          userId: params.id
        },
        _sum: {
          viewsCount: true,
          likesCount: true
        }
      }),
      prisma.like.count({
        where: {
          meme: {
            userId: params.id
          }
        }
      })
    ]);

    const response = {
      ...user,
      password: undefined, // 비밀번호 제외
      stats: {
        totalMemes: user._count.memes,
        publicMemes: publicMemesCount,
        totalLikes: user._count.likes,
        totalComments: user._count.comments,
        recentMemes: recentMemesCount,
        totalViews: totalViews._sum.viewsCount || 0,
        likesReceived: totalLikes
      }
    };

    await logAdminAction(
      auth.user.id,
      'VIEW_USER_DETAIL',
      'user',
      params.id
    );

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Admin user detail API error:', error);
    return NextResponse.json(
      { error: '사용자 상세 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 사용자 정보 수정 (관리자)
export async function PATCH(
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

    if (!permissions.canEditUsers(auth.user.role)) {
      return NextResponse.json(
        { error: '사용자 수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { name, bio, isVerified, isActive, role, reason } = await request.json();

    // 자기 자신의 역할/상태는 변경할 수 없음
    if (params.id === auth.user.id) {
      if (role !== undefined || isActive !== undefined) {
        return NextResponse.json(
          { error: '자기 자신의 역할이나 활성 상태는 변경할 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    // 역할 변경 권한 확인
    if (role !== undefined) {
      if (!permissions.canManageRoles(auth.user.role)) {
        return NextResponse.json(
          { error: '역할 변경 권한이 없습니다.' },
          { status: 403 }
        );
      }

      if (!['user', 'moderator', 'admin', 'super_admin'].includes(role)) {
        return NextResponse.json(
          { error: '유효하지 않은 역할입니다.' },
          { status: 400 }
        );
      }

      if (role === 'super_admin' && auth.user.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Super Admin 역할은 Super Admin만 부여할 수 있습니다.' },
          { status: 403 }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(isVerified !== undefined && { isVerified }),
        ...(isActive !== undefined && { isActive }),
        ...(role !== undefined && { role }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        isVerified: true,
        isActive: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await logAdminAction(
      auth.user.id,
      'EDIT_USER',
      'user',
      params.id,
      { 
        changes: { name, bio, isVerified, isActive, role },
        originalEmail: user.email,
        reason 
      }
    );

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: '사용자 정보가 수정되었습니다.'
    });

  } catch (error) {
    console.error('Admin edit user API error:', error);
    return NextResponse.json(
      { error: '사용자 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 사용자 삭제 (관리자)
export async function DELETE(
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

    if (!permissions.canDeleteUsers(auth.user.role)) {
      return NextResponse.json(
        { error: '사용자 삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 자기 자신은 삭제할 수 없음
    if (params.id === auth.user.id) {
      return NextResponse.json(
        { error: '자기 자신은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    const { reason } = await request.json().catch(() => ({}));

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            memes: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 관리자 삭제는 super_admin만 가능
    if (['admin', 'super_admin'].includes(user.role) && auth.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: '관리자 계정은 Super Admin만 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }

    // Cascade 삭제로 관련된 모든 데이터가 함께 삭제됨
    await prisma.user.delete({
      where: { id: params.id }
    });

    await logAdminAction(
      auth.user.id,
      'DELETE_USER',
      'user',
      params.id,
      { 
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        memesCount: user._count.memes,
        commentsCount: user._count.comments,
        reason 
      }
    );

    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Admin delete user API error:', error);
    return NextResponse.json(
      { error: '사용자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}