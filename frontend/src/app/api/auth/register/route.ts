import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
    const { email, name, password } = await request.json();

    // 유효성 검사
    if (!email || !name || !password) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_FIELDS',
        message: '모든 필드를 입력해주세요.',
      }, { status: 400 });
    }

    // 데이터베이스가 설정되지 않은 경우 테스트용 처리
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'your-database-connection-string') {
      return NextResponse.json({
        success: true,
        message: '회원가입이 완료되었습니다. (데이터베이스 미연결 - 테스트 모드)',
      }, { status: 201 });
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_EMAIL',
        message: '올바른 이메일 형식을 입력해주세요.',
      }, { status: 400 });
    }

    // 사용자명 검사
    if (name.length < 2 || name.length > 20) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_NAME',
        message: '사용자명은 2-20자 사이여야 합니다.',
      }, { status: 400 });
    }

    // 비밀번호 검사
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_PASSWORD',
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
        error: 'USER_EXISTS',
        message: '이미 사용 중인 이메일입니다.',
      }, { status: 400 });
    }

    // 이미 해당 이름으로 가입한 사용자가 있는지 확인 (선택사항 - name은 중복 가능)
    // Prisma 스키마에서 name 필드가 unique가 아니므로 이 검사는 제거합니다.

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        name,
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
          name: user.name,
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