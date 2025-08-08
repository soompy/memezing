import { PrismaClient } from '@prisma/client';
import { detectSuspiciousActivity } from './automation';

const prisma = new PrismaClient();

export interface AdminNotification {
  id: string;
  type: 'system' | 'content' | 'user' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  data?: any;
  actions?: Array<{
    label: string;
    action: string;
    params?: any;
  }>;
}

// 알림 생성 및 브로드캐스트
export async function createNotification(notification: Omit<AdminNotification, 'id' | 'createdAt' | 'isRead'>) {
  const fullNotification: AdminNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    isRead: false
  };

  // 실제 환경에서는 데이터베이스에 저장
  // await prisma.notification.create({ data: fullNotification });

  // 실시간 브로드캐스트 (WebSocket, Server-Sent Events 등)
  await broadcastToAdmins(fullNotification);

  // 높은 우선순위 알림은 이메일로도 발송
  if (notification.priority === 'critical' || notification.priority === 'high') {
    await sendEmailNotification(fullNotification);
  }

  return fullNotification;
}

// 관리자들에게 실시간 브로드캐스트
async function broadcastToAdmins(notification: AdminNotification) {
  // 실제로는 WebSocket 서버나 Server-Sent Events를 통해 전송
  console.log('[BROADCAST] Notification to admins:', {
    id: notification.id,
    type: notification.type,
    priority: notification.priority,
    title: notification.title
  });

  // Socket.IO 예시:
  // io.to('admins').emit('notification', notification);

  // Server-Sent Events 예시:
  // adminClients.forEach(client => {
  //   client.write(`data: ${JSON.stringify(notification)}\n\n`);
  // });
}

// 이메일 알림 발송
async function sendEmailNotification(notification: AdminNotification) {
  // 실제 이메일 발송 로직
  console.log('[EMAIL] Sending notification email:', {
    to: 'admin@memezing.com',
    subject: `[${notification.priority.toUpperCase()}] ${notification.title}`,
    body: notification.message
  });

  // nodemailer 사용 예시:
  // await sendEmail({
  //   to: adminEmails,
  //   subject: `[${notification.priority.toUpperCase()}] ${notification.title}`,
  //   html: generateEmailTemplate(notification)
  // });
}

// 자동 알림 트리거들

// 신규 신고 접수 시
export async function onReportCreated(reportId: string, reportData: any) {
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  
  if (reportData.reason === 'harassment' || reportData.reason === 'copyright') {
    priority = 'high';
  }
  if (reportData.priority === 'critical') {
    priority = 'critical';
  }

  await createNotification({
    type: 'content',
    priority,
    title: `새로운 ${priority === 'critical' ? '긴급' : ''} 신고`,
    message: `${reportData.type} 콘텐츠에 대한 ${reportData.reason} 신고가 접수되었습니다.`,
    data: {
      reportId,
      reportType: reportData.type,
      reason: reportData.reason,
      targetId: reportData.targetId
    },
    actions: [
      { label: '신고 확인', action: 'view_report', params: { reportId } },
      { label: '즉시 처리', action: 'quick_resolve', params: { reportId } }
    ]
  });
}

// 시스템 이상 감지 시
export async function onSystemAlert(alertType: string, severity: 'low' | 'medium' | 'high' | 'critical', data: any) {
  let title = '';
  let message = '';

  switch (alertType) {
    case 'high_memory':
      title = '메모리 사용량 경고';
      message = `메모리 사용량이 ${data.percentage}%에 도달했습니다.`;
      break;
    case 'high_cpu':
      title = 'CPU 사용량 경고';
      message = `CPU 사용량이 ${data.percentage}%에 도달했습니다.`;
      break;
    case 'database_slow':
      title = '데이터베이스 응답 지연';
      message = `데이터베이스 응답 시간이 ${data.responseTime}ms로 지연되고 있습니다.`;
      break;
    case 'user_surge':
      title = '사용자 급증';
      message = `${data.timeframe} 내 신규 사용자 ${data.count}명이 가입했습니다.`;
      break;
    default:
      title = '시스템 알림';
      message = `${alertType} 이벤트가 발생했습니다.`;
  }

  await createNotification({
    type: 'system',
    priority: severity,
    title,
    message,
    data: { alertType, ...data },
    actions: [
      { label: '시스템 상태 확인', action: 'view_system_status' },
      { label: '상세 분석', action: 'view_analytics', params: { type: 'performance' } }
    ]
  });
}

// 의심스러운 사용자 활동 감지 시
export async function onSuspiciousUserActivity(userId: string, activityData: any) {
  await createNotification({
    type: 'security',
    priority: activityData.severity || 'medium',
    title: '의심스러운 사용자 활동',
    message: `사용자 ${activityData.userEmail || userId}의 의심스러운 활동이 감지되었습니다: ${activityData.description}`,
    data: {
      userId,
      activityType: activityData.type,
      details: activityData.details
    },
    actions: [
      { label: '사용자 분석', action: 'analyze_user', params: { userId } },
      { label: '계정 확인', action: 'view_user', params: { userId } },
      { label: '즉시 조치', action: 'user_action', params: { userId } }
    ]
  });
}

