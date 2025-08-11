import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// AI 텍스트 생성 (POST /api/ai/generate-text)
router.post('/generate-text', authenticateToken as any, [
  body('prompt')
    .isLength({ min: 1 })
    .withMessage('프롬프트를 입력해주세요.'),
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

    const { prompt, context } = req.body;

    // OpenAI API나 다른 AI 서비스를 사용하여 텍스트 생성
    // 현재는 더미 응답 반환
    const suggestions = generateMemeTextSuggestions(prompt, context);

    res.json({
      success: true,
      data: {
        suggestions,
        prompt,
        context,
      },
      message: 'AI 텍스트 생성이 완료되었습니다.',
    });
  } catch (error) {
    console.error('AI text generation route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// AI 이미지 생성 (POST /api/ai/generate-image) - 추후 구현
router.post('/generate-image', authenticateToken as any, [
  body('prompt')
    .isLength({ min: 1 })
    .withMessage('프롬프트를 입력해주세요.'),
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

    // AI 이미지 생성 기능은 추후 구현
    res.status(501).json({
      success: false,
      message: 'AI 이미지 생성 기능은 현재 개발 중입니다.',
    });
  } catch (error) {
    console.error('AI image generation route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 더미 텍스트 생성 함수 (실제로는 OpenAI API 등 사용)
function generateMemeTextSuggestions(prompt: string, context?: any): string[] {
  const templates = [
    `${prompt}할 때 나`,
    `${prompt}인 척하는 나`,
    `${prompt}라고 생각했지만`,
    `${prompt}하는 사람들`,
    `${prompt}의 진실`,
  ];

  // 컨텍스트 기반 추가 제안
  if (context?.templateId) {
    templates.push(
      `${prompt}? 아니다`,
      `${prompt}하면 안 되는 이유`,
      `${prompt}의 현실`,
    );
  }

  // 기존 텍스트 고려
  if (context?.existingTexts?.length > 0) {
    const existing = context.existingTexts[0];
    templates.push(
      `${existing} vs ${prompt}`,
      `${existing}이지만 ${prompt}`,
    );
  }

  return templates.slice(0, 5); // 최대 5개 제안
}

export default router;