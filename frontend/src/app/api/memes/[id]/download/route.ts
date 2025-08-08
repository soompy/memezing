import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 밈 다운로드 카운트 증가
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memeId = params.id;
    const { quality, format, userAgent } = await request.json().catch(() => ({}));

    // 밈 존재 및 공개 상태 확인
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        isPublic: true,
        downloadsCount: true,
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
        { error: '비공개 밈은 다운로드할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 다운로드 카운트 증가
    const updatedMeme = await prisma.meme.update({
      where: { id: memeId },
      data: {
        downloadsCount: {
          increment: 1
        }
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        downloadsCount: true
      }
    });

    // 다운로드 분석을 위한 로그
    console.log(`[DOWNLOAD] Meme ${memeId} downloaded in ${quality || 'original'} quality, ${format || 'original'} format`);

    // 다운로드 옵션에 따른 이미지 URL 생성
    let downloadUrl = meme.imageUrl;
    let fileName = `meme-${memeId}`;

    // 제목이 있으면 파일명에 포함
    if (meme.title) {
      const safeTitle = meme.title
        .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      fileName = `${safeTitle}-${memeId}`;
    }

    // Cloudinary URL 변환 (품질 및 포맷 조정)
    if (meme.imageUrl.includes('cloudinary.com')) {
      const baseUrl = meme.imageUrl.split('/upload/')[0] + '/upload/';
      const imagePath = meme.imageUrl.split('/upload/')[1];
      
      const transformations = [];
      
      // 품질 설정
      switch (quality) {
        case 'high':
          transformations.push('q_90');
          break;
        case 'medium':
          transformations.push('q_70');
          break;
        case 'low':
          transformations.push('q_50');
          break;
        default:
          transformations.push('q_auto');
      }
      
      // 포맷 설정
      switch (format) {
        case 'jpg':
          transformations.push('f_jpg');
          fileName += '.jpg';
          break;
        case 'png':
          transformations.push('f_png');
          fileName += '.png';
          break;
        case 'webp':
          transformations.push('f_webp');
          fileName += '.webp';
          break;
        default:
          transformations.push('f_auto');
          fileName += '.jpg'; // 기본값
      }
      
      if (transformations.length > 0) {
        downloadUrl = baseUrl + transformations.join(',') + '/' + imagePath;
      }
    } else {
      // Cloudinary가 아닌 경우 원본 URL 사용
      const ext = meme.imageUrl.split('.').pop() || 'jpg';
      fileName += `.${ext}`;
    }

    const downloadData = {
      downloadUrl,
      fileName,
      originalUrl: meme.imageUrl,
      options: {
        quality: quality || 'original',
        format: format || 'auto'
      },
      stats: {
        downloadsCount: updatedMeme.downloadsCount
      },
      meme: {
        id: meme.id,
        title: meme.title,
        author: meme.user.name
      }
    };

    return NextResponse.json({
      success: true,
      data: downloadData,
      message: '다운로드 준비가 완료되었습니다.'
    });

  } catch (error) {
    console.error('Meme download API error:', error);
    return NextResponse.json(
      { error: '다운로드 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 다운로드 통계 조회
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
        imageUrl: true,
        downloadsCount: true,
        isPublic: true,
        createdAt: true,
        user: {
          select: {
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
        { error: '비공개 밈의 통계는 조회할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 다운로드 옵션 정보
    const downloadOptions = {
      qualities: [
        { value: 'original', label: '원본 품질', description: '최고 품질 (용량 큼)' },
        { value: 'high', label: '고품질', description: '90% 품질 (균형)' },
        { value: 'medium', label: '중품질', description: '70% 품질 (작은 용량)' },
        { value: 'low', label: '저품질', description: '50% 품질 (매우 작은 용량)' }
      ],
      formats: [
        { value: 'auto', label: '자동', description: '최적 포맷 자동 선택' },
        { value: 'jpg', label: 'JPG', description: '범용성이 좋은 포맷' },
        { value: 'png', label: 'PNG', description: '투명도 지원' },
        { value: 'webp', label: 'WebP', description: '최신 웹 포맷 (작은 용량)' }
      ]
    };

    return NextResponse.json({
      success: true,
      data: {
        meme: {
          id: meme.id,
          title: meme.title,
          author: meme.user.name,
          imageUrl: meme.imageUrl,
          downloadsCount: meme.downloadsCount,
          createdAt: meme.createdAt
        },
        downloadOptions
      }
    });

  } catch (error) {
    console.error('Download stats API error:', error);
    return NextResponse.json(
      { error: '다운로드 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}