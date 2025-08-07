import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰을 사용하는 경우 토큰 무효화
    // 현재는 NextAuth 세션 기반이므로 클라이언트에서 signOut() 호출하면 됨
    
    return NextResponse.json(
      { 
        success: true,
        message: '성공적으로 로그아웃되었습니다.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}