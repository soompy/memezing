import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 밈 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, popular, views
    const tags = searchParams.get('tags')?.split(',') || [];
    const userId = searchParams.get('userId'); // 특정 사용자의 밈만
    const isPublic = searchParams.get('isPublic') !== 'false'; // 기본적으로 공개 밈만

    const skip = (page - 1) * limit;

    // 정렬 옵션
    const orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy.likesCount = 'desc';
        break;
      case 'views':
        orderBy.viewsCount = 'desc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    // 필터 조건
    const where: any = {};
    if (isPublic) {
      where.isPublic = true;
    }
    if (userId) {
      where.userId = userId;
    }
    if (tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }

    // 밈 목록 조회
    const [memes, total] = await Promise.all([
      prisma.meme.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      }),
      prisma.meme.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: memes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get memes API error:', error);
    return NextResponse.json(
      { error: '밈 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 밈 생성 (POST)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { title, imageUrl, templateId, textBoxes, tags, description, isPublic = true } = await request.json();

    // 유효성 검증
    if (!imageUrl) {
      return NextResponse.json(
        { error: '이미지 URL이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(textBoxes)) {
      return NextResponse.json(
        { error: '텍스트박스 데이터가 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 밈 생성
    const meme = await prisma.meme.create({
      data: {
        title: title?.trim() || null,
        imageUrl,
        templateId: templateId || null,
        textBoxes,
        tags: Array.isArray(tags) ? tags : [],
        description: description?.trim() || null,
        isPublic: Boolean(isPublic),
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: meme,
        message: '밈이 성공적으로 생성되었습니다.'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create meme API error:', error);
    return NextResponse.json(
      { error: '밈 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}