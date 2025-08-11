import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CommentService {
  // 댓글 생성
  async createComment(data: {
    content: string;
    memeId: string;
    userId: string;
    parentId?: string;
  }) {
    try {
      // 밈 존재 확인
      const meme = await prisma.meme.findUnique({
        where: { id: data.memeId },
      });

      if (!meme) {
        return {
          success: false,
          message: '밈을 찾을 수 없습니다.',
        };
      }

      // 대댓글인 경우 부모 댓글 존재 확인
      if (data.parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: data.parentId },
        });

        if (!parentComment || parentComment.memeId !== data.memeId) {
          return {
            success: false,
            message: '유효하지 않은 부모 댓글입니다.',
          };
        }
      }

      const comment = await prisma.comment.create({
        data: {
          content: data.content,
          memeId: data.memeId,
          userId: data.userId,
          parentId: data.parentId,
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
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
      });

      return {
        success: true,
        data: comment,
        message: '댓글이 성공적으로 작성되었습니다.',
      };
    } catch (error) {
      console.error('Create comment error:', error);
      return {
        success: false,
        message: '댓글 작성 중 오류가 발생했습니다.',
      };
    }
  }

  // 댓글 목록 조회
  async getComments(memeId: string, params: {
    page?: number;
    limit?: number;
    currentUserId?: string;
  }) {
    try {
      const { page = 1, limit = 20, currentUserId } = params;
      const skip = (page - 1) * limit;

      // 최상위 댓글만 조회 (parentId가 null인 댓글)
      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: {
            memeId,
            parentId: null,
          },
          orderBy: { createdAt: 'desc' },
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
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    isVerified: true,
                  },
                },
                _count: {
                  select: {
                    likes: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
              take: 5, // 대댓글은 최대 5개까지만 미리 로드
            },
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
          },
        }),
        prisma.comment.count({
          where: {
            memeId,
            parentId: null,
          },
        }),
      ]);

      // 현재 사용자의 댓글 좋아요 상태 확인
      let userCommentLikes: string[] = [];
      if (currentUserId) {
        const allCommentIds = comments.flatMap(comment => [
          comment.id,
          ...comment.replies.map(reply => reply.id),
        ]);

        const commentLikes = await prisma.commentLike.findMany({
          where: {
            userId: currentUserId,
            commentId: { in: allCommentIds },
          },
          select: { commentId: true },
        });

        userCommentLikes = commentLikes.map(like => like.commentId);
      }

      // 데이터 포맷팅
      const formattedComments = comments.map(comment => ({
        ...comment,
        isLiked: userCommentLikes.includes(comment.id),
        username: comment.user.name || '익명',
        replies: comment.replies.map(reply => ({
          ...reply,
          isLiked: userCommentLikes.includes(reply.id),
          username: reply.user.name || '익명',
        })),
      }));

      return {
        success: true,
        data: formattedComments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get comments error:', error);
      return {
        success: false,
        message: '댓글 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 대댓글 더 보기
  async getReplies(parentId: string, params: {
    page?: number;
    limit?: number;
    currentUserId?: string;
  }) {
    try {
      const { page = 1, limit = 10, currentUserId } = params;
      const skip = (page - 1) * limit;

      const [replies, total] = await Promise.all([
        prisma.comment.findMany({
          where: { parentId },
          orderBy: { createdAt: 'asc' },
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
            _count: {
              select: {
                likes: true,
              },
            },
          },
        }),
        prisma.comment.count({
          where: { parentId },
        }),
      ]);

      // 현재 사용자의 댓글 좋아요 상태 확인
      let userCommentLikes: string[] = [];
      if (currentUserId) {
        const commentLikes = await prisma.commentLike.findMany({
          where: {
            userId: currentUserId,
            commentId: { in: replies.map(reply => reply.id) },
          },
          select: { commentId: true },
        });
        userCommentLikes = commentLikes.map(like => like.commentId);
      }

      const formattedReplies = replies.map(reply => ({
        ...reply,
        isLiked: userCommentLikes.includes(reply.id),
        username: reply.user.name || '익명',
      }));

      return {
        success: true,
        data: formattedReplies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get replies error:', error);
      return {
        success: false,
        message: '대댓글 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 댓글 수정
  async updateComment(id: string, userId: string, content: string) {
    try {
      // 권한 확인
      const existingComment = await prisma.comment.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingComment) {
        return {
          success: false,
          message: '댓글을 찾을 수 없습니다.',
        };
      }

      if (existingComment.userId !== userId) {
        return {
          success: false,
          message: '댓글을 수정할 권한이 없습니다.',
        };
      }

      const updatedComment = await prisma.comment.update({
        where: { id },
        data: {
          content,
          isEdited: true,
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
        data: updatedComment,
        message: '댓글이 성공적으로 수정되었습니다.',
      };
    } catch (error) {
      console.error('Update comment error:', error);
      return {
        success: false,
        message: '댓글 수정 중 오류가 발생했습니다.',
      };
    }
  }

  // 댓글 삭제
  async deleteComment(id: string, userId: string) {
    try {
      // 권한 확인
      const existingComment = await prisma.comment.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingComment) {
        return {
          success: false,
          message: '댓글을 찾을 수 없습니다.',
        };
      }

      if (existingComment.userId !== userId) {
        return {
          success: false,
          message: '댓글을 삭제할 권한이 없습니다.',
        };
      }

      await prisma.comment.delete({
        where: { id },
      });

      return {
        success: true,
        message: '댓글이 성공적으로 삭제되었습니다.',
      };
    } catch (error) {
      console.error('Delete comment error:', error);
      return {
        success: false,
        message: '댓글 삭제 중 오류가 발생했습니다.',
      };
    }
  }

  // 댓글 좋아요/좋아요 취소
  async toggleCommentLike(commentId: string, userId: string) {
    try {
      // 기존 좋아요 확인
      const existingLike = await prisma.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      if (existingLike) {
        // 좋아요 취소
        await prisma.$transaction([
          prisma.commentLike.delete({
            where: { id: existingLike.id },
          }),
          prisma.comment.update({
            where: { id: commentId },
            data: { likesCount: { decrement: 1 } },
          }),
        ]);

        return {
          success: true,
          data: { isLiked: false },
          message: '댓글 좋아요를 취소했습니다.',
        };
      } else {
        // 좋아요 추가
        await prisma.$transaction([
          prisma.commentLike.create({
            data: {
              userId,
              commentId,
            },
          }),
          prisma.comment.update({
            where: { id: commentId },
            data: { likesCount: { increment: 1 } },
          }),
        ]);

        return {
          success: true,
          data: { isLiked: true },
          message: '댓글 좋아요를 추가했습니다.',
        };
      }
    } catch (error) {
      console.error('Toggle comment like error:', error);
      return {
        success: false,
        message: '댓글 좋아요 처리 중 오류가 발생했습니다.',
      };
    }
  }
}