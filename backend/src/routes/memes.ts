import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { MemeService } from '../services/memeService';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const memeService = new MemeService();
const prisma = new PrismaClient();

// 밈 생성 유효성 검사
const createMemeValidation = [
  body('imageUrl')
    .isURL()
    .withMessage('올바른 이미지 URL을 입력해주세요.'),
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('제목은 100자 이하여야 합니다.'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다.'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('설명은 500자 이하여야 합니다.'),
];

// 밈 목록 조회 (GET /api/memes)
router.get('/', optionalAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const {
      page = '1',
      limit = '20',
      sortBy = 'recent',
      tags,
      userId,
      isPublic = 'true',
    } = req.query;

    const result = await memeService.getMemes({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as 'recent' | 'popular' | 'views',
      tags: tags ? (tags as string).split(',') : [],
      userId: userId as string,
      isPublic: isPublic === 'true',
      currentUserId: req.user?.userId,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get memes route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 밈 생성 (POST /api/memes)
router.post('/', authenticateToken as any, createMemeValidation, async (req: AuthenticatedRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 정보를 확인해주세요.',
        errors: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const { title, imageUrl, templateId, textBoxes, tags, description, isPublic } = req.body;

    const result = await memeService.createMeme({
      title,
      imageUrl,
      templateId,
      textBoxes,
      tags,
      description,
      isPublic,
      userId: req.user.userId,
    });

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Create meme route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 밈 상세 조회 (GET /api/memes/:id)
router.get('/:id', optionalAuth as any, [
  param('id').isString().withMessage('유효하지 않은 밈 ID입니다.'),
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

    const { id } = req.params;
    const result = await memeService.getMemeById(id, req.user?.userId);

    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Get meme by ID route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 밈 수정 (PUT /api/memes/:id)
router.put('/:id', authenticateToken as any, [
  param('id').isString().withMessage('유효하지 않은 밈 ID입니다.'),
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('제목은 100자 이하여야 합니다.'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다.'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('설명은 500자 이하여야 합니다.'),
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const { id } = req.params;
    const { title, tags, description, isPublic } = req.body;

    const result = await memeService.updateMeme(id, req.user.userId, {
      title,
      tags,
      description,
      isPublic,
    });

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Update meme route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 밈 삭제 (DELETE /api/memes/:id)
router.delete('/:id', authenticateToken as any, [
  param('id').isString().withMessage('유효하지 않은 밈 ID입니다.'),
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const { id } = req.params;
    const result = await memeService.deleteMeme(id, req.user.userId);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Delete meme route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 밈 좋아요/좋아요 취소 (POST /api/memes/:id/like)
router.post('/:id/like', authenticateToken as any, [
  param('id').isString().withMessage('유효하지 않은 밈 ID입니다.'),
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const { id } = req.params;
    const result = await memeService.toggleLike(id, req.user.userId);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Toggle like route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 밈 공유 (POST /api/memes/:id/share)
router.post('/:id/share', [
  param('id').isString().withMessage('유효하지 않은 밈 ID입니다.'),
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

    const { id } = req.params;
    const { platform } = req.body;

    // 밈 존재 및 공개 상태 확인
    const meme = await prisma.meme.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        isPublic: true,
        sharesCount: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!meme) {
      return res.status(404).json({
        success: false,
        message: '밈을 찾을 수 없습니다.',
      });
    }

    if (!meme.isPublic) {
      return res.status(403).json({
        success: false,
        message: '비공개 밈은 공유할 수 없습니다.',
      });
    }

    // 공유 카운트 증가
    const updatedMeme = await prisma.meme.update({
      where: { id },
      data: {
        sharesCount: { increment: 1 },
      },
      select: {
        id: true,
        title: true,
        sharesCount: true,
      },
    });

    // 공유 메타데이터 생성
    const shareMetadata = {
      url: `${process.env.FRONTEND_URL}/memes/${id}`,
      title: meme.title || `${meme.user.name}의 밈`,
      description: `밈징에서 ${meme.user.name}님이 만든 재미있는 밈을 확인해보세요!`,
      platform: platform || 'web',
    };

    res.json({
      success: true,
      data: {
        meme: updatedMeme,
        shareMetadata,
      },
      message: '공유 카운트가 증가했습니다.',
    });
  } catch (error) {
    console.error('Share meme route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 밈 다운로드 (GET /api/memes/:id/download)
router.get('/:id/download', [
  param('id').isString().withMessage('유효하지 않은 밈 ID입니다.'),
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

    const { id } = req.params;

    // 밈 존재 확인
    const meme = await prisma.meme.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        isPublic: true,
      },
    });

    if (!meme) {
      return res.status(404).json({
        success: false,
        message: '밈을 찾을 수 없습니다.',
      });
    }

    if (!meme.isPublic) {
      return res.status(403).json({
        success: false,
        message: '비공개 밈은 다운로드할 수 없습니다.',
      });
    }

    // 다운로드 카운트 증가
    await prisma.meme.update({
      where: { id },
      data: {
        downloadsCount: { increment: 1 },
      },
    });

    // 이미지 URL로 리다이렉트 (실제 구현에서는 이미지를 스트리밍하거나 다운로드 링크 제공)
    res.json({
      success: true,
      data: {
        downloadUrl: meme.imageUrl,
        filename: `meme-${id}.jpg`,
      },
      message: '다운로드 준비가 완료되었습니다.',
    });
  } catch (error) {
    console.error('Download meme route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

export default router;