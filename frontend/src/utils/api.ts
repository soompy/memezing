const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'API 요청이 실패했습니다.',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('네트워크 오류가 발생했습니다.', 0);
  }
}

export async function uploadImage(file: File): Promise<{
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(
        result.message || '이미지 업로드에 실패했습니다.',
        response.status,
        result
      );
    }

    if (!result.success || !result.data) {
      throw new ApiError('이미지 업로드 응답이 올바르지 않습니다.', 400);
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('이미지 업로드 중 네트워크 오류가 발생했습니다.', 0);
  }
}