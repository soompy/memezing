import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'reply' 
  | 'follow' 
  | 'mention' 
  | 'bookmark' 
  | 'collection_add'
  | 'meme_featured'
  | 'template_approved';

// 알림 생성 헬퍼 함수
export async function createNotification({
  userId,
  type,
  title,
  message,
  actorId,
  targetType,
  targetId,
  data,
  expiresAt
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  data?: any;
  expiresAt?: Date;
}) {
  try {
    // 자기 자신에게는 알림 생성하지 않음
    if (actorId === userId) {
      return null;
    }

    // 사용자가 활성 상태인지 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true }
    });

    if (!user || !user.isActive) {
      return null;
    }

    // 중복 알림 방지 로직
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
        return await prisma.notification.update({
          where: { id: recentSimilar.id },
          data: {
            message,
            isRead: false,
            createdAt: new Date(),
            data: data || recentSimilar.data
          }
        });
      }
    }

    // 새 알림 생성
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
        expiresAt
      }
    });

    return notification;

  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

// 좋아요 알림 생성
export async function createLikeNotification({
  memeOwnerId,
  likerUserId,
  memeId,
  memeTitle
}: {
  memeOwnerId: string;
  likerUserId: string;
  memeId: string;
  memeTitle?: string;
}) {
  const liker = await prisma.user.findUnique({
    where: { id: likerUserId },
    select: { name: true }
  });

  if (!liker) return null;

  return await createNotification({
    userId: memeOwnerId,
    type: 'like',
    title: '좋아요 알림',
    message: `${liker.name}님이 "${memeTitle || '밈'}"에 좋아요를 했습니다.`,
    actorId: likerUserId,
    targetType: 'meme',
    targetId: memeId,
    data: {
      memeTitle,
      memeId
    }
  });
}

// 댓글 알림 생성
export async function createCommentNotification({
  memeOwnerId,
  commenterId,
  memeId,
  commentId,
  memeTitle,
  commentContent
}: {
  memeOwnerId: string;
  commenterId: string;
  memeId: string;
  commentId: string;
  memeTitle?: string;
  commentContent: string;
}) {
  const commenter = await prisma.user.findUnique({
    where: { id: commenterId },
    select: { name: true }
  });

  if (!commenter) return null;

  const previewContent = commentContent.length > 50 
    ? commentContent.slice(0, 50) + '...' 
    : commentContent;

  return await createNotification({
    userId: memeOwnerId,
    type: 'comment',
    title: '새 댓글',
    message: `${commenter.name}님이 "${memeTitle || '밈'}"에 댓글을 남겼습니다: "${previewContent}"`,
    actorId: commenterId,
    targetType: 'meme',
    targetId: memeId,
    data: {
      memeTitle,
      memeId,
      commentId,
      commentContent: previewContent
    }
  });
}

// 대댓글 알림 생성
export async function createReplyNotification({
  originalCommenterId,
  replierUserId,
  memeId,
  commentId,
  replyId,
  replyContent
}: {
  originalCommenterId: string;
  replierUserId: string;
  memeId: string;
  commentId: string;
  replyId: string;
  replyContent: string;
}) {
  const replier = await prisma.user.findUnique({
    where: { id: replierUserId },
    select: { name: true }
  });

  if (!replier) return null;

  const previewContent = replyContent.length > 50 
    ? replyContent.slice(0, 50) + '...' 
    : replyContent;

  return await createNotification({
    userId: originalCommenterId,
    type: 'reply',
    title: '댓글 답글',
    message: `${replier.name}님이 회원님의 댓글에 답글을 남겼습니다: "${previewContent}"`,
    actorId: replierUserId,
    targetType: 'comment',
    targetId: commentId,
    data: {
      memeId,
      commentId,
      replyId,
      replyContent: previewContent
    }
  });
}

