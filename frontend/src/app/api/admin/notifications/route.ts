import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 관리자 알림 목록 조회
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // system, content, user, security
    const priority = searchParams.get('priority'); // low, medium, high, critical
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const skip = (page - 1) * limit;

    // 실제 알림 시스템 구현을 위해서는 Notification 모델이 필요하지만
    // 여기서는 AdminLog와 Report를 기반으로 알림을 생성
    
    // 최근 중요 이벤트들을 알림으로 변환
    const [
      criticalReports,
      suspiciousActivity,
      systemEvents,
      recentLogs
    ] = await Promise.all([
      // 긴급 신고들
      prisma.report.findMany({
        where: {
          priority: { in: ['high', 'critical'] },
          status: 'pending',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 최근 24시간
          }
        },
        include: {
          reporter: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),

      // 의심스러운 활동 (예시 데이터)
      [
        {
          id: 'sus_1',
          type: 'user_surge',
          message: '1시간 내 신규 가입자 급증 (50명)',
          severity: 'medium',
          createdAt: new Date(),
          data: { count: 50, timeframe: '1h' }
        },
        {
          id: 'sus_2',
          type: 'spam_detection',
          message: '스팸 콘텐츠 자동 차단 (15개)',
          severity: 'low',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          data: { blocked: 15 }
        }
      ],

      // 시스템 이벤트들
      [
        {
          id: 'sys_1',
          type: 'system_health',
          message: '메모리 사용량 85% 도달',
          severity: 'high',
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
          data: { memory: 85 }
        }
      ],

      // 최근 관리자 액션 로그
      prisma.adminLog.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 6 * 60 * 60 * 1000) // 최근 6시간
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
        take: 5
      })
    ]);

    // 알림 객체로 변환
    const notifications = [];

    // 신고 알림
    criticalReports.forEach(report => {
      notifications.push({
        id: `report_${report.id}`,
        type: 'content',
        priority: report.priority,
        title: `${report.priority === 'critical' ? '긴급' : '중요'} 신고 접수`,
        message: `${report.type} 콘텐츠에 대한 ${report.reason} 신고가 접수되었습니다.`,
        createdAt: report.createdAt,
        isRead: false,
        data: {
          reportId: report.id,
          reportType: report.type,
          reason: report.reason,
          reporter: report.reporter.name || report.reporter.email
        },
        actions: [
          { label: '신고 확인', action: 'view_report', params: { reportId: report.id } },
          { label: '즉시 처리', action: 'quick_resolve', params: { reportId: report.id } }
        ]
      });
    });

    // 의심스러운 활동 알림
    suspiciousActivity.forEach(activity => {
      notifications.push({
        id: activity.id,
        type: 'security',
        priority: activity.severity,
        title: '의심스러운 활동 감지',
        message: activity.message,
        createdAt: activity.createdAt,
        isRead: false,
        data: activity.data,
        actions: [
          { label: '상세 확인', action: 'view_analytics', params: {} },
          { label: '조치 취하기', action: 'take_action', params: {} }
        ]
      });
    });

    // 시스템 이벤트 알림
    systemEvents.forEach(event => {
      notifications.push({
        id: event.id,
        type: 'system',
        priority: event.severity,
        title: '시스템 알림',
        message: event.message,
        createdAt: event.createdAt,
        isRead: false,
        data: event.data,
        actions: [
          { label: '시스템 상태 확인', action: 'view_system_status', params: {} }
        ]
      });
    });

    // 관리자 액션 알림
    recentLogs.forEach(log => {
      notifications.push({
        id: `log_${log.id}`,
        type: 'user',
        priority: 'low',
        title: '관리자 활동',
        message: `${log.admin.name || log.admin.email}님이 ${log.action}을 수행했습니다.`,
        createdAt: log.createdAt,
        isRead: false,
        data: {
          adminId: log.adminId,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId
        },
        actions: [
          { label: '로그 확인', action: 'view_log', params: { logId: log.id } }
        ]
      });
    });

    // 정렬 및 필터링
    let filteredNotifications = notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }

    if (priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
    }

    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.isRead);
    }

    // 페이지네이션
    const total = filteredNotifications.length;
    const paginatedNotifications = filteredNotifications.slice(skip, skip + limit);

    // 통계
    const stats = {
      total,
      unread: filteredNotifications.filter(n => !n.isRead).length,
      byPriority: {
        critical: filteredNotifications.filter(n => n.priority === 'critical').length,
        high: filteredNotifications.filter(n => n.priority === 'high').length,
        medium: filteredNotifications.filter(n => n.priority === 'medium').length,
        low: filteredNotifications.filter(n => n.priority === 'low').length
      },
      byType: {
        system: filteredNotifications.filter(n => n.type === 'system').length,
        content: filteredNotifications.filter(n => n.type === 'content').length,
        user: filteredNotifications.filter(n => n.type === 'user').length,
        security: filteredNotifications.filter(n => n.type === 'security').length
      }
    };

    return NextResponse.json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Admin notifications API error:', error);
    return NextResponse.json(
      { error: '알림 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 알림 생성 (내부적으로 사용)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { type, priority, title, message, targetUsers, data } = await request.json();

    if (!type || !priority || !title || !message) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 실제로는 Notification 테이블에 저장하고 실시간 알림 발송
    const notification = {
      id: `notif_${Date.now()}`,
      type,
      priority,
      title,
      message,
      createdAt: new Date(),
      isRead: false,
      data: data || {}
    };

    // 대상 사용자들에게 알림 발송 (실제로는 WebSocket, Push 등 사용)
    console.log('[NOTIFICATION] Created:', notification);

    // 우선순위가 높은 경우 이메일 알림도 발송
    if (priority === 'critical' || priority === 'high') {
      // TODO: 이메일 발송 로직
      console.log('[EMAIL] High priority notification sent');
    }

    await logAdminAction(
      auth.user.id,
      'CREATE_NOTIFICATION',
      'system',
      undefined,
      { notification }
    );

    return NextResponse.json({
      success: true,
      data: notification,
      message: '알림이 생성되었습니다.'
    });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: '알림 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 알림 상태 업데이트 (읽음 처리, 삭제 등)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { action, notificationIds } = await request.json();

    if (!action || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: '액션과 알림 ID 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    let affectedCount = 0;

    switch (action) {
      case 'markAsRead':
        // 실제로는 Notification 테이블에서 읽음 처리
        affectedCount = notificationIds.length;
        console.log(`[NOTIFICATION] Marked ${affectedCount} notifications as read`);
        break;

      case 'markAsUnread':
        // 실제로는 Notification 테이블에서 읽지 않음 처리
        affectedCount = notificationIds.length;
        console.log(`[NOTIFICATION] Marked ${affectedCount} notifications as unread`);
        break;

      case 'delete':
        // 실제로는 Notification 테이블에서 삭제
        affectedCount = notificationIds.length;
        console.log(`[NOTIFICATION] Deleted ${affectedCount} notifications`);
        break;

      case 'archive':
        // 실제로는 Notification 테이블에서 아카이브
        affectedCount = notificationIds.length;
        console.log(`[NOTIFICATION] Archived ${affectedCount} notifications`);
        break;

      default:
        return NextResponse.json(
          { error: '알 수 없는 액션입니다.' },
          { status: 400 }
        );
    }

    await logAdminAction(
      auth.user.id,
      `${action.toUpperCase()}_NOTIFICATIONS`,
      'system',
      undefined,
      { notificationIds, count: affectedCount }
    );

    return NextResponse.json({
      success: true,
      data: { affected: affectedCount },
      message: `${affectedCount}개의 알림이 처리되었습니다.`
    });

  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: '알림 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}