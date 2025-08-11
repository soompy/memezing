import express from 'express';
import { query, validationResult } from 'express-validator';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 통합 검색 (GET /api/search)
router.get('/', optionalAuth as any, [
  query('q')
    .isLength({ min: 1 })
    .withMessage('검색어를 입력해주세요.'),
  query('type')
    .optional()
    .isIn(['all', 'memes', 'users', 'templates'])
    .withMessage('검색 타입은 all, memes, users, templates 중 하나여야 합니다.'),
], async (req: AuthenticatedRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 정보를 확인해주세요.',
        errors: errors.array(),
      });
    }

    const {
      q: query,
      type = 'all',
      page = '1',
      limit = '20',
    } = req.query;

    const searchQuery = query as string;
    const searchType = type as string;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const results: any = {
      query: searchQuery,
      type: searchType,
    };

    // 밈 검색
    if (searchType === 'all' || searchType === 'memes') {
      const [memes, memesTotal] = await Promise.all([
        prisma.meme.findMany({
          where: {
            AND: [
              { isPublic: true },
              {
                OR: [
                  { title: { contains: searchQuery, mode: 'insensitive' } },
                  { description: { contains: searchQuery, mode: 'insensitive' } },
                  { tags: { hasSome: [searchQuery] } },
                ],
              },
            ],
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
          skip: searchType === 'memes' ? skip : 0,
          take: searchType === 'memes' ? limitNum : 5,
        }),
        prisma.meme.count({
          where: {
            AND: [
              { isPublic: true },
              {
                OR: [
                  { title: { contains: searchQuery, mode: 'insensitive' } },
                  { description: { contains: searchQuery, mode: 'insensitive' } },
                  { tags: { hasSome: [searchQuery] } },
                ],
              },
            ],
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

      results.memes = {
        data: memes.map(meme => ({
          ...meme,
          username: meme.user.name || '익명',
          isLiked: userLikes.includes(meme.id),
        })),
        total: memesTotal,
        pagination: searchType === 'memes' ? {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(memesTotal / limitNum),
        } : null,
      };
    }

    // 사용자 검색
    if (searchType === 'all' || searchType === 'users') {
      const [users, usersTotal] = await Promise.all([
        prisma.user.findMany({
          where: {
            AND: [
              { isActive: true },
              {
                OR: [
                  { name: { contains: searchQuery, mode: 'insensitive' } },
                  { bio: { contains: searchQuery, mode: 'insensitive' } },
                ],
              },
            ],
          },
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
          orderBy: [
            { isVerified: 'desc' },
            { createdAt: 'desc' },
          ],
          skip: searchType === 'users' ? skip : 0,
          take: searchType === 'users' ? limitNum : 5,
        }),
        prisma.user.count({
          where: {
            AND: [
              { isActive: true },
              {
                OR: [
                  { name: { contains: searchQuery, mode: 'insensitive' } },
                  { bio: { contains: searchQuery, mode: 'insensitive' } },
                ],
              },
            ],
          },
        }),
      ]);

      // 현재 사용자의 팔로우 상태 확인
      let userFollows: string[] = [];
      if (req.user?.userId) {
        const follows = await prisma.follow.findMany({
          where: {
            followerId: req.user.userId,
            followingId: { in: users.map(user => user.id) },
          },
          select: { followingId: true },
        });
        userFollows = follows.map(f => f.followingId);
      }

      results.users = {
        data: users.map(user => ({
          ...user,
          username: user.name || '익명',
          isFollowing: userFollows.includes(user.id),
          stats: {
            followersCount: user._count.followers,
            memesCount: user._count.memes,
          },
        })),
        total: usersTotal,
        pagination: searchType === 'users' ? {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(usersTotal / limitNum),
        } : null,
      };
    }

    // 템플릿 검색
    if (searchType === 'all' || searchType === 'templates') {
      const [templates, templatesTotal] = await Promise.all([
        prisma.template.findMany({
          where: {
            AND: [
              { isActive: true },
              {
                OR: [
                  { name: { contains: searchQuery, mode: 'insensitive' } },
                  { category: { contains: searchQuery, mode: 'insensitive' } },
                ],
              },
            ],
          },
          orderBy: { usageCount: 'desc' },
          skip: searchType === 'templates' ? skip : 0,
          take: searchType === 'templates' ? limitNum : 5,
        }),
        prisma.template.count({
          where: {
            AND: [
              { isActive: true },
              {
                OR: [
                  { name: { contains: searchQuery, mode: 'insensitive' } },
                  { category: { contains: searchQuery, mode: 'insensitive' } },
                ],
              },
            ],
          },
        }),
      ]);

      results.templates = {
        data: templates,
        total: templatesTotal,
        pagination: searchType === 'templates' ? {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(templatesTotal / limitNum),
        } : null,
      };
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 인기 검색어 조회 (GET /api/search/trending)
router.get('/trending', async (req: any, res: any) => {
  try {
    // 실제로는 검색 로그를 분석해서 인기 검색어를 반환
    // 현재는 하드코딩된 데이터 반환
    const trendingKeywords = [
      { keyword: '드라마', count: 156 },
      { keyword: '음식', count: 134 },
      { keyword: '일상', count: 128 },
      { keyword: '직장', count: 95 },
      { keyword: '연예인', count: 87 },
      { keyword: '동물', count: 76 },
      { keyword: '게임', count: 65 },
      { keyword: '운동', count: 54 },
      { keyword: '여행', count: 43 },
      { keyword: '공부', count: 38 },
    ];

    res.json({
      success: true,
      data: {
        keywords: trendingKeywords,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Trending search route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 검색 제안 (GET /api/search/suggestions)
router.get('/suggestions', [
  query('q')
    .isLength({ min: 1 })
    .withMessage('검색어를 입력해주세요.'),
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 정보를 확인해주세요.',
        errors: errors.array(),
      });
    }

    const { q: query } = req.query;
    const searchQuery = query as string;

    // 태그 기반 제안
    const tagSuggestions = await prisma.meme.findMany({
      where: {
        isPublic: true,
        tags: {
          hasSome: [searchQuery],
        },
      },
      select: {
        tags: true,
      },
      distinct: ['tags'],
      take: 5,
    });

    // 사용자명 제안
    const userSuggestions = await prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          { name: { startsWith: searchQuery, mode: 'insensitive' } },
        ],
      },
      select: {
        name: true,
      },
      take: 3,
    });

    const suggestions = [
      ...Array.from(new Set(tagSuggestions.flatMap(meme => meme.tags)))
        .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5),
      ...userSuggestions.map(user => user.name).filter(name => name),
    ];

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 8), // 최대 8개
        query: searchQuery,
      },
    });
  } catch (error) {
    console.error('Search suggestions route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

export default router;