// 팔로우 알림 생성
export async function createFollowNotification({
  followedUserId,
  followerUserId
}: {
  followedUserId: string;
  followerUserId: string;
}) {
  const follower = await prisma.user.findUnique({
    where: { id: followerUserId },
    select: { name: true }
  });

  if (!follower) return null;

  return await createNotification({
    userId: followedUserId,
    type: 'follow',
    title: '새 팔로워',
    message: `${follower.name}님이 회원님을 팔로우했습니다.`,
    actorId: followerUserId,
    targetType: 'user',
    targetId: followerUserId,
    data: {
      followerName: follower.name
    }
  });
}

// 북마크 알림 생성 (선택사항 - 너무 많을 수 있음)
export async function createBookmarkNotification({
  memeOwnerId,
  bookmarkerUserId,
  memeId,
  memeTitle
}: {
  memeOwnerId: string;
  bookmarkerUserId: string;
  memeId: string;
  memeTitle?: string;
}) {
  const bookmarker = await prisma.user.findUnique({
    where: { id: bookmarkerUserId },
    select: { name: true }
  });

  if (!bookmarker) return null;

  return await createNotification({
    userId: memeOwnerId,
    type: 'bookmark',
    title: '북마크 알림',
    message: `${bookmarker.name}님이 "${memeTitle || '밈'}"을 북마크했습니다.`,
    actorId: bookmarkerUserId,
    targetType: 'meme',
    targetId: memeId,
    data: {
      memeTitle,
      memeId
    }
  });
}

// 컬렉션 추가 알림 생성
export async function createCollectionAddNotification({
  memeOwnerId,
  collectorUserId,
  memeId,
  collectionId,
  memeTitle,
  collectionName
}: {
  memeOwnerId: string;
  collectorUserId: string;
  memeId: string;
  collectionId: string;
  memeTitle?: string;
  collectionName: string;
}) {
  const collector = await prisma.user.findUnique({
    where: { id: collectorUserId },
    select: { name: true }
  });

  if (!collector) return null;

  return await createNotification({
    userId: memeOwnerId,
    type: 'collection_add',
    title: '컬렉션 추가',
    message: `${collector.name}님이 "${memeTitle || '밈'}"을 "${collectionName}" 컬렉션에 추가했습니다.`,
    actorId: collectorUserId,
    targetType: 'meme',
    targetId: memeId,
    data: {
      memeTitle,
      memeId,
      collectionId,
      collectionName
    }
  });
}

// 멘션 알림 생성
export async function createMentionNotification({
  mentionedUserId,
  mentionerUserId,
  contentType,
  contentId,
  content
}: {
  mentionedUserId: string;
  mentionerUserId: string;
  contentType: 'comment' | 'meme';
  contentId: string;
  content: string;
}) {
  const mentioner = await prisma.user.findUnique({
    where: { id: mentionerUserId },
    select: { name: true }
  });

  if (!mentioner) return null;

  const previewContent = content.length > 50 
    ? content.slice(0, 50) + '...' 
    : content;

  return await createNotification({
    userId: mentionedUserId,
    type: 'mention',
    title: '멘션 알림',
    message: `${mentioner.name}님이 회원님을 언급했습니다: "${previewContent}"`,
    actorId: mentionerUserId,
    targetType: contentType,
    targetId: contentId,
    data: {
      content: previewContent,
      contentType
    }
  });
}

// 만료된 알림 정리 (cron job용)
export async function cleanupExpiredNotifications() {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`[NOTIFICATION CLEANUP] Deleted ${result.count} expired notifications`);
    return result.count;

  } catch (error) {
    console.error('Cleanup expired notifications error:', error);
    return 0;
  } finally {
    await prisma.$disconnect();
  }
}

// 오래된 읽은 알림 정리 (30일 이상)
export async function cleanupOldReadNotifications() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`[NOTIFICATION CLEANUP] Deleted ${result.count} old read notifications`);
    return result.count;

  } catch (error) {
    console.error('Cleanup old notifications error:', error);
    return 0;
  } finally {
    await prisma.$disconnect();
  }
}