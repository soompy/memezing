import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 사용자 알림 목록 조회
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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type'); // 'like', 'comment', 'follow', etc.
    
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
      userId: user.id
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    if (type) {
      where.type = type;
    }

    // 만료된 알림 제외
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ];

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [
          { isRead: 'asc' }, // 읽지 않은 것 먼저
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      })
    ]);

    // 알림의 관련 데이터 추가 (actor, target 정보 등)
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        let actorInfo = null;
        let targetInfo = null;

        // Actor 정보 조회
        if (notification.actorId) {
          const actor = await prisma.user.findUnique({
            where: { id: notification.actorId },
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true
            }
          });
          actorInfo = actor;
        }

        // Target 정보 조회
        if (notification.targetType && notification.targetId) {
          try {
            switch (notification.targetType) {
              case 'meme':
                const meme = await prisma.meme.findUnique({
                  where: { id: notification.targetId },
                  select: {
                    id: true,
                    title: true,
                    imageUrl: true,
                    isPublic: true
                  }
                });
                targetInfo = meme;
                break;

              case 'comment':
                const comment = await prisma.comment.findUnique({
                  where: { id: notification.targetId },
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
                targetInfo = comment;
                break;

              case 'user':
                const targetUser = await prisma.user.findUnique({
                  where: { id: notification.targetId },
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    isVerified: true
                  }
                });
                targetInfo = targetUser;
                break;

              case 'collection':
                const collection = await prisma.collection.findUnique({
                  where: { id: notification.targetId },
                  select: {
                    id: true,
                    name: true,
                    isPublic: true
                  }
                });
                targetInfo = collection;
                break;
            }
          } catch (error) {
            console.error(`Error fetching target info for notification ${notification.id}:`, error);
          }
        }

        return {
          ...notification,
          actor: actorInfo,
          target: targetInfo,
          // 시간 표시를 위한 상대 시간
          timeAgo: getTimeAgo(notification.createdAt)
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedNotifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        unreadCount,
        totalCount: total
      }
    });

  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: '알림 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 알림 생성 (내부 API용)
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      type,
      title,
      message,
      actorId,
      targetType,
      targetId,
      data,
      expiresAt
    } = await request.json();

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 중복 알림 방지 (같은 액터가 같은 대상에 같은 타입의 알림을 최근 1시간 내에 생성한 경우)
    if (actorId && targetId) {
      const recentSimilar = await prisma.notification.findFirst({
        where: {
          userId,
          type,
          actorId,
          targetId,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // 1시간 전
          }
        }
      });

      if (recentSimilar) {
        // 기존 알림 업데이트
        const updatedNotification = await prisma.notification.update({
          where: { id: recentSimilar.id },
          data: {
            message,
            isRead: false, // 다시 읽지 않음으로 변경
            createdAt: new Date(), // 시간 갱신
            data: data || recentSimilar.data
          }
        });

        return NextResponse.json({
          success: true,
          data: updatedNotification,
          message: '기존 알림이 업데이트되었습니다.'
        });
      }
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actorId,
        targetType,
        targetId,
        data,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: notification,
      message: '알림이 생성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    console.error('Create notification API error:', error);
    return NextResponse.json(
      { error: '알림 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 알림 읽음 처리
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { notificationIds, markAllAsRead } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    let result;

    if (markAllAsRead) {
      // 모든 알림 읽음 처리
      result = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // 특정 알림들 읽음 처리
      result = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          id: { in: notificationIds },
          isRead: false
        },
        data: {
          isRead: true
        }
      });
    } else {
      return NextResponse.json(
        { error: '알림 ID 목록이나 전체 읽음 플래그가 필요합니다.' },
        { status: 400 }
      );
    }

    // 업데이트된 읽지 않은 알림 수
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.count,
        unreadCount
      },
      message: `${result.count}개의 알림이 읽음 처리되었습니다.`
    });

  } catch (error) {
    console.error('Update notifications API error:', error);
    return NextResponse.json(
      { error: '알림 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 시간 계산 헬퍼 함수
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR');
  }
}