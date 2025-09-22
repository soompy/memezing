import { NextResponse } from 'next/server';

export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultCorsOptions: CorsOptions = {
  origin: true, // 모든 origin 허용 (프로덕션에서는 특정 도메인으로 제한)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
  ],
  credentials: true,
  maxAge: 86400, // 24시간
};

export function corsHeaders(options: CorsOptions = {}): Headers {
  const opts = { ...defaultCorsOptions, ...options };
  const headers = new Headers();

  // Origin 설정
  if (opts.origin === true) {
    headers.set('Access-Control-Allow-Origin', '*');
  } else if (typeof opts.origin === 'string') {
    headers.set('Access-Control-Allow-Origin', opts.origin);
  } else if (Array.isArray(opts.origin)) {
    // 실제 구현에서는 요청의 Origin을 확인해야 함
    headers.set('Access-Control-Allow-Origin', opts.origin.join(', '));
  }

  // Methods 설정
  if (opts.methods) {
    headers.set('Access-Control-Allow-Methods', opts.methods.join(', '));
  }

  // Headers 설정
  if (opts.allowedHeaders) {
    headers.set('Access-Control-Allow-Headers', opts.allowedHeaders.join(', '));
  }

  // Credentials 설정
  if (opts.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Max Age 설정
  if (opts.maxAge) {
    headers.set('Access-Control-Max-Age', opts.maxAge.toString());
  }

  return headers;
}

export function withCors(
  handler: (request: Request) => Promise<Response> | Response,
  options: CorsOptions = {}
) {
  return async (request: Request): Promise<Response> => {
    // OPTIONS 요청 처리
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(options),
      });
    }

    try {
      // 실제 핸들러 실행
      const response = await handler(request);
      
      // CORS 헤더 추가
      const corsHeadersMap = corsHeaders(options);
      corsHeadersMap.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      // 에러 응답에도 CORS 헤더 추가
      const errorResponse = NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );

      const corsHeadersMap = corsHeaders(options);
      corsHeadersMap.forEach((value, key) => {
        errorResponse.headers.set(key, value);
      });

      return errorResponse;
    }
  };
}

// 특정 origin에 대한 CORS 검증
export function validateOrigin(
  origin: string | null,
  allowedOrigins: string[]
): boolean {
  if (!origin) return false;
  
  // 개발 환경에서는 localhost 허용
  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
  }

  return allowedOrigins.includes(origin);
}

// 동적 CORS 설정 (요청에 따라 다른 설정 적용)
export function dynamicCorsHeaders(request: Request): Headers {
  const origin = request.headers.get('origin');
  const headers = new Headers();

  // 허용된 origins 목록
  const allowedOrigins = [
    'https://memezing.com',
    'https://www.memezing.com',
    'https://memezing.vercel.app',
    ...(process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000'] 
      : [])
  ];

  // Origin 검증 및 설정
  if (origin && validateOrigin(origin, allowedOrigins)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
  } else if (process.env.NODE_ENV === 'development') {
    // 개발 환경에서는 모든 origin 허용
    headers.set('Access-Control-Allow-Origin', '*');
  }

  // 기본 CORS 헤더
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  headers.set('Access-Control-Max-Age', '86400');

  return headers;
}