import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 관리자 대시보드 통계 조회
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y
    
    // 기간 계산
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 전체 통계
    const [
      totalUsers,
      totalMemes,
      totalTemplates,
      activeUsers,
      newUsersCount,
      newMemesCount,
      topMemes,
      topTemplates,
      userGrowth,
      memeGrowth,
      categoryStats,
      tagStats
    ] = await Promise.all([
      // 전체 사용자 수
      prisma.user.count({
        where: { isActive: true }
      }),
      
      // 전체 밈 수
      prisma.meme.count({
        where: { isPublic: true }
      }),
      
      // 전체 템플릿 수
      prisma.template.count({
        where: { isActive: true }
      }),
      
      // 활성 사용자 (최근 30일 로그인)
      prisma.user.count({
        where: {
          isActive: true,
          lastLoginAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // 신규 사용자 (선택된 기간)
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // 신규 밈 (선택된 기간)
      prisma.meme.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // 인기 밈 (조회수 기준)
      prisma.meme.findMany({
        where: {
          isPublic: true,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: [
          { viewsCount: 'desc' },
          { likesCount: 'desc' }
        ],
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      }),
      
      // 인기 템플릿 (사용 횟수 기준)
      prisma.template.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          usageCount: 'desc'
        },
        take: 10,
        include: {
          _count: {
            select: {
              memes: true
            }
          }
        }
      }),
      
      // 사용자 증가 추이 (일별)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM "User"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // 밈 생성 추이 (일별)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM "Meme"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // 템플릿 카테고리별 통계
      prisma.template.groupBy({
        by: ['category'],
        where: {
          isActive: true
        },
        _count: {
          category: true
        },
        _sum: {
          usageCount: true
        },
        orderBy: {
          _sum: {
            usageCount: 'desc'
          }
        }
      }),
      
      // 인기 태그 통계
      prisma.meme.findMany({
        where: {
          isPublic: true,
          createdAt: {
            gte: startDate
          },
          tags: {
            not: []
          }
        },
        select: {
          tags: true
        }
      }).then(memes => {
        const tagCount: Record<string, number> = {};
        memes.forEach(meme => {
          meme.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        });
        return Object.entries(tagCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20)
          .map(([tag, count]) => ({ tag, count }));
      })
    ]);

    // 권한별 데이터 필터링
    const canViewUserDetails = permissions.canViewUsers(auth.user.role);
    const canViewAnalytics = permissions.canViewAnalytics(auth.user.role);

    const dashboardData = {
      overview: {
        totalUsers,
        totalMemes,
        totalTemplates,
        activeUsers,
        newUsersCount,
        newMemesCount,
        period
      },
      
      ...(canViewAnalytics && {
        charts: {
          userGrowth,
          memeGrowth,
          categoryStats: categoryStats.map(cat => ({
            category: cat.category,
            templateCount: cat._count.category,
            totalUsage: cat._sum.usageCount || 0
          })),
          tagStats
        }
      }),
      
      topContent: {
        memes: topMemes.map(meme => ({
          id: meme.id,
          title: meme.title,
          viewsCount: meme.viewsCount,
          likesCount: meme.likesCount,
          commentsCount: meme._count.comments,
          createdAt: meme.createdAt,
          user: canViewUserDetails ? meme.user : { name: meme.user.name }
        })),
        templates: topTemplates
      },
      
      userStats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsers: newUsersCount,
        userRetentionRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(1) : 0
      }
    };

    // 관리자 액션 로그
    await logAdminAction(
      auth.user.id,
      'VIEW_DASHBOARD',
      'system',
      undefined,
      { period }
    );

    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: '대시보드 데이터를 조회했습니다.'
    });

  } catch (error) {
    console.error('Admin dashboard API error:', error);
    return NextResponse.json(
      { error: '대시보드 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}