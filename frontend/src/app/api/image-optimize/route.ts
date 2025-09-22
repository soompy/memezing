import { NextRequest, NextResponse } from 'next/server';
import { dynamicCorsHeaders } from '@/lib/cors';

// Sharp가 있다면 사용, 없다면 Canvas 폴백
let sharp: any = null;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp not available, using Canvas fallback');
}

// 캐시 Map (메모리 캐시)
const optimizedImageCache = new Map<string, { 
  data: ArrayBuffer; 
  contentType: string; 
  timestamp: number;
  etag: string;
}>();

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24시간
const MAX_CACHE_SIZE = 200; // 최대 200개 이미지 캐시
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');
  const width = searchParams.get('w');
  const height = searchParams.get('h');
  const quality = searchParams.get('q') || '85';
  const format = searchParams.get('f') || 'auto';
  const fit = searchParams.get('fit') || 'inside';
  const blur = searchParams.get('blur');
  const sharpen = searchParams.get('sharpen');

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
    
    // 허용된 도메인 체크
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

    // 캐시 키 생성
    const cacheKey = `${decodedUrl}?w=${width || ''}&h=${height || ''}&q=${quality}&f=${format}&fit=${fit}&blur=${blur || ''}&sharpen=${sharpen || ''}`;
    
    // 캐시 확인
    const cached = optimizedImageCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      // ETag 확인
      const clientETag = request.headers.get('if-none-match');
      if (clientETag === cached.etag) {
        const notModifiedResponse = new NextResponse(null, { status: 304 });
        corsHeaders.forEach((value, key) => {
          notModifiedResponse.headers.set(key, value);
        });
        return notModifiedResponse;
      }

      console.log('Serving optimized image from cache:', cacheKey);
      const response = new NextResponse(cached.data, {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'X-Cache': 'HIT',
          'ETag': cached.etag,
          'Content-Length': cached.data.byteLength.toString(),
        },
      });
      
      corsHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      
      return response;
    }

    // 원본 이미지 가져오기
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃

    try {
      const imageResponse = await fetch(decodedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MemeZing-ImageOptimizer/1.0)',
          'Referer': process.env.NEXTAUTH_URL || 'https://memezing.com',
          'Accept': 'image/*',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!imageResponse.ok) {
        throw new Error(`HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
      }

      const contentType = imageResponse.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const contentLength = imageResponse.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
        throw new Error('Image too large');
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // 이미지 최적화 처리
      let optimizedBuffer: ArrayBuffer;
      let outputContentType: string;

      if (sharp) {
        // Sharp 사용 (서버 환경)
        const result = await optimizeImageWithSharp(
          Buffer.from(imageBuffer),
          {
            width: width ? parseInt(width) : undefined,
            height: height ? parseInt(height) : undefined,
            quality: parseInt(quality),
            format: format as any,
            fit: fit as any,
            blur: blur ? parseInt(blur) : undefined,
            sharpen: sharpen === 'true',
          }
        );
        
        optimizedBuffer = result.buffer;
        outputContentType = result.contentType;
      } else {
        // Canvas 폴백 (브라우저 환경)
        const result = await optimizeImageWithCanvas(
          imageBuffer,
          {
            width: width ? parseInt(width) : undefined,
            height: height ? parseInt(height) : undefined,
            quality: parseInt(quality) / 100,
            format: format as any,
          }
        );
        
        optimizedBuffer = result.buffer;
        outputContentType = result.contentType;
      }

      // ETag 생성
      const etag = `"${Buffer.from(optimizedBuffer).toString('base64').slice(0, 16)}"`;

      // 캐시에 저장
      if (optimizedImageCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = Array.from(optimizedImageCache.keys())[0];
        optimizedImageCache.delete(oldestKey);
      }
      
      optimizedImageCache.set(cacheKey, {
        data: optimizedBuffer,
        contentType: outputContentType,
        timestamp: now,
        etag
      });

      // 응답 생성
      const response = new NextResponse(optimizedBuffer, {
        headers: {
          'Content-Type': outputContentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'X-Cache': 'MISS',
          'ETag': etag,
          'Content-Length': optimizedBuffer.byteLength.toString(),
        },
      });

      corsHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    console.error('Image optimization error:', error);
    
    let errorMessage = 'Failed to optimize image';
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
      } else if (error.message.includes('too large')) {
        errorMessage = 'Image file too large';
        statusCode = 413;
      }
    }
    
    const errorResponse = NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: statusCode }
    );
    
    corsHeaders.forEach((value, key) => {
      errorResponse.headers.set(key, value);
    });
    
    return errorResponse;
  }
}

// Sharp를 사용한 이미지 최적화 (서버 환경)
async function optimizeImageWithSharp(
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpeg' | 'png';
    fit?: 'inside' | 'outside' | 'cover' | 'contain' | 'fill';
    blur?: number;
    sharpen?: boolean;
  }
): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const { width, height, quality = 85, format = 'auto', fit = 'inside', blur, sharpen } = options;

  let pipeline = sharp(buffer);

  // 리사이징
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: fit as any,
      withoutEnlargement: true,
    });
  }

  // 블러 효과
  if (blur && blur > 0) {
    pipeline = pipeline.blur(blur);
  }

  // 샤프닝
  if (sharpen) {
    pipeline = pipeline.sharpen();
  }

  // 포맷 결정 및 변환
  let outputFormat: string;
  let contentType: string;

  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality, progressive: true });
      outputFormat = 'webp';
      contentType = 'image/webp';
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
      outputFormat = 'jpeg';
      contentType = 'image/jpeg';
      break;
    case 'png':
      pipeline = pipeline.png({ quality, progressive: true });
      outputFormat = 'png';
      contentType = 'image/png';
      break;
    case 'auto':
    default:
      // WebP 우선, 폴백으로 JPEG
      try {
        pipeline = pipeline.webp({ quality, progressive: true });
        outputFormat = 'webp';
        contentType = 'image/webp';
      } catch {
        pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
        outputFormat = 'jpeg';
        contentType = 'image/jpeg';
      }
      break;
  }

  const optimizedBuffer = await pipeline.toBuffer();
  
  return {
    buffer: optimizedBuffer.buffer,
    contentType
  };
}

// Canvas를 사용한 이미지 최적화 (폴백)
async function optimizeImageWithCanvas(
  buffer: ArrayBuffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpeg' | 'png';
  }
): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  // 브라우저 환경이 아니므로 기본 처리만
  const { format = 'jpeg', quality = 0.85 } = options;
  
  let contentType: string;
  
  switch (format) {
    case 'webp':
      contentType = 'image/webp';
      break;
    case 'png':
      contentType = 'image/png';
      break;
    case 'auto':
    case 'jpeg':
    default:
      contentType = 'image/jpeg';
      break;
  }

  // 서버 환경에서는 원본 반환 (Sharp가 없는 경우)
  return {
    buffer,
    contentType
  };
}

// OPTIONS 요청 처리
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = dynamicCorsHeaders(request);
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}