import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 컬렉션 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId'); // 특정 사용자의 컬렉션
    const isPublic = searchParams.get('isPublic'); // 공개 컬렉션만
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, popular, oldest, name
    const search = searchParams.get('search'); // 컬렉션 이름 검색
    
    const skip = (page - 1) * limit;

    // 필터 조건
    const where: any = {};
    
    // 로그인한 사용자가 자신의 컬렉션을 보는 경우가 아니면 공개 컬렉션만
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (userId && currentUser?.id === userId) {
        // 본인 컬렉션은 모두 보기 가능
        where.userId = userId;
      } else if (userId) {
        // 다른 사람 컬렉션은 공개만
        where.userId = userId;
        where.isPublic = true;
      } else if (isPublic === 'true') {
        where.isPublic = true;
      } else {
        // 기본적으로 공개 컬렉션만
        where.isPublic = true;
      }
    } else {
      // 비로그인 사용자는 공개 컬렉션만
      where.isPublic = true;
      if (userId) {
        where.userId = userId;
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 정렬 설정
    const orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy.items = { _count: 'desc' };
        break;
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      case 'name':
        orderBy.name = 'asc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
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
          items: {
            take: 4, // 미리보기용 4개만
            include: {
              meme: {
                select: {
                  id: true,
                  imageUrl: true,
                  title: true
                }
              }
            },
            orderBy: {
              order: 'asc'
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        }
      }),
      prisma.collection.count({ where })
    ]);

    const formattedCollections = collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isPublic: collection.isPublic,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      user: collection.user,
      previewMemes: collection.items.map(item => item.meme),
      stats: {
        itemsCount: collection._count.items
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedCollections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Collections list API error:', error);
    return NextResponse.json(
      { error: '컬렉션 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 컬렉션 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { name, description, isPublic = false } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: '컬렉션 이름이 필요합니다.' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: '컬렉션 이름은 100자를 초과할 수 없습니다.' },
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

    // 같은 이름의 컬렉션이 있는지 확인
    const existingCollection = await prisma.collection.findFirst({
      where: {
        userId: user.id,
        name: name.trim()
      }
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: '같은 이름의 컬렉션이 이미 존재합니다.' },
        { status: 409 }
      );
    }

    // 사용자별 컬렉션 개수 제한
    const collectionCount = await prisma.collection.count({
      where: { userId: user.id }
    });

    if (collectionCount >= 50) { // 최대 50개 제한
      return NextResponse.json(
        { error: '컬렉션은 최대 50개까지 만들 수 있습니다.' },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: Boolean(isPublic),
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...collection,
        stats: {
          itemsCount: collection._count.items
        }
      },
      message: '컬렉션이 생성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    console.error('Create collection API error:', error);
    return NextResponse.json(
      { error: '컬렉션 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}