export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  username?: string;
  bio: string | null;
  image: string | null;
  provider: string | null;
  interests: string[];
  isVerified: boolean;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      username: string;
      bio?: string | null;
      image?: string | null;
      provider?: string | null;
      interests?: string[];
      isVerified?: boolean;
      isActive?: boolean;
      role?: string;
      createdAt: string;
      updatedAt?: string;
      lastLoginAt?: string | null;
    };
    token: string;
  };
  message: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}