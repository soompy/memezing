import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import type { Provider } from 'next-auth/providers';

const prisma = new PrismaClient();

// 카카오 OAuth 프로바이더
const KakaoProvider: Provider = {
  id: 'kakao',
  name: 'Kakao',
  type: 'oauth',
  version: '2.0',
  authorization: {
    url: 'https://kauth.kakao.com/oauth/authorize',
    params: {
      scope: 'profile_nickname profile_image account_email',
      response_type: 'code',
    },
  },
  token: 'https://kauth.kakao.com/oauth/token',
  userinfo: 'https://kapi.kakao.com/v2/user/me',
  clientId: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.id.toString(),
      name: profile.properties?.nickname || profile.kakao_account?.profile?.nickname,
      email: profile.kakao_account?.email,
      image: profile.properties?.profile_image || profile.kakao_account?.profile?.profile_image_url,
    };
  },
};

// 네이버 OAuth 프로바이더
const NaverProvider: Provider = {
  id: 'naver',
  name: 'Naver',
  type: 'oauth',
  version: '2.0',
  authorization: {
    url: 'https://nid.naver.com/oauth2.0/authorize',
    params: {
      response_type: 'code',
      state: 'random_state_string',
    },
  },
  token: 'https://nid.naver.com/oauth2.0/token',
  userinfo: 'https://openapi.naver.com/v1/nid/me',
  clientId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.response.id,
      name: profile.response.name || profile.response.nickname,
      email: profile.response.email,
      image: profile.response.profile_image,
    };
  },
};

const authOptions: NextAuthOptions = {
  // 최소한의 설정으로 시작
  providers: [
    // 환경변수가 있을 때만 Google 제공자 활성화
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  session: {
    strategy: 'jwt', // JWT 사용
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };