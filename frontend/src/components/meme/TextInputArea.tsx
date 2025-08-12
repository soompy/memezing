'use client';

import { useState, useCallback } from 'react';
import { Type, RotateCcw, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';

interface TextInputAreaProps {
  onTextAdd: (text: string) => void;
  className?: string;
}

const TextInputArea: React.FC<TextInputAreaProps> = ({
  onTextAdd,
  className = ''
}) => {
  const [textInput, setTextInput] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 캔버스에 텍스트 추가
  const handleAddToCanvas = useCallback(() => {
    if (textInput.trim()) {
      onTextAdd(textInput.trim());
    }
  }, [textInput, onTextAdd]);

  // 텍스트 초기화
  const handleResetText = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  // 초기화 확인
  const handleConfirmReset = useCallback(() => {
    setTextInput('');
    setShowResetConfirm(false);
  }, []);

  // 초기화 취소
  const handleCancelReset = useCallback(() => {
    setShowResetConfirm(false);
  }, []);


  return (
    <div className={`text-input-area ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center mb-3">
          <Type size={20} className="mr-2" />
          텍스트 입력
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="텍스트를 입력하세요"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddToCanvas();
                }
              }}
              className="w-full"
            />
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={handleAddToCanvas}
            disabled={!textInput.trim()}
            className="shrink-0"
          >
            적용
          </Button>
        </div>
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

      {/* 초기화 확인 모달 */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
        title="텍스트 초기화"
        message="텍스트 입력을 초기화하시겠습니까? 입력한 내용이 사라집니다."
        confirmText="초기화"
        cancelText="취소"
        type="warning"
        icon={<AlertTriangle className="w-6 h-6" />}
      />
    </div>
  );
};

export default TextInputArea;