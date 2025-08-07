'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, Download, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToastContext } from '@/context/ToastContext';

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  className?: string;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  onImageGenerated,
  className = ''
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{
    url: string;
    prompt: string;
    fallback?: boolean;
    message?: string;
  } | null>(null);
  
  const { showSuccess, showError, showInfo } = useToastContext();

  // 예시 프롬프트들
  const examplePrompts = [
    '고양이가 컴퓨터 앞에서 코딩하는 모습',
    '월요일 아침의 피곤한 표정',
    '커피 없이는 살 수 없는 직장인',
    '시험 공부하는 대학생의 절망',
    '금요일 퇴근 시간의 기쁨',
    '다이어트 실패한 슬픈 표정',
    '주말이 끝나가는 일요일 밤',
    '새로운 기술을 배우려는 개발자'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showError('이미지 생성을 위한 프롬프트를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size: '1024x1024',
          quality: 'standard'
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedImage({
          url: data.data.imageUrl,
          prompt: data.data.prompt,
          fallback: data.data.fallback,
          message: data.data.message
        });

        if (data.data.fallback && data.data.message) {
          showInfo(data.data.message);
        } else {
          showSuccess('이미지가 성공적으로 생성되었습니다!');
        }
      } else {
        showError(data.error || '이미지 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      showError('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImage = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage.url, generatedImage.prompt);
      showSuccess('이미지가 선택되었습니다!');
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI 이미지 생성</h3>
        </div>
        <p className="text-sm text-gray-600">
          원하는 이미지를 설명해주세요. AI가 밈에 적합한 이미지를 생성해드립니다.
        </p>
      </div>

      {/* 프롬프트 입력 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          이미지 설명 (프롬프트)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예: 고양이가 컴퓨터 앞에서 코딩하는 모습"
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={isGenerating}
        />
      </div>

      {/* 예시 프롬프트 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          💡 예시 프롬프트 (클릭하여 사용)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-left p-2 text-xs bg-gray-50 hover:bg-purple-50 rounded border transition-colors"
              disabled={isGenerating}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* 생성 버튼 */}
      <div className="flex space-x-3">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          variant="primary"
          size="sm"
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              이미지 생성 중...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              이미지 생성
            </>
          )}
        </Button>
      </div>

      {/* 생성된 이미지 */}
      {generatedImage && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="aspect-square relative mb-3">
              <img
                src={generatedImage.url}
                alt={generatedImage.prompt}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  console.error('Generated image failed to load');
                  e.currentTarget.src = 'https://via.placeholder.com/512x512?text=Image+Load+Failed';
                }}
              />
              {generatedImage.fallback && (
                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  더미 이미지
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-600 mb-3">
              <strong>프롬프트:</strong> {generatedImage.prompt}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleUseImage}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                이미지 사용하기
              </Button>
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImage.url;
                  link.download = `ai-generated-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  showSuccess('이미지가 다운로드됩니다.');
                }}
                variant="secondary"
                size="sm"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 안내사항 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-xs text-blue-800">
          <strong>💡 팁:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>구체적이고 명확한 설명을 사용하세요</li>
            <li>감정이나 상황을 포함하면 더 좋은 결과를 얻을 수 있습니다</li>
            <li>생성된 이미지는 밈 제작에 최적화됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIImageGenerator;