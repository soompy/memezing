import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MemeService {
  // 밈 생성
  async createMeme(data: {
    title?: string;
    imageUrl: string;
    templateId?: string;
    textBoxes?: any;
    tags?: string[];
    description?: string;
    isPublic?: boolean;
    userId: string;
  }) {
    try {
      const meme = await prisma.meme.create({
        data: {
          title: data.title,
          imageUrl: data.imageUrl,
          templateId: data.templateId,
          textBoxes: data.textBoxes,
          tags: data.tags || [],
          description: data.description,
          isPublic: data.isPublic ?? true,
          userId: data.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      return {
        success: true,
        data: meme,
        message: '밈이 성공적으로 생성되었습니다.',
      };
    } catch (error) {
      console.error('Create meme error:', error);
      return {
        success: false,
        message: '밈 생성 중 오류가 발생했습니다.',
      };
    }
  }

  // 밈 목록 조회
  async getMemes(params: {
    page?: number;
    limit?: number;
    sortBy?: 'recent' | 'popular' | 'views';
    tags?: string[];
    userId?: string;
    isPublic?: boolean;
    currentUserId?: string;
  }) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'recent',
        tags = [],
        userId,
        isPublic = true,
        currentUserId,
      } = params;

      const skip = (page - 1) * limit;

      // 정렬 옵션
      let orderBy: any = {};
      switch (sortBy) {
        case 'popular':
          orderBy = { likesCount: 'desc' };
          break;
        case 'views':
          orderBy = { viewsCount: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
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
          hasSome: tags,
        };
      }

      // 밈 목록과 총 개수 조회
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
                isVerified: true,
              },
            },
            template: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        }),
        prisma.meme.count({ where }),
      ]);

      // 현재 사용자의 좋아요 상태 확인
      let userLikes: string[] = [];
      if (currentUserId) {
        const likes = await prisma.like.findMany({
          where: {
            userId: currentUserId,
            memeId: { in: memes.map((meme) => meme.id) },
          },
          select: { memeId: true },
        });
        userLikes = likes.map((like) => like.memeId);
      }

      // 데이터 포맷팅
      const formattedMemes = memes.map((meme) => ({
        ...meme,
        isLiked: userLikes.includes(meme.id),
        username: meme.user.name || '익명',
      }));

      return {
        success: true,
        data: formattedMemes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get memes error:', error);
      return {
        success: false,
        message: '밈 목록 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 밈 상세 조회
  async getMemeById(id: string, currentUserId?: string) {
    try {
      const meme = await prisma.meme.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      if (!meme) {
        return {
          success: false,
          message: '밈을 찾을 수 없습니다.',
        };
      }

      // 조회수 증가
      await prisma.meme.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      });

      // 현재 사용자의 좋아요 상태 확인
      let isLiked = false;
      if (currentUserId) {
        const like = await prisma.like.findUnique({
          where: {
            userId_memeId: {
              userId: currentUserId,
              memeId: id,
            },
          },
        });
        isLiked = !!like;
      }

      return {
        success: true,
        data: {
          ...meme,
          isLiked,
          username: meme.user.name || '익명',
        },
      };
    } catch (error) {
      console.error('Get meme by ID error:', error);
      return {
        success: false,
        message: '밈 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 밈 수정
  async updateMeme(id: string, userId: string, data: {
    title?: string;
    tags?: string[];
    description?: string;
    isPublic?: boolean;
  }) {
    try {
      // 권한 확인
      const existingMeme = await prisma.meme.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingMeme) {
        return {
          success: false,
          message: '밈을 찾을 수 없습니다.',
        };
      }

      if (existingMeme.userId !== userId) {
        return {
          success: false,
          message: '밈을 수정할 권한이 없습니다.',
        };
      }

      const updatedMeme = await prisma.meme.update({
        where: { id },
        data: {
          title: data.title,
          tags: data.tags,
          description: data.description,
          isPublic: data.isPublic,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true,
            },
          },
        },
      });

      return {
        success: true,
        data: updatedMeme,
        message: '밈이 성공적으로 수정되었습니다.',
      };
    } catch (error) {
      console.error('Update meme error:', error);
      return {
        success: false,
        message: '밈 수정 중 오류가 발생했습니다.',
      };
    }
  }

  // 밈 삭제
  async deleteMeme(id: string, userId: string) {
    try {
      // 권한 확인
      const existingMeme = await prisma.meme.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingMeme) {
        return {
          success: false,
          message: '밈을 찾을 수 없습니다.',
        };
      }

      if (existingMeme.userId !== userId) {
        return {
          success: false,
          message: '밈을 삭제할 권한이 없습니다.',
        };
      }

      await prisma.meme.delete({
        where: { id },
      });

      return {
        success: true,
        message: '밈이 성공적으로 삭제되었습니다.',
      };
    } catch (error) {
      console.error('Delete meme error:', error);
      return {
        success: false,
        message: '밈 삭제 중 오류가 발생했습니다.',
      };
    }
  }

  // 밈 좋아요/좋아요 취소
  async toggleLike(memeId: string, userId: string) {
    try {
      // 기존 좋아요 확인
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_memeId: {
            userId,
            memeId,
          },
        },
      });

      if (existingLike) {
        // 좋아요 취소
        await prisma.$transaction([
          prisma.like.delete({
            where: { id: existingLike.id },
          }),
          prisma.meme.update({
            where: { id: memeId },
            data: { likesCount: { decrement: 1 } },
          }),
        ]);

        return {
          success: true,
          data: { isLiked: false },
          message: '좋아요를 취소했습니다.',
        };
      } else {
        // 좋아요 추가
        await prisma.$transaction([
          prisma.like.create({
            data: {
              userId,
              memeId,
            },
          }),
          prisma.meme.update({
            where: { id: memeId },
            data: { likesCount: { increment: 1 } },
          }),
        ]);

        return {
          success: true,
          data: { isLiked: true },
          message: '좋아요를 추가했습니다.',
        };
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      return {
        success: false,
        message: '좋아요 처리 중 오류가 발생했습니다.',
      };
    }
  }
}