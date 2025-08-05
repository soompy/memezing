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
    const { email, username, password } = await request.json();

    // 유효성 검사
    if (!email || !username || !password) {
      return NextResponse.json({
        success: false,
        message: '모든 필드를 입력해주세요.',
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

    // 사용자명 검사
    if (username.length < 2 || username.length > 20) {
      return NextResponse.json({
        success: false,
        message: '사용자명은 2-20자 사이여야 합니다.',
      }, { status: 400 });
    }

    // 비밀번호 검사
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: '비밀번호는 최소 6자 이상이어야 합니다.',
      }, { status: 400 });
    }

    // 이메일 중복 확인
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json({
        success: false,
        message: '이미 사용 중인 이메일입니다.',
      }, { status: 400 });
    }

    // 사용자명 중복 확인
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return NextResponse.json({
        success: false,
        message: '이미 사용 중인 사용자명입니다.',
      }, { status: 400 });
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

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
      message: '회원가입이 완료되었습니다.',
    }, { status: 201 });

  } catch (error) {
    console.error('Register route error:', error);
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}