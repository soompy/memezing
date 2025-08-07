import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        interests: true,
        socialLinks: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            memes: true,
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Get profile API error:', error);
    return NextResponse.json(
      { error: '프로필 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { name, bio, interests, socialLinks } = await request.json();

    // 유효성 검증
    if (name && (typeof name !== 'string' || name.trim().length < 1)) {
      return NextResponse.json(
        { error: '유효한 이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (bio && (typeof bio !== 'string' || bio.length > 500)) {
      return NextResponse.json(
        { error: '소개는 500자 이하로 입력해주세요.' },
        { status: 400 }
      );
    }

    if (interests && (!Array.isArray(interests) || interests.length > 10)) {
      return NextResponse.json(
        { error: '관심사는 최대 10개까지 선택 가능합니다.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim() || null;
    if (interests !== undefined) updateData.interests = interests;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        interests: true,
        socialLinks: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            memes: true,
            likes: true,
            comments: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
        message: '프로필이 성공적으로 업데이트되었습니다.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update profile API error:', error);
    return NextResponse.json(
      { error: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}