// 자동화 시스템 결과 알림
export async function onAutomationResult(resultType: string, data: any) {
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let title = '';
  let message = '';

  switch (resultType) {
    case 'spam_blocked':
      priority = 'medium';
      title = '스팸 콘텐츠 자동 차단';
      message = `${data.count}개의 스팸 콘텐츠가 자동으로 차단되었습니다.`;
      break;
    case 'user_suspended':
      priority = 'high';
      title = '사용자 자동 정지';
      message = `위험도가 높은 사용자 ${data.userEmail}이 자동으로 정지되었습니다.`;
      break;
    case 'batch_review_complete':
      priority = 'low';
      title = '배치 검토 완료';
      message = `${data.processed}개 콘텐츠 검토 완료, ${data.blocked}개 차단`;
      break;
    case 'false_positive_detected':
      priority = 'medium';
      title = '오탐 감지';
      message = '자동화 시스템의 오탐이 감지되었습니다. 설정 검토가 필요합니다.';
      break;
  }

  await createNotification({
    type: 'system',
    priority,
    title,
    message,
    data: { resultType, ...data },
    actions: [
      { label: '자동화 설정', action: 'view_automation_settings' },
      { label: '상세 로그', action: 'view_automation_logs' }
    ]
  });
}

// 정기적 상태 체크 (cron job에서 호출)
export async function performPeriodicChecks() {
  try {
    console.log('[PERIODIC CHECK] Starting...');

    // 의심스러운 활동 감지
    const suspiciousActivity = await detectSuspiciousActivity();
    
    for (const alert of suspiciousActivity.alerts) {
      await onSystemAlert(alert.type, alert.severity, alert.data);
    }

    // 미처리 신고 확인
    const pendingReports = await prisma.report.count({
      where: {
        status: 'pending',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24시간 이상 된 것
        }
      }
    });

    if (pendingReports > 10) {
      await createNotification({
        type: 'content',
        priority: 'medium',
        title: '미처리 신고 누적',
        message: `24시간 이상 미처리된 신고가 ${pendingReports}개 있습니다.`,
        data: { pendingCount: pendingReports },
        actions: [
          { label: '신고 목록', action: 'view_reports', params: { status: 'pending' } }
        ]
      });
    }

    // 시스템 리소스 확인 (가상 데이터)
    const memoryUsage = 70 + Math.random() * 25; // 70-95%
    const cpuUsage = 30 + Math.random() * 50; // 30-80%

    if (memoryUsage > 85) {
      await onSystemAlert('high_memory', 'high', { percentage: Math.round(memoryUsage) });
    }

    if (cpuUsage > 80) {
      await onSystemAlert('high_cpu', 'critical', { percentage: Math.round(cpuUsage) });
    }

    console.log('[PERIODIC CHECK] Completed');

  } catch (error) {
    console.error('[PERIODIC CHECK] Error:', error);
    
    await createNotification({
      type: 'system',
      priority: 'high',
      title: '정기 체크 오류',
      message: '시스템 정기 체크 중 오류가 발생했습니다.',
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      actions: [
        { label: '로그 확인', action: 'view_system_logs' }
      ]
    });
  } finally {
    await prisma.$disconnect();
  }
}

// 알림 템플릿 생성
function generateEmailTemplate(notification: AdminNotification): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .notification { 
                background: #f8f9fa; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
            }
            .priority-${notification.priority} { 
                border-left: 4px solid ${
                  notification.priority === 'critical' ? '#dc3545' :
                  notification.priority === 'high' ? '#fd7e14' :
                  notification.priority === 'medium' ? '#ffc107' : '#28a745'
                }; 
            }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .message { font-size: 14px; line-height: 1.5; }
            .actions { margin-top: 20px; }
            .action-btn { 
                display: inline-block; 
                padding: 8px 16px; 
                background: #007bff; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px; 
                margin-right: 10px; 
            }
        </style>
    </head>
    <body>
        <div class="notification priority-${notification.priority}">
            <div class="title">[${notification.priority.toUpperCase()}] ${notification.title}</div>
            <div class="message">${notification.message}</div>
            ${notification.actions ? `
                <div class="actions">
                    ${notification.actions.map(action => 
                      `<a href="#" class="action-btn">${action.label}</a>`
                    ).join('')}
                </div>
            ` : ''}
        </div>
        <p><small>이 알림은 Memezing 관리 시스템에서 자동 생성되었습니다.</small></p>
    </body>
    </html>
  `;
}