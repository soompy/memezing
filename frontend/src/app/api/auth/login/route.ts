import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.',
      }, { status: 400 });
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: '올바른 이메일 형식을 입력해주세요.',
      }, { status: 400 });
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      }, { status: 401 });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      }, { status: 401 });
    }

    // JWT 토큰 생성
    const token = generateToken(user.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt.toISOString(),
        },
        token,
      },
      message: '로그인이 완료되었습니다.',
    });

  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}