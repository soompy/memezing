'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ui/ImageUpload';

export default function Home() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImages(prev => [...prev, imageUrl]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎭 밈징어
          </h1>
          <p className="text-lg text-gray-600">
            한국 문화 특화 밈 생성 플랫폼
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 이미지 업로드 섹션 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              이미지 업로드
            </h2>
            <ImageUpload
              onUpload={handleImageUpload}
              className="mb-4"
            />
            <p className="text-sm text-gray-500">
              밈 템플릿으로 사용할 이미지를 업로드하세요
            </p>
          </div>

          {/* 업로드된 이미지 갤러리 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              업로드된 이미지
            </h2>
            {uploadedImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                업로드된 이미지가 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-lg shadow-sm px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                백엔드 서버
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                이미지 업로드
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                MVP 개발 중
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}