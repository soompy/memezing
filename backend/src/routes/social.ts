import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { SocialService } from '../services/socialService';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const socialService = new SocialService();

// 팔로우/언팔로우 (POST /api/social/follow/:userId)
router.post('/follow/:userId', authenticateToken as any, [
  param('userId').isString().withMessage('유효하지 않은 사용자 ID입니다.'),
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

    const { userId } = req.params;
    const result = await socialService.toggleFollow(req.user.userId, userId);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Toggle follow route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 팔로워 목록 조회 (GET /api/social/:userId/followers)
router.get('/:userId/followers', optionalAuth as any, [
  param('userId').isString().withMessage('유효하지 않은 사용자 ID입니다.'),
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

    const { userId } = req.params;
    const {
      page = '1',
      limit = '20',
    } = req.query;

    const result = await socialService.getFollowers(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      currentUserId: req.user?.userId,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get followers route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 팔로잉 목록 조회 (GET /api/social/:userId/following)
router.get('/:userId/following', optionalAuth as any, [
  param('userId').isString().withMessage('유효하지 않은 사용자 ID입니다.'),
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

    const { userId } = req.params;
    const {
      page = '1',
      limit = '20',
    } = req.query;

    const result = await socialService.getFollowing(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      currentUserId: req.user?.userId,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get following route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 팔로우 상태 확인 (GET /api/social/follow-status/:userId)
router.get('/follow-status/:userId', authenticateToken as any, [
  param('userId').isString().withMessage('유효하지 않은 사용자 ID입니다.'),
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

    const { userId } = req.params;
    const result = await socialService.getFollowStatus(req.user.userId, userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get follow status route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 북마크 토글 (POST /api/social/bookmark/:memeId)
router.post('/bookmark/:memeId', authenticateToken as any, [
  param('memeId').isString().withMessage('유효하지 않은 밈 ID입니다.'),
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

    const { memeId } = req.params;
    const result = await socialService.toggleBookmark(req.user.userId, memeId);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Toggle bookmark route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 북마크 목록 조회 (GET /api/social/bookmarks)
router.get('/bookmarks', authenticateToken as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const {
      page = '1',
      limit = '20',
    } = req.query;

    const result = await socialService.getBookmarks(req.user.userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get bookmarks route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 북마크 상태 확인 (GET /api/social/bookmark-status/:memeId)
router.get('/bookmark-status/:memeId', authenticateToken as any, [
  param('memeId').isString().withMessage('유효하지 않은 밈 ID입니다.'),
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

    const { memeId } = req.params;
    const result = await socialService.getBookmarkStatus(req.user.userId, memeId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get bookmark status route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

export default router;