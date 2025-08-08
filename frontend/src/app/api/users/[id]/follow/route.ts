import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 팔로우/언팔로우 토글
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const targetUserId = params.id;

    // 현재 사용자 조회
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 자기 자신을 팔로우하는 것 방지
    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: '자기 자신을 팔로우할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 대상 사용자 존재 확인
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: '팔로우할 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비활성 사용자는 팔로우 불가
    if (!targetUser.isActive) {
      return NextResponse.json(
        { error: '비활성 사용자는 팔로우할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 현재 팔로우 상태 확인
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId
        }
      }
    });

    let isFollowing = false;
    let message = '';

    if (existingFollow) {
      // 언팔로우
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      isFollowing = false;
      message = '팔로우를 취소했습니다.';
    } else {
      // 팔로우
      await prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUserId
        }
      });
      isFollowing = true;
      message = '팔로우했습니다.';
    }

    // 팔로우 카운트 조회
    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: { followingId: targetUserId }
      }),
      prisma.follow.count({
        where: { followerId: targetUserId }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        isFollowing,
        followerCount,
        followingCount,
        targetUser: {
          id: targetUser.id,
          name: targetUser.name,
          image: targetUser.image
        }
      },
      message
    });

  } catch (error) {
    console.error('Follow API error:', error);
    return NextResponse.json(
      { error: '팔로우 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 팔로우 상태 확인
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const targetUserId = params.id;

    let isFollowing = false;
    
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (currentUser && currentUser.id !== targetUserId) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: targetUserId
            }
          }
        });
        isFollowing = !!follow;
      }
    }

    // 팔로우 카운트 조회
    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: { followingId: targetUserId }
      }),
      prisma.follow.count({
        where: { followerId: targetUserId }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        isFollowing,
        followerCount,
        followingCount
      }
    });

  } catch (error) {
    console.error('Follow status API error:', error);
    return NextResponse.json(
      { error: '팔로우 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}