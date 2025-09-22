'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { MemeTemplate } from '@/components/meme/FabricCanvas';

interface UnifiedTemplateGridProps {
  templates: MemeTemplate[];
  selectedTemplate: MemeTemplate | null;
  onTemplateSelect: (template: MemeTemplate) => void;
  isLoading?: boolean;
  onSidebarClose?: () => void;
  onRefreshTemplates?: () => void;
  error?: string | null;
}

const UnifiedTemplateGrid: React.FC<UnifiedTemplateGridProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  isLoading = false,
  onSidebarClose,
  onRefreshTemplates,
  error
}) => {
  const handleTemplateSelect = (template: MemeTemplate) => {
    onTemplateSelect(template);
    onSidebarClose?.();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">템플릿 선택</h3>
        {onRefreshTemplates && (
          <button
            onClick={onRefreshTemplates}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            title="새로운 템플릿 조합 보기"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            새로고침
          </button>
        )}
      </div>
      
      {/* 에러 메시지 표시 */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            {error.includes('fallback') 
              ? '일부 템플릿을 불러오지 못했지만 기본 템플릿을 표시합니다.' 
              : '템플릿을 불러오는 중 문제가 발생했습니다.'
            }
          </p>
          {onRefreshTemplates && (
            <button
              onClick={onRefreshTemplates}
              className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 underline"
            >
              다시 시도
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              disabled={isLoading}
              className={`
                group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300
                ${isSelected 
                  ? 'border-primary-500 ring-2 ring-primary-200 scale-105 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-102'
                }
                bg-white
              `}
            >
              {/* 템플릿 이미지 */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <OptimizedImage
                  src={template.url}
                  alt={template.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  lazy={true}
                  priority={false}
                  quality={75}
                />
              </div>

              {/* 선택 표시 */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}

              {/* 템플릿 정보 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-2">
                <p className="text-xs font-bold truncate">{template.name}</p>
              </div>

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedTemplateGrid;