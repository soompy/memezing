import { NextRequest, NextResponse } from 'next/server';
import { dynamicCorsHeaders } from '@/lib/cors';

// 캐시 Map (메모리 캐시)
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1시간
const MAX_CACHE_SIZE = 100; // 최대 100개 이미지 캐시

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  // CORS 헤더 생성
  const corsHeaders = dynamicCorsHeaders(request);

  if (!imageUrl) {
    const errorResponse = NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
    corsHeaders.forEach((value, key) => {
      errorResponse.headers.set(key, value);
    });
    return errorResponse;
  }

  try {
    // URL 디코딩 및 유효성 검사
    const decodedUrl = decodeURIComponent(imageUrl);
    const url = new URL(decodedUrl);
    
    // 허용된 도메인만 프록시 (보안 강화)
    const allowedDomains = [
      'i.imgur.com',
      'i.imgflip.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'source.unsplash.com',
      'img.freepik.com',
      'cdn.pixabay.com',
      'images.pexels.com',
      // 개발 환경에서만 localhost 허용
      ...(process.env.NODE_ENV === 'development' ? ['localhost', '127.0.0.1'] : [])
    ];

    const isAllowed = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );

    if (!isAllowed) {
      const errorResponse = NextResponse.json(
        { error: `Domain ${url.hostname} not allowed` },
        { status: 403 }
      );
      corsHeaders.forEach((value, key) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    // 캐시 확인
    const cacheKey = decodedUrl;
    const cached = imageCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Serving from cache:', cacheKey);
      const response = new NextResponse(cached.data, {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'X-Cache': 'HIT',
        },
      });
      
      // CORS 헤더 추가
      corsHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      
      return response;
    }

    // 외부 이미지 요청 (타임아웃 설정)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    try {
      const response = await fetch(decodedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MemeZing/1.0)',
          'Referer': process.env.NEXTAUTH_URL || 'https://memezing.com',
          'Accept': 'image/*',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      // 이미지 타입 검증 강화
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      // 파일 크기 제한 (10MB)
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        throw new Error('Image too large (max 10MB)');
      }

      const imageBuffer = await response.arrayBuffer();

      // 캐시에 저장 (크기 제한)
      if (imageCache.size >= MAX_CACHE_SIZE) {
        // 가장 오래된 항목 제거
        const oldestKey = Array.from(imageCache.keys())[0];
        imageCache.delete(oldestKey);
      }
      
      imageCache.set(cacheKey, {
        data: imageBuffer,
        contentType,
        timestamp: Date.now()
      });

      // 응답 생성
      const successResponse = new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'X-Cache': 'MISS',
          'Content-Length': imageBuffer.byteLength.toString(),
        },
      });

      // CORS 헤더 추가
      corsHeaders.forEach((value, key) => {
        successResponse.headers.set(key, value);
      });

      return successResponse;

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    console.error('Image proxy error:', error);
    
    let errorMessage = 'Failed to fetch image';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        errorMessage = 'Request timeout';
        statusCode = 408;
      } else if (error.message.includes('Invalid URL')) {
        errorMessage = 'Invalid URL format';
        statusCode = 400;
      } else if (error.message.includes('HTTP')) {
        errorMessage = error.message;
        statusCode = 502;
      }
    }
    
    const errorResponse = NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: statusCode }
    );
    
    // 에러 응답에도 CORS 헤더 추가
    corsHeaders.forEach((value, key) => {
      errorResponse.headers.set(key, value);
    });
    
    return errorResponse;
  }
}

// OPTIONS 요청 처리 (CORS Preflight)
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = dynamicCorsHeaders(request);
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}