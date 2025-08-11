import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { TemplateService } from '../services/templateService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const templateService = new TemplateService();

// 템플릿 생성 유효성 검사
const createTemplateValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('템플릿 이름은 1자 이상 100자 이하여야 합니다.'),
  body('imageUrl')
    .isURL()
    .withMessage('올바른 이미지 URL을 입력해주세요.'),
  body('category')
    .isLength({ min: 1, max: 50 })
    .withMessage('카테고리는 1자 이상 50자 이하여야 합니다.'),
  body('textBoxes')
    .isArray()
    .withMessage('텍스트박스는 배열 형태여야 합니다.'),
];

// 템플릿 목록 조회 (GET /api/templates)
router.get('/', async (req: any, res: any) => {
  try {
    const {
      category,
      limit = '20',
      sortBy = 'popular',
    } = req.query;

    const result = await templateService.getTemplates({
      category: category as string,
      limit: parseInt(limit as string),
      sortBy: sortBy as 'popular' | 'recent' | 'usage',
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get templates route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 템플릿 카테고리 목록 조회 (GET /api/templates/categories)
router.get('/categories', async (req: any, res: any) => {
  try {
    const result = await templateService.getCategories();

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get categories route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 템플릿 상세 조회 (GET /api/templates/:id)
router.get('/:id', [
  param('id').isString().withMessage('유효하지 않은 템플릿 ID입니다.'),
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
    const result = await templateService.getTemplateById(id);

    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Get template by ID route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 템플릿 사용 (POST /api/templates/:id/use)
router.post('/:id/use', [
  param('id').isString().withMessage('유효하지 않은 템플릿 ID입니다.'),
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
    const result = await templateService.incrementUsage(id);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Use template route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 관리자 전용 라우트들

// 템플릿 생성 (POST /api/templates) - 관리자 전용
router.post('/', authenticateToken as any, createTemplateValidation, async (req: AuthenticatedRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 정보를 확인해주세요.',
        errors: errors.array(),
      });
    }

    // TODO: 관리자 권한 확인 로직 추가
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: '관리자 권한이 필요합니다.',
    //   });
    // }

    const { name, imageUrl, category, textBoxes } = req.body;

    const result = await templateService.createTemplate({
      name,
      imageUrl,
      category,
      textBoxes,
    });

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Create template route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 템플릿 수정 (PUT /api/templates/:id) - 관리자 전용
router.put('/:id', authenticateToken as any, [
  param('id').isString().withMessage('유효하지 않은 템플릿 ID입니다.'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('템플릿 이름은 1자 이상 100자 이하여야 합니다.'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('올바른 이미지 URL을 입력해주세요.'),
  body('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('카테고리는 1자 이상 50자 이하여야 합니다.'),
  body('textBoxes')
    .optional()
    .isArray()
    .withMessage('텍스트박스는 배열 형태여야 합니다.'),
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

    // TODO: 관리자 권한 확인 로직 추가
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: '관리자 권한이 필요합니다.',
    //   });
    // }

    const { id } = req.params;
    const { name, imageUrl, category, textBoxes, isActive } = req.body;

    const result = await templateService.updateTemplate(id, {
      name,
      imageUrl,
      category,
      textBoxes,
      isActive,
    });

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Update template route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 템플릿 삭제 (DELETE /api/templates/:id) - 관리자 전용
router.delete('/:id', authenticateToken as any, [
  param('id').isString().withMessage('유효하지 않은 템플릿 ID입니다.'),
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

    // TODO: 관리자 권한 확인 로직 추가
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: '관리자 권한이 필요합니다.',
    //   });
    // }

    const { id } = req.params;
    const result = await templateService.deleteTemplate(id);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Delete template route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

export default router;