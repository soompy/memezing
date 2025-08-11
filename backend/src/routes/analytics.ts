import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 밈 조회 추적 (POST /api/analytics/view)
router.post('/view', [
  body('memeId')
    .isString()
    .withMessage('유효하지 않은 밈 ID입니다.'),
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

    const { memeId } = req.body;
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress;

    // 밈 존재 확인
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: { id: true, isPublic: true },
    });

    if (!meme || !meme.isPublic) {
      return res.status(404).json({
        success: false,
        message: '밈을 찾을 수 없습니다.',
      });
    }

    // 조회수 증가 (이미 getMemeById에서 처리되지만 별도 추적용)
    await prisma.meme.update({
      where: { id: memeId },
      data: { viewsCount: { increment: 1 } },
    });

    // 분석 로그 저장 (UserInteraction 활용)
    // 현재 사용자가 있다면 userId 포함
    const userId = req.user?.userId;
    
    if (userId) {
      await prisma.userInteraction.create({
        data: {
          userId,
          action: 'view',
          targetType: 'meme',
          targetId: memeId,
          metadata: {
            userAgent,
            timestamp: new Date(),
          },
          ipAddress: ip ? Buffer.from(ip).toString('base64') : null, // IP 해시화
          userAgent,
        },
      });
    }

    res.json({
      success: true,
      message: '조회가 기록되었습니다.',
    });
  } catch (error) {
    console.error('Analytics view route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 밈 다운로드 추적 (POST /api/analytics/download)
router.post('/download', [
  body('memeId')
    .isString()
    .withMessage('유효하지 않은 밈 ID입니다.'),
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

    const { memeId } = req.body;
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress;

    // 밈 존재 확인
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: { id: true, isPublic: true },
    });

    if (!meme || !meme.isPublic) {
      return res.status(404).json({
        success: false,
        message: '밈을 찾을 수 없습니다.',
      });
    }

    // 다운로드 카운트 증가
    await prisma.meme.update({
      where: { id: memeId },
      data: { downloadsCount: { increment: 1 } },
    });

    // 분석 로그 저장
    const userId = req.user?.userId;
    
    if (userId) {
      await prisma.userInteraction.create({
        data: {
          userId,
          action: 'download',
          targetType: 'meme',
          targetId: memeId,
          metadata: {
            userAgent,
            timestamp: new Date(),
          },
          ipAddress: ip ? Buffer.from(ip).toString('base64') : null,
          userAgent,
        },
      });
    }

    res.json({
      success: true,
      message: '다운로드가 기록되었습니다.',
    });
  } catch (error) {
    console.error('Analytics download route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 사용자 통계 조회 (GET /api/analytics/user/stats)
router.get('/user/stats', authenticateToken as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        _count: {
          select: {
            memes: true,
            likes: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // 사용자 밈들의 총 조회수, 좋아요 수, 다운로드 수
    const memeStats = await prisma.meme.aggregate({
      where: { userId },
      _sum: {
        viewsCount: true,
        likesCount: true,
        downloadsCount: true,
        sharesCount: true,
      },
    });

    res.json({
      success: true,
      data: {
        totalMemes: user._count.memes,
        totalLikes: memeStats._sum.likesCount || 0,
        totalViews: memeStats._sum.viewsCount || 0,
        totalDownloads: memeStats._sum.downloadsCount || 0,
        totalShares: memeStats._sum.sharesCount || 0,
        followers: user._count.followers,
        following: user._count.following,
        joinDate: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get user stats route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 전체 플랫폼 통계 (GET /api/analytics/platform/stats) - 공개 API
router.get('/platform/stats', async (req: any, res: any) => {
  try {
    const [
      totalUsers,
      totalMemes,
      totalLikes,
      totalViews,
      activeUsers, // 최근 30일 활성 사용자
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.meme.count({ where: { isPublic: true } }),
      prisma.like.count(),
      prisma.meme.aggregate({
        _sum: { viewsCount: true },
        where: { isPublic: true },
      }),
      prisma.user.count({
        where: {
          isActive: true,
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalMemes,
        totalLikes,
        totalViews: totalViews._sum.viewsCount || 0,
        activeUsers,
        platform: 'Memezing',
      },
    });
  } catch (error) {
    console.error('Get platform stats route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

export default router;