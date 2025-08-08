import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 밈 공유 카운트 증가
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memeId = params.id;
    const { platform, userAgent } = await request.json().catch(() => ({}));

    // 밈 존재 및 공개 상태 확인
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: {
        id: true,
        title: true,
        isPublic: true,
        sharesCount: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!meme.isPublic) {
      return NextResponse.json(
        { error: '비공개 밈은 공유할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 공유 카운트 증가
    const updatedMeme = await prisma.meme.update({
      where: { id: memeId },
      data: {
        sharesCount: {
          increment: 1
        }
      },
      select: {
        id: true,
        title: true,
        sharesCount: true
      }
    });

    // 공유 분석을 위한 로그 (실제로는 별도 ShareLog 테이블 사용)
    console.log(`[SHARE] Meme ${memeId} shared to ${platform || 'unknown'} platform`);

    // 공유 플랫폼별 메타데이터 생성
    const shareMetadata = {
      url: `${process.env.NEXTAUTH_URL}/memes/${memeId}`,
      title: meme.title || `${meme.user.name}의 밈`,
      description: `Memezing에서 ${meme.user.name}님이 만든 재미있는 밈을 확인해보세요!`,
      image: meme.title ? `${process.env.NEXTAUTH_URL}/api/memes/${memeId}/thumbnail` : null,
      platform: platform || 'web'
    };

    return NextResponse.json({
      success: true,
      data: {
        meme: {
          id: updatedMeme.id,
          title: updatedMeme.title,
          sharesCount: updatedMeme.sharesCount
        },
        shareMetadata
      },
      message: '공유 카운트가 증가했습니다.'
    });

  } catch (error) {
    console.error('Meme share API error:', error);
    return NextResponse.json(
      { error: '공유 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 공유 통계 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memeId = params.id;

    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: {
        id: true,
        title: true,
        sharesCount: true,
        isPublic: true,
        createdAt: true
      }
    });

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!meme.isPublic) {
      return NextResponse.json(
        { error: '비공개 밈의 통계는 조회할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 공유 메타데이터
    const shareData = {
      sharesCount: meme.sharesCount,
      shareUrl: `${process.env.NEXTAUTH_URL}/memes/${memeId}`,
      socialShare: {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/memes/${memeId}`)}&text=${encodeURIComponent(`재미있는 밈을 발견했어요! - ${meme.title || 'Memezing'}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/memes/${memeId}`)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/memes/${memeId}`)}`,
        reddit: `https://reddit.com/submit?url=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/memes/${memeId}`)}&title=${encodeURIComponent(meme.title || 'Funny Meme from Memezing')}`,
        kakao: {
          // 카카오톡 공유를 위한 메타데이터
          objectType: 'feed',
          content: {
            title: meme.title || 'Memezing 밈',
            description: '재미있는 밈을 확인해보세요!',
            imageUrl: `${process.env.NEXTAUTH_URL}/api/memes/${memeId}/thumbnail`,
            link: {
              webUrl: `${process.env.NEXTAUTH_URL}/memes/${memeId}`,
              mobileWebUrl: `${process.env.NEXTAUTH_URL}/memes/${memeId}`
            }
          }
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: shareData
    });

  } catch (error) {
    console.error('Share stats API error:', error);
    return NextResponse.json(
      { error: '공유 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}