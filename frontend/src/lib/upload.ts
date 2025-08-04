import { apiClient, ApiError } from './api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export class UploadError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'UploadError';
  }
}

// 파일 검증 함수
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 파일 크기 체크 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '파일 크기는 10MB를 초과할 수 없습니다.',
    };
  }

  // 파일 타입 체크
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'JPEG, PNG, GIF, WebP 형식만 지원됩니다.',
    };
  }

  return { valid: true };
}

// 이미지 리사이즈 함수
export function resizeImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 비율 계산
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // 캔버스 크기 설정
      canvas.width = width;
      canvas.height = height;

      // 이미지 그리기
      ctx?.drawImage(img, 0, 0, width, height);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('이미지 리사이즈에 실패했습니다.'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// 진행률을 포함한 업로드 함수
export async function uploadImageWithProgress(
  file: File,
  type: 'meme' | 'avatar' | 'template' = 'meme',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // 파일 검증
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new UploadError(validation.error!);
  }

  try {
    // XMLHttpRequest를 사용하여 진행률 추적
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      // 진행률 추적
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progress);
        }
      });

      // 완료 처리
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              resolve(result.data);
            } else {
              reject(new UploadError(result.message || 'Upload failed'));
            }
          } catch (error) {
            reject(new UploadError('응답 파싱 오류'));
          }
        } else {
          try {
            const errorResult = JSON.parse(xhr.responseText);
            reject(new UploadError(errorResult.message || `HTTP Error: ${xhr.status}`));
          } catch {
            reject(new UploadError(`HTTP Error: ${xhr.status}`));
          }
        }
      });

      // 에러 처리
      xhr.addEventListener('error', () => {
        reject(new UploadError('네트워크 오류가 발생했습니다.'));
      });

      // 요청 전송
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/image`);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError('업로드 중 오류가 발생했습니다.');
  }
}

// 간단한 업로드 함수 (기존 API 클라이언트 사용)
export async function uploadImage(
  file: File,
  type: 'meme' | 'avatar' | 'template' = 'meme'
): Promise<UploadResult> {
  // 파일 검증
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new UploadError(validation.error!);
  }

  try {
    const result = await apiClient.uploadImage(file, type);
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new UploadError(error.message);
    }
    throw new UploadError('업로드 중 오류가 발생했습니다.');
  }
}

// 이미지를 Base64로 변환
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Base64 변환 실패'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
}

// 이미지 URL에서 Blob 생성
export async function urlToBlob(url: string): Promise<Blob> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    throw new Error('이미지를 불러올 수 없습니다.');
  }
}

// 캔버스를 이미지 파일로 변환
export function canvasToFile(
  canvas: HTMLCanvasElement,
  filename: string = 'meme.png',
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], filename, {
            type: 'image/png',
            lastModified: Date.now(),
          });
          resolve(file);
        }
      },
      'image/png',
      quality
    );
  });
}

// 이미지 미리보기 URL 생성
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

// 미리보기 URL 해제
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}