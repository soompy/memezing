import express from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 개인화된 피드 (GET /api/feed)
router.get('/', optionalAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const {
      page = '1',
      limit = '20',
      algorithm = 'mixed', // 'chronological', 'popular', 'mixed'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let memes: any[] = [];
    let total = 0;

    if (req.user?.userId) {
      // 로그인된 사용자: 개인화된 피드
      const userId = req.user.userId;

      // 팔로잉 사용자들의 밈
      const followingUsers = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = followingUsers.map(f => f.followingId);

      if (followingIds.length > 0) {
        // 팔로잉 사용자들의 최신 밈
        const followingMemes = await prisma.meme.findMany({
          where: {
            userId: { in: followingIds },
            isPublic: true,
          },
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
          orderBy: { createdAt: 'desc' },
          take: Math.floor(limitNum * 0.6), // 전체의 60%
        });

        memes.push(...followingMemes);
      }

      // 사용자 관심사 기반 밈 추천
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { interests: true },
      });

      if (user?.interests && user.interests.length > 0) {
        const interestBasedMemes = await prisma.meme.findMany({
          where: {
            isPublic: true,
            userId: { notIn: [...followingIds, userId] }, // 팔로잉 제외, 본인 제외
            tags: { hasSome: user.interests },
          },
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
          orderBy: { likesCount: 'desc' },
          take: Math.floor(limitNum * 0.3), // 전체의 30%
        });

        memes.push(...interestBasedMemes);
      }

      // 나머지는 트렌딩 밈으로 채움
      const remainingCount = limitNum - memes.length;
      if (remainingCount > 0) {
        const trendingMemes = await prisma.meme.findMany({
          where: {
            isPublic: true,
            id: { notIn: memes.map(m => m.id) },
          },
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
          orderBy: [
            { likesCount: 'desc' },
            { viewsCount: 'desc' },
            { createdAt: 'desc' },
          ],
          take: remainingCount,
        });

        memes.push(...trendingMemes);
      }

      // 셔플 알고리즘 적용
      if (algorithm === 'mixed') {
        memes = shuffleArray(memes);
      }

      // 페이지네이션 적용
      total = memes.length;
      memes = memes.slice(skip, skip + limitNum);

      // 사용자의 좋아요 상태 확인
      const likes = await prisma.like.findMany({
        where: {
          userId,
          memeId: { in: memes.map(meme => meme.id) },
        },
        select: { memeId: true },
      });
      const userLikes = likes.map(like => like.memeId);

      memes = memes.map(meme => ({
        ...meme,
        username: meme.user.name || '익명',
        isLiked: userLikes.includes(meme.id),
      }));
    } else {
      // 비로그인 사용자: 일반 트렌딩 피드
      [memes, total] = await Promise.all([
        prisma.meme.findMany({
          where: { isPublic: true },
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
          orderBy: algorithm === 'chronological' 
            ? { createdAt: 'desc' }
            : [{ likesCount: 'desc' }, { viewsCount: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: limitNum,
        }),
        prisma.meme.count({ where: { isPublic: true } }),
      ]);

      memes = memes.map(meme => ({
        ...meme,
        username: meme.user.name || '익명',
        isLiked: false,
      }));
    }

    res.json({
      success: true,
      data: {
        memes,
        algorithm,
        isPersonalized: !!req.user?.userId,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Feed route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 트렌딩 피드 (GET /api/feed/trending)
router.get('/trending', optionalAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const {
      page = '1',
      limit = '20',
      period = 'day', // 'hour', 'day', 'week', 'month'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 기간별 날짜 계산
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'hour':
        startDate.setHours(now.getHours() - 1);
        break;
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const [memes, total] = await Promise.all([
      prisma.meme.findMany({
        where: {
          isPublic: true,
          createdAt: { gte: startDate },
        },
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
        orderBy: [
          { likesCount: 'desc' },
          { viewsCount: 'desc' },
          { sharesCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limitNum,
      }),
      prisma.meme.count({
        where: {
          isPublic: true,
          createdAt: { gte: startDate },
        },
      }),
    ]);

    // 현재 사용자의 좋아요 상태 확인
    let userLikes: string[] = [];
    if (req.user?.userId) {
      const likes = await prisma.like.findMany({
        where: {
          userId: req.user.userId,
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

    res.json({
      success: true,
      data: {
        memes: formattedMemes,
        period,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Trending feed route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 배열 셔플 함수
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default router;