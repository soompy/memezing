import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 트렌딩 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'meme', 'tag', 'template', 'user', 'all'
    const period = searchParams.get('period') || 'day'; // 'hour', 'day', 'week', 'month'
    const limit = parseInt(searchParams.get('limit') || '20');

    let where: any = {
      period,
      expiresAt: { gt: new Date() }
    };

    if (type !== 'all') {
      where.type = type;
    }

    const trendingItems = await prisma.trendingItem.findMany({
      where,
      orderBy: [
        { rank: 'asc' },
        { score: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        type: true,
        targetId: true,
        score: true,
        rank: true,
        period: true,
        data: true,
        createdAt: true
      }
    });

    // 각 타입별로 실제 데이터 조회하여 enrichment
    const enrichedItems = await Promise.all(
      trendingItems.map(async (item) => {
        let targetData = null;

        try {
          switch (item.type) {
            case 'meme':
              const meme = await prisma.meme.findUnique({
                where: { id: item.targetId },
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                  likesCount: true,
                  viewsCount: true,
                  sharesCount: true,
                  tags: true,
                  createdAt: true,
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
              targetData = meme;
              break;

            case 'tag':
              const tag = await prisma.tag.findUnique({
                where: { id: item.targetId },
                select: {
                  id: true,
                  name: true,
                  usageCount: true,
                  category: true
                }
              });
              targetData = tag;
              break;

            case 'template':
              const template = await prisma.template.findUnique({
                where: { id: item.targetId },
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  category: true,
                  usageCount: true
                }
              });
              targetData = template;
              break;

            case 'user':
              const user = await prisma.user.findUnique({
                where: { id: item.targetId },
                select: {
                  id: true,
                  name: true,
                  image: true,
                  isVerified: true,
                  createdAt: true,
                  _count: {
                    select: {
                      memes: true,
                      followers: true,
                      likes: true
                    }
                  }
                }
              });
              targetData = user;
              break;
          }
        } catch (error) {
          console.error(`Error fetching ${item.type} data for ID ${item.targetId}:`, error);
        }

        return {
          ...item,
          target: targetData,
          trendingReason: determineTrendingReason(item)
        };
      })
    );

    // 실제 데이터가 있는 항목만 필터링
    const validItems = enrichedItems.filter(item => item.target !== null);

    // 타입별 집계
    const stats = {
      totalItems: validItems.length,
      byType: validItems.reduce((acc: any, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      period,
      lastUpdated: trendingItems[0]?.createdAt
    };

    return NextResponse.json({
      success: true,
      data: {
        items: validItems,
        stats,
        period,
        type
      }
    });

  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json(
      { error: '트렌딩 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 트렌딩 데이터 업데이트/생성 (내부 배치 작업용)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 관리자 권한 확인 (배치 작업이므로)
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      
      if (!user || !['admin', 'super_admin'].includes(user.role)) {
        return NextResponse.json(
          { error: '권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    const { period = 'day', forceUpdate = false } = await request.json();

    // 기간별 시간 범위 설정
    const timeRanges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    const timeRange = timeRanges[period as keyof typeof timeRanges] || timeRanges.day;
    const startTime = new Date(Date.now() - timeRange);
    const expiresAt = new Date(Date.now() + timeRange);

    // 기존 해당 기간 트렌딩 데이터 삭제 (forceUpdate인 경우)
    if (forceUpdate) {
      await prisma.trendingItem.deleteMany({
        where: { period }
      });
    }

    const results = {
      memes: 0,
      tags: 0,
      templates: 0,
      users: 0
    };

    // 1. 트렌딩 밈 계산
    const trendingMemes = await prisma.meme.findMany({
      where: {
        createdAt: { gte: startTime },
        isPublic: true
      },
      select: {
        id: true,
        title: true,
        likesCount: true,
        viewsCount: true,
        sharesCount: true,
        downloadsCount: true,
        createdAt: true,
        _count: { select: { comments: true } }
      },
      orderBy: [
        { likesCount: 'desc' },
        { viewsCount: 'desc' },
        { sharesCount: 'desc' }
      ],
      take: 50
    });

    for (let i = 0; i < Math.min(trendingMemes.length, 20); i++) {
      const meme = trendingMemes[i];
      const score = calculateMemeScore(meme);
      
      await prisma.trendingItem.upsert({
        where: {
          type_targetId_period: {
            type: 'meme',
            targetId: meme.id,
            period
          }
        },
        update: {
          score,
          rank: i + 1,
          data: {
            title: meme.title,
            metrics: {
              likes: meme.likesCount,
              views: meme.viewsCount,
              shares: meme.sharesCount,
              downloads: meme.downloadsCount,
              comments: meme._count.comments
            }
          },
          expiresAt
        },
        create: {
          type: 'meme',
          targetId: meme.id,
          score,
          rank: i + 1,
          period,
          data: {
            title: meme.title,
            metrics: {
              likes: meme.likesCount,
              views: meme.viewsCount,
              shares: meme.sharesCount,
              downloads: meme.downloadsCount,
              comments: meme._count.comments
            }
          },
          expiresAt
        }
      });
    }
    results.memes = Math.min(trendingMemes.length, 20);

    // 2. 트렌딩 태그 계산
    const trendingTags = await prisma.tag.findMany({
      where: {
        isActive: true,
        usageCount: { gt: 0 },
        updatedAt: { gte: startTime }
      },
      orderBy: { usageCount: 'desc' },
      take: 15
    });

    for (let i = 0; i < trendingTags.length; i++) {
      const tag = trendingTags[i];
      
      await prisma.trendingItem.upsert({
        where: {
          type_targetId_period: {
            type: 'tag',
            targetId: tag.id,
            period
          }
        },
        update: {
          score: tag.usageCount,
          rank: i + 1,
          data: {
            name: tag.name,
            category: tag.category,
            usageCount: tag.usageCount
          },
          expiresAt
        },
        create: {
          type: 'tag',
          targetId: tag.id,
          score: tag.usageCount,
          rank: i + 1,
          period,
          data: {
            name: tag.name,
            category: tag.category,
            usageCount: tag.usageCount
          },
          expiresAt
        }
      });
    }
    results.tags = trendingTags.length;

    // 3. 트렌딩 템플릿 계산
    const trendingTemplates = await prisma.template.findMany({
      where: {
        isActive: true,
        usageCount: { gt: 0 },
        updatedAt: { gte: startTime }
      },
      orderBy: { usageCount: 'desc' },
      take: 10
    });

    for (let i = 0; i < trendingTemplates.length; i++) {
      const template = trendingTemplates[i];
      
      await prisma.trendingItem.upsert({
        where: {
          type_targetId_period: {
            type: 'template',
            targetId: template.id,
            period
          }
        },
        update: {
          score: template.usageCount,
          rank: i + 1,
          data: {
            name: template.name,
            category: template.category,
            usageCount: template.usageCount
          },
          expiresAt
        },
        create: {
          type: 'template',
          targetId: template.id,
          score: template.usageCount,
          rank: i + 1,
          period,
          data: {
            name: template.name,
            category: template.category,
            usageCount: template.usageCount
          },
          expiresAt
        }
      });
    }
    results.templates = trendingTemplates.length;

    // 4. 트렌딩 유저 계산
    const trendingUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 최근 30일 가입자
      },
      select: {
        id: true,
        name: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            memes: true,
            followers: true,
            likes: true
          }
        }
      },
      orderBy: [
        { followers: { _count: 'desc' } },
        { memes: { _count: 'desc' } }
      ],
      take: 10
    });

    for (let i = 0; i < trendingUsers.length; i++) {
      const user = trendingUsers[i];
      const userScore = user._count.followers * 2 + user._count.memes + user._count.likes * 0.1;
      
      await prisma.trendingItem.upsert({
        where: {
          type_targetId_period: {
            type: 'user',
            targetId: user.id,
            period
          }
        },
        update: {
          score: userScore,
          rank: i + 1,
          data: {
            name: user.name,
            isVerified: user.isVerified,
            metrics: {
              memes: user._count.memes,
              followers: user._count.followers,
              likes: user._count.likes
            }
          },
          expiresAt
        },
        create: {
          type: 'user',
          targetId: user.id,
          score: userScore,
          rank: i + 1,
          period,
          data: {
            name: user.name,
            isVerified: user.isVerified,
            metrics: {
              memes: user._count.memes,
              followers: user._count.followers,
              likes: user._count.likes
            }
          },
          expiresAt
        }
      });
    }
    results.users = trendingUsers.length;

    // 만료된 트렌딩 데이터 정리
    await prisma.trendingItem.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    return NextResponse.json({
      success: true,
      data: results,
      message: `${period} 트렌딩 데이터가 업데이트되었습니다.`
    }, { status: 201 });

  } catch (error) {
    console.error('Update trending data error:', error);
    return NextResponse.json(
      { error: '트렌딩 데이터 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 밈 트렌딩 점수 계산
function calculateMemeScore(meme: {
  likesCount: number;
  viewsCount: number;
  sharesCount: number;
  downloadsCount: number;
  createdAt: Date;
  _count: { comments: number };
}): number {
  const age = Date.now() - meme.createdAt.getTime();
  const hoursSinceCreation = age / (1000 * 60 * 60);
  
  // 시간이 지날수록 점수 감소 (24시간 후 절반)
  const timeDecay = Math.exp(-hoursSinceCreation / 24);
  
  // 가중치: 좋아요 > 공유 > 다운로드 > 댓글 > 조회수
  const engagementScore = 
    meme.likesCount * 5 +
    meme.sharesCount * 8 +
    meme.downloadsCount * 3 +
    meme._count.comments * 4 +
    Math.min(meme.viewsCount * 0.1, 100); // 조회수는 최대 100점으로 제한

  return engagementScore * timeDecay;
}

// 트렌딩 이유 결정
function determineTrendingReason(item: any): string {
  if (!item.data?.metrics) return '인기 상승';

  const metrics = item.data.metrics;
  
  if (metrics.shares > metrics.likes) {
    return '높은 공유율';
  } else if (metrics.comments > metrics.likes * 0.1) {
    return '활발한 댓글';
  } else if (metrics.likes > 100) {
    return '인기 폭발';
  } else if (metrics.views > 1000) {
    return '높은 조회수';
  }
  
  return '꾸준한 인기';
}