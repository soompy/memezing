import { NextRequest, NextResponse } from 'next/server';
<parameter name="content">import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 관리자 신고 목록 조회
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
    const status = searchParams.get('status'); // pending, reviewing, resolved, dismissed
    const priority = searchParams.get('priority'); // low, medium, high, critical
    const type = searchParams.get('type'); // meme, user, comment
    const reason = searchParams.get('reason'); // spam, inappropriate, etc.
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, priority, oldest
    
    const skip = (page - 1) * limit;

    // 필터 조건
    const where: any = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (reason) where.reason = reason;

    // 정렬 설정
    const orderBy: any = [];
    
    if (sortBy === 'priority') {
      // 우선순위 정렬 (critical > high > medium > low)
      orderBy.push({
        priority: 'desc' // 실제로는 CASE 문이나 enum 순서로 정렬 필요
      });
    } else if (sortBy === 'oldest') {
      orderBy.push({ createdAt: 'asc' });
    } else {
      orderBy.push({ createdAt: 'desc' });
    }

    const [reports, total, statusCounts] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      
      prisma.report.count({ where }),
      
      // 상태별 개수
      prisma.report.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      })
    ]);

    // 대상 콘텐츠 정보 추가
    const reportsWithTargetInfo = await Promise.all(
      reports.map(async (report) => {
        let targetInfo: any = null;
        let targetOwner: any = null;

        try {
          switch (report.type) {
            case 'meme':
              const meme = await prisma.meme.findUnique({
                where: { id: report.targetId },
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      isActive: true
                    }
                  }
                }
              });
              if (meme) {
                targetInfo = {
                  title: meme.title || '제목 없음',
                  imageUrl: meme.imageUrl,
                  isPublic: meme.isPublic,
                  viewsCount: meme.viewsCount,
                  likesCount: meme.likesCount
                };
                targetOwner = meme.user;
              }
              break;
            
            case 'user':
              const user = await prisma.user.findUnique({
                where: { id: report.targetId },
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  isActive: true,
                  role: true,
                  createdAt: true,
                  _count: {
                    select: {
                      memes: true,
                      comments: true
                    }
                  }
                }
              });
              if (user) {
                targetInfo = {
                  name: user.name,
                  email: user.email,
                  image: user.image,
                  isActive: user.isActive,
                  role: user.role,
                  createdAt: user.createdAt,
                  memesCount: user._count.memes,
                  commentsCount: user._count.comments
                };
                targetOwner = user;
              }
              break;
            
            case 'comment':
              const comment = await prisma.comment.findUnique({
                where: { id: report.targetId },
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      isActive: true
                    }
                  },
                  meme: {
                    select: {
                      id: true,
                      title: true
                    }
                  }
                }
              });
              if (comment) {
                targetInfo = {
                  content: comment.content,
                  createdAt: comment.createdAt,
                  isEdited: comment.isEdited,
                  memeId: comment.meme.id,
                  memeTitle: comment.meme.title
                };
                targetOwner = comment.user;
              }
              break;
          }
        } catch (error) {
          console.error(`Error fetching target info for report ${report.id}:`, error);
        }

        return {
          ...report,
          targetInfo: targetInfo || { deleted: true },
          targetOwner: targetOwner || { deleted: true }
        };
      })
    );

    await logAdminAction(
      auth.user.id,
      'VIEW_REPORTS_LIST',
      'system',
      undefined,
      { page, limit, status, priority, type }
    );

    return NextResponse.json({
      success: true,
      data: reportsWithTargetInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        totalReports: total
      }
    });

  } catch (error) {
    console.error('Admin reports list API error:', error);
    return NextResponse.json(
      { error: '신고 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 신고 일괄 처리
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { action, reportIds, reason } = await request.json();
    
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { error: '처리할 신고를 선택해주세요.' },
        { status: 400 }
      );
    }

    const validActions = ['review', 'resolve', 'dismiss', 'escalate'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다.' },
        { status: 400 }
      );
    }

    let updateData: any = {
      updatedAt: new Date(),
      reviewerId: auth.user.id
    };

    switch (action) {
      case 'review':
        updateData.status = 'reviewing';
        break;
      
      case 'resolve':
        updateData.status = 'resolved';
        updateData.resolvedAt = new Date();
        break;
      
      case 'dismiss':
        updateData.status = 'dismissed';
        updateData.resolvedAt = new Date();
        break;
      
      case 'escalate':
        updateData.priority = 'critical';
        updateData.status = 'reviewing';
        break;
    }

    // 신고들을 가져와서 상세 정보 확인
    const reports = await prisma.report.findMany({
      where: {
        id: { in: reportIds }
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (reports.length === 0) {
      return NextResponse.json(
        { error: '처리할 신고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 트랜잭션으로 일괄 처리
    const result = await prisma.$transaction(async (tx) => {
      // 신고 상태 업데이트
      const updatedReports = await tx.report.updateMany({
        where: {
          id: { in: reportIds }
        },
        data: updateData
      });

      // 해결된 신고에 대해 추가 처리
      if (action === 'resolve') {
        for (const report of reports) {
          // 심각한 위반의 경우 대상 콘텐츠 자동 처리
          if (report.priority === 'critical' || report.reason === 'harassment') {
            try {
              switch (report.type) {
                case 'meme':
                  await tx.meme.update({
                    where: { id: report.targetId },
                    data: { isPublic: false } // 숨김 처리
                  });
                  break;
                
                case 'user':
                  // 사용자 일시 정지는 더 신중하게 처리
                  if (report.reason === 'harassment') {
                    await tx.user.update({
                      where: { id: report.targetId },
                      data: { isActive: false }
                    });
                  }
                  break;
                
                case 'comment':
                  await tx.comment.delete({
                    where: { id: report.targetId }
                  });
                  break;
              }
            } catch (error) {
              console.error(`Error auto-processing report ${report.id}:`, error);
            }
          }
        }
      }

      return updatedReports;
    });

    await logAdminAction(
      auth.user.id,
      `${action.toUpperCase()}_REPORTS_BULK`,
      'system',
      undefined,
      { 
        reportIds, 
        count: result.count, 
        reason,
        reportTypes: reports.map(r => r.type),
        reportReasons: reports.map(r => r.reason)
      }
    );

    return NextResponse.json({
      success: true,
      data: { affected: result.count },
      message: `${result.count}개의 신고가 처리되었습니다.`
    });

  } catch (error) {
    console.error('Admin reports bulk action error:', error);
    return NextResponse.json(
      { error: '신고 일괄 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}