import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export type ReportType = 'meme' | 'user' | 'comment';
export type ReportReason = 'spam' | 'inappropriate' | 'copyright' | 'harassment' | 'fake' | 'other';

// 신고 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { type, targetId, reason, description } = await request.json();

    // 입력 유효성 검사
    if (!type || !targetId || !reason) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const validTypes: ReportType[] = ['meme', 'user', 'comment'];
    const validReasons: ReportReason[] = ['spam', 'inappropriate', 'copyright', 'harassment', 'fake', 'other'];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '유효하지 않은 신고 유형입니다.' },
        { status: 400 }
      );
    }

    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: '유효하지 않은 신고 사유입니다.' },
        { status: 400 }
      );
    }

    // 신고자 정보 조회
    const reporter = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!reporter) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 중복 신고 확인
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: reporter.id,
        type,
        targetId,
        status: { in: ['pending', 'reviewing'] }
      }
    });

    if (existingReport) {
      return NextResponse.json(
        { error: '이미 신고하신 콘텐츠입니다.' },
        { status: 409 }
      );
    }

    // 대상 콘텐츠 존재 확인
    let targetExists = false;
    let targetData: any = null;

    switch (type) {
      case 'meme':
        targetData = await prisma.meme.findUnique({
          where: { id: targetId },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        });
        targetExists = !!targetData;
        break;
      
      case 'user':
        targetData = await prisma.user.findUnique({
          where: { id: targetId },
          select: { id: true, name: true, email: true }
        });
        targetExists = !!targetData;
        break;
      
      case 'comment':
        targetData = await prisma.comment.findUnique({
          where: { id: targetId },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            meme: {
              select: { id: true, title: true }
            }
          }
        });
        targetExists = !!targetData;
        break;
    }

    if (!targetExists) {
      return NextResponse.json(
        { error: '신고 대상을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 자기 자신의 콘텐츠 신고 방지
    if (type === 'meme' && targetData.userId === reporter.id) {
      return NextResponse.json(
        { error: '자신의 콘텐츠는 신고할 수 없습니다.' },
        { status: 400 }
      );
    }

    if (type === 'user' && targetId === reporter.id) {
      return NextResponse.json(
        { error: '자기 자신을 신고할 수 없습니다.' },
        { status: 400 }
      );
    }

    if (type === 'comment' && targetData.userId === reporter.id) {
      return NextResponse.json(
        { error: '자신의 댓글은 신고할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 우선순위 결정
    let priority = 'medium';
    if (reason === 'harassment' || reason === 'inappropriate') {
      priority = 'high';
    } else if (reason === 'copyright') {
      priority = 'critical';
    } else if (reason === 'spam') {
      priority = 'low';
    }

    // 신고 생성
    const report = await prisma.report.create({
      data: {
        type,
        targetId,
        reason,
        description: description?.trim() || null,
        priority,
        reporterId: reporter.id
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // 관리자 알림 (높은 우선순위인 경우)
    if (priority === 'high' || priority === 'critical') {
      console.log(`[HIGH PRIORITY REPORT] ${type} reported for ${reason} by ${reporter.email}`);
      // TODO: 실제 환경에서는 관리자에게 실시간 알림 발송
    }

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        type: report.type,
        reason: report.reason,
        priority: report.priority,
        status: report.status,
        createdAt: report.createdAt
      },
      message: '신고가 접수되었습니다. 검토 후 적절한 조치를 취하겠습니다.'
    }, { status: 201 });

  } catch (error) {
    console.error('Report creation API error:', error);
    return NextResponse.json(
      { error: '신고 접수 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 사용자의 신고 내역 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // pending, reviewing, resolved, dismissed
    
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 필터 조건
    const where: any = {
      reporterId: user.id
    };

    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.report.count({ where })
    ]);

    // 대상 콘텐츠 정보 추가
    const reportsWithTargetInfo = await Promise.all(
      reports.map(async (report) => {
        let targetInfo: any = null;

        try {
          switch (report.type) {
            case 'meme':
              const meme = await prisma.meme.findUnique({
                where: { id: report.targetId },
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                  isPublic: true
                }
              });
              targetInfo = meme ? {
                title: meme.title || '제목 없음',
                imageUrl: meme.imageUrl,
                isPublic: meme.isPublic
              } : null;
              break;
            
            case 'user':
              const user = await prisma.user.findUnique({
                where: { id: report.targetId },
                select: {
                  id: true,
                  name: true,
                  isActive: true
                }
              });
              targetInfo = user ? {
                name: user.name,
                isActive: user.isActive
              } : null;
              break;
            
            case 'comment':
              const comment = await prisma.comment.findUnique({
                where: { id: report.targetId },
                select: {
                  id: true,
                  content: true,
                  meme: {
                    select: {
                      id: true,
                      title: true
                    }
                  }
                }
              });
              targetInfo = comment ? {
                content: comment.content.slice(0, 100) + (comment.content.length > 100 ? '...' : ''),
                memeTitle: comment.meme.title
              } : null;
              break;
          }
        } catch (error) {
          console.error(`Error fetching target info for report ${report.id}:`, error);
          targetInfo = null;
        }

        return {
          ...report,
          targetInfo: targetInfo || { deleted: true }
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: reportsWithTargetInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user reports API error:', error);
    return NextResponse.json(
      { error: '신고 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}