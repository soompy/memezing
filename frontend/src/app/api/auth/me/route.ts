import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: '인증이 필요합니다.',
      }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { user },
      message: '사용자 정보를 성공적으로 조회했습니다.',
    });

  } catch (error) {
    console.error('Get user route error:', error);
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}