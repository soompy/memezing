import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 컬렉션에 밈 추가
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

    const collectionId = params.id;
    const { memeId, order } = await request.json();

    if (!memeId) {
      return NextResponse.json(
        { error: '밈 ID가 필요합니다.' },
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

    // 컬렉션 권한 확인
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
        { error: '컬렉션에 밈을 추가할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 밈 존재 및 공개 상태 확인
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        isPublic: true,
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
        { error: '비공개 밈은 컬렉션에 추가할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 중복 확인
    const existingItem = await prisma.collectionItem.findUnique({
      where: {
        collectionId_memeId: {
          collectionId,
          memeId
        }
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: '이미 컬렉션에 추가된 밈입니다.' },
        { status: 409 }
      );
    }

    // 컬렉션 아이템 수 제한
    const itemCount = await prisma.collectionItem.count({
      where: { collectionId }
    });

    if (itemCount >= 500) { // 최대 500개 제한
      return NextResponse.json(
        { error: '컬렉션은 최대 500개의 밈을 포함할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 순서 설정 (지정하지 않으면 맨 끝에 추가)
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxOrder = await prisma.collectionItem.aggregate({
        where: { collectionId },
        _max: { order: true }
      });
      finalOrder = (maxOrder._max.order || 0) + 1;
    }

    // 컬렉션에 밈 추가
    const collectionItem = await prisma.collectionItem.create({
      data: {
        collectionId,
        memeId,
        order: finalOrder
      },
      include: {
        meme: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            user: {
              select: {
                name: true
              }
            }
          }
        },
        collection: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: collectionItem,
      message: `"${meme.title || 'Untitled'}" 밈이 "${collection.name}" 컬렉션에 추가되었습니다.`
    }, { status: 201 });

  } catch (error) {
    console.error('Add meme to collection API error:', error);
    return NextResponse.json(
      { error: '컬렉션에 밈 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 컬렉션에서 밈 제거
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
    const { memeId } = await request.json();

    if (!memeId) {
      return NextResponse.json(
        { error: '밈 ID가 필요합니다.' },
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

    // 컬렉션 권한 확인
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
        { error: '컬렉션에서 밈을 제거할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 컬렉션 아이템 확인
    const collectionItem = await prisma.collectionItem.findUnique({
      where: {
        collectionId_memeId: {
          collectionId,
          memeId
        }
      },
      include: {
        meme: {
          select: {
            title: true
          }
        }
      }
    });

    if (!collectionItem) {
      return NextResponse.json(
        { error: '컬렉션에 해당 밈이 없습니다.' },
        { status: 404 }
      );
    }

    // 컬렉션에서 밈 제거
    await prisma.collectionItem.delete({
      where: { id: collectionItem.id }
    });

    return NextResponse.json({
      success: true,
      message: `"${collectionItem.meme.title || 'Untitled'}" 밈이 컬렉션에서 제거되었습니다.`
    });

  } catch (error) {
    console.error('Remove meme from collection API error:', error);
    return NextResponse.json(
      { error: '컬렉션에서 밈 제거 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 컬렉션 아이템 순서 변경
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
    const { items } = await request.json(); // [{ memeId, order }, ...]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '순서를 변경할 아이템 목록이 필요합니다.' },
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

    // 컬렉션 권한 확인
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
        { error: '컬렉션 순서를 변경할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 트랜잭션으로 순서 일괄 업데이트
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.collectionItem.updateMany({
          where: {
            collectionId,
            memeId: item.memeId
          },
          data: {
            order: item.order
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: '컬렉션 아이템 순서가 변경되었습니다.',
      data: {
        updatedItems: items.length
      }
    });

  } catch (error) {
    console.error('Reorder collection items API error:', error);
    return NextResponse.json(
      { error: '컬렉션 아이템 순서 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}