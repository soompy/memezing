import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // NextAuth 세션 쿠키들 제거
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.callback-url', 
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token', // HTTPS 환경용
      '__Host-next-auth.csrf-token'       // HTTPS 환경용
    ];

    // 모든 관련 쿠키 삭제
    cookiesToClear.forEach(cookieName => {
      cookieStore.delete(cookieName);
    });

    // 커스텀 토큰이 있다면 제거 (localStorage/sessionStorage는 클라이언트에서 처리)
    const response = NextResponse.json({
      success: true,
      message: '로그아웃이 완료되었습니다.'
    });

    // 쿠키 삭제 헤더 설정 (추가 보안)
    cookiesToClear.forEach(cookieName => {
      response.cookies.delete(cookieName);
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: '로그아웃 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 로그아웃은 POST 메서드만 지원
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST 메서드만 지원됩니다.'
  }, { status: 405 });
}