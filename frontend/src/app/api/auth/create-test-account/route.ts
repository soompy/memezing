import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 개발 환경에서만 허용
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: '프로덕션 환경에서는 테스트 계정을 생성할 수 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    // 기본값 설정
    const testEmail = email || 'test@memezing.com';
    const testPassword = password || 'test123!';
    const testName = name || '테스트 사용자';

    // 이미 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: '테스트 계정이 이미 존재합니다.',
        data: {
          email: testEmail,
          password: testPassword,
          name: existingUser.name
        }
      });
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // 테스트 계정 생성
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: testName,
        isVerified: true,
        interests: ['humor', 'trending'],
        bio: '밈징 테스트 계정입니다.'
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isVerified: true,
        interests: true,
        bio: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: '테스트 계정이 성공적으로 생성되었습니다.',
      data: {
        user,
        credentials: {
          email: testEmail,
          password: testPassword
        }
      }
    });

  } catch (error) {
    console.error('Test account creation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '테스트 계정 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}