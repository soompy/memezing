import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// const KakaoStrategy = require('passport-kakao').Strategy;
import bcrypt from 'bcrypt';
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

// Google Strategy - TODO: Add proper OAuth credentials
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
//       callbackURL: '/api/auth/google/callback',
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       // Strategy implementation will be enabled when OAuth is configured
//     }
//   )
// );

// Kakao Strategy - TODO: Fix type issues
// passport.use(
//   new KakaoStrategy(
//     {
//       clientID: process.env.KAKAO_CLIENT_ID!,
//       callbackURL: '/api/auth/kakao/callback',
//     },
//     async (accessToken: string, refreshToken: string, profile: any, done: (error?: Error | null, user?: any) => void) => {
//       // Strategy implementation will be added later
//     }
//   )
// );

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