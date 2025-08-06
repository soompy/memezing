'use client';

import { useState, useCallback } from 'react';
import { Plus, Type, X, Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import AITextGenerator from './AITextGenerator';

interface TextInput {
  id: string;
  text: string;
  placeholder: string;
}

interface TextInputAreaProps {
  onTextAdd: (text: string) => void;
  className?: string;
}

const TextInputArea: React.FC<TextInputAreaProps> = ({
  onTextAdd,
  className = ''
}) => {
  const [textInputs, setTextInputs] = useState<TextInput[]>([
    { id: '1', text: '', placeholder: '텍스트를 입력하세요' }
  ]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 텍스트 입력 추가
  const addTextInput = useCallback(() => {
    const newId = (textInputs.length + 1).toString();
    setTextInputs(prev => [
      ...prev,
      { 
        id: newId, 
        text: '', 
        placeholder: `텍스트 ${newId}을 입력하세요` 
      }
    ]);
  }, [textInputs.length]);

  // 텍스트 입력 제거
  const removeTextInput = useCallback((id: string) => {
    if (textInputs.length <= 1) return; // 최소 1개는 유지
    setTextInputs(prev => prev.filter(input => input.id !== id));
  }, [textInputs.length]);

  // 텍스트 값 변경
  const handleTextChange = useCallback((id: string, value: string) => {
    setTextInputs(prev => 
      prev.map(input => 
        input.id === id ? { ...input, text: value } : input
      )
    );
  }, []);

  // 캔버스에 텍스트 추가
  const handleAddToCanvas = useCallback((text: string) => {
    if (text.trim()) {
      onTextAdd(text.trim());
    }
  }, [onTextAdd]);

  // 모든 텍스트를 캔버스에 추가
  const handleAddAllTexts = useCallback(() => {
    textInputs.forEach(input => {
      if (input.text.trim()) {
        onTextAdd(input.text.trim());
      }
    });
  }, [textInputs, onTextAdd]);

  // AI 텍스트 선택 핸들러
  const handleAITextSelect = useCallback((text: string) => {
    console.log('AI text selected:', text); // 디버깅용
    
    // 빈 입력 필드에 AI 텍스트 추가하거나 새 필드 생성
    setTextInputs(prev => {
      const emptyInput = prev.find(input => !input.text.trim());
      if (emptyInput) {
        // 빈 필드가 있으면 해당 필드에 텍스트 추가
        return prev.map(input => 
          input.id === emptyInput.id 
            ? { ...input, text: text }
            : input
        );
      } else {
        // 빈 필드가 없으면 새 필드 생성
        const newId = (prev.length + 1).toString();
        return [
          ...prev,
          { 
            id: newId, 
            text: text, 
            placeholder: `텍스트 ${newId}을 입력하세요` 
          }
        ];
      }
    });
    
    // 선택된 텍스트를 바로 캔버스에도 추가 (사용자 편의성을 위해)
    setTimeout(() => {
      onTextAdd(text);
    }, 100);
  }, [onTextAdd]);

  // 모든 텍스트 입력 초기화
  const handleResetAll = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  // 초기화 확인
  const handleConfirmReset = useCallback(() => {
    setTextInputs([
      { id: '1', text: '', placeholder: '텍스트를 입력하세요' }
    ]);
    setShowAIGenerator(false);
    setShowResetConfirm(false);
  }, []);

  // 초기화 취소
  const handleCancelReset = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  // 기존 텍스트들을 AI 컨텍스트로 전달
  const existingTexts = textInputs.map(input => input.text).filter(text => text.trim());

  return (
    <div className={`text-input-area ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center">
            <Type size={20} className="mr-2" />
            텍스트 입력
          </h3>
        </div>
        
        {/* 버튼 그룹을 더 보기 좋게 재배치 */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            className={`flex items-center ${showAIGenerator ? 'bg-purple-100 text-purple-700 border-purple-300' : ''}`}
          >
            <Sparkles size={16} className="mr-1" />
            AI 생성
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={addTextInput}
            className="flex items-center"
          >
            <Plus size={16} className="mr-1" />
            필드 추가
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetAll}
            className="flex items-center text-gray-600 hover:text-red-600 hover:border-red-300"
          >
            <RotateCcw size={16} className="mr-1" />
            초기화
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleAddAllTexts}
            className="flex items-center"
          >
            모두 적용
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {textInputs.map((input) => (
          <div key={input.id} className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                value={input.text}
                onChange={(e) => handleTextChange(input.id, e.target.value)}
                placeholder={input.placeholder}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddToCanvas(input.text);
                  }
                }}
                className="w-full"
              />
            </div>
            <Button
              size="sm"
              onClick={() => handleAddToCanvas(input.text)}
              disabled={!input.text.trim()}
              className="shrink-0"
            >
              적용
            </Button>
            {textInputs.length > 1 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => removeTextInput(input.id)}
                className="shrink-0 p-2"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* AI 텍스트 생성기 */}
      {showAIGenerator && (
        <div className="mt-4">
          <AITextGenerator
            onTextSelect={handleAITextSelect}
            existingTexts={existingTexts}
            className="mb-4"
          />
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>사용법:</strong>
        </p>
        <ul className="text-xs text-gray-500 mt-1 space-y-1">
          <li>• 텍스트를 입력하고 &quot;적용&quot; 버튼을 클릭하세요</li>
          <li>• Enter 키를 눌러도 텍스트가 추가됩니다</li>
          <li>• <strong>AI 생성</strong> 버튼으로 재미있는 밈 텍스트를 자동 생성할 수 있어요</li>
          <li>• 캔버스에서 텍스트를 드래그하여 위치를 조정하세요</li>
          <li>• 텍스트를 선택한 후 스타일을 변경할 수 있습니다</li>
        </ul>
      </div>

      {/* 초기화 확인 모달 */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
        title="텍스트 초기화"
        message="모든 텍스트 입력을 초기화하시겠습니까? 입력한 내용이 모두 사라집니다."
        confirmText="초기화"
        cancelText="취소"
        type="warning"
        icon={<AlertTriangle className="w-6 h-6" />}
      />
    </div>
  );
};

export default TextInputArea;