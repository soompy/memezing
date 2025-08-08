import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 활동 피드 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'following', 'all', 'own'
    const actionType = searchParams.get('actionType'); // 특정 액션 타입 필터
    
    const skip = (page - 1) * limit;

    let where: any = {};

    if (type === 'following') {
      // 팔로우하는 사용자들의 활동만
      const followingUsers = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true }
      });
      
      if (followingUsers.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        });
      }

      where.actorId = { in: followingUsers.map(f => f.followingId) };
    } else if (type === 'own') {
      // 자신의 활동만
      where.actorId = user.id;
    } else {
      // 'all' - 모든 활동 (일반적으로 팔로우하는 사용자 + 인기 활동)
      const followingUsers = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true }
      });
      
      const followingIds = followingUsers.map(f => f.followingId);
      followingIds.push(user.id); // 자신의 활동도 포함
      
      where.OR = [
        { actorId: { in: followingIds } },
        // 인기 있는 활동들도 포함 (좋아요가 많거나 최신)
        { 
          actionType: 'create_meme',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 최근 24시간
        }
      ];
    }

    if (actionType) {
      where.actionType = actionType;
    }

    // 사용자 자신의 피드에서 제외할 액션들 필터링
    where.userId = user.id;

    const [activities, total] = await Promise.all([
      prisma.activityFeed.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          actionType: true,
          targetType: true,
          targetId: true,
          data: true,
          createdAt: true,
          actorId: true
        }
      }),
      prisma.activityFeed.count({ where })
    ]);

    // 활동의 주체(actor)와 대상(target) 정보 가져오기
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        let actorInfo = null;
        let targetInfo = null;

        // Actor 정보
        if (activity.actorId) {
          const actor = await prisma.user.findUnique({
            where: { id: activity.actorId },
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true
            }
          });
          actorInfo = actor;
        }

        // Target 정보
        if (activity.targetType && activity.targetId) {
          try {
            switch (activity.targetType) {
              case 'meme':
                const meme = await prisma.meme.findUnique({
                  where: { id: activity.targetId },
                  select: {
                    id: true,
                    title: true,
                    imageUrl: true,
                    likesCount: true,
                    viewsCount: true,
                    isPublic: true,
                    user: {
                      select: {
                        id: true,
                        name: true,
                        image: true
                      }
                    }
                  }
                });
                targetInfo = meme;
                break;

              case 'comment':
                const comment = await prisma.comment.findUnique({
                  where: { id: activity.targetId },
                  select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    meme: {
                      select: {
                        id: true,
                        title: true,
                        imageUrl: true
                      }
                    }
                  }
                });
                targetInfo = comment;
                break;

              case 'user':
                const targetUser = await prisma.user.findUnique({
                  where: { id: activity.targetId },
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
                  where: { id: activity.targetId },
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    isPublic: true,
                    _count: {
                      select: { items: true }
                    }
                  }
                });
                targetInfo = collection;
                break;
            }
          } catch (error) {
            console.error(`Error fetching target info for activity ${activity.id}:`, error);
          }
        }

        return {
          ...activity,
          actor: actorInfo,
          target: targetInfo,
          // 활동 메시지 생성
          message: generateActivityMessage(activity, actorInfo, targetInfo),
          timeAgo: getTimeAgo(activity.createdAt)
        };
      })
    );

    // 타겟이 삭제되었거나 비공개인 활동들 필터링
    const validActivities = enrichedActivities.filter(activity => {
      if (!activity.target) return false;
      
      // 밈이 비공개인 경우 제외
      if (activity.targetType === 'meme' && !activity.target.isPublic) {
        return false;
      }
      
      // 컬렉션이 비공개이고 자신의 것이 아닌 경우 제외
      if (activity.targetType === 'collection' && 
          !activity.target.isPublic && 
          activity.actorId !== user.id) {
        return false;
      }
      
      return true;
    });

    return NextResponse.json({
      success: true,
      data: validActivities,
      pagination: {
        page,
        limit,
        total: validActivities.length,
        totalPages: Math.ceil(validActivities.length / limit)
      }
    });

  } catch (error) {
    console.error('Activity feed API error:', error);
    return NextResponse.json(
      { error: '활동 피드 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 새 활동 생성 (내부 API용)
export async function POST(request: NextRequest) {
  try {
    const {
      actorId,
      actionType,
      targetType,
      targetId,
      data,
      affectedUsers // 이 활동을 피드에서 볼 수 있는 사용자들의 ID 배열
    } = await request.json();

    if (!actorId || !actionType || !targetType || !targetId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    let feedUserIds = affectedUsers || [];

    // 영향받는 사용자들 자동 결정
    if (!affectedUsers || affectedUsers.length === 0) {
      switch (actionType) {
        case 'create_meme':
        case 'create_collection':
          // 팔로워들에게 표시
          const followers = await prisma.follow.findMany({
            where: { followingId: actorId },
            select: { followerId: true }
          });
          feedUserIds = followers.map(f => f.followerId);
          break;

        case 'like_meme':
        case 'comment':
        case 'bookmark':
          // 해당 밈의 작성자에게 표시
          const meme = await prisma.meme.findUnique({
            where: { id: targetId },
            select: { userId: true }
          });
          if (meme && meme.userId !== actorId) {
            feedUserIds = [meme.userId];
          }
          break;

        case 'follow':
          // 팔로우 받는 사용자에게 표시
          feedUserIds = [targetId];
          break;
      }
    }

    // 자신의 활동은 자신의 피드에도 추가
    if (!feedUserIds.includes(actorId)) {
      feedUserIds.push(actorId);
    }

    // 각 영향받는 사용자의 피드에 활동 추가
    const activityPromises = feedUserIds.map(userId => 
      prisma.activityFeed.create({
        data: {
          userId,
          actorId,
          actionType,
          targetType,
          targetId,
          data
        }
      })
    );

    const activities = await Promise.all(activityPromises);

    // 피드 정리 (각 사용자당 최대 1000개 활동만 유지)
    for (const userId of feedUserIds) {
      const activityCount = await prisma.activityFeed.count({
        where: { userId }
      });

      if (activityCount > 1000) {
        // 오래된 활동 삭제
        const oldActivities = await prisma.activityFeed.findMany({
          where: { userId },
          orderBy: { createdAt: 'asc' },
          take: activityCount - 1000,
          select: { id: true }
        });

        if (oldActivities.length > 0) {
          await prisma.activityFeed.deleteMany({
            where: { id: { in: oldActivities.map(a => a.id) } }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        createdCount: activities.length,
        affectedUsers: feedUserIds.length
      },
      message: '활동 피드가 생성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    console.error('Create activity feed error:', error);
    return NextResponse.json(
      { error: '활동 피드 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 활동 메시지 생성 함수
function generateActivityMessage(
  activity: any,
  actor: any,
  target: any
): string {
  if (!actor) return '알 수 없는 활동';
  
  const actorName = actor.name || '사용자';
  
  switch (activity.actionType) {
    case 'create_meme':
      return `${actorName}님이 새 밈을 만들었습니다: "${target?.title || '제목 없음'}"`;
    
    case 'like_meme':
      return `${actorName}님이 밈에 좋아요를 눌렀습니다: "${target?.title || '제목 없음'}"`;
    
    case 'comment':
      const commentPreview = target?.content ? 
        (target.content.length > 30 ? target.content.slice(0, 30) + '...' : target.content) : 
        '댓글';
      return `${actorName}님이 댓글을 남겼습니다: "${commentPreview}"`;
    
    case 'follow':
      return `${actorName}님이 ${target?.name || '사용자'}님을 팔로우했습니다`;
    
    case 'bookmark':
      return `${actorName}님이 밈을 북마크했습니다: "${target?.title || '제목 없음'}"`;
    
    case 'create_collection':
      return `${actorName}님이 새 컬렉션을 만들었습니다: "${target?.name || '제목 없음'}"`;
    
    default:
      return `${actorName}님의 활동`;
  }
}

// 시간 계산 함수
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