import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    // 세션이 없거나 테스트 사용자인 경우 처리
    let userEmail = session?.user?.email;
    let isTestUser = false;
    
    if (!userEmail) {
      // 세션이 없는 경우 테스트 사용자로 처리
      console.log('No session found, treating as test user');
      userEmail = 'test@memezing.com';
      isTestUser = true;
    }

    // 데이터베이스가 설정되지 않은 경우 테스트 응답
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'your-database-connection-string') {
      console.log('Database not configured, returning test response');
      return NextResponse.json({
        success: true,
        message: '업로드가 완료되었습니다! (테스트 모드 - 데이터베이스 미연결)'
      });
    }

    // 사용자 조회 또는 생성
    let user;
    if (isTestUser) {
      // 테스트 사용자 생성 또는 조회
      user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {},
        create: {
          email: userEmail,
          name: '테스트 사용자',
          password: null
        }
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email: userEmail }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // FormData 파싱
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';
    const tagsString = formData.get('tags') as string;
    const imageFile = formData.get('image') as File;

    // FormData 로깅
    console.log('FormData received:', {
      title: title,
      description: description,
      isPublic: isPublic,
      tagsString: tagsString,
      imageFile: imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'No file'
    });

    // 필수 필드 검증
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: '제목을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: '이미지를 선택해주세요.' },
        { status: 400 }
      );
    }

    // 제목 길이 검증
    if (title.length > 100) {
      return NextResponse.json(
        { success: false, error: '제목은 100자 이하로 입력해주세요.' },
        { status: 400 }
      );
    }

    // 설명 길이 검증
    if (description && description.length > 500) {
      return NextResponse.json(
        { success: false, error: '설명은 500자 이하로 입력해주세요.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 태그 파싱 및 검증
    let tags: string[] = [];
    if (tagsString) {
      try {
        tags = JSON.parse(tagsString);
        if (!Array.isArray(tags)) {
          tags = [];
        }
        // 태그 개수 및 길이 검증
        tags = tags.slice(0, 5).map(tag => String(tag).trim().substring(0, 20)).filter(tag => tag.length > 0);
      } catch {
        tags = [];
      }
    }

    // Cloudinary 설정 확인
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Cloudinary not configured, using placeholder URL');
      const placeholderUrl = `data:${imageFile.type};base64,${Buffer.from(await imageFile.arrayBuffer()).toString('base64')}`;
      
      // 데이터베이스에 밈 정보 저장 (Cloudinary 없이)
      const meme = await prisma.meme.create({
        data: {
          title: title.trim(),
          description: description?.trim() || '',
          imageUrl: placeholderUrl.substring(0, 500), // URL 길이 제한
          userId: user.id,
          isPublic: isPublic,
          tags: tags.length > 0 ? tags : undefined,
          likesCount: 0,
          sharesCount: 0,
          viewsCount: 0,
          cloudinaryPublicId: null
        },
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

      return NextResponse.json({
        success: true,
        data: {
          id: meme.id,
          title: meme.title,
          description: meme.description,
          imageUrl: meme.imageUrl,
          author: meme.user.name || '익명',
          isPublic: meme.isPublic,
          tags: meme.tags,
          likes: meme.likesCount,
          shares: meme.sharesCount,
          views: meme.viewsCount,
          createdAt: meme.createdAt.toISOString(),
          user: meme.user
        },
        message: '밈이 성공적으로 업로드되었습니다! (Cloudinary 미설정)'
      });
    }

    // 이미지를 Cloudinary에 업로드
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'memezing/community',
          resource_type: 'image',
          format: 'jpg',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const cloudinaryResult = uploadResult as any;

    // 데이터베이스에 밈 정보 저장
    const meme = await prisma.meme.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        imageUrl: cloudinaryResult.secure_url,
        userId: user.id,
        isPublic: isPublic,
        tags: tags.length > 0 ? tags : undefined,
        likesCount: 0,
        sharesCount: 0,
        viewsCount: 0,
        cloudinaryPublicId: cloudinaryResult.public_id
      },
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

    // 응답 데이터 포맷팅
    const responseData = {
      id: meme.id,
      title: meme.title,
      description: meme.description,
      imageUrl: meme.imageUrl,
      author: meme.user.name || '익명',
      isPublic: meme.isPublic,
      tags: meme.tags,
      likes: meme.likesCount,
      shares: meme.sharesCount,
      views: meme.viewsCount,
      createdAt: meme.createdAt.toISOString(),
      user: meme.user
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: '밈이 성공적으로 업로드되었습니다!'
    });

  } catch (error) {
    console.error('Community upload error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '업로드 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}