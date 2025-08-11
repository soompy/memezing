import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { UserService } from '../services/userService';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const userService = new UserService();

// 프로필 수정 유효성 검사
const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('사용자명은 2자 이상 50자 이하여야 합니다.')
    .matches(/^[a-zA-Z0-9가-힣_]+$/)
    .withMessage('사용자명은 한글, 영문, 숫자, 밑줄만 사용 가능합니다.'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('소개글은 500자 이하여야 합니다.'),
  body('image')
    .optional()
    .isURL()
    .withMessage('올바른 이미지 URL을 입력해주세요.'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('관심사는 배열 형태여야 합니다.'),
];

// 사용자 프로필 조회 (GET /api/users/:id)
router.get('/:id', optionalAuth as any, [
  param('id').isString().withMessage('유효하지 않은 사용자 ID입니다.'),
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
    const result = await userService.getUserProfile(id, req.user?.userId);

    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Get user profile route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 프로필 수정 (PUT /api/users/profile)
router.put('/profile', authenticateToken as any, updateProfileValidation, async (req: AuthenticatedRequest, res: any) => {
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

    const { name, bio, image, socialLinks, interests } = req.body;

    const result = await userService.updateUserProfile(req.user.userId, {
      name,
      bio,
      image,
      socialLinks,
      interests,
    });

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Update profile route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 사용자 검색 (GET /api/users/search)
router.get('/search', optionalAuth as any, [
  query('q')
    .isLength({ min: 1 })
    .withMessage('검색어를 입력해주세요.'),
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
      page = '1',
      limit = '20',
    } = req.query;

    const result = await userService.searchUsers({
      query: query as string,
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
    console.error('Search users route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 사용자 활동 통계 (GET /api/users/:id/activity)
router.get('/:id/activity', optionalAuth as any, [
  param('id').isString().withMessage('유효하지 않은 사용자 ID입니다.'),
  query('period')
    .optional()
    .isIn(['week', 'month', 'year'])
    .withMessage('기간은 week, month, year 중 하나여야 합니다.'),
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
    const { period = 'month' } = req.query;

    const result = await userService.getUserActivity(id, {
      period: period as 'week' | 'month' | 'year',
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get user activity route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 사용자 밈 목록 (GET /api/users/:id/memes)
router.get('/:id/memes', optionalAuth as any, [
  param('id').isString().withMessage('유효하지 않은 사용자 ID입니다.'),
  query('sortBy')
    .optional()
    .isIn(['recent', 'popular', 'views'])
    .withMessage('정렬 방식은 recent, popular, views 중 하나여야 합니다.'),
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
    const {
      page = '1',
      limit = '20',
      sortBy = 'recent',
      isPublic,
    } = req.query;

    const result = await userService.getUserMemes(id, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as 'recent' | 'popular' | 'views',
      isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      currentUserId: req.user?.userId,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get user memes route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

export default router;