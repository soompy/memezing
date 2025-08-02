import { DefaultSession } from 'next-auth';

// NextAuth 세션 타입 확장
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string | null;
      interests?: string[];
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    provider?: string | null;
    interests?: string[];
    createdAt: Date;
    updatedAt: Date;
  }
}

// 기존 타입들 (호환성 유지)
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: string | null;
  interests?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  data?: AuthData;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// 밈 관련 타입들
export interface TextBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface Meme {
  id: string;
  title?: string | null;
  imageUrl: string;
  templateId?: string | null;
  textBoxes: TextBox[];
  isPublic: boolean;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: User;
}