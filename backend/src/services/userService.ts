import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  // 사용자 프로필 조회
  async getUserProfile(userId: string, currentUserId?: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          socialLinks: true,
          interests: true,
          isVerified: true,
          isActive: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
              memes: true,
              likes: true,
            },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        };
      }

      // 비활성화된 사용자
      if (!user.isActive) {
        return {
          success: false,
          message: '비활성화된 사용자입니다.',
        };
      }

      // 현재 사용자의 팔로우 상태 확인
      let isFollowing = false;
      if (currentUserId && currentUserId !== userId) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: userId,
            },
          },
        });
        isFollowing = !!follow;
      }

      return {
        success: true,
        data: {
          ...user,
          username: user.name || '익명',
          isFollowing,
          stats: {
            followersCount: user._count.followers,
            followingCount: user._count.following,
            memesCount: user._count.memes,
            likesReceivedCount: user._count.likes,
          },
        },
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        message: '사용자 프로필 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 사용자 프로필 수정
  async updateUserProfile(userId: string, data: {
    name?: string;
    bio?: string;
    image?: string;
    socialLinks?: any;
    interests?: string[];
  }) {
    try {
      // 사용자명 중복 확인 (변경하는 경우)
      if (data.name) {
        const existingUser = await prisma.user.findFirst({
          where: {
            name: data.name,
            id: { not: userId },
          },
        });

        if (existingUser) {
          return {
            success: false,
            message: '이미 사용 중인 사용자명입니다.',
          };
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          bio: data.bio,
          image: data.image,
          socialLinks: data.socialLinks,
          interests: data.interests,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          socialLinks: true,
          interests: true,
          isVerified: true,
          role: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        data: {
          ...updatedUser,
          username: updatedUser.name || '익명',
        },
        message: '프로필이 성공적으로 수정되었습니다.',
      };
    } catch (error) {
      console.error('Update user profile error:', error);
      return {
        success: false,
        message: '프로필 수정 중 오류가 발생했습니다.',
      };
    }
  }

  // 사용자 검색
  async searchUsers(params: {
    query: string;
    page?: number;
    limit?: number;
    currentUserId?: string;
  }) {
    try {
      const { query, page = 1, limit = 20, currentUserId } = params;
      const skip = (page - 1) * limit;

      if (!query.trim()) {
        return {
          success: false,
          message: '검색어를 입력해주세요.',
        };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            AND: [
              { isActive: true },
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { bio: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          orderBy: [
            { isVerified: 'desc' },
            { createdAt: 'desc' },
          ],
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            isVerified: true,
            _count: {
              select: {
                followers: true,
                memes: true,
              },
            },
          },
        }),
        prisma.user.count({
          where: {
            AND: [
              { isActive: true },
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { bio: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
        }),
      ]);

      // 현재 사용자의 팔로우 상태 확인
      let currentUserFollows: string[] = [];
      if (currentUserId) {
        const follows = await prisma.follow.findMany({
          where: {
            followerId: currentUserId,
            followingId: { in: users.map(user => user.id) },
          },
          select: { followingId: true },
        });
        currentUserFollows = follows.map(f => f.followingId);
      }

      const formattedUsers = users.map(user => ({
        ...user,
        username: user.name || '익명',
        isFollowing: currentUserFollows.includes(user.id),
        stats: {
          followersCount: user._count.followers,
          memesCount: user._count.memes,
        },
      }));

      return {
        success: true,
        data: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Search users error:', error);
      return {
        success: false,
        message: '사용자 검색 중 오류가 발생했습니다.',
      };
    }
  }

  // 사용자 활동 통계
  async getUserActivity(userId: string, params: {
    period?: 'week' | 'month' | 'year';
  }) {
    try {
      const { period = 'month' } = params;
      
      // 기간 계산
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const [
        memesCreated,
        likesReceived,
        commentsWritten,
        followersGained,
      ] = await Promise.all([
        // 생성한 밈 수
        prisma.meme.count({
          where: {
            userId,
            createdAt: { gte: startDate },
          },
        }),
        // 받은 좋아요 수
        prisma.like.count({
          where: {
            meme: { userId },
            createdAt: { gte: startDate },
          },
        }),
        // 작성한 댓글 수
        prisma.comment.count({
          where: {
            userId,
            createdAt: { gte: startDate },
          },
        }),
        // 새로운 팔로워 수
        prisma.follow.count({
          where: {
            followingId: userId,
            createdAt: { gte: startDate },
          },
        }),
      ]);

      return {
        success: true,
        data: {
          period,
          stats: {
            memesCreated,
            likesReceived,
            commentsWritten,
            followersGained,
          },
        },
      };
    } catch (error) {
      console.error('Get user activity error:', error);
      return {
        success: false,
        message: '사용자 활동 통계 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 사용자 밈 목록 조회
  async getUserMemes(userId: string, params: {
    page?: number;
    limit?: number;
    sortBy?: 'recent' | 'popular' | 'views';
    isPublic?: boolean;
    currentUserId?: string;
  }) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'recent',
        isPublic = true,
        currentUserId,
      } = params;

      const skip = (page - 1) * limit;

      // 정렬 옵션
      let orderBy: any = {};
      switch (sortBy) {
        case 'popular':
          orderBy = { likesCount: 'desc' };
          break;
        case 'views':
          orderBy = { viewsCount: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }

      // 권한 확인 (비공개 밈은 본인만 조회 가능)
      const where: any = { userId };
      if (currentUserId !== userId) {
        where.isPublic = true;
      } else if (isPublic !== undefined) {
        where.isPublic = isPublic;
      }

      const [memes, total] = await Promise.all([
        prisma.meme.findMany({
          where,
          orderBy,
          skip,
          take: limit,
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
        }),
        prisma.meme.count({ where }),
      ]);

      // 현재 사용자의 좋아요 상태 확인
      let userLikes: string[] = [];
      if (currentUserId) {
        const likes = await prisma.like.findMany({
          where: {
            userId: currentUserId,
            memeId: { in: memes.map(meme => meme.id) },
          },
          select: { memeId: true },
        });
        userLikes = likes.map(like => like.memeId);
      }

      const formattedMemes = memes.map(meme => ({
        ...meme,
        username: meme.user.name || '익명',
        isLiked: userLikes.includes(meme.id),
      }));

      return {
        success: true,
        data: formattedMemes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get user memes error:', error);
      return {
        success: false,
        message: '사용자 밈 목록 조회 중 오류가 발생했습니다.',
      };
    }
  }
}