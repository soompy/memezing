import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    // 커스텀 JWT 토큰 생성 (필요시)
    const payload = {
      userId: session.user?.id || session.user?.email,
      email: session.user?.email,
      name: session.user?.name,
      image: session.user?.image,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24시간
    };

    // JWT 시크릿 확인
    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('NEXTAUTH_SECRET is not defined');
      return NextResponse.json({
        success: false,
        error: '서버 설정 오류입니다.'
      }, { status: 500 });
    }

    // 새로운 토큰 생성
    const newToken = jwt.sign(payload, jwtSecret, {
      algorithm: 'HS256'
    });

    // 리프레시 토큰 생성 (더 긴 유효기간)
    const refreshPayload = {
      userId: session.user?.id || session.user?.email,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7일
    };

    const refreshToken = jwt.sign(refreshPayload, jwtSecret, {
      algorithm: 'HS256'
    });

    return NextResponse.json({
      success: true,
      data: {
        accessToken: newToken,
        refreshToken: refreshToken,
        expiresIn: 86400, // 24시간 (초)
        tokenType: 'Bearer',
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          image: session.user?.image,
        }
      },
      message: '토큰이 성공적으로 갱신되었습니다.'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // JWT 관련 에러 처리
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰입니다.'
      }, { status: 401 });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({
        success: false,
        error: '토큰이 만료되었습니다. 다시 로그인해주세요.'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: '토큰 갱신 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 토큰 검증 함수 (내부 사용)
export async function verifyToken(token: string) {
  try {
    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    return {
      valid: true,
      payload: decoded
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Token verification failed'
    };
  }
}

// GET 메서드는 지원하지 않음
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST 메서드만 지원됩니다.'
  }, { status: 405 });
}