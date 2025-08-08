import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 컬렉션 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    const collectionId = params.id;

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        }
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: '컬렉션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인
    let canView = collection.isPublic;
    let isOwner = false;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (user && user.id === collection.userId) {
        canView = true;
        isOwner = true;
      }
    }

    if (!canView) {
      return NextResponse.json(
        { error: '비공개 컬렉션에 접근할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 컬렉션 아이템 조회
    const [items, totalItems] = await Promise.all([
      prisma.collectionItem.findMany({
        where: { collectionId },
        include: {
          meme: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  isVerified: true
                }
              },
              template: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                  bookmarks: true
                }
              }
            }
          }
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.collectionItem.count({
        where: { collectionId }
      })
    ]);

    // 로그인한 사용자의 좋아요/북마크 상태 확인
    let userInteractions = {};
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (user) {
        const memeIds = items.map(item => item.meme.id);
        
        const [userLikes, userBookmarks] = await Promise.all([
          prisma.like.findMany({
            where: {
              userId: user.id,
              memeId: { in: memeIds }
            },
            select: { memeId: true }
          }),
          prisma.bookmark.findMany({
            where: {
              userId: user.id,
              memeId: { in: memeIds }
            },
            select: { memeId: true }
          })
        ]);

        const likedMemeIds = new Set(userLikes.map(like => like.memeId));
        const bookmarkedMemeIds = new Set(userBookmarks.map(bookmark => bookmark.memeId));

        userInteractions = {
          likes: likedMemeIds,
          bookmarks: bookmarkedMemeIds
        };
      }
    }

    const formattedItems = items.map(item => ({
      id: item.id,
      order: item.order,
      addedAt: item.createdAt,
      meme: {
        ...item.meme,
        isLiked: userInteractions.likes?.has(item.meme.id) || false,
        isBookmarked: userInteractions.bookmarks?.has(item.meme.id) || false,
        stats: {
          likes: item.meme._count.likes,
          comments: item.meme._count.comments,
          bookmarks: item.meme._count.bookmarks
        }
      }
    }));

    const response = {
      ...collection,
      isOwner,
      items: formattedItems,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit)
      },
      stats: {
        totalItems
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Collection detail API error:', error);
    return NextResponse.json(
      { error: '컬렉션 상세 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 컬렉션 수정
export async function PATCH(
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

    const collectionId = params.id;
    const { name, description, isPublic } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId }
    });

    if (!collection) {
      return NextResponse.json(
        { error: '컬렉션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (collection.userId !== user.id) {
      return NextResponse.json(
        { error: '컬렉션 수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 이름 중복 확인 (본인 컬렉션 제외)
    if (name && name !== collection.name) {
      const existingCollection = await prisma.collection.findFirst({
        where: {
          userId: user.id,
          name: name.trim(),
          id: { not: collectionId }
        }
      });

      if (existingCollection) {
        return NextResponse.json(
          { error: '같은 이름의 컬렉션이 이미 존재합니다.' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) {
      if (name.trim().length === 0) {
        return NextResponse.json(
          { error: '컬렉션 이름은 필수입니다.' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (isPublic !== undefined) {
      updateData.isPublic = Boolean(isPublic);
    }

    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: updateData,
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
        ...updatedCollection,
        stats: {
          itemsCount: updatedCollection._count.items
        }
      },
      message: '컬렉션이 수정되었습니다.'
    });

  } catch (error) {
    console.error('Update collection API error:', error);
    return NextResponse.json(
      { error: '컬렉션 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 컬렉션 삭제
export async function DELETE(
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

    const collectionId = params.id;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: '컬렉션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (collection.userId !== user.id) {
      return NextResponse.json(
        { error: '컬렉션 삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 컬렉션 삭제 (CASCADE로 아이템들도 함께 삭제)
    await prisma.collection.delete({
      where: { id: collectionId }
    });

    return NextResponse.json({
      success: true,
      message: `"${collection.name}" 컬렉션이 삭제되었습니다.`,
      data: {
        deletedCollection: {
          name: collection.name,
          itemsCount: collection._count.items
        }
      }
    });

  } catch (error) {
    console.error('Delete collection API error:', error);
    return NextResponse.json(
      { error: '컬렉션 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}