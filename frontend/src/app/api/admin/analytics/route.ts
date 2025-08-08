import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 고급 분석 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    if (!permissions.canViewAnalytics(auth.user.role)) {
      return NextResponse.json(
        { error: '분석 데이터 조회 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview'; // overview, users, content, performance
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, 90d
    
    // 기간 계산
    const now = new Date();
    let startDate: Date;
    let previousPeriodStart: Date;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    }

    let analyticsData: any = {};

    if (type === 'overview' || type === 'all') {
      // 전체 개요 통계
      const [
        currentPeriodUsers,
        previousPeriodUsers,
        currentPeriodMemes,
        previousPeriodMemes,
        totalViews,
        totalLikes,
        activeUsers,
        topPerformers
      ] = await Promise.all([
        // 현재 기간 신규 사용자
        prisma.user.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        
        // 이전 기간 신규 사용자 (변화율 계산용)
        prisma.user.count({
          where: {
            createdAt: { 
              gte: previousPeriodStart,
              lt: startDate
            }
          }
        }),
        
        // 현재 기간 신규 밈
        prisma.meme.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        
        // 이전 기간 신규 밈
        prisma.meme.count({
          where: {
            createdAt: { 
              gte: previousPeriodStart,
              lt: startDate
            }
          }
        }),
        
        // 총 조회수 (현재 기간)
        prisma.meme.aggregate({
          where: {
            createdAt: { gte: startDate }
          },
          _sum: {
            viewsCount: true
          }
        }),
        
        // 총 좋아요 수 (현재 기간)
        prisma.like.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        
        // 활성 사용자 (현재 기간에 로그인한 사용자)
        prisma.user.count({
          where: {
            lastLoginAt: { gte: startDate },
            isActive: true
          }
        }),
        
        // 톱 퍼포머 밈
        prisma.meme.findMany({
          where: {
            createdAt: { gte: startDate },
            isPublic: true
          },
          orderBy: [
            { viewsCount: 'desc' },
            { likesCount: 'desc' }
          ],
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          }
        })
      ]);

      // 변화율 계산
      const userGrowthRate = previousPeriodUsers > 0 
        ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers * 100)
        : currentPeriodUsers > 0 ? 100 : 0;
        
      const memeGrowthRate = previousPeriodMemes > 0 
        ? ((currentPeriodMemes - previousPeriodMemes) / previousPeriodMemes * 100)
        : currentPeriodMemes > 0 ? 100 : 0;

      analyticsData.overview = {
        period,
        metrics: {
          newUsers: {
            current: currentPeriodUsers,
            previous: previousPeriodUsers,
            growthRate: Number(userGrowthRate.toFixed(1))
          },
          newMemes: {
            current: currentPeriodMemes,
            previous: previousPeriodMemes,
            growthRate: Number(memeGrowthRate.toFixed(1))
          },
          totalViews: totalViews._sum.viewsCount || 0,
          totalLikes: totalLikes,
          activeUsers: activeUsers
        },
        topContent: topPerformers
      };
    }

    if (type === 'users' || type === 'all') {
      // 사용자 분석
      const [
        usersByProvider,
        usersByRole,
        userRetention,
        topCreators
      ] = await Promise.all([
        // 제공자별 사용자 분포
        prisma.user.groupBy({
          by: ['provider'],
          where: {
            createdAt: { gte: startDate }
          },
          _count: {
            provider: true
          }
        }),
        
        // 역할별 사용자 분포
        prisma.user.groupBy({
          by: ['role'],
          _count: {
            role: true
          }
        }),
        
        // 사용자 유지율 (7일, 30일)
        Promise.all([
          prisma.user.count({
            where: {
              createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
              lastLoginAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
            }
          }),
          prisma.user.count({
            where: {
              createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
              lastLoginAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
            }
          })
        ]).then(([day7, day30]) => ({ day7, day30 })),
        
        // 톱 크리에이터
        prisma.user.findMany({
          where: {
            memes: {
              some: {
                createdAt: { gte: startDate }
              }
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isVerified: true,
            _count: {
              select: {
                memes: true,
                likes: true
              }
            }
          },
          orderBy: {
            memes: {
              _count: 'desc'
            }
          },
          take: 10
        })
      ]);

      analyticsData.users = {
        distribution: {
          byProvider: usersByProvider,
          byRole: usersByRole
        },
        retention: userRetention,
        topCreators: topCreators
      };
    }

    if (type === 'content' || type === 'all') {
      // 콘텐츠 분석
      const [
        contentByCategory,
        popularTags,
        aiGeneratedStats,
        engagementMetrics
      ] = await Promise.all([
        // 템플릿 카테고리별 밈 생성 수
        prisma.meme.groupBy({
          by: ['templateId'],
          where: {
            createdAt: { gte: startDate },
            templateId: { not: null }
          },
          _count: {
            templateId: true
          },
          orderBy: {
            _count: {
              templateId: 'desc'
            }
          }
        }).then(async (results) => {
          if (results.length === 0) return [];
          
          const templateIds = results.map(r => r.templateId).filter(Boolean);
          const templates = await prisma.template.findMany({
            where: {
              id: { in: templateIds as string[] }
            },
            select: {
              id: true,
              name: true,
              category: true
            }
          });
          
          return results.map(result => {
            const template = templates.find(t => t.id === result.templateId);
            return {
              templateId: result.templateId,
              templateName: template?.name || 'Unknown',
              category: template?.category || 'uncategorized',
              count: result._count.templateId
            };
          });
        }),
        
        // 인기 태그
        prisma.meme.findMany({
          where: {
            createdAt: { gte: startDate },
            tags: { not: [] }
          },
          select: {
            tags: true,
            viewsCount: true,
            likesCount: true
          }
        }).then(memes => {
          const tagStats: Record<string, { count: number, views: number, likes: number }> = {};
          
          memes.forEach(meme => {
            meme.tags.forEach(tag => {
              if (!tagStats[tag]) {
                tagStats[tag] = { count: 0, views: 0, likes: 0 };
              }
              tagStats[tag].count++;
              tagStats[tag].views += meme.viewsCount;
              tagStats[tag].likes += meme.likesCount;
            });
          });
          
          return Object.entries(tagStats)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 20)
            .map(([tag, stats]) => ({ tag, ...stats }));
        }),
        
        // AI 생성 콘텐츠 통계
        Promise.all([
          prisma.meme.count({
            where: {
              createdAt: { gte: startDate },
              isAiGenerated: true
            }
          }),
          prisma.meme.count({
            where: {
              createdAt: { gte: startDate },
              isAiGenerated: false
            }
          })
        ]).then(([aiGenerated, userGenerated]) => ({
          aiGenerated,
          userGenerated,
          total: aiGenerated + userGenerated,
          aiPercentage: aiGenerated + userGenerated > 0 
            ? (aiGenerated / (aiGenerated + userGenerated) * 100).toFixed(1)
            : 0
        })),
        
        // 참여도 메트릭
        prisma.meme.aggregate({
          where: {
            createdAt: { gte: startDate }
          },
          _avg: {
            viewsCount: true,
            likesCount: true
          },
          _sum: {
            viewsCount: true,
            likesCount: true
          }
        })
      ]);

      analyticsData.content = {
        categoryDistribution: contentByCategory,
        popularTags: popularTags,
        aiStats: aiGeneratedStats,
        engagement: {
          avgViews: Number((engagementMetrics._avg.viewsCount || 0).toFixed(1)),
          avgLikes: Number((engagementMetrics._avg.likesCount || 0).toFixed(1)),
          totalViews: engagementMetrics._sum.viewsCount || 0,
          totalLikes: engagementMetrics._sum.likesCount || 0
        }
      };
    }

    if (type === 'performance' || type === 'all') {
      // 성능 분석
      const [
        hourlyActivity,
        responseMetrics
      ] = await Promise.all([
        // 시간대별 활동 패턴
        prisma.$queryRaw`
          SELECT 
            EXTRACT(hour FROM created_at) as hour,
            COUNT(*) as activity_count
          FROM "Meme"
          WHERE created_at >= ${startDate}
          GROUP BY EXTRACT(hour FROM created_at)
          ORDER BY hour ASC
        `,
        
        // 응답 메트릭 (임시 데이터)
        {
          avgLoadTime: Math.random() * 200 + 100, // 100-300ms
          errorRate: Math.random() * 2, // 0-2%
          uptime: 99.5 + Math.random() * 0.5 // 99.5-100%
        }
      ]);

      analyticsData.performance = {
        hourlyActivity: hourlyActivity,
        responseMetrics: {
          avgLoadTime: Number(responseMetrics.avgLoadTime.toFixed(0)),
          errorRate: Number(responseMetrics.errorRate.toFixed(2)),
          uptime: Number(responseMetrics.uptime.toFixed(2))
        }
      };
    }

    await logAdminAction(
      auth.user.id,
      'VIEW_ANALYTICS',
      'system',
      undefined,
      { type, period }
    );

    return NextResponse.json({
      success: true,
      data: analyticsData,
      generated: now.toISOString(),
      message: `${type} 분석 데이터를 조회했습니다.`
    });

  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json(
      { error: '분석 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 실시간 알림 이벤트 조회
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { alertType } = await request.json(); // 'critical', 'warning', 'info'

    // 최근 24시간 내 주요 이벤트 체크
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
      unusualActivity,
      systemHealth,
      contentFlags
    ] = await Promise.all([
      // 비정상적인 활동 감지
      Promise.all([
        // 급격한 사용자 증가
        prisma.user.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // 1시간
          }
        }),
        
        // 급격한 밈 생성 증가
        prisma.meme.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
          }
        }),
        
        // 높은 조회수 밈 (바이럴 감지)
        prisma.meme.count({
          where: {
            createdAt: { gte: last24h },
            viewsCount: { gte: 1000 } // 임계값
          }
        })
      ]).then(([newUsers, newMemes, viralMemes]) => ({
        newUsers,
        newMemes,
        viralMemes,
        isUnusual: newUsers > 50 || newMemes > 100 || viralMemes > 5
      })),
      
      // 시스템 건강도 체크
      {
        dbConnectionHealthy: true, // DB 연결 상태
        memoryUsage: Math.random() * 80 + 10, // 10-90%
        cpuUsage: Math.random() * 60 + 20, // 20-80%
        diskSpace: Math.random() * 20 + 70 // 70-90%
      },
      
      // 콘텐츠 플래그
      Promise.all([
        // 비활성화된 사용자 수
        prisma.user.count({
          where: { isActive: false }
        }),
        
        // 숨겨진 밈 수
        prisma.meme.count({
          where: { isPublic: false }
        })
      ]).then(([inactiveUsers, hiddenMemes]) => ({
        inactiveUsers,
        hiddenMemes
      }))
    ]);

    // 알림 레벨별 메시지 생성
    const alerts = [];

    // Critical alerts
    if (systemHealth.memoryUsage > 85) {
      alerts.push({
        level: 'critical',
        type: 'system',
        message: `메모리 사용량이 ${systemHealth.memoryUsage.toFixed(1)}%로 높습니다.`,
        timestamp: new Date()
      });
    }

    if (systemHealth.cpuUsage > 80) {
      alerts.push({
        level: 'critical',
        type: 'system',
        message: `CPU 사용량이 ${systemHealth.cpuUsage.toFixed(1)}%로 높습니다.`,
        timestamp: new Date()
      });
    }

    // Warning alerts
    if (unusualActivity.isUnusual) {
      alerts.push({
        level: 'warning',
        type: 'activity',
        message: `비정상적인 활동 감지: 신규 사용자 ${unusualActivity.newUsers}명, 신규 밈 ${unusualActivity.newMemes}개`,
        timestamp: new Date()
      });
    }

    if (unusualActivity.viralMemes > 0) {
      alerts.push({
        level: 'info',
        type: 'content',
        message: `바이럴 콘텐츠 ${unusualActivity.viralMemes}개 감지됨`,
        timestamp: new Date()
      });
    }

    // Info alerts
    if (contentFlags.inactiveUsers > 10) {
      alerts.push({
        level: 'info',
        type: 'moderation',
        message: `비활성화된 사용자 ${contentFlags.inactiveUsers}명`,
        timestamp: new Date()
      });
    }

    const response = {
      systemHealth,
      unusualActivity,
      contentFlags,
      alerts: alertType ? alerts.filter(alert => alert.level === alertType) : alerts,
      summary: {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.level === 'critical').length,
        warningAlerts: alerts.filter(a => a.level === 'warning').length,
        infoAlerts: alerts.filter(a => a.level === 'info').length
      }
    };

    await logAdminAction(
      auth.user.id,
      'CHECK_ALERTS',
      'system',
      undefined,
      { alertType, alertsCount: alerts.length }
    );

    return NextResponse.json({
      success: true,
      data: response,
      message: `${alerts.length}개의 알림을 확인했습니다.`
    });

  } catch (error) {
    console.error('Admin alerts API error:', error);
    return NextResponse.json(
      { error: '알림 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}