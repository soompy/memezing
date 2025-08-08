import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 특정 신고 상세 조회
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

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            _count: {
              select: {
                reports: true,
                memes: true
              }
            }
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
    });

    if (!report) {
      return NextResponse.json(
        { error: '신고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 대상 콘텐츠 상세 정보
    let targetDetails: any = null;
    let targetOwner: any = null;
    let relatedReports: any[] = [];

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
                  image: true,
                  isActive: true,
                  role: true,
                  createdAt: true
                }
              },
              template: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              },
              _count: {
                select: {
                  likes: true,
                  comments: true
                }
              }
            }
          });
          
          if (meme) {
            targetDetails = {
              id: meme.id,
              title: meme.title,
              imageUrl: meme.imageUrl,
              textBoxes: meme.textBoxes,
              tags: meme.tags,
              description: meme.description,
              isPublic: meme.isPublic,
              isAiGenerated: meme.isAiGenerated,
              viewsCount: meme.viewsCount,
              likesCount: meme.likesCount,
              sharesCount: meme.sharesCount,
              template: meme.template,
              createdAt: meme.createdAt,
              updatedAt: meme.updatedAt,
              stats: {
                likes: meme._count.likes,
                comments: meme._count.comments
              }
            };
            targetOwner = meme.user;

            // 같은 밈에 대한 다른 신고들
            relatedReports = await prisma.report.findMany({
              where: {
                type: 'meme',
                targetId: report.targetId,
                id: { not: report.id }
              },
              include: {
                reporter: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            });
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
              bio: true,
              provider: true,
              isVerified: true,
              isActive: true,
              role: true,
              lastLoginAt: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: {
                  memes: true,
                  likes: true,
                  comments: true,
                  reports: true
                }
              }
            }
          });
          
          if (user) {
            targetDetails = user;
            targetOwner = user;

            // 같은 사용자에 대한 다른 신고들
            relatedReports = await prisma.report.findMany({
              where: {
                type: 'user',
                targetId: report.targetId,
                id: { not: report.id }
              },
              include: {
                reporter: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            });
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
                  image: true,
                  isActive: true,
                  role: true
                }
              },
              meme: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true
                }
              }
            }
          });
          
          if (comment) {
            targetDetails = {
              id: comment.id,
              content: comment.content,
              isEdited: comment.isEdited,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
              meme: comment.meme
            };
            targetOwner = comment.user;

            // 같은 댓글에 대한 다른 신고들
            relatedReports = await prisma.report.findMany({
              where: {
                type: 'comment',
                targetId: report.targetId,
                id: { not: report.id }
              },
              include: {
                reporter: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            });
          }
          break;
      }
    } catch (error) {
      console.error(`Error fetching target details for report ${report.id}:`, error);
    }

    const response = {
      ...report,
      targetDetails: targetDetails || { deleted: true },
      targetOwner: targetOwner || { deleted: true },
      relatedReports
    };

    await logAdminAction(
      auth.user.id,
      'VIEW_REPORT_DETAIL',
      'system',
      params.id
    );

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Admin report detail API error:', error);
    return NextResponse.json(
      { error: '신고 상세 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 신고 처리 (개별)
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

    const { action, actionReason, autoProcess } = await request.json();

    const validActions = ['review', 'resolve', 'dismiss', 'escalate'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다.' },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id }
    });

    if (!report) {
      return NextResponse.json(
        { error: '신고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 처리된 신고는 재처리 불가
    if (report.status === 'resolved' || report.status === 'dismissed') {
      return NextResponse.json(
        { error: '이미 처리된 신고입니다.' },
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

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 신고 상태 업데이트
      const updatedReport = await tx.report.update({
        where: { id: params.id },
        data: updateData
      });

      // 자동 처리 옵션이 활성화되고 해결된 경우
      if (action === 'resolve' && autoProcess) {
        try {
          switch (report.type) {
            case 'meme':
              if (report.reason === 'inappropriate' || report.reason === 'harassment') {
                await tx.meme.update({
                  where: { id: report.targetId },
                  data: { isPublic: false }
                });
              }
              break;
            
            case 'user':
              if (report.reason === 'harassment' && report.priority === 'critical') {
                await tx.user.update({
                  where: { id: report.targetId },
                  data: { isActive: false }
                });
              }
              break;
            
            case 'comment':
              if (report.reason === 'inappropriate' || report.reason === 'harassment') {
                await tx.comment.delete({
                  where: { id: report.targetId }
                });
              }
              break;
          }
        } catch (error) {
          console.error(`Error auto-processing report ${report.id}:`, error);
        }
      }

      return updatedReport;
    });

    await logAdminAction(
      auth.user.id,
      `${action.toUpperCase()}_REPORT`,
      'system',
      params.id,
      { 
        reportType: report.type,
        reportReason: report.reason,
        targetId: report.targetId,
        actionReason,
        autoProcess
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `신고가 ${action === 'resolve' ? '해결' : action === 'dismiss' ? '기각' : '처리'}되었습니다.`
    });

  } catch (error) {
    console.error('Admin report action API error:', error);
    return NextResponse.json(
      { error: '신고 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}