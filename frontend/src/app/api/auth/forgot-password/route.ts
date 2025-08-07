import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 비밀번호 재설정 요청
export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json();

    // 비밀번호 재설정 토큰 요청
    if (email && !token && !newPassword) {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // 보안상 이유로 사용자가 존재하지 않아도 성공 메시지 반환
        return NextResponse.json(
          { 
            success: true,
            message: '해당 이메일로 비밀번호 재설정 링크를 발송했습니다.'
          },
          { status: 200 }
        );
      }

      // 토큰 생성 (1시간 유효)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1시간 후

      await prisma.passwordReset.create({
        data: {
          email,
          token: resetToken,
          expires,
          userId: user.id
        }
      });

      // TODO: 실제 환경에서는 이메일 발송 서비스 통합 필요
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return NextResponse.json(
        { 
          success: true,
          message: '해당 이메일로 비밀번호 재설정 링크를 발송했습니다.',
          // 개발 환경에서만 토큰 반환
          ...(process.env.NODE_ENV === 'development' && { token: resetToken })
        },
        { status: 200 }
      );
    }

    // 비밀번호 재설정 실행
    if (token && newPassword) {
      if (!email) {
        return NextResponse.json(
          { error: '이메일이 필요합니다.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: '비밀번호는 최소 8자 이상이어야 합니다.' },
          { status: 400 }
        );
      }

      const passwordReset = await prisma.passwordReset.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!passwordReset || passwordReset.used) {
        return NextResponse.json(
          { error: '유효하지 않은 토큰입니다.' },
          { status: 400 }
        );
      }

      if (passwordReset.expires < new Date()) {
        return NextResponse.json(
          { error: '토큰이 만료되었습니다.' },
          { status: 400 }
        );
      }

      if (passwordReset.email !== email) {
        return NextResponse.json(
          { error: '이메일이 일치하지 않습니다.' },
          { status: 400 }
        );
      }

      // 비밀번호 암호화
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // 비밀번호 업데이트
      await prisma.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword }
      });

      // 토큰 사용 처리
      await prisma.passwordReset.update({
        where: { token },
        data: { used: true }
      });

      return NextResponse.json(
        { 
          success: true,
          message: '비밀번호가 성공적으로 변경되었습니다.'
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json(
      { error: '비밀번호 재설정 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}