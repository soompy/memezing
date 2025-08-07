import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

// 비밀번호 재설정 토큰 검증
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: '재설정 토큰이 필요합니다.'
      }, { status: 400 });
    }

    // 토큰 유효성 검사
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date() // 만료되지 않은 토큰
        }
      }
    });

    if (!resetRecord) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않거나 만료된 토큰입니다.'
      }, { status: 400 });
    }

    // 해당 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { email: resetRecord.userId },
      select: { email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        tokenValid: true
      },
      message: '토큰이 유효합니다.'
    });

  } catch (error) {
    console.error('Reset password token validation error:', error);
    return NextResponse.json({
      success: false,
      error: '토큰 검증 중 오류가 발생했습니다.'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 비밀번호 재설정 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json({
        success: false,
        error: '필수 정보가 누락되었습니다.'
      }, { status: 400 });
    }

    // 비밀번호 확인
    if (newPassword !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: '비밀번호가 일치하지 않습니다.'
      }, { status: 400 });
    }

    // 비밀번호 강도 검증
    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: '비밀번호는 최소 8자 이상이어야 합니다.'
      }, { status: 400 });
    }

    // 비밀번호 복잡성 검증 (선택사항)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({
        success: false,
        error: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.'
      }, { status: 400 });
    }

    // 토큰 유효성 검사
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!resetRecord) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않거나 만료된 토큰입니다.'
      }, { status: 400 });
    }

    // 새 비밀번호 해싱
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash(newPassword, saltRounds);

    // 트랜잭션으로 비밀번호 업데이트 및 토큰 삭제
    await prisma.$transaction(async (tx) => {
      // 비밀번호 업데이트
      await tx.user.update({
        where: { email: resetRecord.userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // 사용된 토큰 및 해당 사용자의 모든 재설정 토큰 삭제
      await tx.passwordReset.deleteMany({
        where: { userId: resetRecord.userId }
      });
    });

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      success: false,
      error: '비밀번호 재설정 중 오류가 발생했습니다.'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}