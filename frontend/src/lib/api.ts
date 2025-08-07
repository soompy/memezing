import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || `HTTP Error: ${response.status}`,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, '네트워크 오류가 발생했습니다.');
    }
  }

  // Auth API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const result = await this.request<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    });
    
    // 로그아웃 성공 시 로컬 토큰 제거
    if (result.success) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    
    return result;
  }

  async getMe(): Promise<{
    success: boolean;
    data: {
      user: User;
      session: {
        expires: string;
      };
    };
    message: string;
  }> {
    return this.request<any>('/api/auth/me');
  }

  async refreshToken(): Promise<{
    success: boolean;
    data: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: string;
      user: User;
    };
    message: string;
  }> {
    const result = await this.request<any>('/api/auth/refresh', {
      method: 'POST',
    });
    
    // 토큰 갱신 성공 시 새로운 토큰 저장
    if (result.success && result.data.accessToken) {
      localStorage.setItem('token', result.data.accessToken);
    }
    
    return result;
  }

  async updateMe(data: { name?: string; image?: string }): Promise<{
    success: boolean;
    data: { user: User };
    message: string;
  }> {
    return this.request<any>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // User API
  async updateProfile(data: Partial<User>): Promise<{ success: boolean; data: { user: User } }> {
    return this.request<{ success: boolean; data: { user: User } }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateInterests(interests: string[]): Promise<{ success: boolean; data: { user: User } }> {
    return this.request<{ success: boolean; data: { user: User } }>('/api/user/interests', {
      method: 'PUT',
      body: JSON.stringify({ interests }),
    });
  }

  async getUserStats(): Promise<{
    success: boolean;
    data: {
      totalMemes: number;
      totalLikes: number;
      totalViews: number;
      followers: number;
      following: number;
      joinDate: string;
    };
  }> {
    return this.request<any>('/api/user/stats');
  }

  // Meme API
  async getMemes(params?: {
    page?: number;
    limit?: number;
    sort?: 'latest' | 'popular' | 'trending';
    category?: string;
    userId?: string;
  }): Promise<{
    success: boolean;
    data: {
      memes: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const query = queryParams.toString();
    return this.request<any>(`/api/memes${query ? `?${query}` : ''}`);
  }

  async getMeme(id: string): Promise<{ success: boolean; data: { meme: any } }> {
    return this.request<any>(`/api/memes/${id}`);
  }

  async createMeme(data: {
    title?: string;
    imageUrl: string;
    templateId?: string;
    textBoxes: any[];
    isPublic: boolean;
  }): Promise<{ success: boolean; data: { meme: any } }> {
    return this.request<any>('/api/memes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMeme(id: string, data: {
    title?: string;
    isPublic?: boolean;
    textBoxes?: any[];
  }): Promise<{ success: boolean; data: { meme: any } }> {
    return this.request<any>(`/api/memes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMeme(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/memes/${id}`, {
      method: 'DELETE',
    });
  }

  async likeMeme(id: string): Promise<{ success: boolean; data: { isLiked: boolean; likesCount: number } }> {
    return this.request<any>(`/api/memes/${id}/like`, {
      method: 'POST',
    });
  }

  async downloadMeme(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/memes/${id}/download`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Download failed');
    }
    
    return response.blob();
  }

  // Upload API
  async uploadImage(file: File, type: 'meme' | 'avatar' | 'template' = 'meme'): Promise<{
    success: boolean;
    data: {
      url: string;
      publicId: string;
      width: number;
      height: number;
    };
  }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/api/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || 'Upload failed',
        errorData
      );
    }

    return response.json();
  }

  // AI API
  async generateText(prompt: string, context?: {
    templateId?: string;
    existingTexts?: string[];
  }): Promise<{
    success: boolean;
    data: {
      suggestions: string[];
    };
  }> {
    return this.request<any>('/api/ai/generate-text', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  }

  // Analytics API
  async trackView(memeId: string): Promise<void> {
    return this.request<void>('/api/analytics/view', {
      method: 'POST',
      body: JSON.stringify({ memeId }),
    });
  }

  async trackDownload(memeId: string): Promise<void> {
    return this.request<void>('/api/analytics/download', {
      method: 'POST',
      body: JSON.stringify({ memeId }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { ApiError };
export default apiClient;