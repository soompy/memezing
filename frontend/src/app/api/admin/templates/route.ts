import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, logAdminAction, permissions } from '@/lib/auth';

const prisma = new PrismaClient();

// 관리자 템플릿 목록 조회
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'usage';
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // active, inactive, pending
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;

    // 필터 조건
    const where: any = {};
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 정렬 설정
    const orderBy: any = {};
    switch (sortBy) {
      case 'recent':
        orderBy.createdAt = 'desc';
        break;
      case 'name':
        orderBy.name = 'asc';
        break;
      case 'category':
        orderBy.category = 'asc';
        break;
      default:
        orderBy.usageCount = 'desc';
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              memes: true
            }
          }
        }
      }),
      prisma.template.count({ where })
    ]);

    // 각 템플릿의 최근 사용 통계
    const templatesWithStats = await Promise.all(
      templates.map(async (template) => {
        const recentUsage = await prisma.meme.count({
          where: {
            templateId: template.id,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 최근 30일
            }
          }
        });

        return {
          ...template,
          recentUsage,
          totalMemes: template._count.memes
        };
      })
    );

    await logAdminAction(
      auth.user.id,
      'VIEW_TEMPLATES_LIST',
      'template',
      undefined,
      { page, limit, category, status, search }
    );

    return NextResponse.json({
      success: true,
      data: templatesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin templates list API error:', error);
    return NextResponse.json(
      { error: '템플릿 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 새 템플릿 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    if (!permissions.canApproveTemplates(auth.user.role)) {
      return NextResponse.json(
        { error: '템플릿 생성 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { name, imageUrl, category, textBoxes, isActive = true } = await request.json();

    if (!name || !imageUrl || !category || !Array.isArray(textBoxes)) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name: name.trim(),
        imageUrl,
        category: category.toLowerCase(),
        textBoxes,
        isActive,
        usageCount: 0
      }
    });

    await logAdminAction(
      auth.user.id,
      'CREATE_TEMPLATE',
      'template',
      template.id,
      { name, category, isActive }
    );

    return NextResponse.json({
      success: true,
      data: template,
      message: '템플릿이 생성되었습니다.'
    });

  } catch (error) {
    console.error('Admin create template API error:', error);
    return NextResponse.json(
      { error: '템플릿 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 템플릿 일괄 처리 (승인, 거절, 삭제 등)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'moderator');
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { action, templateIds, reason } = await request.json();
    
    if (!Array.isArray(templateIds) || templateIds.length === 0) {
      return NextResponse.json(
        { error: '처리할 템플릿을 선택해주세요.' },
        { status: 400 }
      );
    }

    let result;
    
    switch (action) {
      case 'activate':
        if (!permissions.canApproveTemplates(auth.user.role)) {
          return NextResponse.json(
            { error: '템플릿 승인 권한이 없습니다.' },
            { status: 403 }
          );
        }
        
        result = await prisma.template.updateMany({
          where: {
            id: { in: templateIds }
          },
          data: {
            isActive: true,
            updatedAt: new Date()
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'ACTIVATE_TEMPLATES_BULK',
          'template',
          undefined,
          { templateIds, count: result.count, reason }
        );
        break;
        
      case 'deactivate':
        result = await prisma.template.updateMany({
          where: {
            id: { in: templateIds }
          },
          data: {
            isActive: false,
            updatedAt: new Date()
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'DEACTIVATE_TEMPLATES_BULK',
          'template',
          undefined,
          { templateIds, count: result.count, reason }
        );
        break;
        
      case 'delete':
        // 사용 중인 템플릿인지 확인
        const templatesInUse = await prisma.template.findMany({
          where: {
            id: { in: templateIds }
          },
          include: {
            _count: {
              select: {
                memes: true
              }
            }
          }
        });
        
        const templatesWithMemes = templatesInUse.filter(t => t._count.memes > 0);
        if (templatesWithMemes.length > 0) {
          return NextResponse.json(
            { 
              error: '사용 중인 템플릿은 삭제할 수 없습니다.',
              templatesInUse: templatesWithMemes.map(t => ({ id: t.id, name: t.name, memeCount: t._count.memes }))
            },
            { status: 400 }
          );
        }
        
        result = await prisma.template.deleteMany({
          where: {
            id: { in: templateIds }
          }
        });
        
        await logAdminAction(
          auth.user.id,
          'DELETE_TEMPLATES_BULK',
          'template',
          undefined,
          { templateIds, count: result.count, reason }
        );
        break;
        
      default:
        return NextResponse.json(
          { error: '알 수 없는 액션입니다.' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: { affected: result.count },
      message: `${result.count}개의 템플릿이 처리되었습니다.`
    });

  } catch (error) {
    console.error('Admin templates bulk action error:', error);
    return NextResponse.json(
      { error: '템플릿 일괄 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}