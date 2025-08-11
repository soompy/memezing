import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';

const router = express.Router();
const authService = new AuthService();

// JWT 토큰 생성 함수
const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

// 회원가입 유효성 검사 규칙
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('올바른 이메일 형식을 입력해주세요.')
    .normalizeEmail(),
  body('username')
    .isLength({ min: 2, max: 20 })
    .withMessage('사용자명은 2-20자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9가-힣_]+$/)
    .withMessage('사용자명은 한글, 영문, 숫자, 밑줄만 사용 가능합니다.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('비밀번호는 영문과 숫자를 포함해야 합니다.'),
];

// 로그인 유효성 검사 규칙
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('올바른 이메일 형식을 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.'),
];

// 회원가입
router.post('/register', registerValidation, async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 정보를 확인해주세요.',
        errors: errors.array(),
      });
    }

    const { email, username, password } = req.body;
    const result = await authService.register({ email, username, password });

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Register route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 로그인
router.post('/login', loginValidation, async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 정보를 확인해주세요.',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    const statusCode = result.success ? 200 : 401;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 현재 사용자 정보 조회
router.get('/me', authenticateToken as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: { user },
      message: '사용자 정보를 성공적으로 조회했습니다.',
    });
  } catch (error) {
    console.error('Get user route error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: '로그아웃이 완료되었습니다.',
  });
});

// Google OAuth 로그인 시작
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Google OAuth 콜백
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google' }),
  (req: any, res: any) => {
    try {
      const user = req.user as any;
      const token = generateToken(user.id);
      
      // 성공 시 프론트엔드로 리다이렉트 (토큰과 함께)
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&provider=google`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/login?error=google');
    }
  }
);

// Kakao OAuth 로그인 시작
router.get('/kakao', passport.authenticate('kakao'));

// Kakao OAuth 콜백
router.get('/kakao/callback',
  passport.authenticate('kakao', { session: false, failureRedirect: '/login?error=kakao' }),
  (req: any, res: any) => {
    try {
      const user = req.user as any;
      const token = generateToken(user.id);
      
      // 성공 시 프론트엔드로 리다이렉트 (토큰과 함께)
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&provider=kakao`);
    } catch (error) {
      console.error('Kakao OAuth callback error:', error);
      res.redirect('/login?error=kakao');
    }
  }
);

export default router;