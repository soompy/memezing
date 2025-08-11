import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // 이메일 중복 확인
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUserByEmail) {
        return {
          success: false,
          message: '이미 사용 중인 이메일입니다.',
        };
      }

      // 사용자명 중복 확인 (name 필드로 변경)
      const existingUserByName = await prisma.user.findFirst({
        where: { name: data.username },
      });

      if (existingUserByName) {
        return {
          success: false,
          message: '이미 사용 중인 사용자명입니다.',
        };
      }

      // 비밀번호 해싱
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // 사용자 생성
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.username,
          password: hashedPassword,
          provider: 'email',
        },
      });

      // JWT 토큰 생성
      const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.name || '',
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.name || '',
            createdAt: user.createdAt.toISOString(),
          },
          token,
        },
        message: '회원가입이 완료되었습니다.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
      };
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // 사용자 조회
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user || !user.password) {
        return {
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        };
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        };
      }

      // JWT 토큰 생성
      const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.name || '',
      });

      // 마지막 로그인 시간 업데이트
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.name || '',
            createdAt: user.createdAt.toISOString(),
          },
          token,
        },
        message: '로그인이 완료되었습니다.',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
      };
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          bio: true,
          image: true,
          provider: true,
          interests: true,
          isVerified: true,
          isActive: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      if (user) {
        return {
          ...user,
          username: user.name || '',
        };
      }

      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}