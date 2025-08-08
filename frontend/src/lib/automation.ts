import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 스팸 감지 패턴
const SPAM_PATTERNS = [
  /(?:click|visit|check)\s*(?:here|this|now)/i,
  /(?:free|win|winner|prize|money|cash|earn)/i,
  /(?:urgent|limited|offer|deal|sale)/i,
  /(?:http[s]?:\/\/|www\.)[^\s]+/gi, // URL 패턴
  /(?:buy|purchase|order)\s*(?:now|today)/i,
  /(?:100%|guarantee|sure)/i
];

// 부적절한 콘텐츠 감지 키워드 (실제로는 더 정교한 ML 모델 사용)
const INAPPROPRIATE_KEYWORDS = [
  '욕설', '혐오', '차별', '폭력', '음란', '도박',
  // 영어 키워드들도 추가
  'hate', 'violence', 'discrimination', 'explicit'
];

// 콘텐츠 자동 검토
export async function autoReviewContent(
  contentType: 'meme' | 'comment',
  contentId: string,
  content: any
): Promise<{
  isSpam: boolean;
  isInappropriate: boolean;
  isHighRisk: boolean;
  confidence: number;
  reasons: string[];
  recommendedAction?: string;
}> {
  
  let isSpam = false;
  let isInappropriate = false;
  let isHighRisk = false;
  let confidence = 0;
  const reasons: string[] = [];

  try {
    // 텍스트 콘텐츠 추출
    let textContent = '';
    
    if (contentType === 'meme') {
      textContent = [
        content.title || '',
        content.description || '',
        content.tags?.join(' ') || '',
        // textBoxes에서 텍스트 추출
        ...(Array.isArray(content.textBoxes) 
          ? content.textBoxes.map((box: any) => box.text || box.defaultText || '')
          : []
        )
      ].join(' ').toLowerCase();
    } else if (contentType === 'comment') {
      textContent = content.content?.toLowerCase() || '';
    }

    // 스팸 감지
    let spamScore = 0;
    SPAM_PATTERNS.forEach(pattern => {
      const matches = textContent.match(pattern);
      if (matches) {
        spamScore += matches.length * 10;
        reasons.push(`스팸 패턴 감지: ${pattern.source}`);
      }
    });

    // 부적절한 콘텐츠 감지
    let inappropriateScore = 0;
    INAPPROPRIATE_KEYWORDS.forEach(keyword => {
      if (textContent.includes(keyword)) {
        inappropriateScore += 15;
        reasons.push(`부적절한 키워드: ${keyword}`);
      }
    });

    // 반복 패턴 감지 (같은 문자/단어 반복)
    const repeatPattern = /(.{1,10})\1{3,}/g;
    if (repeatPattern.test(textContent)) {
      spamScore += 20;
      reasons.push('반복 패턴 감지');
    }

    // 대문자 과용 감지
    const upperCaseRatio = (textContent.match(/[A-Z]/g) || []).length / textContent.length;
    if (upperCaseRatio > 0.7 && textContent.length > 10) {
      spamScore += 15;
      reasons.push('대문자 과용');
    }

    // 숫자/특수문자 과용 감지
    const specialCharRatio = (textContent.match(/[0-9!@#$%^&*()]/g) || []).length / textContent.length;
    if (specialCharRatio > 0.5) {
      spamScore += 10;
      reasons.push('특수문자 과용');
    }

    // 짧은 시간 내 대량 생성 감지
    if (contentType === 'meme') {
      const recentMemes = await prisma.meme.count({
        where: {
          userId: content.userId,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // 1시간
          }
        }
      });
      
      if (recentMemes > 10) {
        spamScore += 25;
        reasons.push('단시간 대량 생성');
      }
    }

    // 사용자 히스토리 분석
    if (content.userId) {
      const userStats = await prisma.user.findUnique({
        where: { id: content.userId },
        select: {
          createdAt: true,
          _count: {
            select: {
              reports: true, // 신고받은 횟수
              memes: true
            }
          }
        }
      });

      if (userStats) {
        // 신규 사용자의 의심스러운 활동
        const accountAge = Date.now() - userStats.createdAt.getTime();
        const isNewUser = accountAge < 7 * 24 * 60 * 60 * 1000; // 7일 미만

        if (isNewUser && userStats._count.memes > 20) {
          spamScore += 20;
          reasons.push('신규 사용자의 과도한 활동');
        }

        // 신고 히스토리
        if (userStats._count.reports > 5) {
          inappropriateScore += 30;
          reasons.push('다수 신고 이력');
        }
      }
    }

    // 점수 기반 판정
    isSpam = spamScore >= 30;
    isInappropriate = inappropriateScore >= 25;
    isHighRisk = spamScore >= 50 || inappropriateScore >= 40;

    // 신뢰도 계산 (0-100)
    confidence = Math.min(100, Math.max(spamScore, inappropriateScore));

    // 권장 조치
    let recommendedAction = 'allow';
    if (isHighRisk) {
      recommendedAction = 'block';
    } else if (isSpam || isInappropriate) {
      recommendedAction = 'review';
    }

    // 자동 처리 (고위험 콘텐츠)
    if (isHighRisk && confidence > 80) {
      await autoProcessHighRiskContent(contentType, contentId, reasons);
    }

    return {
      isSpam,
      isInappropriate,
      isHighRisk,
      confidence,
      reasons,
      recommendedAction
    };

  } catch (error) {
    console.error('Auto review error:', error);
    return {
      isSpam: false,
      isInappropriate: false,
      isHighRisk: false,
      confidence: 0,
      reasons: ['검토 시스템 오류'],
      recommendedAction: 'review'
    };
  }
}

// 고위험 콘텐츠 자동 처리
async function autoProcessHighRiskContent(
  contentType: 'meme' | 'comment',
  contentId: string,
  reasons: string[]
) {
  try {
    if (contentType === 'meme') {
      // 밈 숨김 처리
      await prisma.meme.update({
        where: { id: contentId },
        data: { isPublic: false }
      });

      // 관리자 알림용 로그
      console.log(`[AUTO-BLOCK] Meme ${contentId} blocked:`, reasons);
    } else if (contentType === 'comment') {
      // 댓글 삭제
      await prisma.comment.delete({
        where: { id: contentId }
      });

      console.log(`[AUTO-DELETE] Comment ${contentId} deleted:`, reasons);
    }
  } catch (error) {
    console.error('Auto process error:', error);
  }
}

// 사용자 행동 패턴 분석
export async function analyzeUserBehavior(userId: string): Promise<{
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  patterns: string[];
  recommendations: string[];
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memes: {
          select: {
            id: true,
            createdAt: true,
            isPublic: true,
            viewsCount: true,
            likesCount: true
          },
          orderBy: { createdAt: 'desc' },
          take: 100
        },
        comments: {
          select: {
            id: true,
            createdAt: true,
            content: true
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        reports: {
          select: {
            reason: true,
            status: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            memes: true,
            comments: true,
            likes: true,
            reports: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    let riskScore = 0;
    const patterns: string[] = [];
    const recommendations: string[] = [];

    const now = Date.now();
    const accountAge = now - user.createdAt.getTime();
    const daysSinceJoin = accountAge / (24 * 60 * 60 * 1000);

    // 1. 활동 빈도 분석
    const last24hMemes = user.memes.filter(m => 
      now - m.createdAt.getTime() < 24 * 60 * 60 * 1000
    ).length;

    const last7dMemes = user.memes.filter(m => 
      now - m.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;

    if (last24hMemes > 20) {
      riskScore += 30;
      patterns.push('24시간 내 과도한 밈 생성 (20개 이상)');
      recommendations.push('일일 생성 제한 적용 고려');
    }

    if (last7dMemes > 100) {
      riskScore += 25;
      patterns.push('주간 과도한 밈 생성 (100개 이상)');
    }

    // 2. 신고 이력 분석
    const recentReports = user.reports.filter(r => 
      now - r.createdAt.getTime() < 30 * 24 * 60 * 60 * 1000
    );

    if (recentReports.length > 5) {
      riskScore += 40;
      patterns.push('최근 30일 내 다수 신고 (5개 이상)');
      recommendations.push('계정 검토 및 주의 조치');
    }

    const harassmentReports = recentReports.filter(r => r.reason === 'harassment');
    if (harassmentReports.length > 2) {
      riskScore += 35;
      patterns.push('괴롭힘 관련 다수 신고');
      recommendations.push('즉시 계정 정지 고려');
    }

    // 3. 콘텐츠 품질 분석
    const publicMemes = user.memes.filter(m => m.isPublic);
    const totalViews = publicMemes.reduce((sum, m) => sum + m.viewsCount, 0);
    const totalLikes = publicMemes.reduce((sum, m) => sum + m.likesCount, 0);
    
    const avgViews = publicMemes.length > 0 ? totalViews / publicMemes.length : 0;
    const avgLikes = publicMemes.length > 0 ? totalLikes / publicMemes.length : 0;

    // 조회수 대비 좋아요 비율이 너무 낮으면 품질 문제
    if (avgViews > 10 && avgLikes / avgViews < 0.01) {
      riskScore += 15;
      patterns.push('낮은 콘텐츠 품질 (좋아요 비율 < 1%)');
    }

    // 4. 신규 사용자 특별 검사
    if (daysSinceJoin < 7) {
      if (user._count.memes > 50) {
        riskScore += 25;
        patterns.push('신규 사용자의 과도한 활동');
        recommendations.push('신규 사용자 제한 적용');
      }
    }

    // 5. 댓글 패턴 분석
    const recentComments = user.comments.filter(c => 
      now - c.createdAt.getTime() < 24 * 60 * 60 * 1000
    );

    if (recentComments.length > 50) {
      riskScore += 20;
      patterns.push('24시간 내 과도한 댓글 (50개 이상)');
    }

    // 짧은 댓글이 대부분인 경우
    const shortComments = recentComments.filter(c => c.content.length < 10);
    if (shortComments.length / recentComments.length > 0.8 && recentComments.length > 10) {
      riskScore += 15;
      patterns.push('의미없는 짧은 댓글 다수 작성');
    }

    // 위험도 레벨 결정
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore < 20) {
      riskLevel = 'low';
    } else if (riskScore < 50) {
      riskLevel = 'medium';
      recommendations.push('모니터링 강화');
    } else if (riskScore < 80) {
      riskLevel = 'high';
      recommendations.push('계정 검토 필요');
    } else {
      riskLevel = 'critical';
      recommendations.push('즉시 조치 필요');
    }

    return {
      riskLevel,
      riskScore: Math.min(100, riskScore),
      patterns,
      recommendations
    };

  } catch (error) {
    console.error('User behavior analysis error:', error);
    return {
      riskLevel: 'low',
      riskScore: 0,
      patterns: ['분석 시스템 오류'],
      recommendations: ['수동 검토 필요']
    };
  }
}

// 일괄 콘텐츠 검토 (크론 작업용)
export async function batchContentReview() {
  try {
    console.log('[BATCH REVIEW] Starting batch content review...');

    // 최근 24시간 내 생성된 밈 중 검토되지 않은 것들
    const unreviewed = await prisma.meme.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        // 검토 플래그가 없는 것들 (실제로는 별도 필드 필요)
      },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    let processed = 0;
    let blocked = 0;

    for (const meme of unreviewed) {
      const review = await autoReviewContent('meme', meme.id, meme);
      
      processed++;

      if (review.isHighRisk) {
        blocked++;
        console.log(`[BATCH REVIEW] Blocked meme ${meme.id}:`, review.reasons);
      }

      // 배치 처리 시 너무 많은 DB 쿼리 방지
      if (processed % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[BATCH REVIEW] Completed: ${processed} reviewed, ${blocked} blocked`);
    
    return { processed, blocked };

  } catch (error) {
    console.error('Batch review error:', error);
    return { processed: 0, blocked: 0 };
  } finally {
    await prisma.$disconnect();
  }
}

// 의심스러운 활동 감지
export async function detectSuspiciousActivity(): Promise<{
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    data?: any;
  }>;
}> {
  const alerts: any[] = [];

  try {
    const now = new Date();
    const last1h = new Date(now.getTime() - 60 * 60 * 1000);
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. 급격한 사용자 증가
    const newUsersLast1h = await prisma.user.count({
      where: { createdAt: { gte: last1h } }
    });

    if (newUsersLast1h > 50) {
      alerts.push({
        type: 'user_surge',
        severity: 'high',
        message: `1시간 내 신규 사용자 급증: ${newUsersLast1h}명`,
        data: { count: newUsersLast1h }
      });
    }

    // 2. 급격한 콘텐츠 증가
    const newMemesLast1h = await prisma.meme.count({
      where: { createdAt: { gte: last1h } }
    });

    if (newMemesLast1h > 200) {
      alerts.push({
        type: 'content_surge',
        severity: 'medium',
        message: `1시간 내 밈 생성 급증: ${newMemesLast1h}개`,
        data: { count: newMemesLast1h }
      });
    }

    // 3. 신고 급증
    const newReportsLast1h = await prisma.report.count({
      where: { createdAt: { gte: last1h } }
    });

    if (newReportsLast1h > 20) {
      alerts.push({
        type: 'report_surge',
        severity: 'high',
        message: `1시간 내 신고 급증: ${newReportsLast1h}개`,
        data: { count: newReportsLast1h }
      });
    }

    // 4. 특정 사용자의 과도한 활동
    const hyperActiveUsers = await prisma.meme.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: last24h }
      },
      _count: {
        userId: true
      },
      having: {
        userId: {
          _count: {
            gt: 30
          }
        }
      }
    });

    if (hyperActiveUsers.length > 0) {
      alerts.push({
        type: 'hyperactive_users',
        severity: 'medium',
        message: `과도한 활동 사용자 ${hyperActiveUsers.length}명 감지`,
        data: { users: hyperActiveUsers }
      });
    }

    return { alerts };

  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    return { alerts: [] };
  } finally {
    await prisma.$disconnect();
  }
}