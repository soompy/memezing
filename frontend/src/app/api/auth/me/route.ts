import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    // 사용자 정보 조회 (데이터베이스에서)
    let userInfo = null;
    
    if (session.user.email) {
      try {
        userInfo = await prisma.user.findUnique({
          where: {
            email: session.user.email
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            // 민감한 정보는 제외
            // password는 select하지 않음
          }
        });
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // DB 오류가 있어도 세션 정보는 반환
      }
    }

    // 세션 기반 사용자 정보와 DB 정보 병합
    const userData = {
      id: userInfo?.id || session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      emailVerified: userInfo?.emailVerified || null,
      createdAt: userInfo?.createdAt || null,
      updatedAt: userInfo?.updatedAt || null,
      // 추가 메타데이터
      isNewUser: !userInfo, // DB에 없으면 새 사용자
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        session: {
          expires: session.expires,
          // 세션 추가 정보가 필요하면 여기에 추가
        }
      },
      message: '사용자 정보를 성공적으로 조회했습니다.'
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 사용자 정보 업데이트 (부분 업데이트)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, image } = body;

    // 업데이트 가능한 필드만 필터링
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        error: '업데이트할 데이터가 없습니다.'
      }, { status: 400 });
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser
      },
      message: '사용자 정보가 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Update user info error:', error);
    
    // Prisma 에러 처리
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: '사용자 정보 업데이트 중 오류가 발생했습니다.'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST 메서드는 지원하지 않음 (계정 삭제 기능은 너무 위험해서 주석 처리)
export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'GET, PATCH 메서드만 지원됩니다.'
  }, { status: 405 });
}