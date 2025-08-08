import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3
};

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
}

// 세션에서 사용자 정보 가져오기 (DB 조회 포함)
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isVerified: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      ...user,
      role: user.role as UserRole
    };

  } catch (error) {
    console.error('Get auth user error:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// 권한 확인
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// 관리자 권한 확인 미들웨어
export async function requireAuth(request: NextRequest, minRole: UserRole = 'user') {
  const user = await getAuthUser();
  
  if (!user) {
    return {
      error: '인증되지 않은 요청입니다.',
      status: 401,
      user: null
    };
  }

  if (!hasPermission(user.role, minRole)) {
    return {
      error: '권한이 부족합니다.',
      status: 403,
      user
    };
  }

  return {
    error: null,
    status: 200,
    user
  };
}

// 관리자 액션 로그
export async function logAdminAction(
  userId: string,
  action: string,
  targetType: 'user' | 'meme' | 'template' | 'system',
  targetId?: string,
  metadata?: Record<string, any>
) {
  try {
    // AdminLog 모델이 있다면 사용, 없으면 콘솔 로그
    console.log('Admin Action:', {
      userId,
      action,
      targetType,
      targetId,
      metadata,
      timestamp: new Date().toISOString()
    });
    
    // TODO: 실제 환경에서는 AdminLog 테이블에 저장
    // await prisma.adminLog.create({...})
    
  } catch (error) {
    console.error('Admin action logging error:', error);
  }
}

// 권한별 기능 체크
export const permissions = {
  // 사용자 관리
  canViewUsers: (role: UserRole) => hasPermission(role, 'moderator'),
  canEditUsers: (role: UserRole) => hasPermission(role, 'admin'),
  canDeleteUsers: (role: UserRole) => hasPermission(role, 'admin'),
  canBanUsers: (role: UserRole) => hasPermission(role, 'moderator'),
  
  // 콘텐츠 관리
  canViewAllMemes: (role: UserRole) => hasPermission(role, 'moderator'),
  canDeleteMemes: (role: UserRole) => hasPermission(role, 'moderator'),
  canEditMemes: (role: UserRole) => hasPermission(role, 'admin'),
  canApproveTemplates: (role: UserRole) => hasPermission(role, 'moderator'),
  
  // 시스템 관리
  canViewAnalytics: (role: UserRole) => hasPermission(role, 'moderator'),
  canManageSystem: (role: UserRole) => hasPermission(role, 'admin'),
  canManageRoles: (role: UserRole) => hasPermission(role, 'super_admin'),
  
  // 관리자 권한
  canAccessAdminPanel: (role: UserRole) => hasPermission(role, 'moderator')
};