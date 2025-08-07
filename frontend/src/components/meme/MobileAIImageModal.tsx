'use client';

import React, { useState } from 'react';
import { X, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToastContext } from '@/context/ToastContext';

interface MobileAIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (imageUrl: string) => void;
}

const MobileAIImageModal: React.FC<MobileAIImageModalProps> = ({
  isOpen,
  onClose,
  onImageGenerated
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { showSuccess, showError, showInfo } = useToastContext();

  // 모바일 최적화된 예시 프롬프트들
  const quickPrompts = [
    '피곤한 고양이',
    '행복한 강아지', 
    '화난 표정',
    '놀란 얼굴',
    '웃는 사람',
    '슬픈 표정'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showError('프롬프트를 입력해주세요.');
      return;
    }

    setIsGenerating(true);

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
        onImageGenerated(data.data.imageUrl);
        
        if (data.data.fallback && data.data.message) {
          showInfo(data.data.message);
        } else {
          showSuccess('AI 이미지가 생성되었습니다!');
        }
        
        onClose();
        setPrompt('');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">AI 이미지 생성</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={isGenerating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* 설명 */}
          <p className="text-sm text-gray-600 text-center">
            원하는 이미지를 간단히 설명해주세요
          </p>

          {/* 프롬프트 입력 */}
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 피곤한 고양이"
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>

          {/* 빠른 선택 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">빠른 선택:</p>
            <div className="grid grid-cols-3 gap-2">
              {quickPrompts.map((quickPrompt, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(quickPrompt)}
                  className="p-2 text-xs bg-gray-100 hover:bg-purple-100 rounded border transition-colors"
                  disabled={isGenerating}
                >
                  {quickPrompt}
                </button>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <div className="space-y-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              variant="primary"
              size="sm"
              className="w-full py-3"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  이미지 생성하기
                </>
              )}
            </Button>
            
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="w-full py-3 text-gray-600 hover:text-gray-800 text-sm"
            >
              취소
            </button>
          </div>

          {/* 안내 */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 간단하고 명확한 설명을 사용하면 더 좋은 결과를 얻을 수 있어요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAIImageModal;