'use client';

import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import TabGroup from '@/components/ui/TabGroup';
import TextStyleControls, { TextStyle } from '@/components/meme/TextStyleControls';

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  textBoxes: {
    x: number;
    y: number;
    width: number;
    height: number;
    defaultText: string;
  }[];
}

const popularTemplates: MemeTemplate[] = [
  {
    id: 'drake',
    name: '드레이크 밈',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 200, height: 60, defaultText: '이건 별로' },
      { x: 10, y: 180, width: 200, height: 60, defaultText: '이게 좋아' }
    ]
  },
  {
    id: 'distracted-boyfriend',
    name: '한눈파는 남친',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    textBoxes: [
      { x: 50, y: 50, width: 150, height: 40, defaultText: '새로운 것' },
      { x: 250, y: 100, width: 120, height: 40, defaultText: '남친' },
      { x: 400, y: 80, width: 120, height: 40, defaultText: '기존 것' }
    ]
  },
  {
    id: 'woman-yelling-cat',
    name: '고양이 vs 여자',
    url: 'https://i.imgflip.com/345v97.jpg',
    textBoxes: [
      { x: 20, y: 20, width: 180, height: 50, defaultText: '화난 여자' },
      { x: 320, y: 150, width: 150, height: 50, defaultText: '무관심한 고양이' }
    ]
  }
];

// 기본 텍스트 스타일
const defaultTextStyle: TextStyle = {
  fontSize: 30,
  fontFamily: 'Impact, Arial Black, sans-serif',
  fontWeight: 'bold',
  fontStyle: 'normal',
  color: '#FFFFFF',
  textAlign: 'center',
  strokeColor: '#000000',
  strokeWidth: 2,
};

