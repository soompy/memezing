'use client';

import { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, Copy, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { generateMemeText, generateRandomKoreanMeme, generateContextualText, type MemeTextSuggestion } from '@/utils/aiTextGenerator';

interface AITextGeneratorProps {
  onTextSelect: (text: string) => void;
  existingTexts?: string[];
  className?: string;
}

export default function AITextGenerator({ onTextSelect, existingTexts = [], className = '' }: AITextGeneratorProps) {
  const [suggestions, setSuggestions] = useState<MemeTextSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('random');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = [
    { id: 'random', name: '랜덤', icon: '🎲' },
    { id: 'monday', name: '월요일', icon: '😫' },
    { id: 'work', name: '직장생활', icon: '💼' },
    { id: 'study', name: '공부', icon: '📚' },
    { id: 'food', name: '음식', icon: '🍕' },
    { id: 'relationship', name: '연애', icon: '💕' },
    { id: 'kpop', name: 'K-POP', icon: '🎵' },
    { id: 'drama', name: '드라마', icon: '📺' },
    { id: 'gaming', name: '게임', icon: '🎮' },
    { id: 'trending', name: '트렌드', icon: '🔥' }
  ];

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // AI 생성 시뮬레이션
      
      let newSuggestions: MemeTextSuggestion[];
      
      if (selectedCategory === 'random') {
        newSuggestions = generateRandomKoreanMeme();
      } else if (selectedCategory === 'contextual' && existingTexts.length > 0) {
        newSuggestions = generateContextualText(existingTexts);
      } else {
        newSuggestions = generateMemeText(selectedCategory === 'random' ? undefined : selectedCategory);
      }
      
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('AI text generation failed:', error);
      // 폴백으로 랜덤 텍스트 생성
      setSuggestions(generateRandomKoreanMeme());
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelect = (text: string, id: string) => {
    console.log('handleTextSelect called with:', text); // 디버깅용
    setSelectedId(id);
    onTextSelect(text);
    
    // 선택 피드백을 일정 시간 후 초기화
    setTimeout(() => {
      setSelectedId(null);
    }, 2000);
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const getToneEmoji = (tone: string) => {
    switch (tone) {
      case 'funny': return '😂';
      case 'sarcastic': return '😏';
      case 'cute': return '🥰';
      case 'dramatic': return '😱';
      case 'trendy': return '✨';
      default: return '💭';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-900">AI 텍스트 생성</h3>
      </div>

      {/* 카테고리 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 선택
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>{category.icon}</span>
                <span className="text-xs">{category.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 컨텍스트 기반 생성 버튼 (기존 텍스트가 있을 때만 표시) */}
      {existingTexts.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-2">
            기존 텍스트를 분석해서 관련 내용을 생성할 수 있어요
          </p>
          <Button
            onClick={() => {
              setSelectedCategory('contextual');
              generateSuggestions();
            }}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Wand2 className="w-4 h-4 mr-1" />
            관련 텍스트 생성
          </Button>
        </div>
      )}

      {/* 생성 버튼 */}
      <Button
        onClick={generateSuggestions}
        disabled={isLoading}
        isLoading={isLoading}
        className="w-full mb-4"
        variant="primary"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            AI가 텍스트를 생성 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            텍스트 생성하기
          </>
        )}
      </Button>

      {/* 생성된 제안들 */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            💡 AI 제안 ({suggestions.length}개)
          </h4>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="group p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{getToneEmoji(suggestion.tone)}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {suggestion.category}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium break-words">
                    {suggestion.text}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyText(suggestion.text, suggestion.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    title="텍스트 복사"
                  >
                    {copiedId === suggestion.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <Button
                    onClick={() => handleTextSelect(suggestion.text, suggestion.id)}
                    size="sm"
                    variant="primary"
                    className="text-xs px-2 py-1"
                    disabled={selectedId === suggestion.id}
                  >
                    {selectedId === suggestion.id ? '추가됨!' : '사용'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* 다시 생성 버튼 */}
          <Button
            onClick={generateSuggestions}
            variant="outline"
            size="sm"
            className="w-full mt-3"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다른 텍스트 생성
          </Button>
        </div>
      )}

      {/* 도움말 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>팁:</strong> 카테고리를 선택하면 해당 주제에 맞는 밈 텍스트를 생성해요. 
          기존 텍스트가 있다면 관련성 있는 내용도 제안할 수 있어요!
        </p>
      </div>
    </div>
  );
}