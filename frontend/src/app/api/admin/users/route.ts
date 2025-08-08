import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 관리자 사용자 목록 조회
export async function GET(request: NextRequest) {
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
        { error: '사용자 목록 조회 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const role = searchParams.get('role'); // user, moderator, admin, super_admin
    const status = searchParams.get('status'); // active, inactive, banned
    const search = searchParams.get('search');
    const provider = searchParams.get('provider'); // google, kakao, naver, email
    
    const skip = (page - 1) * limit;

    // 필터 조건
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    
    if (provider) {
      where.provider = provider;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 정렬 설정
    const orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy.name = 'asc';
        break;
      case 'email':
        orderBy.email = 'asc';
        break;
      case 'lastLogin':
        orderBy.lastLoginAt = 'desc';
        break;
      case 'memes':
        orderBy.memes = { _count: 'desc' };
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          provider: true,
          isVerified: true,
          isActive: true,
          role: true,
          bio: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              memes: true,
              likes: true,
              comments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // 각 사용자의 추가 통계
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [publicMemes, recentActivity] = await Promise.all([
          prisma.meme.count({
            where: {
              userId: user.id,
              isPublic: true
            }
          }),
          prisma.meme.count({
            where: {
              userId: user.id,
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 최근 30일
              }
            }
          })
        ]);

        return {
          ...user,
          stats: {
            totalMemes: user._count.memes,
            publicMemes,
            totalLikes: user._count.likes,
            totalComments: user._count.comments,
            recentActivity
          }
        };
      })
    );

    await logAdminAction(
      auth.user.id,
      'VIEW_USERS_LIST',
      'user',
      undefined,
      { page, limit, role, status, search }
    );

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin users list API error:', error);
    return NextResponse.json(
      { error: '사용자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 사용자 일괄 처리 (상태 변경, 역할 변경 등)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { action, userIds, reason, newRole } = await request.json();
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: '처리할 사용자를 선택해주세요.' },
        { status: 400 }
      );
    }

    let result;
    
    switch (action) {
      case 'activate':
        if (!permissions.canEditUsers(auth.user.role)) {
          return NextResponse.json(
            { error: '사용자 활성화 권한이 없습니다.' },
            { status: 403 }
          );
        }
        
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds }
          },
          data: {
            isActive: true,
            updatedAt: new Date()
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'ACTIVATE_USERS_BULK',
          'user',
          undefined,
          { userIds, count: result.count, reason }
        );
        break;
        
      case 'deactivate':
        if (!permissions.canBanUsers(auth.user.role)) {
          return NextResponse.json(
            { error: '사용자 비활성화 권한이 없습니다.' },
            { status: 403 }
          );
        }
        
        // 자기 자신은 비활성화할 수 없음
        if (userIds.includes(auth.user.id)) {
          return NextResponse.json(
            { error: '자기 자신은 비활성화할 수 없습니다.' },
            { status: 400 }
          );
        }
        
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            id: { not: auth.user.id }
          },
          data: {
            isActive: false,
            updatedAt: new Date()
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'DEACTIVATE_USERS_BULK',
          'user',
          undefined,
          { userIds, count: result.count, reason }
        );
        break;
        
      case 'changeRole':
        if (!permissions.canManageRoles(auth.user.role)) {
          return NextResponse.json(
            { error: '역할 변경 권한이 없습니다.' },
            { status: 403 }
          );
        }
        
        if (!newRole || !['user', 'moderator', 'admin', 'super_admin'].includes(newRole)) {
          return NextResponse.json(
            { error: '유효하지 않은 역할입니다.' },
            { status: 400 }
          );
        }
        
        // 자기 자신의 역할은 변경할 수 없음
        if (userIds.includes(auth.user.id)) {
          return NextResponse.json(
            { error: '자기 자신의 역할은 변경할 수 없습니다.' },
            { status: 400 }
          );
        }
        
        // super_admin 역할은 super_admin만 부여 가능
        if (newRole === 'super_admin' && auth.user.role !== 'super_admin') {
          return NextResponse.json(
            { error: 'Super Admin 역할은 Super Admin만 부여할 수 있습니다.' },
            { status: 403 }
          );
        }
        
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            id: { not: auth.user.id }
          },
          data: {
            role: newRole,
            updatedAt: new Date()
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'CHANGE_USER_ROLES_BULK',
          'user',
          undefined,
          { userIds, count: result.count, newRole, reason }
        );
        break;
        
      case 'verify':
        if (!permissions.canEditUsers(auth.user.role)) {
          return NextResponse.json(
            { error: '사용자 인증 권한이 없습니다.' },
            { status: 403 }
          );
        }
        
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds }
          },
          data: {
            isVerified: true,
            updatedAt: new Date()
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'VERIFY_USERS_BULK',
          'user',
          undefined,
          { userIds, count: result.count, reason }
        );
        break;
        
      case 'delete':
        if (!permissions.canDeleteUsers(auth.user.role)) {
          return NextResponse.json(
            { error: '사용자 삭제 권한이 없습니다.' },
            { status: 403 }
          );
        }
        
        // 자기 자신은 삭제할 수 없음
        if (userIds.includes(auth.user.id)) {
          return NextResponse.json(
            { error: '자기 자신은 삭제할 수 없습니다.' },
            { status: 400 }
          );
        }
        
        // 관리자 사용자 삭제 전 확인
        const adminUsers = await prisma.user.findMany({
          where: {
            id: { in: userIds },
            role: { in: ['admin', 'super_admin'] }
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });
        
        if (adminUsers.length > 0 && auth.user.role !== 'super_admin') {
          return NextResponse.json(
            { 
              error: '관리자 계정은 Super Admin만 삭제할 수 있습니다.',
              adminUsers: adminUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
            },
            { status: 403 }
          );
        }
        
        result = await prisma.user.deleteMany({
          where: {
            id: { in: userIds },
            id: { not: auth.user.id }
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'DELETE_USERS_BULK',
          'user',
          undefined,
          { userIds, count: result.count, reason }
        );
        break;
        
      default:
        return NextResponse.json(
          { error: '알 수 없는 액션입니다.' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: { affected: result.count },
      message: `${result.count}명의 사용자가 처리되었습니다.`
    });

  } catch (error) {
    console.error('Admin users bulk action error:', error);
    return NextResponse.json(
      { error: '사용자 일괄 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}