export default function MemeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [textInputs, setTextInputs] = useState<string[]>([]);
  const [textStyles, setTextStyles] = useState<TextStyle[]>([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [templateType, setTemplateType] = useState<'popular' | 'upload'>('popular');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleTemplateSelect = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTextInputs(template.textBoxes.map(box => box.defaultText));
    // 각 텍스트 박스마다 기본 스타일 적용
    setTextStyles(template.textBoxes.map(() => ({ ...defaultTextStyle })));
    setSelectedTextIndex(0);
    setTemplateType('popular');
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImages(prev => [...prev, imageUrl]);
  };

  const handleUploadedImageSelect = (imageUrl: string) => {
    // 업로드된 이미지를 템플릿으로 사용 (기본 텍스트 박스 2개)
    const customTemplate: MemeTemplate = {
      id: `custom-${Date.now()}`,
      name: '내 이미지',
      url: imageUrl,
      textBoxes: [
        { x: 10, y: 10, width: 300, height: 60, defaultText: '상단 텍스트' },
        { x: 10, y: 200, width: 300, height: 60, defaultText: '하단 텍스트' }
      ]
    };
    setSelectedTemplate(customTemplate);
    setTextInputs(['상단 텍스트', '하단 텍스트']);
    setTextStyles([{ ...defaultTextStyle }, { ...defaultTextStyle }]);
    setSelectedTextIndex(0);
    setTemplateType('upload');
  };

  const handleTextChange = (index: number, value: string) => {
    const newTextInputs = [...textInputs];
    newTextInputs[index] = value;
    setTextInputs(newTextInputs);
  };

  const handleStyleChange = (style: TextStyle) => {
    const newStyles = [...textStyles];
    newStyles[selectedTextIndex] = style;
    setTextStyles(newStyles);
  };

  const handleStyleReset = () => {
    const newStyles = [...textStyles];
    newStyles[selectedTextIndex] = { ...defaultTextStyle };
    setTextStyles(newStyles);
  };

  const generateMeme = async () => {
    if (!selectedTemplate || !canvasRef.current) return;

    setIsGenerating(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      selectedTemplate.textBoxes.forEach((box, index) => {
        const text = textInputs[index] || '';
        const style = textStyles[index] || defaultTextStyle;
        
        // 텍스트 스타일 적용
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
        ctx.fillStyle = style.color;
        ctx.strokeStyle = style.strokeColor;
        ctx.lineWidth = style.strokeWidth;
        ctx.textAlign = style.textAlign;
        
        // 텍스트 위치 계산
        let x: number;
        switch (style.textAlign) {
          case 'left':
            x = box.x + 10;
            break;
          case 'right':
            x = box.x + box.width - 10;
            break;
          default: // center
            x = box.x + box.width / 2;
        }
        const y = box.y + box.height / 2;
        
        // 텍스트 래핑 처리
        const maxWidth = box.width - 20;
        const lines = wrapText(ctx, text, maxWidth);
        const lineHeight = style.fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        const startY = y - totalHeight / 2 + style.fontSize / 2;
        
        lines.forEach((line, lineIndex) => {
          const lineY = startY + lineIndex * lineHeight;
          if (style.strokeWidth > 0) {
            ctx.strokeText(line, x, lineY);
          }
          ctx.fillText(line, x, lineY);
        });
      });
      
      setIsGenerating(false);
    };
    
    img.src = selectedTemplate.url;
  };

  // 텍스트 래핑 함수
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const downloadMeme = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const shareMeme = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `meme-${Date.now()}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '내가 만든 밈',
            text: '밈징어에서 만든 재미있는 밈을 확인해보세요!',
            files: [file]
          });
        } else {
          // Web Share API를 지원하지 않는 경우 URL 복사
          navigator.clipboard.writeText(window.location.href);
          alert('페이지 링크가 복사되었습니다!');
        }
      }, 'image/png');
    } catch (error) {
      console.error('공유 실패:', error);
      alert('공유에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-900 mb-2">
            🎭 밈 생성기
          </h1>
          <p className="text-lg text-600">
            인기 템플릿으로 나만의 밈을 만들어보세요
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 템플릿 선택 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-800 mb-4">
                템플릿 선택
              </h2>
              
              {/* 탭 선택 */}
              <TabGroup
                items={[
                  { key: 'popular', label: '인기 템플릿' },
                  { key: 'upload', label: '내 이미지' }
                ]}
                activeKey={templateType}
                onChange={(key) => setTemplateType(key as 'popular' | 'upload')}
                className="mb-4"
              />

              {/* 인기 템플릿 */}
              {templateType === 'popular' && (
                <div className="space-y-4">
                  {popularTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                        selectedTemplate?.id === template.id && templateType === 'popular'
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <img
                        src={template.url}
                        alt={template.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <p className="text-sm font-medium text-700">
                        {template.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* 이미지 업로드 */}
              {templateType === 'upload' && (
                <div className="space-y-4">
                  <ImageUpload
                    onUpload={handleImageUpload}
                    maxSizeInMB={5}
                    className="mb-4"
                  />
                  
                  {uploadedImages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-700 mb-3">
                        업로드된 이미지
                      </h3>
                      <div className="space-y-3">
                        {uploadedImages.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                              selectedTemplate?.url === imageUrl && templateType === 'upload'
                                ? 'border-primary bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleUploadedImageSelect(imageUrl)}
                          >
                            <img
                              src={imageUrl}
                              alt={`업로드된 이미지 ${index + 1}`}
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                            <p className="text-sm font-medium text-700">
                              내 이미지 {index + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadedImages.length === 0 && (
                    <div className="text-center py-8 text-500">
                      <p className="text-sm">이미지를 업로드하면</p>
                      <p className="text-sm">밈 템플릿으로 사용할 수 있습니다</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 텍스트 편집 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-800 mb-4">
                텍스트 편집
              </h2>
              {selectedTemplate ? (
                <div className="space-y-4">
                  {/* 텍스트 박스 선택 탭 */}
                  <TabGroup
                    items={selectedTemplate.textBoxes.map((_, index) => ({
                      key: index.toString(),
                      label: `텍스트 ${index + 1}`
                    }))}
                    activeKey={selectedTextIndex.toString()}
                    onChange={(key) => setSelectedTextIndex(parseInt(key))}
                    variant="pills"
                    className="mb-4"
                  />

                  {/* 선택된 텍스트 입력 */}
                  <Input
                    label={`텍스트 ${selectedTextIndex + 1}`}
                    value={textInputs[selectedTextIndex] || ''}
                    onChange={(e) => handleTextChange(selectedTextIndex, e.target.value)}
                    placeholder={selectedTemplate.textBoxes[selectedTextIndex]?.defaultText}
                  />

                  {/* 모든 텍스트 미리보기 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-700">전체 텍스트</label>
                    {selectedTemplate.textBoxes.map((box, index) => (
                      <div
                        key={index}
                        className={`p-2 text-sm rounded border ${
                          selectedTextIndex === index
                            ? 'border-primary bg-primary-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">텍스트 {index + 1}:</span>{' '}
                        {textInputs[index] || box.defaultText}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={generateMeme}
                      isLoading={isGenerating}
                      className="w-full"
                    >
                      밈 생성하기
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={downloadMeme}
                        variant="outline"
                        disabled={!selectedTemplate || isGenerating}
                      >
                        다운로드
                      </Button>
                      <Button
                        onClick={shareMeme}
                        variant="secondary"
                        disabled={!selectedTemplate || isGenerating}
                      >
                        공유하기
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-500">
                  템플릿을 선택해주세요
                </div>
              )}
            </div>
          </div>

          {/* 텍스트 스타일링 */}
          <div className="lg:col-span-1">
            {selectedTemplate && textStyles.length > 0 ? (
              <TextStyleControls
                style={textStyles[selectedTextIndex] || defaultTextStyle}
                onChange={handleStyleChange}
                onReset={handleStyleReset}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-800 mb-4">
                  텍스트 스타일
                </h3>
                <div className="text-center py-8 text-500">
                  템플릿을 선택하면 스타일 설정이 가능합니다
                </div>
              </div>
            )}
          </div>

          {/* 미리보기 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-800 mb-4">
                미리보기
              </h2>
              <div className="text-center">
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto border rounded-lg"
                      style={{ maxHeight: '400px' }}
                    />
                    <p className="text-sm text-500">
                      텍스트를 입력하고 "밈 생성하기"를 클릭하세요
                    </p>
                  </div>
                ) : (
                  <div className="py-16 text-500">
                    템플릿을 선택하면 미리보기가 표시됩니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-800 mb-3">
            사용법
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-600">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-primary">1.</span>
              <span>좌측에서 원하는 밈 템플릿을 선택하세요</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-primary">2.</span>
              <span>중앙에서 각 텍스트 박스에 원하는 문구를 입력하세요</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-primary">3.</span>
              <span>"밈 생성하기"를 클릭하고 다운로드하세요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}