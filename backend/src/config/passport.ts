import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });
        
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return done(null, false, { message: '사용자를 찾을 수 없습니다.' });
        }

        if (!user.password) {
          return done(null, false, { message: '소셜 로그인 계정입니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { providerId: profile.id, provider: 'google' },
              { email: profile.emails?.[0]?.value },
            ],
          },
        });

        if (user) {
          // 기존 사용자 업데이트
          if (user.provider === 'email') {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'google',
                providerId: profile.id,
                avatar: profile.photos?.[0]?.value,
                displayName: profile.displayName,
              },
            });
          }
        } else {
          // 새 사용자 생성
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('이메일 정보를 가져올 수 없습니다.'), false);
          }

          // 사용자명 생성 (중복 방지)
          let username = profile.displayName?.replace(/\s+/g, '').toLowerCase() || 'user';
          let counter = 1;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${profile.displayName?.replace(/\s+/g, '').toLowerCase() || 'user'}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email,
              username,
              provider: 'google',
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value,
              displayName: profile.displayName,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Kakao Strategy
passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID!,
      callbackURL: '/api/auth/kakao/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { providerId: profile.id, provider: 'kakao' },
              { email: profile._json.kakao_account?.email },
            ],
          },
        });

        if (user) {
          // 기존 사용자 업데이트
          if (user.provider === 'email') {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'kakao',
                providerId: profile.id,
                avatar: profile._json.kakao_account?.profile?.profile_image_url,
                displayName: profile._json.kakao_account?.profile?.nickname,
              },
            });
          }
        } else {
          // 새 사용자 생성
          const email = profile._json.kakao_account?.email;
          if (!email) {
            return done(new Error('이메일 정보를 가져올 수 없습니다.'), false);
          }

          // 사용자명 생성 (중복 방지)
          let username = profile._json.kakao_account?.profile?.nickname?.replace(/\s+/g, '').toLowerCase() || 'user';
          let counter = 1;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${profile._json.kakao_account?.profile?.nickname?.replace(/\s+/g, '').toLowerCase() || 'user'}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email,
              username,
              provider: 'kakao',
              providerId: profile.id,
              avatar: profile._json.kakao_account?.profile?.profile_image_url,
              displayName: profile._json.kakao_account?.profile?.nickname,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;