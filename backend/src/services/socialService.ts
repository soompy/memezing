import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SocialService {
  // 팔로우/언팔로우
  async toggleFollow(followerId: string, followingId: string) {
    try {
      // 자기 자신을 팔로우하는 것을 방지
      if (followerId === followingId) {
        return {
          success: false,
          message: '자기 자신을 팔로우할 수 없습니다.',
        };
      }

      // 팔로우 대상 사용자 존재 확인
      const targetUser = await prisma.user.findUnique({
        where: { id: followingId },
      });

      if (!targetUser) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        };
      }

      // 기존 팔로우 관계 확인
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      if (existingFollow) {
        // 언팔로우
        await prisma.follow.delete({
          where: { id: existingFollow.id },
        });

        return {
          success: true,
          data: { isFollowing: false },
          message: '언팔로우했습니다.',
        };
      } else {
        // 팔로우
        await prisma.follow.create({
          data: {
            followerId,
            followingId,
          },
        });

        return {
          success: true,
          data: { isFollowing: true },
          message: '팔로우했습니다.',
        };
      }
    } catch (error) {
      console.error('Toggle follow error:', error);
      return {
        success: false,
        message: '팔로우 처리 중 오류가 발생했습니다.',
      };
    }
  }

  // 팔로워 목록 조회
  async getFollowers(userId: string, params: {
    page?: number;
    limit?: number;
    currentUserId?: string;
  }) {
    try {
      const { page = 1, limit = 20, currentUserId } = params;
      const skip = (page - 1) * limit;

      const [followers, total] = await Promise.all([
        prisma.follow.findMany({
          where: { followingId: userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            follower: {
              select: {
                id: true,
                name: true,
                image: true,
                bio: true,
                isVerified: true,
                _count: {
                  select: {
                    followers: true,
                    following: true,
                    memes: true,
                  },
                },
              },
            },
          },
        }),
        prisma.follow.count({
          where: { followingId: userId },
        }),
      ]);

      // 현재 사용자의 팔로우 상태 확인
      let currentUserFollows: string[] = [];
      if (currentUserId) {
        const follows = await prisma.follow.findMany({
          where: {
            followerId: currentUserId,
            followingId: { in: followers.map(f => f.follower.id) },
          },
          select: { followingId: true },
        });
        currentUserFollows = follows.map(f => f.followingId);
      }

      const formattedFollowers = followers.map(follow => ({
        ...follow.follower,
        isFollowedByCurrentUser: currentUserFollows.includes(follow.follower.id),
        username: follow.follower.name || '익명',
      }));

      return {
        success: true,
        data: formattedFollowers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get followers error:', error);
      return {
        success: false,
        message: '팔로워 목록 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 팔로잉 목록 조회
  async getFollowing(userId: string, params: {
    page?: number;
    limit?: number;
    currentUserId?: string;
  }) {
    try {
      const { page = 1, limit = 20, currentUserId } = params;
      const skip = (page - 1) * limit;

      const [following, total] = await Promise.all([
        prisma.follow.findMany({
          where: { followerId: userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            following: {
              select: {
                id: true,
                name: true,
                image: true,
                bio: true,
                isVerified: true,
                _count: {
                  select: {
                    followers: true,
                    following: true,
                    memes: true,
                  },
                },
              },
            },
          },
        }),
        prisma.follow.count({
          where: { followerId: userId },
        }),
      ]);

      // 현재 사용자의 팔로우 상태 확인
      let currentUserFollows: string[] = [];
      if (currentUserId && currentUserId !== userId) {
        const follows = await prisma.follow.findMany({
          where: {
            followerId: currentUserId,
            followingId: { in: following.map(f => f.following.id) },
          },
          select: { followingId: true },
        });
        currentUserFollows = follows.map(f => f.followingId);
      }

      const formattedFollowing = following.map(follow => ({
        ...follow.following,
        isFollowedByCurrentUser: currentUserFollows.includes(follow.following.id),
        username: follow.following.name || '익명',
      }));

      return {
        success: true,
        data: formattedFollowing,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get following error:', error);
      return {
        success: false,
        message: '팔로잉 목록 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 북마크 토글
  async toggleBookmark(userId: string, memeId: string) {
    try {
      // 밈 존재 확인
      const meme = await prisma.meme.findUnique({
        where: { id: memeId },
      });

      if (!meme) {
        return {
          success: false,
          message: '밈을 찾을 수 없습니다.',
        };
      }

      // 기존 북마크 확인
      const existingBookmark = await prisma.bookmark.findUnique({
        where: {
          userId_memeId: {
            userId,
            memeId,
          },
        },
      });

      if (existingBookmark) {
        // 북마크 제거
        await prisma.bookmark.delete({
          where: { id: existingBookmark.id },
        });

        return {
          success: true,
          data: { isBookmarked: false },
          message: '북마크를 제거했습니다.',
        };
      } else {
        // 북마크 추가
        await prisma.bookmark.create({
          data: {
            userId,
            memeId,
          },
        });

        return {
          success: true,
          data: { isBookmarked: true },
          message: '북마크에 추가했습니다.',
        };
      }
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      return {
        success: false,
        message: '북마크 처리 중 오류가 발생했습니다.',
      };
    }
  }

  // 북마크 목록 조회
  async getBookmarks(userId: string, params: {
    page?: number;
    limit?: number;
  }) {
    try {
      const { page = 1, limit = 20 } = params;
      const skip = (page - 1) * limit;

      const [bookmarks, total] = await Promise.all([
        prisma.bookmark.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            meme: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    isVerified: true,
                  },
                },
                template: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                  },
                },
                _count: {
                  select: {
                    likes: true,
                    comments: true,
                  },
                },
              },
            },
          },
        }),
        prisma.bookmark.count({
          where: { userId },
        }),
      ]);

      const formattedBookmarks = bookmarks.map(bookmark => ({
        ...bookmark.meme,
        username: bookmark.meme.user.name || '익명',
        bookmarkedAt: bookmark.createdAt,
      }));

      return {
        success: true,
        data: formattedBookmarks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get bookmarks error:', error);
      return {
        success: false,
        message: '북마크 목록 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 팔로우 상태 확인
  async getFollowStatus(currentUserId: string, targetUserId: string) {
    try {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });

      return {
        success: true,
        data: {
          isFollowing: !!follow,
        },
      };
    } catch (error) {
      console.error('Get follow status error:', error);
      return {
        success: false,
        message: '팔로우 상태 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 북마크 상태 확인
  async getBookmarkStatus(userId: string, memeId: string) {
    try {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_memeId: {
            userId,
            memeId,
          },
        },
      });

      return {
        success: true,
        data: {
          isBookmarked: !!bookmark,
        },
      };
    } catch (error) {
      console.error('Get bookmark status error:', error);
      return {
        success: false,
        message: '북마크 상태 조회 중 오류가 발생했습니다.',
      };
    }
  }
}