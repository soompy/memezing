import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { CommentService } from '../services/commentService';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const commentService = new CommentService();

// 댓글 생성 유효성 검사
const createCommentValidation = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('댓글은 1자 이상 1000자 이하여야 합니다.'),
  body('memeId')
    .isString()
    .withMessage('유효하지 않은 밈 ID입니다.'),
  body('parentId')
    .optional()
    .isString()
    .withMessage('유효하지 않은 부모 댓글 ID입니다.'),
];

// 댓글 생성 (POST /api/comments)
router.post('/', authenticateToken as any, createCommentValidation, async (req: AuthenticatedRequest, res: any) => {
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

    const { content, memeId, parentId } = req.body;

    const result = await commentService.createComment({
      content,
      memeId,
      parentId,
      userId: req.user.userId,
    });

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Create comment route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 댓글 목록 조회 (GET /api/comments)
router.get('/', optionalAuth as any, [
  query('memeId')
    .isString()
    .withMessage('유효하지 않은 밈 ID입니다.'),
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
      memeId,
      page = '1',
      limit = '20',
    } = req.query;

    const result = await commentService.getComments(memeId as string, {
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
    console.error('Get comments route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 대댓글 조회 (GET /api/comments/:parentId/replies)
router.get('/:parentId/replies', optionalAuth as any, [
  param('parentId')
    .isString()
    .withMessage('유효하지 않은 댓글 ID입니다.'),
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

    const { parentId } = req.params;
    const {
      page = '1',
      limit = '10',
    } = req.query;

    const result = await commentService.getReplies(parentId, {
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
    console.error('Get replies route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 댓글 수정 (PUT /api/comments/:id)
router.put('/:id', authenticateToken as any, [
  param('id')
    .isString()
    .withMessage('유효하지 않은 댓글 ID입니다.'),
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('댓글은 1자 이상 1000자 이하여야 합니다.'),
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
    const { content } = req.body;

    const result = await commentService.updateComment(id, req.user.userId, content);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Update comment route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 댓글 삭제 (DELETE /api/comments/:id)
router.delete('/:id', authenticateToken as any, [
  param('id')
    .isString()
    .withMessage('유효하지 않은 댓글 ID입니다.'),
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
    const result = await commentService.deleteComment(id, req.user.userId);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Delete comment route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 댓글 좋아요/좋아요 취소 (POST /api/comments/:id/like)
router.post('/:id/like', authenticateToken as any, [
  param('id')
    .isString()
    .withMessage('유효하지 않은 댓글 ID입니다.'),
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
    const result = await commentService.toggleCommentLike(id, req.user.userId);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Toggle comment like route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

export default router;