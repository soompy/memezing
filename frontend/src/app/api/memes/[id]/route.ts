import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 개별 밈 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const meme = await prisma.meme.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                isVerified: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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

    if (!meme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await prisma.meme.update({
      where: { id },
      data: {
        viewsCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: meme
    });

  } catch (error) {
    console.error('Get meme API error:', error);
    return NextResponse.json(
      { error: '밈 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 밈 업데이트 (PUT)
export async function PUT(
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

    const { id } = params;
    const { title, tags, description, isPublic } = await request.json();

    // 권한 확인
    const existingMeme = await prisma.meme.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingMeme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingMeme.user.email !== session.user.email) {
      return NextResponse.json(
        { error: '해당 밈을 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 업데이트 데이터 준비
    const updateData: any = {};
    if (title !== undefined) updateData.title = title?.trim() || null;
    if (Array.isArray(tags)) updateData.tags = tags;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);

    const updatedMeme = await prisma.meme.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: updatedMeme,
      message: '밈이 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Update meme API error:', error);
    return NextResponse.json(
      { error: '밈 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 밈 삭제 (DELETE)
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

    const { id } = params;

    // 권한 확인
    const existingMeme = await prisma.meme.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingMeme) {
      return NextResponse.json(
        { error: '밈을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingMeme.user.email !== session.user.email) {
      return NextResponse.json(
        { error: '해당 밈을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await prisma.meme.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '밈이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Delete meme API error:', error);
    return NextResponse.json(
      { error: '밈 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}