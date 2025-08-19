import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // URL 유효성 검사
    const url = new URL(imageUrl);
    
    // 허용된 도메인만 프록시 (보안)
    const allowedDomains = [
      'i.imgur.com',
      'i.imgflip.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'source.unsplash.com'
    ];

    if (!allowedDomains.includes(url.hostname)) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      );
    }

    // 외부 이미지 요청
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MemeZing/1.0)',
        'Referer': process.env.NEXTAUTH_URL || 'https://memezing.com',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    
    // 이미지 타입 검증
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    const imageBuffer = await response.arrayBuffer();

    // 캐싱 헤더 추가
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', // 1일 캐시, 7일 재검증
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}