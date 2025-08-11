import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TemplateService {
  // 템플릿 생성
  async createTemplate(data: {
    name: string;
    imageUrl: string;
    category: string;
    textBoxes: any;
  }) {
    try {
      const template = await prisma.template.create({
        data: {
          name: data.name,
          imageUrl: data.imageUrl,
          category: data.category,
          textBoxes: data.textBoxes,
        },
      });

      return {
        success: true,
        data: template,
        message: '템플릿이 성공적으로 생성되었습니다.',
      };
    } catch (error) {
      console.error('Create template error:', error);
      return {
        success: false,
        message: '템플릿 생성 중 오류가 발생했습니다.',
      };
    }
  }

  // 템플릿 목록 조회
  async getTemplates(params: {
    category?: string;
    limit?: number;
    sortBy?: 'popular' | 'recent' | 'usage';
  }) {
    try {
      const {
        category,
        limit = 20,
        sortBy = 'popular',
      } = params;

      // 정렬 옵션
      let orderBy: any = {};
      switch (sortBy) {
        case 'recent':
          orderBy = { createdAt: 'desc' };
          break;
        case 'usage':
          orderBy = { usageCount: 'desc' };
          break;
        default:
          orderBy = { usageCount: 'desc' }; // 기본적으로 인기순
      }

      // 필터 조건
      const where: any = {
        isActive: true,
      };

      if (category) {
        where.category = category;
      }

      const templates = await prisma.template.findMany({
        where,
        orderBy,
        take: limit,
      });

      // 템플릿이 없는 경우 하드코딩된 템플릿 반환
      if (templates.length === 0) {
        const hardcodedTemplates = [
          {
            id: 'drake',
            name: '드레이크 밈',
            imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
            category: 'popular',
            textBoxes: [
              { x: 10, y: 10, width: 200, height: 60, defaultText: '이건 별로' },
              { x: 10, y: 180, width: 200, height: 60, defaultText: '이게 좋아' },
            ],
            isActive: true,
            usageCount: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'distracted-boyfriend',
            name: '한눈파는 남친',
            imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
            category: 'popular',
            textBoxes: [
              { x: 50, y: 50, width: 150, height: 40, defaultText: '새로운 것' },
              { x: 250, y: 100, width: 120, height: 40, defaultText: '남친' },
              { x: 400, y: 80, width: 120, height: 40, defaultText: '기존 것' },
            ],
            isActive: true,
            usageCount: 950,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'woman-yelling-cat',
            name: '고양이 vs 여자',
            imageUrl: 'https://i.imgflip.com/345v97.jpg',
            category: 'popular',
            textBoxes: [
              { x: 20, y: 20, width: 180, height: 50, defaultText: '화난 여자' },
              { x: 320, y: 150, width: 150, height: 50, defaultText: '무관심한 고양이' },
            ],
            isActive: true,
            usageCount: 880,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'two-buttons',
            name: '두 가지 선택',
            imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
            category: 'popular',
            textBoxes: [
              { x: 10, y: 10, width: 180, height: 40, defaultText: '어려운 선택' },
              { x: 100, y: 120, width: 120, height: 30, defaultText: '선택 A' },
              { x: 250, y: 120, width: 120, height: 30, defaultText: '선택 B' },
            ],
            isActive: true,
            usageCount: 750,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'expanding-brain',
            name: '확장하는 뇌',
            imageUrl: 'https://i.imgflip.com/1jwhww.jpg',
            category: 'popular',
            textBoxes: [
              { x: 10, y: 10, width: 180, height: 40, defaultText: '일반적인 생각' },
              { x: 10, y: 80, width: 180, height: 40, defaultText: '조금 더 나은 생각' },
              { x: 10, y: 150, width: 180, height: 40, defaultText: '좋은 생각' },
              { x: 10, y: 220, width: 180, height: 40, defaultText: '천재적인 생각' },
            ],
            isActive: true,
            usageCount: 680,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'change-my-mind',
            name: '내 마음을 바꿔봐',
            imageUrl: 'https://i.imgflip.com/24y43o.jpg',
            category: 'popular',
            textBoxes: [
              { x: 250, y: 220, width: 200, height: 50, defaultText: '논란이 될 만한 의견' },
            ],
            isActive: true,
            usageCount: 620,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        // 카테고리 필터링
        let filteredTemplates = hardcodedTemplates;
        if (category) {
          filteredTemplates = hardcodedTemplates.filter(t => t.category === category);
        }

        return {
          success: true,
          data: filteredTemplates.slice(0, limit),
          total: filteredTemplates.length,
          message: '하드코딩된 템플릿을 반환했습니다. 실제 데이터베이스에 템플릿을 추가해주세요.',
        };
      }

      return {
        success: true,
        data: templates,
        total: templates.length,
      };
    } catch (error) {
      console.error('Get templates error:', error);
      return {
        success: false,
        message: '템플릿 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 템플릿 상세 조회
  async getTemplateById(id: string) {
    try {
      const template = await prisma.template.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              memes: true,
            },
          },
        },
      });

      if (!template) {
        return {
          success: false,
          message: '템플릿을 찾을 수 없습니다.',
        };
      }

      return {
        success: true,
        data: template,
      };
    } catch (error) {
      console.error('Get template by ID error:', error);
      return {
        success: false,
        message: '템플릿 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 템플릿 카테고리 목록 조회
  async getCategories() {
    try {
      const categories = await prisma.template.groupBy({
        by: ['category'],
        where: {
          isActive: true,
        },
        _count: {
          category: true,
        },
      });

      // 하드코딩된 카테고리 (데이터베이스가 비어있을 경우)
      if (categories.length === 0) {
        const hardcodedCategories = [
          { category: 'popular', _count: { category: 6 } },
          { category: 'reaction', _count: { category: 4 } },
          { category: 'comparison', _count: { category: 3 } },
          { category: 'decision', _count: { category: 2 } },
          { category: 'philosophy', _count: { category: 2 } },
        ];

        return {
          success: true,
          data: hardcodedCategories,
        };
      }

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      console.error('Get categories error:', error);
      return {
        success: false,
        message: '카테고리 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 템플릿 사용 횟수 증가
  async incrementUsage(id: string) {
    try {
      await prisma.template.update({
        where: { id },
        data: {
          usageCount: { increment: 1 },
        },
      });

      return {
        success: true,
        message: '템플릿 사용 횟수가 업데이트되었습니다.',
      };
    } catch (error) {
      console.error('Increment template usage error:', error);
      return {
        success: false,
        message: '템플릿 사용 횟수 업데이트 중 오류가 발생했습니다.',
      };
    }
  }

  // 템플릿 수정 (관리자 전용)
  async updateTemplate(id: string, data: {
    name?: string;
    imageUrl?: string;
    category?: string;
    textBoxes?: any;
    isActive?: boolean;
  }) {
    try {
      const updatedTemplate = await prisma.template.update({
        where: { id },
        data: {
          name: data.name,
          imageUrl: data.imageUrl,
          category: data.category,
          textBoxes: data.textBoxes,
          isActive: data.isActive,
        },
      });

      return {
        success: true,
        data: updatedTemplate,
        message: '템플릿이 성공적으로 수정되었습니다.',
      };
    } catch (error) {
      console.error('Update template error:', error);
      return {
        success: false,
        message: '템플릿 수정 중 오류가 발생했습니다.',
      };
    }
  }

  // 템플릿 삭제 (관리자 전용)
  async deleteTemplate(id: string) {
    try {
      await prisma.template.delete({
        where: { id },
      });

      return {
        success: true,
        message: '템플릿이 성공적으로 삭제되었습니다.',
      };
    } catch (error) {
      console.error('Delete template error:', error);
      return {
        success: false,
        message: '템플릿 삭제 중 오류가 발생했습니다.',
      };
    }
  }
}