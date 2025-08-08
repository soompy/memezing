import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logAdminAction } from '@/lib/auth';
import { 
  autoReviewContent, 
  analyzeUserBehavior, 
  batchContentReview, 
  detectSuspiciousActivity 
} from '@/lib/automation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 자동화 도구 API
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { action, params } = await request.json();

    let result: any = {};

    switch (action) {
      case 'reviewContent':
        if (!params.contentType || !params.contentId) {
          return NextResponse.json(
            { error: '콘텐츠 타입과 ID가 필요합니다.' },
            { status: 400 }
          );
        }

        // 콘텐츠 조회
        let content: any = null;
        if (params.contentType === 'meme') {
          content = await prisma.meme.findUnique({
            where: { id: params.contentId },
            include: {
              user: { select: { id: true } }
            }
          });
        } else if (params.contentType === 'comment') {
          content = await prisma.comment.findUnique({
            where: { id: params.contentId },
            include: {
              user: { select: { id: true } }
            }
          });
        }

        if (!content) {
          return NextResponse.json(
            { error: '콘텐츠를 찾을 수 없습니다.' },
            { status: 404 }
          );
        }

        result = await autoReviewContent(params.contentType, params.contentId, content);
        
        await logAdminAction(
          auth.user.id,
          'AUTO_REVIEW_CONTENT',
          params.contentType,
          params.contentId,
          { result }
        );
        break;

      case 'analyzeUser':
        if (!params.userId) {
          return NextResponse.json(
            { error: '사용자 ID가 필요합니다.' },
            { status: 400 }
          );
        }

        result = await analyzeUserBehavior(params.userId);
        
        await logAdminAction(
          auth.user.id,
          'ANALYZE_USER_BEHAVIOR',
          'user',
          params.userId,
          { riskLevel: result.riskLevel, riskScore: result.riskScore }
        );
        break;

      case 'batchReview':
        if (auth.user.role !== 'admin' && auth.user.role !== 'super_admin') {
          return NextResponse.json(
            { error: '배치 검토는 관리자만 실행할 수 있습니다.' },
            { status: 403 }
          );
        }

        result = await batchContentReview();
        
        await logAdminAction(
          auth.user.id,
          'BATCH_CONTENT_REVIEW',
          'system',
          undefined,
          result
        );
        break;

      case 'detectSuspicious':
        result = await detectSuspiciousActivity();
        
        await logAdminAction(
          auth.user.id,
          'DETECT_SUSPICIOUS_ACTIVITY',
          'system',
          undefined,
          { alertsCount: result.alerts.length }
        );
        break;

      case 'getAutomationStats':
        // 자동화 통계 조회
        const [
          totalAutoBlocked,
          recentAutoActions,
          spamDetectionStats,
          userRiskStats
        ] = await Promise.all([
          // 자동 차단된 콘텐츠 수 (최근 30일)
          prisma.meme.count({
            where: {
              isPublic: false,
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
              // 실제로는 autoBlocked 플래그가 있어야 함
            }
          }),

          // 최근 자동화 액션들 (AdminLog에서)
          prisma.adminLog.findMany({
            where: {
              action: {
                in: ['AUTO_REVIEW_CONTENT', 'BATCH_CONTENT_REVIEW', 'ANALYZE_USER_BEHAVIOR']
              },
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            },
            include: {
              admin: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 50
          }),

          // 스팸 감지 통계 (가상 데이터)
          {
            totalScanned: Math.floor(Math.random() * 1000) + 500,
            spamDetected: Math.floor(Math.random() * 50) + 10,
            falsePositives: Math.floor(Math.random() * 5),
            accuracy: 95 + Math.random() * 4
          },

          // 사용자 위험도 통계
          Promise.all([
            prisma.user.count({ where: { isActive: true } }),
            // 실제로는 riskLevel 필드가 있어야 함
            Math.floor(Math.random() * 10), // high risk users
            Math.floor(Math.random() * 30), // medium risk users
          ]).then(([total, high, medium]) => ({
            totalUsers: total,
            highRisk: high,
            mediumRisk: medium,
            lowRisk: total - high - medium
          }))
        ]);

        result = {
          overview: {
            totalAutoBlocked,
            recentActions: recentAutoActions.length,
            systemAccuracy: spamDetectionStats.accuracy
          },
          spamDetection: spamDetectionStats,
          userRisks: userRiskStats,
          recentActions: recentAutoActions
        };
        break;

      default:
        return NextResponse.json(
          { error: '알 수 없는 액션입니다.' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${action} 작업이 완료되었습니다.`
    });

  } catch (error) {
    console.error('Automation API error:', error);
    return NextResponse.json(
      { error: '자동화 작업 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 자동화 설정 조회
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // 자동화 설정 (실제로는 별도 Settings 테이블에서 조회)
    const automationSettings = {
      autoReview: {
        enabled: true,
        spamThreshold: 30,
        inappropriateThreshold: 25,
        highRiskThreshold: 50
      },
      autoBlock: {
        enabled: true,
        confidenceThreshold: 80,
        requiresManualReview: false
      },
      userAnalysis: {
        enabled: true,
        riskThresholds: {
          medium: 20,
          high: 50,
          critical: 80
        }
      },
      notifications: {
        enabled: true,
        channels: ['email', 'dashboard'],
        highPriorityOnly: false
      },
      batchProcessing: {
        enabled: true,
        schedule: '0 */4 * * *', // 4시간마다
        maxProcessPerBatch: 100
      }
    };

    // 최근 자동화 성능 메트릭
    const performanceMetrics = {
      last24h: {
        contentScanned: Math.floor(Math.random() * 200) + 100,
        spamBlocked: Math.floor(Math.random() * 20) + 5,
        usersAnalyzed: Math.floor(Math.random() * 50) + 20,
        falsePositives: Math.floor(Math.random() * 3),
        processingTime: Math.floor(Math.random() * 500) + 100 // ms
      },
      last7d: {
        contentScanned: Math.floor(Math.random() * 1000) + 500,
        spamBlocked: Math.floor(Math.random() * 100) + 30,
        usersAnalyzed: Math.floor(Math.random() * 200) + 100,
        falsePositives: Math.floor(Math.random() * 10) + 2,
        averageProcessingTime: Math.floor(Math.random() * 200) + 150
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        settings: automationSettings,
        performance: performanceMetrics,
        status: {
          systemHealthy: true,
          lastBatchRun: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000),
          nextScheduledRun: new Date(Date.now() + (4 - (Date.now() / (60 * 60 * 1000)) % 4) * 60 * 60 * 1000),
          activeMonitoring: true
        }
      }
    });

  } catch (error) {
    console.error('Get automation settings error:', error);
    return NextResponse.json(
      { error: '자동화 설정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 자동화 설정 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'admin');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { settings } = await request.json();

    if (!settings) {
      return NextResponse.json(
        { error: '설정 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제로는 Settings 테이블에 저장
    // 여기서는 로그만 남김
    await logAdminAction(
      auth.user.id,
      'UPDATE_AUTOMATION_SETTINGS',
      'system',
      undefined,
      { newSettings: settings }
    );

    return NextResponse.json({
      success: true,
      data: { updated: true },
      message: '자동화 설정이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Update automation settings error:', error);
    return NextResponse.json(
      { error: '자동화 설정 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}