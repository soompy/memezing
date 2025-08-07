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

    // NextAuth의 JWT 토큰은 자동으로 갱신됨
    // 커스텀 JWT 토큰이 필요한 경우 여기서 처리
    
    const refreshedSession = {
      ...session,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일
    };

    return NextResponse.json(
      { 
        success: true,
        session: refreshedSession,
        message: '토큰이 성공적으로 갱신되었습니다.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token refresh API error:', error);
    return NextResponse.json(
      { error: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}