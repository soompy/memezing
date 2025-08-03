'use client';

import { useState, useCallback } from 'react';
import { Plus, Type, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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
    { id: '1', text: '', placeholder: '상단 텍스트를 입력하세요' },
    { id: '2', text: '', placeholder: '하단 텍스트를 입력하세요' }
  ]);

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

  return (
    <div className={`text-input-area ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Type size={20} className="mr-2" />
          텍스트 입력
        </h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={addTextInput}
          >
            <Plus size={16} className="mr-1" />
            추가
          </Button>
          <Button
            size="sm"
            onClick={handleAddAllTexts}
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

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>사용법:</strong>
        </p>
        <ul className="text-xs text-gray-500 mt-1 space-y-1">
          <li>• 텍스트를 입력하고 &quot;적용&quot; 버튼을 클릭하세요</li>
          <li>• Enter 키를 눌러도 텍스트가 추가됩니다</li>
          <li>• 캔버스에서 텍스트를 드래그하여 위치를 조정하세요</li>
          <li>• 텍스트를 선택한 후 스타일을 변경할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default TextInputArea;