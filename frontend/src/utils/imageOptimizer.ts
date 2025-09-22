// 이미지 최적화 유틸리티

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  progressive?: boolean;
  blur?: number;
  sharpen?: boolean;
  removeMetadata?: boolean;
  maxFileSize?: number; // bytes
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * 이미지 차원 계산
 */
export function calculateImageDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number,
  fit: 'cover' | 'contain' | 'fill' = 'contain'
): ImageDimensions {
  const aspectRatio = originalWidth / originalHeight;

  if (!targetWidth && !targetHeight) {
    return {
      width: originalWidth,
      height: originalHeight,
      aspectRatio
    };
  }

  if (targetWidth && targetHeight) {
    switch (fit) {
      case 'fill':
        return {
          width: targetWidth,
          height: targetHeight,
          aspectRatio: targetWidth / targetHeight
        };
      
      case 'cover': {
        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;
        const scale = Math.max(scaleX, scaleY);
        return {
          width: Math.round(originalWidth * scale),
          height: Math.round(originalHeight * scale),
          aspectRatio
        };
      }
      
      case 'contain':
      default: {
        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;
        const scale = Math.min(scaleX, scaleY);
        return {
          width: Math.round(originalWidth * scale),
          height: Math.round(originalHeight * scale),
          aspectRatio
        };
      }
    }
  }

  if (targetWidth) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
      aspectRatio
    };
  }

  if (targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
      aspectRatio
    };
  }

  return {
    width: originalWidth,
    height: originalHeight,
    aspectRatio
  };
}

/**
 * Canvas를 사용한 클라이언트 사이드 이미지 최적화
 */
export async function optimizeImageOnClient(
  file: File | Blob,
  options: ImageOptimizationOptions = {}
): Promise<{ blob: Blob; dimensions: ImageDimensions; originalSize: number; optimizedSize: number }> {
  const {
    width,
    height,
    quality = 0.8,
    format = 'auto',
    fit = 'contain',
    progressive = true,
    removeMetadata = true,
    maxFileSize = 5 * 1024 * 1024 // 5MB
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        const originalSize = file.size;
        
        // 차원 계산
        const dimensions = calculateImageDimensions(
          img.naturalWidth,
          img.naturalHeight,
          width,
          height,
          fit
        );

        // 캔버스 크기 설정
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // 고품질 렌더링 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 배경색 설정 (투명도 지원을 위해)
        if (format === 'jpeg' || (format === 'auto' && file.type === 'image/jpeg')) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

        // 출력 포맷 결정
        let outputFormat = 'image/jpeg';
        let outputQuality = quality;

        if (format === 'webp') {
          outputFormat = 'image/webp';
        } else if (format === 'png') {
          outputFormat = 'image/png';
          outputQuality = 1; // PNG는 무손실
        } else if (format === 'auto') {
          // 투명도가 있는 경우 PNG, 없으면 WebP/JPEG
          const hasTransparency = checkImageTransparency(ctx, canvas.width, canvas.height);
          if (hasTransparency) {
            outputFormat = 'image/png';
            outputQuality = 1;
          } else if (supportsWebP()) {
            outputFormat = 'image/webp';
          }
        }

        // Blob 생성
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create optimized image blob'));
              return;
            }

            const optimizedSize = blob.size;

            // 파일 크기 제한 확인
            if (optimizedSize > maxFileSize) {
              // 품질을 낮춰서 다시 시도
              const newQuality = Math.max(0.1, quality * 0.7);
              if (newQuality < quality) {
                optimizeImageOnClient(file, { ...options, quality: newQuality })
                  .then(resolve)
                  .catch(reject);
                return;
              } else {
                reject(new Error(`Optimized image size (${optimizedSize}) exceeds maximum (${maxFileSize})`));
                return;
              }
            }

            resolve({
              blob,
              dimensions,
              originalSize,
              optimizedSize
            });
          },
          outputFormat,
          outputQuality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for optimization'));
    };

    // 이미지 로드
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    } else {
      img.src = URL.createObjectURL(file);
    }
  });
}

/**
 * 이미지 투명도 체크
 */
function checkImageTransparency(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 샘플링으로 투명도 체크 (성능 최적화)
    const sampleSize = Math.min(1000, data.length / 4);
    const step = Math.floor(data.length / 4 / sampleSize);

    for (let i = 3; i < data.length; i += step * 4) {
      if (data[i] < 255) {
        return true; // 투명한 픽셀 발견
      }
    }

    return false;
  } catch (error) {
    console.warn('Failed to check image transparency:', error);
    return false;
  }
}

/**
 * WebP 지원 확인
 */
export function supportsWebP(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * AVIF 지원 확인
 */
export function supportsAVIF(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').startsWith('data:image/avif');
  } catch {
    return false;
  }
}

/**
 * 최적의 이미지 포맷 결정
 */
export function getBestImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
}

/**
 * 이미지 파일 크기 예측
 */
export function estimateImageSize(
  width: number,
  height: number,
  format: 'jpeg' | 'webp' | 'png' | 'avif' = 'jpeg',
  quality: number = 0.8
): number {
  const pixels = width * height;
  
  switch (format) {
    case 'png':
      return pixels * 4; // 무손실, 4바이트/픽셀
    case 'avif':
      return Math.round(pixels * quality * 0.3); // AVIF는 매우 효율적
    case 'webp':
      return Math.round(pixels * quality * 0.5); // WebP는 JPEG보다 30% 작음
    case 'jpeg':
    default:
      return Math.round(pixels * quality * 0.7); // 일반적인 JPEG 압축률
  }
}

/**
 * 반응형 이미지 srcSet 생성
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920]
): string {
  return widths
    .map(width => {
      const url = new URL(baseUrl);
      url.searchParams.set('w', width.toString());
      return `${url.toString()} ${width}w`;
    })
    .join(', ');
}

/**
 * 이미지 포맷 감지
 */
export function detectImageFormat(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer.slice(0, 16));
  
  // JPEG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'image/png';
  }
  
  // WebP
  if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }
  
  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif';
  }
  
  return null;
}

/**
 * 이미지 메타데이터 제거
 */
export function stripImageMetadata(buffer: ArrayBuffer): ArrayBuffer {
  // JPEG EXIF 데이터 제거 (간단한 구현)
  const bytes = new Uint8Array(buffer);
  
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) { // JPEG
    // EXIF 마커 찾기 및 제거
    let i = 2;
    while (i < bytes.length - 1) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xE1) {
        // EXIF 세그먼트 발견
        const segmentLength = (bytes[i + 2] << 8) | bytes[i + 3];
        // EXIF 세그먼트 제거
        const newBytes = new Uint8Array(bytes.length - segmentLength - 2);
        newBytes.set(bytes.slice(0, i));
        newBytes.set(bytes.slice(i + segmentLength + 2), i);
        return newBytes.buffer;
      }
      i++;
    }
  }
  
  return buffer;
}