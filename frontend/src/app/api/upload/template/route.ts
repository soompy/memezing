import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageToCloudinary = async (
  buffer: Buffer,
  folder: string = 'memezing'
): Promise<{
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, height: 1200, crop: 'limit' }
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        } else {
          reject(new Error('Upload failed'));
        }
      }
    ).end(buffer);
  });
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: '템플릿 이미지 파일이 필요합니다.',
      }, { status: 400 });
    }

    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        message: '이미지 파일만 업로드 가능합니다.',
      }, { status: 400 });
    }

    // 파일 크기 검사 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        message: '파일 크기는 10MB 이하여야 합니다.',
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImageToCloudinary(buffer, 'memezing/templates');

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
      message: '템플릿 이미지 업로드가 완료되었습니다.',
    });

  } catch (error) {
    console.error('Template upload error:', error);
    return NextResponse.json({
      success: false,
      message: '템플릿 업로드 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}